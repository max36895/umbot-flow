import type {
    ActionBlock,
    ActionNodeData,
    CommandNodeData,
    ConditionOperator,
    FlowButton,
    FlowCard,
    FlowCondition,
    FlowDocument,
    FlowNodeData,
    ResponseNodeData,
    StepNodeData,
} from '../types/flow';
import { t, tf } from '../i18n';
import { TEMPLATE_VAR_REGEX, IS_SAY_TRUE_REGEX, IS_SAY_FALSE_REGEX, isUrl } from './regex';

/**
 * Движок превью чата — симуляция бота, сгенерированного `umbot create from-flow`.
 *
 * Превью обязано показывать то же, что ответит настоящий бот, поэтому модель
 * повторяет семантику CLI-генератора (umbot/cli/flowGenerator.js) и рантайма umbot:
 *
 * - Один ввод пользователя → ОДНО сообщение бота. Тексты всех блоков, выполненных
 *   за ход, склеиваются через перевод строки (setText дописывает к ctrl.text).
 * - «Ответ» / «Действие» / «Условие» не ждут пользователя: связанные с ними блоки
 *   выполняются сразу, в том же ходе (в CLI — прямые вызовы функций).
 * - «Шаг» — единственный блок ожидания. Переход НА шаг (thisIntentName) лишь
 *   запоминает его; обработчик шага срабатывает на СЛЕДУЮЩИЙ ввод: сохраняет ответ,
 *   выводит свой текст (реакцию на ответ) и продолжает цепочку.
 * - Переход на «Команду» ожиданием не является: thisIntentName в umbot ищет только
 *   шаги, дальше срабатывает обычный подбор команды по слотам.
 * - Кнопка без блока-цели отправляет свой текст как обычный ввод. Кнопка с блоком-целью
 *   (targetNodeId) — действие `[go:N]` в CLI: выполняет цель сразу, минуя ожидающий шаг;
 *   шаг и команда получают текст кнопки как ввод.
 *
 * - Старт диалога (/start в Telegram, новая сессия Алисы) — приветствие: нода welcome
 *   или текст и кнопки из настроек, без них — fallback. /start пропускает ожидающий шаг.
 *   Без нод welcome/help на «привет»/«помощь» отвечают тексты из настроек бота.
 * - Подбор команды: ввод в нижнем регистре; сначала точное совпадение со слотом, затем
 *   вхождение/регулярка по порядку. Согласие/отказ/ссылка — те же проверки, что Text в umbot.
 *
 * Шаг: сохранить ответ → действия шага → текст шага. eq/neq сравнивают значения как
 * строки ("2" == 2), isEnd у «Ответа» завершает диалог — так генерирует CLI после
 * исправлений (в umbot 3.1.1 из npm их ещё нет).
 *
 * Отличие от CLI: actions у блока «Ответ» (поле без UI, осталось от старых игр)
 * превью выполняет, а CLI не генерирует.
 */

/** Кнопка в сообщении превью. */
export interface PreviewButton {
    title: string;
    url?: string;
    /** Блок, который выполнит нажатие (кнопка с переходом). */
    target?: string;
}

/** Сообщение в ленте превью. */
export interface PreviewMessage {
    role: 'user' | 'bot';
    text: string;
    buttons?: PreviewButton[];
    card?: FlowCard;
    /** Бот завершил диалог (isEnd). */
    isEnd?: boolean;
}

/** Состояние диалога между ходами (аналог userData + oldIntentName). */
export interface DialogState {
    vars: Record<string, string>;
    /** Шаг, который обработает следующий ввод (thisIntentName). */
    waitStep: string | null;
}

/** Результат одного хода. */
export interface TurnResult {
    /** Ответ бота или null, если бот ничего не отправил. */
    reply: PreviewMessage | null;
    state: DialogState;
}

/** Слоты по умолчанию у welcome/help в umbot (WELCOME_INTENT_SLOTS, HELP_INTENT_SLOTS). */
const WELCOME_SLOTS = ['привет', 'здравст'];
const HELP_SLOTS = ['помощь', 'что ты умеешь'];
/** Команда старта Telegram: CLI добавляет её к слотам приветствия. */
const START_SLOT = '/start';

