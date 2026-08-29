import type {
    FlowDocument,
    ActionBlock,
    FlowCondition,
    CommandNodeData,
    StepNodeData,
} from '../types/flow';
import {
    TEMPLATE_VAR_REGEX,
    REGEX_ESCAPE_CHARS,
    NON_ALPHANUMERIC_HYPHEN,
    MULTIPLE_HYPHENS,
    LEADING_TRAILING_HYPHENS,
} from './regex';
import { isValidJSIdentifier, sanitizeIdentifier } from './identifiers';

/** Генерируемый файл. */
export interface GeneratedFile {
    path: string;
    content: string;
}

/** Экранирует строку для безопасной вставки в TypeScript-код (кавычки, обратные слеши, переносы, Unicode line separators). */
function escapeStr(s: string): string {
    return s
        .replace(/\r/g, '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$')
        .replace(/\n/g, '\\n')
        .split(' ')
        .join('\\u2028')
        .split(' ')
        .join('\\u2029');
}

/** Экранирует спецсимволы regex для безопасного создания RegExp из имени переменной. */
function escapeRegExp(s: string): string {
    return s.replace(REGEX_ESCAPE_CHARS, '\\$&');
}

/** Кэш скомпилированных регулярных выражений для resolveVars. */
const regexCache = new Map<string, RegExp>();

/** Получает скомпилированное RegExp из кэша (или создаёт новое). */
function getCachedRegex(pattern: string): RegExp {
    let re = regexCache.get(pattern);
    if (!re) {
        re = new RegExp(pattern, 'g');
        regexCache.set(pattern, re);
    }
    return re;
}

/** Безопасное имя переменной — невалидные имена оборачиваем в скобки. */
function safeVar(name: string): string {
    if (isValidJSIdentifier(name)) {
        return `ctrl.userData.${name}`;
    }
    return `ctrl.userData['${escapeStr(name)}']`;
}

/** Фильтрация невалидных узлов (null, undefined, не объекты). */
function filterValidNodes(doc: FlowDocument): FlowDocument['nodes'] {
    return doc.nodes.filter((n): n is NonNullable<typeof n> => n != null && typeof n === 'object');
}