/** Предохранитель от бесконечной рекурсии блоков (CLI упал бы с переполнением стека). */
const MAX_BLOCK_CALLS = 200;
/** Лимит поиска следующего шага/команды — как в findNextNonBlockNode CLI. */
const MAX_NAV_HOPS = 20;

const BLOCK_TYPES = new Set(['action', 'condition', 'response']);

export const EMPTY_STATE: DialogState = { vars: {}, waitStep: null };

/* ───────────────────────── Переменные и выражения ───────────────────────── */

/** Защита от prototype pollution при записи в vars. */
function isSafeVarName(name: string): boolean {
    return name !== '__proto__' && name !== 'constructor' && name !== 'prototype';
}

/** Убирает обёртку {{ }} у имени переменной (VariablePicker вставляет {{var}}). */
function unwrapVar(name: string): string {
    return name.startsWith('{{') && name.endsWith('}}') ? name.slice(2, -2) : name;
}

function getSystemVar(name: string): string {
    const now = new Date();
    switch (name) {
        case '__currentTime':
            return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        case '__currentDate':
            return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
        case '__currentTimestamp':
            // Как в CLI (Date.now()): миллисекунды
            return String(Date.now());
        case '__randomNumber':
            return String(Math.floor(Math.random() * 101));
        case '__userName':
            return t('system.userName');
        default:
            return `{{${name}}}`;
    }
}

/** Подставить {{переменные}} в текст. */
export function substitute(text: string, vars: Record<string, string>): string {
    return text.replace(TEMPLATE_VAR_REGEX, (_, key: string) => {
        if (vars[key] !== undefined) return vars[key];
        if (SYSTEM_VARS.has(key)) return getSystemVar(key);
        // Как в CLI (`${ctrl.userData.x ?? ''}`): незаданная переменная — пустая строка
        return '';
    });
}

/** Системные переменные, которые знает CLI. */
const SYSTEM_VARS = new Set([
    '__currentTime',
    '__currentDate',
    '__currentTimestamp',
    '__randomNumber',
    '__userName',
]);

/** Имена переменных сценария (collectVarNames CLI): saveTo, поле действия, saveResponseTo. */
const varNamesCache = new WeakMap<FlowDocument, Set<string>>();
function getVarNames(doc: FlowDocument): Set<string> {
    let names = varNamesCache.get(doc);
    if (!names) {
        names = new Set();
        for (const n of doc.nodes) {
            const saveTo = (n as { saveTo?: string }).saveTo;
            if (saveTo && !SYSTEM_VARS.has(saveTo)) names.add(saveTo);
            for (const a of (n as { actions?: ActionBlock[] }).actions ?? []) {
                if (a.field && !SYSTEM_VARS.has(a.field)) names.add(a.field);
                if (a.saveResponseTo && !SYSTEM_VARS.has(a.saveResponseTo)) {
                    names.add(a.saveResponseTo);
                }
            }
        }
        varNamesCache.set(doc, names);
    }
    return names;
}

const JS_IDENTIFIER = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/**
 * Арифметика set_variable — та же грамматика, что parseArithmeticExpression CLI:
 * числа, переменные сценария, системные переменные, + - * / % и скобки.
 * Незаданная переменная считается нулём. Если выражение не разбирается — null
 * (CLI сохраняет такое значение как обычный текст).
 */
function evalArithmetic(source: string, ctx: TurnContext): number | null {
    const tokens: { type: 'number' | 'name' | 'operator'; value: string }[] = [];
    const tokenPattern = /^\s*(?:(\d+(?:\.\d*)?|\.\d+)|([A-Za-z_$][A-Za-z0-9_$]*)|([()+\-*/%]))/;
    let offset = 0;
    while (offset < source.length) {
        const match = tokenPattern.exec(source.slice(offset));
        if (!match) return null;
        offset += match[0].length;
        if (match[1]) tokens.push({ type: 'number', value: match[1] });
        else if (match[2]) tokens.push({ type: 'name', value: match[2] });
        else tokens.push({ type: 'operator', value: match[3]! });
    }
    const varNames = getVarNames(ctx.doc);
    let pos = 0;
    const primary = (): number | null => {
        const token = tokens[pos];
        if (!token) return null;
        if (token.type === 'number') {
            pos++;
            return Number(token.value);
        }
        if (token.type === 'name') {
            pos++;
            if (SYSTEM_VARS.has(token.value)) return Number(getSystemVar(token.value));
            if (varNames.has(token.value) && JS_IDENTIFIER.test(token.value)) {
                return Number(ctx.vars[token.value] ?? 0);
            }
            return null;
        }
        if (token.value === '(') {
            pos++;
            const value = additive();
            if (value === null || tokens[pos]?.value !== ')') return null;
            pos++;
            return value;
        }
        return null;
    };
    const unary = (): number | null => {
        const token = tokens[pos];
        if (token?.value === '+' || token?.value === '-') {
            pos++;
            const operand = unary();
            return operand === null ? null : token.value === '-' ? -operand : operand;
        }
        return primary();
    };
    const multiplicative = (): number | null => {
        let value = unary();
        while (value !== null && ['*', '/', '%'].includes(tokens[pos]?.value ?? '')) {
            const op = tokens[pos]!.value;
            pos++;
            const right = unary();
            if (right === null) return null;
            value = op === '*' ? value * right : op === '/' ? value / right : value % right;
        }
        return value;
    };
    const additive = (): number | null => {
        let value = multiplicative();
        while (value !== null && ['+', '-'].includes(tokens[pos]?.value ?? '')) {
            const op = tokens[pos]!.value;
            pos++;
            const right = multiplicative();
            if (right === null) return null;
            value = op === '+' ? value + right : value - right;
        }
        return value;
    };
    const result = additive();
    return result !== null && pos === tokens.length ? result : null;
}

/** Выполнить блоки действий (set_variable, random_number, http_request-заглушка). */
function executeActions(actions: ActionBlock[] | undefined, ctx: TurnContext): void {
    for (const action of actions ?? []) {
        const field = action.field ? unwrapVar(action.field) : '';
        switch (action.type) {
            case 'set_variable': {
                const value = String(action.value ?? '').trim();
                if (!field || !value || !isSafeVarName(field)) break;
                // Порядок разбора — как getSetVariableExpression в CLI
                if (value.includes('{{')) {
                    ctx.vars[field] = substitute(value, ctx.vars);
                } else if (getVarNames(ctx.doc).has(value)) {
                    ctx.vars[field] = ctx.vars[value] ?? '';
                } else if (SYSTEM_VARS.has(value)) {
                    ctx.vars[field] = getSystemVar(value);
                } else if (Number.isFinite(Number(value))) {
                    ctx.vars[field] = String(Number(value));
                } else {
                    const result = evalArithmetic(value, ctx);
                    ctx.vars[field] = result === null ? value : String(result);
                }
                break;
            }
            case 'random_number': {
                if (!field || !isSafeVarName(field)) break;
                const min = action.min ?? 1;
                const max = action.max ?? 10;
                ctx.vars[field] = String(Math.floor(Math.random() * (max - min + 1)) + min);
                break;
            }
            case 'http_request': {
                if (!action.url) break;
                // Превью — имитация: запрос не выполняется, это видно пользователю
                ctx.texts.push(
                    tf('preview.httpMock', {
                        method: action.method ?? 'GET',
                        url: action.url || '?',
                    }),
                );
                if (action.saveResponseTo && isSafeVarName(action.saveResponseTo)) {
                    ctx.vars[action.saveResponseTo] = `(${t('preview.httpMockData')})`;
                }
                break;
            }
        }
    }
}