/** Генерирует выражение текста с поддержкой шаблонов {{variable}}. */
function textExpr(text: string): string {
    if (!text) return "''";
    if (text.includes('{{')) {
        // Порядок экранирования важен: сначала \ → \\, потом ` → \`, потом ${ → \${
        // После этого заменяем {{var}} → ${ctrl.userData.var} — эти ${ НЕ экранируются
        let escaped = text.replace(/\\/g, '\\\\');
        escaped = escaped.replace(/`/g, '\\`');
        escaped = escaped.replace(/\$\{/g, '\\${');
        const converted = escaped.replace(
            TEMPLATE_VAR_REGEX,
            (_, name: string) => `\${${safeVar(name)}}`,
        );
        return '`' + converted + '`';
    }
    return `'${escapeStr(text)}'`;
}

/** Оборачивает текст в вызов setText(ctrl, text). */
function setTextExpr(text: string): string {
    return `setText(ctrl, ${textExpr(text)})`;
}

/** Оборачивает текст в вызов setTTS(ctrl, text). */
function setTTSExpr(text: string): string {
    return `setTTS(ctrl, '${escapeStr(text)}')`;
}

/** Собирает имена всех переменных из документа (saveTo, field, saveResponseTo). */
function collectVarNames(nodes: FlowDocument['nodes']): string[] {
    const vars = new Set<string>();
    for (const n of nodes) {
        if ('saveTo' in n && n.saveTo) vars.add(n.saveTo as string);
        if ('actions' in n && Array.isArray(n.actions)) {
            for (const a of n.actions as ActionBlock[]) {
                if (a.field) vars.add(a.field);
                if (a.saveResponseTo) vars.add(a.saveResponseTo);
            }
        }
    }
    return [...vars];
}

/** Заменяет имена переменных на ctrl.userData.* в выражении. Сортировка по длине для корректности. */
function resolveVars(expr: string, varNames: string[]): string {
    let result = expr;
    const sorted = [...varNames].sort((a, b) => b.length - a.length);
    for (const name of sorted) {
        const safeName = escapeRegExp(name);
        const re = getCachedRegex(`\\b${safeName}\\b`);
        re.lastIndex = 0;
        result = result.replace(re, safeVar(name));
    }
    return result;
}

/** Генерирует код для блоков действий (random_number, set_variable, http_request). */
function generateActionCode(actions: ActionBlock[], varNames: string[], indent = '    '): string[] {
    const lines: string[] = [];
    for (const block of actions) {
        switch (block.type) {
            case 'random_number':
                if (block.field) {
                    lines.push(
                        `${indent}${safeVar(block.field)} = rand(${block.min ?? 1}, ${block.max ?? 10});`,
                    );
                }
                break;
            case 'set_variable':
                if (block.field && block.value) {
                    let finalExpr: string;
                    // Если значение содержит {{var}} — генерируем template literal
                    if (block.value.includes('{{')) {
                        finalExpr = textExpr(block.value);
                    } else {
                        const expr = resolveVars(block.value, varNames);
                        // Если после замены переменных выражение осталось "голым текстом"
                        // — оборачиваем в кавычки как строковый литерал
                        const isNumeric = !isNaN(Number(expr)) && expr.trim() !== '';
                        const needsQuoting =
                            !expr.includes('ctrl.userData') &&
                            !isNumeric &&
                            !expr.startsWith('`') &&
                            !expr.startsWith("'") &&
                            !expr.startsWith('"');
                        finalExpr = needsQuoting ? `'${escapeStr(expr)}'` : expr;
                    }
                    if (finalExpr.includes('ctrl.userData')) {
                        lines.push(`${indent}// @ts-ignore`);
                    }
                    lines.push(`${indent}${safeVar(block.field)} = ${finalExpr};`);
                }
                break;
            case 'http_request':
                if (block.url) {
                    lines.push(`${indent}try {`);
                    const method = block.method || 'GET';
                    const fetchOpts: string[] = [];
                    if (method !== 'GET') {
                        fetchOpts.push(`method: '${method}'`);
                    }
                    // Безопасная сериализация headers
                    if (block.headers) {
                        try {
                            const safeHeaders = JSON.stringify(JSON.parse(block.headers));
                            fetchOpts.push(`headers: ${safeHeaders}`);
                        } catch {
                            fetchOpts.push(`headers: {}`);
                        }
                    }
                    if (block.body && method !== 'GET') {
                        // Если body содержит {{variables}}, передаём как template literal
                        const bodyHasVars = block.body.includes('{{');
                        if (bodyHasVars) {
                            let templateBody = String(block.body)
                                .replace(/\\/g, '\\\\')
                                .replace(/`/g, '\\`')
                                .replace(/\$\{/g, '\\${');
                            templateBody = templateBody.replace(
                                /\{\{(\w+)\}\}/g,
                                (_, name: string) => `\${${safeVar(name)}}`,
                            );
                            fetchOpts.push(`body: \`${templateBody}\``);
                        } else {
                            fetchOpts.push(`body: ${block.body}`);
                        }
                    }
                    const optsStr = fetchOpts.length > 0 ? `, { ${fetchOpts.join(', ')} }` : '';
                    lines.push(
                        `${indent}    const response = await fetch('${escapeStr(block.url)}'${optsStr});`,
                    );
                    lines.push(
                        `${indent}    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);`,
                    );
                    lines.push(`${indent}    const data = await response.json();`);
                    if (block.saveResponseTo) {
                        lines.push(`${indent}    ${safeVar(block.saveResponseTo)} = data;`);
                    }
                    lines.push(
                        `${indent}} catch (e) { setText(ctrl, \`Ошибка запроса: \${(e as Error).message}\`); }`,
                    );
                }
                break;
        }
    }
    return lines;
}

/** Генерирует код условия как switch-case с поддержкой всех операторов. */
function generateConditionCode(
    condition: FlowCondition,
    varNames: string[],
    indent = '    ',
): string[] {
    const lines: string[] = [];
    lines.push(`${indent}const condVar = ${safeVar(condition.variable)};`);

    let condVal: string;
    const condValueStr = String(condition.value);
    if (varNames.includes(condValueStr)) {
        condVal = safeVar(condValueStr);
    } else {
        const numVal = Number(condition.value);
        condVal = isNaN(numVal) ? `'${escapeStr(condValueStr)}'` : String(numVal);
    }

    lines.push(`${indent}const condVal = ${condVal};`);
    lines.push(`${indent}const numA = Number(condVar);`);
    lines.push(`${indent}const numB = Number(condVal);`);
    lines.push(`${indent}const useNum = !isNaN(numA) && !isNaN(numB);`);
    lines.push(`${indent}let result = false;`);
    lines.push(`${indent}switch ('${escapeStr(condition.operator)}') {`);
    lines.push(
        `${indent}    case 'eq': result = useNum ? numA === numB : String(condVar) === String(condVal); break;`,
    );
    lines.push(
        `${indent}    case 'neq': result = useNum ? numA !== numB : String(condVar) !== String(condVal); break;`,
    );
    lines.push(`${indent}    case 'gt': result = useNum ? numA > numB : false; break;`);
    lines.push(`${indent}    case 'gte': result = useNum ? numA >= numB : false; break;`);
    lines.push(`${indent}    case 'lt': result = useNum ? numA < numB : false; break;`);
    lines.push(`${indent}    case 'lte': result = useNum ? numA <= numB : false; break;`);
    lines.push(
        `${indent}    case 'contains': result = String(condVar).includes(String(condVal)); break;`,
    );
    lines.push(`${indent}    case 'isEmpty': result = !condVar || condVar === ''; break;`);
    lines.push(`${indent}    case 'isNotEmpty': result = !!condVar && condVar !== ''; break;`);
    lines.push(`${indent}    case 'isSayTrue': result = Text.isSayTrue(String(condVar)); break;`);
    lines.push(`${indent}    case 'isSayFalse': result = Text.isSayFalse(String(condVar)); break;`);
    lines.push(`${indent}    case 'isUrl': result = Text.isUrl(String(condVar)); break;`);
    lines.push(`${indent}}`);
    return lines;
}

/**
 * Генерирует код инлайн-условия с ответами true/false веток.
 * Каждое условие обёрнуто в собственный блок {}, чтобы несколько условий
 * в одной ноде не порождали дубликаты const condVar/condVal/numA/numB/useNum/result.
 */
function generateInlineCondition(
    cond: FlowCondition,
    varNames: string[],
    indent = '    ',
): string[] {
    const lines: string[] = [];
    lines.push(`${indent}{`);
    const inner = `${indent}    `;
    lines.push(...generateConditionCode(cond, varNames, inner));
    if (cond.responseTrue) {
        lines.push(`${inner}if (result) {`);
        if (cond.responseTrue.text)
            lines.push(`${inner}    ${setTextExpr(cond.responseTrue.text)};`);
        if (cond.responseTrue.buttons) {
            for (const btn of cond.responseTrue.buttons) {
                lines.push(`${inner}    ctrl.buttons.addBtn('${escapeStr(btn.title)}');`);
            }
        }
        lines.push(`${inner}}`);
    }
    if (cond.responseFalse) {
        lines.push(`${inner}if (!result) {`);
        if (cond.responseFalse.text)
            lines.push(`${inner}    ${setTextExpr(cond.responseFalse.text)};`);
        if (cond.responseFalse.buttons) {
            for (const btn of cond.responseFalse.buttons) {
                lines.push(`${inner}    ctrl.buttons.addBtn('${escapeStr(btn.title)}');`);
            }
        }
        lines.push(`${inner}}`);
    }
    lines.push(`${indent}}`);
    return lines;
}

/** Генерирует код кнопок. supportLinks=false — только addBtn (шаги/действия). */
function generateButtonsCode(
    buttons: { title: string; type?: string; url?: string }[],
    indent = '    ',
    supportLinks = true,
): string[] {
    const lines: string[] = [];
    for (const btn of buttons) {
        if (supportLinks && btn.type === 'link') {
            lines.push(
                `${indent}ctrl.buttons.addLink(${textExpr(btn.title)}, '${escapeStr(btn.url || '')}');`,
            );
        } else {
            lines.push(`${indent}ctrl.buttons.addBtn(${textExpr(btn.title)});`);
        }
    }
    return lines;
}

/** Генерирует код карточки (addImage для каждого изображения). */
function generateCardCode(
    card: {
        images: {
            src: string;
            title: string;
            description: string;
            button?: { title: string };
        }[];
    },
    indent = '    ',
): string[] {
    const lines: string[] = [];
    for (const img of card.images) {
        const args = [
            textExpr(img.src || ''),
            textExpr(img.title || ''),
            textExpr(img.description || ''),
        ];
        if (img.button) args.push(textExpr(img.button.title || ''));
        lines.push(`${indent}ctrl.card.addImage(${args.join(', ')});`);
    }
    return lines;
}

/** Генерирует навигацию по next-ребру (ctrl.thisIntentName). */
function generateNextNavigation(
    nodeId: string,
    doc: FlowDocument,
    validNodes: FlowDocument['nodes'],
    indent = '    ',
    skipIds?: Set<string>,
): string[] {
    const lines: string[] = [];
    const nextEdge = doc.edges.find((e) => e.from === nodeId && e.type === 'next');
    if (nextEdge) {
        const nextNode = validNodes.find((n) => n.id === nextEdge.to);
        if (nextNode && (!skipIds || !skipIds.has(nextNode.id))) {
            const nextName = (nextNode as Record<string, unknown>).name;
            if (typeof nextName === 'string') {
                lines.push(
                    `${indent}ctrl.thisIntentName = '${escapeStr(sanitizeIdentifier(nextName))}';`,
                );
            }
        }
    }
    return lines;
}

/** Проверяет есть ли TTS в document (включая standalone response блоки). */
function hasTTSInDoc(nodes: FlowDocument['nodes']): boolean {
    return nodes.some((n) => {
        if (n.type === 'command') {
            const resp = (n as CommandNodeData).response;
            return resp?.tts;
        }
        if (n.type === 'step') {
            return (n as StepNodeData).prompt?.tts;
        }
        if (n.type === 'response') {
            const resp = (n as { response?: { tts?: string } }).response;
            return resp?.tts;
        }
        return false;
    });
}

/**
 * Собирает тексты role-нод (welcome/help/fallback) для setPlatformParams и FALLBACK_COMMAND.
 * Нода на холсте приоритетнее metadata: пользователь, перетащивший ноду «Старт»,
 * редактирует текст в ней, а не в настройках. Роль ноды несёт поле role.
 */
function collectRoleTexts(
    doc: FlowDocument,
    validNodes: FlowDocument['nodes'],
): {
    welcome: string;
    help: string;
    fallback: string;
} {
    let welcome = doc.welcome?.text ?? '';
    let help = doc.helpText?.text ?? '';
    let fallback = doc.fallback?.text ?? '';

    for (const node of validNodes) {
        if (node.type !== 'command') continue;
        const cmd = node as CommandNodeData;
        if (cmd.role !== 'welcome' && cmd.role !== 'help' && cmd.role !== 'fallback') continue;
        // Текст ноды имеет приоритет, но пустой текст ноды не затирает
        // непустой текст настроек (нода только что перетащена, текст ещё не редактировали)
        if (cmd.response?.text) {
            if (cmd.role === 'welcome') welcome = cmd.response.text;
            else if (cmd.role === 'help') help = cmd.response.text;
            else fallback = cmd.response.text;
        }
    }

    return { welcome, help, fallback };
}

/** Рекурсивно проверяет, нужен ли async для блока (HTTP в нём или в связанных блоках). */
function blockNeedsAsync(
    nodeId: string,
    doc: FlowDocument,
    validNodes: FlowDocument['nodes'],
    visited = new Set<string>(),
): boolean {
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    const node = validNodes.find((n) => n.id === nodeId);
    if (!node) return false;
    if (
        node.type === 'action' &&
        Array.isArray((node as { actions?: ActionBlock[] }).actions) &&
        (node as { actions: ActionBlock[] }).actions.some((a) => a.type === 'http_request')
    ) {
        return true;
    }
    const outgoing = doc.edges
        .filter(
            (e) =>
                e.from === nodeId &&
                (e.type === 'next' || e.type === 'branch_true' || e.type === 'branch_false'),
        )
        .map((e) => e.to);
    return outgoing.some((id) => blockNeedsAsync(id, doc, validNodes, visited));
}

/** Генерирует основной файл src/index.ts для проекта umbot. */
function generateIndexTs(doc: FlowDocument): string {
    const lines: string[] = [];
    const validNodes = filterValidNodes(doc);
    const varNames = collectVarNames(validNodes);

    const needsRand = validNodes.some((n) => {
        return (
            'actions' in n &&
            Array.isArray(n.actions) &&
            (n.actions as ActionBlock[]).some((a: ActionBlock) => a.type === 'random_number')
        );
    });

    const needsText = validNodes.some((n) => {
        const conditions = (n.conditions ?? []) as FlowCondition[];
        if (conditions.some((c) => ['isSayTrue', 'isSayFalse', 'isUrl'].includes(c.operator)))
            return true;
        if (
            n.type === 'condition' &&
            ['isSayTrue', 'isSayFalse', 'isUrl'].includes(
                (n as Record<string, unknown>).operator as string,
            )
        )
            return true;
        return false;
    });

    lines.push(`import { Bot, FALLBACK_COMMAND } from 'umbot';`);

    const needsSetTTS = hasTTSInDoc(validNodes);

    if (needsSetTTS) {
        lines.push(`import { setText, setTTS } from './utils';`);
    } else {
        lines.push(`import { setText } from './utils';`);
    }

    if (doc.database.type === 'file') {
        lines.push(`import { FileAdapter } from 'umbot/plugins';`);
    } else if (doc.database.type === 'mongo') {
        lines.push(`import { MongoAdapter } from 'umbot/plugins';`);
    }
    if (needsRand) lines.push(`import { rand } from 'umbot/utils';`);
    if (needsText) lines.push(`import { Text } from 'umbot/utils';`);

    // Платформы — маппинг lowercase ID → PascalCase adapter name
    const PLATFORM_ADAPTERS: Record<string, string> = {
        alisa: 'AlisaAdapter',
        marusia: 'MarusiaAdapter',
        smart_app: 'SmartAppAdapter',
        telegram: 'TelegramAdapter',
        vk: 'VkAdapter',
        max_app: 'MaxAdapter',
        viber: 'ViberAdapter',
    };

    if (doc.platforms.length === 7) {
        lines.push(`import { fullPlatforms } from 'umbot/plugins';`);
    } else {
        for (const platform of doc.platforms) {
            const adapter = PLATFORM_ADAPTERS[platform] ?? platform;
            lines.push(`import { ${adapter} } from 'umbot/plugins';`);
        }
    }

    lines.push(``);
    lines.push(`const bot = new Bot();`);
    lines.push(``);

    // Платформы — регистрация
    if (doc.platforms.length === 7) {
        lines.push(`bot.use(fullPlatforms);`);
    } else {
        for (const platform of doc.platforms) {
            const adapter = PLATFORM_ADAPTERS[platform] ?? platform;
            lines.push(`bot.use(${adapter});`);
        }
    }
    lines.push(``);

    // База данных
    if (doc.database.type === 'file') {
        lines.push(`bot.use(new FileAdapter());`);
    } else if (doc.database.type === 'mongo') {
        lines.push(
            `bot.use(new MongoAdapter({ host: 'localhost', database: '${escapeStr((doc.database.config as Record<string, string>).database || 'bot_db')}' }));`,
        );
    }
    lines.push(``);

    // Конфигурация
    lines.push(`bot.setAppConfig({`);
    if (doc.database.type !== 'none') {
        lines.push(`    isLocalStorage: ${doc.isLocalStorage},`);
    }
    lines.push(`});`);
    lines.push(``);

    // Параметры платформ. Тексты берём из role-нод (welcome/help/fallback), если они есть
    // на холсте — нода приоритетнее metadata (пользователь редактирует текст в ноде).
    // help при отсутствии — fallback (та же логика, что в ChatPreview).
    const roleTexts = collectRoleTexts(doc, validNodes);
    const helpText = roleTexts.help || roleTexts.fallback;
    lines.push(`bot.setPlatformParams({`);
    lines.push(`    welcome_text: '${escapeStr(roleTexts.welcome)}',`);
    lines.push(`    help_text: '${escapeStr(helpText)}',`);
    lines.push(`    empty_text: '${escapeStr(roleTexts.fallback)}',`);
    lines.push(`    intents: [],`);
    lines.push(`});`);
    lines.push(``);

    // Регистрация команд. Role-ноды (welcome/help/fallback) пропускаем — их тексты
    // идут в setPlatformParams/FALLBACK_COMMAND через collectRoleTexts. Отдельный
    // addCommand('welcome', …) был бы мёртвым кодом (срабатывает только на слово
    // «welcome»), а addCommand('fallback') перетирался бы поздним FALLBACK_COMMAND.
    for (const node of validNodes) {
        if (node.type !== 'command') continue;
        const cmd = node as CommandNodeData;
        if (cmd.role === 'welcome' || cmd.role === 'help' || cmd.role === 'fallback') continue;

        const slotsStr = cmd.slots.map((s) => `'${escapeStr(s)}'`).join(', ');
        const isPattern = cmd.isPattern ? ', true' : '';
        const isAsync =
            cmd.actions?.some((a) => a.type === 'http_request') ||
            blockNeedsAsync(cmd.id, doc, validNodes);
        const asyncPrefix = isAsync ? 'async ' : '';

        lines.push(
            `bot.addCommand('${escapeStr(cmd.name)}', [${slotsStr}]${isPattern}, ${asyncPrefix}(cmd, ctrl) => {`,
        );

        // Инлайн-действия
        if (cmd.actions) {
            lines.push(...generateActionCode(cmd.actions, varNames));
        }

        // Инлайн-условия
        if (cmd.conditions) {
            for (const cond of cmd.conditions) {
                lines.push(...generateInlineCondition(cond, varNames));
            }
        }

        // Текст
        if (cmd.response?.text) {
            lines.push(`    ${setTextExpr(cmd.response.text)};`);
        }

        // Озвучка
        if (cmd.response?.tts) {
            lines.push(`    ${setTTSExpr(cmd.response.tts)};`);
        }

        // isEnd
        if (cmd.response?.isEnd) {
            lines.push(`    ctrl.isEnd = true;`);
        }

        // Кнопки
        if (cmd.response?.buttons) {
            lines.push(...generateButtonsCode(cmd.response.buttons));
        }

        // Карточки
        if (cmd.response?.card?.images) {
            lines.push(...generateCardCode(cmd.response.card));
        }

        // saveTo
        if (cmd.saveTo) {
            lines.push(`    ${safeVar(cmd.saveTo)} = cmd;`);
        }

        // Навигация
        lines.push(...generateNextNavigation(cmd.id, doc, validNodes));

        lines.push(`});`);
        lines.push(``);
    }

    // Регистрация шагов
    for (const node of validNodes) {
        if (node.type !== 'step') continue;
        const step = node as StepNodeData;

        const safeName = sanitizeIdentifier(step.name);
        const isAsync = step.actions?.some((a) => a.type === 'http_request');
        const asyncPrefix = isAsync ? 'async ' : '';

        lines.push(`bot.addStep('${escapeStr(safeName)}', ${asyncPrefix}(ctrl) => {`);

        // 1. Prompt text
        if (step.prompt?.text) {
            lines.push(`    ${setTextExpr(step.prompt.text)};`);
        }

        // 2. TTS
        if (step.prompt?.tts) {
            lines.push(`    ${setTTSExpr(step.prompt.tts)};`);
        }

        // 3. Buttons
        if (step.prompt?.buttons) {
            lines.push(...generateButtonsCode(step.prompt.buttons, '    ', false));
        }

        // 4. saveTo
        if (step.saveTo) {
            const saveExpr =
                step.saveAs === 'lowercase'
                    ? `(ctrl.userCommand ?? '').toLowerCase()`
                    : `ctrl.userCommand ?? ''`;
            lines.push(`    ${safeVar(step.saveTo)} = ${saveExpr};`);
        }

        // 5. Inline actions
        if (step.actions) {
            lines.push(...generateActionCode(step.actions, varNames));
        }

        // 6. Inline conditions
        if (step.conditions) {
            for (const cond of step.conditions) {
                lines.push(...generateInlineCondition(cond, varNames));
            }
        }

        // Навигация
        lines.push(...generateNextNavigation(step.id, doc, validNodes));

        lines.push(`});`);
        lines.push(``);
    }

    // Генерация step-обработчиков для standalone response/action/condition узлов.
    const generatedStandaloneIds = new Set<string>();

    for (const node of validNodes) {
        if (node.type === 'command' || node.type === 'step' || node.type === 'end') continue;
        if (generatedStandaloneIds.has(node.id)) continue;

        const hasIncoming = doc.edges.some(
            (e) =>
                e.to === node.id &&
                (e.type === 'next' || e.type === 'branch_true' || e.type === 'branch_false'),
        );
        // Также проверяем, является ли узел целью branch_true/branch_false от condition
        const isBranchTarget = doc.edges.some(
            (e) => e.to === node.id && (e.type === 'branch_true' || e.type === 'branch_false'),
        );
        if (!hasIncoming && !isBranchTarget) continue;

        generatedStandaloneIds.add(node.id);
        const rawName = (node as Record<string, unknown>).name as string;
        const safeName = sanitizeIdentifier(rawName);

        const isAsync = blockNeedsAsync(node.id, doc, validNodes);
        const asyncPrefix = isAsync ? 'async ' : '';

        lines.push(`bot.addStep('${escapeStr(safeName)}', ${asyncPrefix}(ctrl) => {`);

        if (node.type === 'response') {
            const resp = (
                node as {
                    response?: {
                        text?: string;
                        tts?: string;
                        isEnd?: boolean;
                        buttons?: { title: string; type: string; url?: string }[];
                    };
                }
            ).response;
            if (resp?.text) lines.push(`    ${setTextExpr(resp.text)};`);
            if (resp?.tts) lines.push(`    ${setTTSExpr(resp.tts)};`);
            if (resp?.isEnd) lines.push(`    ctrl.isEnd = true;`);
            if (resp?.buttons) {
                lines.push(...generateButtonsCode(resp.buttons));
            }
        }

        if (node.type === 'action') {
            const actionNode = node as {
                actions?: ActionBlock[];
                text?: string;
                buttons?: { title: string; type: string }[];
                card?: {
                    images: {
                        src: string;
                        title: string;
                        description: string;
                        button?: { title: string; type: string; url?: string };
                    }[];
                };
            };
            if (actionNode.actions) {
                lines.push(...generateActionCode(actionNode.actions, varNames));
            }
            if (actionNode.text) lines.push(`    ${setTextExpr(actionNode.text)};`);
            if (actionNode.buttons) {
                lines.push(...generateButtonsCode(actionNode.buttons, '    ', false));
            }
            if (actionNode.card?.images) {
                lines.push(...generateCardCode(actionNode.card));
            }
        }

        if (node.type === 'condition') {
            const condNode = node as {
                variable: string;
                operator: string;
                value: string | number;
            };
            const cond: FlowCondition = {
                variable: condNode.variable,
                operator: condNode.operator as FlowCondition['operator'],
                value: condNode.value,
            };
            lines.push(...generateConditionCode(cond, varNames));

            const trueEdge = doc.edges.find((e) => e.from === node.id && e.type === 'branch_true');
            const falseEdge = doc.edges.find(
                (e) => e.from === node.id && e.type === 'branch_false',
            );

            if (trueEdge) {
                const trueNode = validNodes.find((n) => n.id === trueEdge.to);
                if (trueNode) {
                    const trueName = sanitizeIdentifier(
                        (trueNode as Record<string, unknown>).name as string,
                    );
                    lines.push(
                        `    if (result) { ctrl.thisIntentName = '${escapeStr(trueName)}'; }`,
                    );
                }
            }
            if (falseEdge) {
                const falseNode = validNodes.find((n) => n.id === falseEdge.to);
                if (falseNode) {
                    const falseName = sanitizeIdentifier(
                        (falseNode as Record<string, unknown>).name as string,
                    );
                    lines.push(
                        `    if (!result) { ctrl.thisIntentName = '${escapeStr(falseName)}'; }`,
                    );
                }
            }
        }

        // Навигация для next-ребра
        lines.push(...generateNextNavigation(node.id, doc, validNodes, '    ', generatedStandaloneIds));

        lines.push(`});`);
        lines.push(``);
    }

    // Фоллбэк — текст из role-ноды fallback (если есть) или из metadata
    lines.push(`bot.addCommand(FALLBACK_COMMAND, [], (cmd, ctrl) => {`);
    lines.push(`    setText(ctrl, '${escapeStr(roleTexts.fallback)}');`);
    lines.push(`});`);
    lines.push(``);

    lines.push(`bot.start('localhost', 3000);`);

    return lines.join('\n');
}

/** Генерирует src/utils.ts с вспомогательными функциями setText и setTTS. */
function generateUtils(): string {
    return `import { BotController } from 'umbot';

/**
 * Установить текст ответа. Если текст уже задан — добавляет через \\n.
 */
export function setText(ctrl: BotController, text: string): void {
    if (ctrl.text) {
        ctrl.text += \`\\n\${text}\`;
    } else {
        ctrl.text = text;
    }
}

/**
 * Установить TTS. Если TTS уже задан — добавляет через пробел.
 */
export function setTTS(ctrl: BotController, text: string): void {
    if (ctrl.tts) {
        ctrl.tts += \` \${text}\`;
    } else {
        ctrl.tts = text;
    }
}
`;
}

/**
 * Генерирует все файлы для flow-документа.
 */
export function generateProject(doc: FlowDocument): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    files.push({ path: 'src/index.ts', content: generateIndexTs(doc) });
    files.push({ path: 'src/utils.ts', content: generateUtils() });
    files.push({ path: 'package.json', content: generatePackageJson(doc) });
    files.push({ path: 'tsconfig.json', content: generateTsConfig() });
    return files;
}

/** Генерирует содержимое package.json с именем проекта и зависимостями. */
function generatePackageJson(doc: FlowDocument): string {
    // Имя пакета: убираем все не-latin символы, начинающиеся с цифры заменяем на bot-
    let name = (doc.name || 'my-bot')
        .replace(NON_ALPHANUMERIC_HYPHEN, '-')
        .toLowerCase()
        .replace(/^[-]+/, 'bot-')
        .replace(MULTIPLE_HYPHENS, '-')
        .replace(LEADING_TRAILING_HYPHENS, '');
    if (!name || /^[0-9]/.test(name)) {
        name = 'bot-' + name;
    }
    return JSON.stringify(
        {
            name,
            version: doc.version || '1.0.0',
            main: './dist/index.js',
            scripts: { start: 'node ./dist/index.js', build: 'tsc' },
            dependencies: { umbot: '^3.0.0' },
            devDependencies: { typescript: '^5.7.0' },
        },
        null,
        2,
    );
}

/** Генерирует содержимое tsconfig.json для TypeScript-проекта. */
function generateTsConfig(): string {
    return JSON.stringify(
        {
            compilerOptions: {
                target: 'es2023',
                module: 'commonjs',
                moduleResolution: 'node',
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                outDir: './dist',
                rootDir: './src',
            },
            include: ['src/**/*'],
        },
        null,
        2,
    );
}