/** Вычислить условие. Без переменной isSayTrue/isSayFalse/isUrl проверяют сам ввод. */
function evaluateCondition(
    cond: { variable?: unknown; operator: ConditionOperator | string; value?: unknown },
    ctx: TurnContext,
): boolean {
    const varName = unwrapVar(String(cond.variable ?? ''));
    // Без переменной проверяется ввод — в umbot это ctrl.userCommand (нижний регистр, без пробелов по краям)
    const condVar = varName ? (ctx.vars[varName] ?? '') : ctx.input.toLowerCase().trim();
    const rawValue = unwrapVar(String(cond.value ?? ''));
    const condValue = ctx.vars[rawValue] !== undefined ? ctx.vars[rawValue]! : rawValue;

    const numVar = Number(condVar);
    const numVal = Number(condValue);

    switch (cond.operator) {
        // Как isEqual в сгенерированном utils.ts: значения сравниваются строками
        case 'eq':
            return condVar === condValue;
        case 'neq':
            return condVar !== condValue;
        case 'gt':
            return numVar > numVal;
        case 'gte':
            return numVar >= numVal;
        case 'lt':
            return numVar < numVal;
        case 'lte':
            return numVar <= numVal;
        case 'contains':
            return condVar.includes(condValue);
        case 'isEmpty':
            return !condVar;
        case 'isNotEmpty':
            return !!condVar;
        case 'isSayTrue':
            return IS_SAY_TRUE_REGEX.test(condVar);
        case 'isSayFalse':
            return IS_SAY_FALSE_REGEX.test(condVar);
        case 'isUrl':
            return isUrl(condVar);
        default:
            return condVar === condValue;
    }
}

/* ───────────────────────────── Контекст хода ───────────────────────────── */

interface TurnContext {
    doc: FlowDocument;
    input: string;
    vars: Record<string, string>;
    texts: string[];
    buttons: PreviewButton[];
    card?: FlowCard;
    isEnd: boolean;
    /** ctrl.thisIntentName — id ноды (шаг/команда), куда перейдёт диалог. */
    nextIntent: string | null;
    blockCalls: number;
}

function nodeById(doc: FlowDocument, id: string): FlowNodeData | undefined {
    return doc.nodes.find((n) => n.id === id);
}

function addText(ctx: TurnContext, text: string | undefined): void {
    if (text) ctx.texts.push(substitute(text, ctx.vars));
}

function addButtons(ctx: TurnContext, buttons: FlowButton[] | undefined, shuffle = false): void {
    const valid = (buttons ?? []).filter((b) => b.title?.trim());
    // Случайный порядок — тот же алгоритм, что в сгенерированном CLI коде
    if (shuffle && valid.length > 1) {
        for (let i = valid.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [valid[i], valid[j]] = [valid[j]!, valid[i]!];
        }
    }
    for (const b of valid) {
        const target = b.type !== 'link' ? getButtonTarget(ctx.doc, b) : undefined;
        ctx.buttons.push({
            title: substitute(b.title, ctx.vars),
            url: b.type === 'link' && b.url ? substitute(b.url, ctx.vars) : undefined,
            target: target?.id,
        });
    }
}

/** Типы блоков, на которые может вести кнопка (как BUTTON_TARGET_TYPES в CLI). */
const BUTTON_TARGET_TYPES = new Set(['command', 'step', 'action', 'condition', 'response']);

/** Блок-цель кнопки или undefined (нет цели, «Завершение», несуществующий блок). */
export function getButtonTarget(doc: FlowDocument, button: FlowButton): FlowNodeData | undefined {
    if (!button.targetNodeId) return undefined;
    const target = nodeById(doc, button.targetNodeId);
    return target && BUTTON_TARGET_TYPES.has(target.type) ? target : undefined;
}

function setCard(ctx: TurnContext, card: FlowCard | undefined): void {
    if (!card || card.images.length === 0) return;
    ctx.card = {
        ...card,
        title: substitute(card.title, ctx.vars),
        images: card.images.map((img) => ({
            ...img,
            src: substitute(img.src, ctx.vars),
            title: substitute(img.title, ctx.vars),
            description: substitute(img.description, ctx.vars),
            // Кнопка картинки с переходом — как кнопка ответа (действие [go:N] в CLI)
            button: img.button?.title?.trim()
                ? {
                      ...img.button,
                      title: substitute(img.button.title, ctx.vars),
                      targetNodeId: getButtonTarget(ctx.doc, img.button)?.id,
                  }
                : undefined,
        })),
    };
}

/**
 * Блоки (action/condition/response), связанные исходящими рёбрами с нодой.
 * Порядок — порядок нод в документе, как в findOutgoingBlocks CLI.
 */
function outgoingBlocks(doc: FlowDocument, nodeId: string): FlowNodeData[] {
    const targets = new Set(
        doc.edges
            .filter(
                (e) =>
                    e.from === nodeId &&
                    (e.type === 'next' || e.type === 'branch_true' || e.type === 'branch_false'),
            )
            .map((e) => e.to),
    );
    return doc.nodes.filter((n) => BLOCK_TYPES.has(n.type) && targets.has(n.id));
}

/** Следующий шаг/команда по первым next-рёбрам, минуя блоки (findNextNonBlockNode). */
function findNextNonBlockNode(doc: FlowDocument, fromId: string): FlowNodeData | null {
    let currentId = fromId;
    for (let hop = 0; hop < MAX_NAV_HOPS; hop++) {
        const edge = doc.edges.find((e) => e.from === currentId && e.type === 'next');
        if (!edge) return null;
        const next = nodeById(doc, edge.to);
        if (!next) return null;
        if (next.type === 'command' || next.type === 'step') return next;
        currentId = next.id;
    }
    return null;
}

/** Текст хотя бы у одного из блоков (hasTextFromBlocks CLI). */
function hasTextFromBlocks(blocks: FlowNodeData[]): boolean {
    return blocks.some(
        (b) =>
            (b.type === 'action' && !!(b as ActionNodeData).text) ||
            (b.type === 'response' && !!(b as ResponseNodeData).response?.text),
    );
}

/** Инлайн-условия команды/шага (targetNodeId ведёт на шаг/команду). */
function runInlineConditions(conditions: FlowCondition[] | undefined, ctx: TurnContext): void {
    for (const cond of conditions ?? []) {
        const varName = unwrapVar(String(cond.variable ?? ''));
        const supportsInput = ['isSayTrue', 'isSayFalse', 'isUrl'].includes(cond.operator);
        if (!varName && !supportsInput) continue;

        if (evaluateCondition(cond, ctx)) {
            const target = cond.responseTrue?.targetNodeId
                ? nodeById(ctx.doc, cond.responseTrue.targetNodeId)
                : undefined;
            if (target && (target.type === 'step' || target.type === 'command')) {
                ctx.nextIntent = target.id;
            } else if (cond.responseTrue) {
                addText(ctx, cond.responseTrue.text);
                addButtons(ctx, cond.responseTrue.buttons);
            }
        } else if (cond.responseFalse) {
            addText(ctx, cond.responseFalse.text);
            addButtons(ctx, cond.responseFalse.buttons);
        }
    }
}

/** Выполнить связанный блок (функция __name(ctrl) в сгенерированном коде). */
function runBlock(block: FlowNodeData, ctx: TurnContext): void {
    if (++ctx.blockCalls > MAX_BLOCK_CALLS) {
        if (ctx.blockCalls === MAX_BLOCK_CALLS + 1) ctx.texts.push(t('preview.blockLimit'));
        return;
    }
    const { doc } = ctx;

    if (block.type === 'condition') {
        const result = evaluateCondition(block as FlowNodeData & FlowCondition, ctx);
        const edge = doc.edges.find(
            (e) => e.from === block.id && e.type === (result ? 'branch_true' : 'branch_false'),
        );
        const target = edge ? nodeById(doc, edge.to) : undefined;
        if (!target) return;
        if (target.type === 'step' || target.type === 'command') {
            ctx.nextIntent = target.id;
        } else if (BLOCK_TYPES.has(target.type)) {
            runBlock(target, ctx);
        }
        return;
    }

    if (block.type === 'response') {
        const resp = block as ResponseNodeData;
        executeActions(resp.actions, ctx);
        addText(ctx, resp.response?.text);
        addButtons(ctx, resp.response?.buttons, resp.response?.shuffleButtons);
        setCard(ctx, resp.response?.card);
        if (resp.response?.isEnd) ctx.isEnd = true;
    } else if (block.type === 'action') {
        const act = block as ActionNodeData;
        executeActions(act.actions, ctx);
        addText(ctx, act.text);
        addButtons(ctx, act.buttons);
        setCard(ctx, act.card);
    }

    const blocks = outgoingBlocks(doc, block.id);
    for (const b of blocks) runBlock(b, ctx);
    if (blocks.length === 0) {
        const next = findNextNonBlockNode(doc, block.id);
        if (next) ctx.nextIntent = next.id;
    }
}

/** Обработчик addCommand. */
function runCommand(cmd: CommandNodeData, ctx: TurnContext): void {
    // Ввод сохраняется до действий и текста (как шаг): {{переменная}} видит текущий ввод
    if (cmd.saveTo?.trim() && isSafeVarName(cmd.saveTo)) ctx.vars[cmd.saveTo] = ctx.input;
    executeActions(cmd.actions, ctx);
    runInlineConditions(cmd.conditions, ctx);

    const blocks = outgoingBlocks(ctx.doc, cmd.id);
    for (const b of blocks) runBlock(b, ctx);

    // CLI: собственный текст команды выводится, только если связанные блоки не задают текст
    if (!hasTextFromBlocks(blocks)) addText(ctx, cmd.response?.text);
    if (cmd.response?.isEnd) ctx.isEnd = true;
    addButtons(ctx, cmd.response?.buttons, cmd.response?.shuffleButtons);
    setCard(ctx, cmd.response?.card);

    const hasConditionWithTarget = (cmd.conditions ?? []).some((c) => c.responseTrue?.targetNodeId);
    if (!hasConditionWithTarget) {
        const next = findNextNonBlockNode(ctx.doc, cmd.id);
        if (next) ctx.nextIntent = next.id;
    }
}

/** Обработчик addStep: срабатывает на ввод, пришедший ПОСЛЕ перехода на шаг. */
function runStep(step: StepNodeData, ctx: TurnContext): void {
    // Сначала ответ и действия, потом текст шага: в тексте видны свежие значения
    if (step.saveTo?.trim() && isSafeVarName(step.saveTo)) {
        ctx.vars[step.saveTo] = step.saveAs === 'lowercase' ? ctx.input.toLowerCase() : ctx.input;
    }
    executeActions(step.actions, ctx);
    addText(ctx, step.prompt?.text);
    addButtons(ctx, step.prompt?.buttons, step.prompt?.shuffleButtons);
    setCard(ctx, step.prompt?.card);
    runInlineConditions(step.conditions, ctx);

    for (const b of outgoingBlocks(ctx.doc, step.id)) runBlock(b, ctx);

    const hasConditionWithTarget = (step.conditions ?? []).some(
        (c) => c.responseTrue?.targetNodeId,
    );
    if (!hasConditionWithTarget) {
        const next = findNextNonBlockNode(ctx.doc, step.id);
        if (next) ctx.nextIntent = next.id;
    }
}

/* ───────────────────────────── Подбор команды ───────────────────────────── */

/** Кэш регулярных выражений слотов-паттернов. */
const slotRegexCache = new Map<string, RegExp | null>();

/** Паттерны с вложенными квантификаторами отклоняем (ReDoS). */
function getSlotRegex(slot: string): RegExp | null {
    if (slotRegexCache.has(slot)) return slotRegexCache.get(slot)!;
    const dangerous = /(\([^)]*[+*][^)]*\))[+*]|(\[[^\]]*\])[+*][+*]|[+*]\([^)]*\)[+*]/;
    let re: RegExp | null = null;
    if (!dangerous.test(slot)) {
        try {
            re = new RegExp(slot, 'i');
        } catch {
            re = null;
        }
    }
    slotRegexCache.set(slot, re);
    return re;
}

function commandRole(cmd: CommandNodeData): 'welcome' | 'help' | 'fallback' | null {
    if (cmd.role === 'welcome' || cmd.name === 'welcome') return 'welcome';
    if (cmd.role === 'help' || cmd.name === 'help') return 'help';
    if (cmd.role === 'fallback' || cmd.name === 'fallback') return 'fallback';
    return null;
}

function commandSlots(cmd: CommandNodeData): string[] {
    const slots = (cmd.slots ?? []).filter((s) => s && s !== START_SLOT);
    const role = commandRole(cmd);
    // Приветствие CLI регистрирует со слотом /start (плюс собственные или стандартные слоты)
    if (role === 'welcome') return [START_SLOT, ...(slots.length > 0 ? slots : WELCOME_SLOTS)];
    if (slots.length > 0) return slots;
    if (role === 'help') return HELP_SLOTS;
    return [];
}

function findRoleCommand(
    doc: FlowDocument,
    role: 'welcome' | 'help' | 'fallback',
): CommandNodeData | undefined {
    return doc.nodes.find(
        (n) => n.type === 'command' && commandRole(n as CommandNodeData) === role,
    ) as CommandNodeData | undefined;
}

/** Приветствие из настроек бота — только без ноды welcome (getSettingsWelcome в CLI). */
function settingsWelcome(doc: FlowDocument): { text: string; buttons: FlowButton[] } | null {
    if (findRoleCommand(doc, 'welcome')) return null;
    const text = doc.welcome?.text ?? '';
    const buttons = (doc.welcome?.buttons ?? []).filter((b) => b.title?.trim());
    return text.trim() || buttons.length > 0 ? { text, buttons } : null;
}

/** Справка из настроек бота — только без ноды help (getSettingsHelpText в CLI). */
function settingsHelpText(doc: FlowDocument): string {
    if (findRoleCommand(doc, 'help')) return '';
    return (doc.helpText?.text ?? '').trim();
}

/** Что сработает на ввод: нода-команда либо приветствие/справка из настроек бота. */
type CommandEntry =
    | { kind: 'node'; cmd: CommandNodeData; slots: string[]; isPattern: boolean }
    | { kind: 'welcome' | 'help'; slots: string[]; isPattern: false };

/** Команды в порядке регистрации в сгенерированном боте (fallback в подборе не участвует). */
function commandEntries(doc: FlowDocument): CommandEntry[] {
    const entries: CommandEntry[] = [];
    for (const node of doc.nodes) {
        if (node.type !== 'command') continue;
        const cmd = node as CommandNodeData;
        if (commandRole(cmd) === 'fallback') continue;
        entries.push({ kind: 'node', cmd, slots: commandSlots(cmd), isPattern: !!cmd.isPattern });
    }
    if (settingsWelcome(doc)) {
        entries.push({ kind: 'welcome', slots: [START_SLOT, ...WELCOME_SLOTS], isPattern: false });
    }
    if (settingsHelpText(doc)) {
        entries.push({ kind: 'help', slots: HELP_SLOTS, isPattern: false });
    }
    return entries;
}

/**
 * Подбор команды как в umbot: ввод приводится к нижнему регистру и обрезается;
 * сначала точное совпадение со слотом (первая зарегистрированная команда с таким слотом),
 * затем по порядку — вхождение слота (Text.isSayText) или регулярное выражение.
 */
function matchEntry(doc: FlowDocument, text: string): CommandEntry | null {
    const command = text.toLowerCase().trim();
    if (!command) return null;
    const entries = commandEntries(doc);
    for (const entry of entries) {
        if (!entry.isPattern && entry.slots.some((slot) => slot === command)) return entry;
    }
    for (const entry of entries) {
        for (const slot of entry.slots) {
            if (!slot) continue;
            if (entry.isPattern) {
                if (getSlotRegex(slot)?.test(command)) return entry;
            } else if (command.includes(slot)) {
                return entry;
            }
        }
    }
    return null;
}

/** Найти команду-ноду по вводу (приветствие/справка из настроек не учитываются). */
export function matchCommand(doc: FlowDocument, text: string): CommandNodeData | null {
    const entry = matchEntry(doc, text);
    return entry?.kind === 'node' ? entry.cmd : null;
}

/* ───────────────────────────────── Ходы ───────────────────────────────── */

function newContext(doc: FlowDocument, state: DialogState, input: string): TurnContext {
    return {
        doc,
        input,
        vars: { ...state.vars },
        texts: [],
        buttons: [],
        isEnd: false,
        nextIntent: null,
        blockCalls: 0,
    };
}

function finishTurn(ctx: TurnContext): TurnResult {
    const nextNode = ctx.nextIntent ? nodeById(ctx.doc, ctx.nextIntent) : undefined;
    const waitStep = !ctx.isEnd && nextNode?.type === 'step' ? nextNode.id : null;
    const hasContent = ctx.texts.length > 0 || ctx.buttons.length > 0 || !!ctx.card;
    return {
        reply: hasContent
            ? {
                  role: 'bot',
                  text: ctx.texts.join('\n'),
                  buttons: ctx.buttons.length > 0 ? ctx.buttons : undefined,
                  card: ctx.card,
                  isEnd: ctx.isEnd || undefined,
              }
            : null,
        state: { vars: ctx.vars, waitStep },
    };
}

/** Приветствие: нода welcome либо текст и кнопки из настроек. false — приветствия нет. */
function runWelcome(ctx: TurnContext): boolean {
    const welcome = findRoleCommand(ctx.doc, 'welcome');
    if (welcome) {
        runCommand(welcome, ctx);
        return true;
    }
    const fromSettings = settingsWelcome(ctx.doc);
    if (!fromSettings) return false;
    addText(ctx, fromSettings.text);
    addButtons(ctx, fromSettings.buttons);
    return true;
}

/** Fallback: нода fallback либо текст «не понял» из настроек. */
function runFallback(ctx: TurnContext): void {
    const fallback = findRoleCommand(ctx.doc, 'fallback');
    if (fallback) {
        runCommand(fallback, ctx);
    } else {
        addText(ctx, ctx.doc.fallback?.text || t('preview.defaultFallback'));
    }
}

/**
 * Начало диалога — как старт в сгенерированном боте (/start в Telegram, новая сессия
 * Алисы): приветствие (нода welcome или текст из настроек), а без него — fallback.
 */
export function startDialog(doc: FlowDocument): TurnResult {
    const ctx = newContext(doc, EMPTY_STATE, '');
    if (!runWelcome(ctx)) runFallback(ctx);
    return finishTurn(ctx);
}

/**
 * Обработать ввод пользователя (текст или заголовок нажатой кнопки).
 * Приоритет как в umbot: кнопка с переходом → активный шаг → команда по слотам → fallback.
 *
 * @param target Блок-цель нажатой кнопки: выполняется сразу, ожидающий шаг пропускает
 *   нажатие (в CLI — действие `[go:N]`); шаг и команда получают текст кнопки как ввод.
 */
export function sendInput(
    doc: FlowDocument,
    state: DialogState,
    input: string,
    target?: string,
): TurnResult {
    const ctx = newContext(doc, state, input);

    const targetNode = target ? nodeById(doc, target) : undefined;
    if (targetNode && BUTTON_TARGET_TYPES.has(targetNode.type)) {
        if (targetNode.type === 'step') runStep(targetNode as StepNodeData, ctx);
        else if (targetNode.type === 'command') runCommand(targetNode as CommandNodeData, ctx);
        else runBlock(targetNode, ctx);
        return finishTurn(ctx);
    }

    // /start начинает диалог заново: ожидающий шаг его пропускает (в CLI шаг возвращает false)
    const isStart = input.toLowerCase().trim().startsWith(START_SLOT);
    const step = state.waitStep && !isStart ? nodeById(doc, state.waitStep) : undefined;
    if (step?.type === 'step') {
        runStep(step as StepNodeData, ctx);
        return finishTurn(ctx);
    }

    const matched = matchEntry(doc, input);
    if (matched?.kind === 'node') {
        runCommand(matched.cmd, ctx);
    } else if (matched?.kind === 'welcome') {
        runWelcome(ctx);
    } else if (matched?.kind === 'help') {
        addText(ctx, settingsHelpText(doc));
    } else {
        runFallback(ctx);
    }
    return finishTurn(ctx);
}
