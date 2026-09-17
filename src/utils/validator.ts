import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import type {
    FlowDocument,
    FlowButton,
    CommandNodeData,
    StepNodeData,
    ConditionNodeData,
    ActionNodeData,
    ResponseNodeData,
} from '../types/flow';
import { isValidJSIdentifier, sanitizeIdentifier } from './identifiers';
import { t, tf } from '../i18n';

/** Validation error. */
export interface ValidationError {
    code: string;
    message: string;
    nodeId?: string;
    /** Какое поле ноды сломано ('name' | 'saveTo' | 'slots' | 'actions' | etc.) — для подсветки в UI. */
    field?: string;
    /** Индекс действия в массиве actions — для точечной подсветки конкретного блока. */
    actionIndex?: number;
}
import flowSchema from '../schemas/flow.schema.json';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

const validateSchema = ajv.compile(flowSchema);

/** Validate flow document against JSON schema. */
export function validateSchemaLevel(doc: unknown): ValidationError[] {
    const valid = validateSchema(doc);
    if (valid) return [];

    // Допустимые типы блоков — только для проверки, в UI не показываются
    const validTypes = new Set(['command', 'step', 'condition', 'action', 'response', 'end']);

    return (validateSchema.errors ?? []).map((err: ErrorObject) => {
        const path = err.instancePath || '/';
        let message = err.message ?? t('validation.v.badValue');

        const parts = path.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1] ?? '';

        // Упрощаем сообщения AJV
        if (message.includes('must be equal to constant')) {
            if (lastPart === 'type') {
                // Пытаемся найти тип ноды
                const nodes = (doc as Record<string, unknown>)?.nodes as unknown[];
                const nodeIdx = parseInt(parts[1] || '0');
                const typeName = (nodes?.[nodeIdx] as Record<string, unknown>)?.type as
                    string | undefined;
                if (typeName && !validTypes.has(typeName)) {
                    message = tf('validation.v.unknownType', { type: typeName });
                } else if (typeName) {
                    message = tf('validation.v.badType', { idx: nodeIdx + 1, type: typeName });
                } else {
                    message = tf('validation.v.badTypeNoName', { idx: nodeIdx + 1 });
                }
            } else if (lastPart === 'operator') {
                message = t('validation.v.unknownOperator');
            } else {
                message = tf('validation.v.badValue', { field: lastPart });
            }
        } else if (message.includes('must match exactly one schema in oneOf')) {
            message = t('validation.v.invalidJson');
        } else if (message.includes('must be equal to one of the allowed values')) {
            if (lastPart === 'operator') {
                message = t('validation.v.unknownOperator');
            } else {
                message = tf('validation.v.badValue', { field: lastPart });
            }
        } else if (message.includes('required')) {
            const field = path.split('/').pop() || t('validation.v.requiredField');
            message = tf('validation.v.required', { field });
        } else if (message.includes('must be string')) {
            message = tf('validation.v.mustBeString', { field: path.split('/').pop() || '?' });
        } else if (message.includes('must be array')) {
            message = tf('validation.v.mustBeArray', { field: path.split('/').pop() || '?' });
        } else if (message.includes('must be object')) {
            message = tf('validation.v.mustBeObject', { field: path.split('/').pop() || '?' });
        }

        return {
            code: 'SCHEMA_ERROR',
            message,
        };
    });
}

/** Validate graph-level constraints. */
export function validateGraph(doc: FlowDocument): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeIds = new Set(doc.nodes.map((n) => n.id));

    // DUPLICATE_ID
    const seenIds = new Set<string>();
    for (const node of doc.nodes) {
        if (seenIds.has(node.id)) {
            errors.push({
                code: 'DUPLICATE_ID',
                message: tf('validation.v.duplicateId', { id: node.id }),
                nodeId: node.id,
            });
        }
        seenIds.add(node.id);
    }

    // DUPLICATE_NAMES — проверка уникальности имён блоков
    const seenNames = new Map<string, string>(); // name -> nodeId
    for (const node of doc.nodes) {
        // End ноды не имеют имени — пропускаем
        if (node.type === 'end') continue;

        // Role-ноды (welcome/help/fallback) имеют зарезервированные уникальные имена
        const role = (node as { role?: string }).role;
        if (role === 'welcome' || role === 'help' || role === 'fallback') continue;

        const name = (node as { name?: string }).name;
        if (!name) {
            errors.push({
                code: 'EMPTY_NAME',
                message: tf('validation.v.emptyNodeName', { id: node.id }),
                nodeId: node.id,
                field: 'name',
            });
            continue;
        }
        if (seenNames.has(name)) {
            errors.push({
                code: 'DUPLICATE_NAMES',
                message: tf('validation.v.duplicateNames', {
                    name,
                    a: seenNames.get(name)!,
                    b: node.id,
                }),
                nodeId: node.id,
                field: 'name',
            });
        } else {
            seenNames.set(name, node.id);
        }
    }

    // DUPLICATE_SANITIZED_NAMES — разные имена блоков после санитизации для кодогена
    // могут совпасть («my cmd» и «my-cmd» → оба my_cmd). Тогда два addStep с одним
    // именем: второй перетирает первый, навигация thisIntentName уходит не туда.
    {
        const sanitizedToOwners = new Map<string, { name: string; id: string }[]>();
        for (const node of doc.nodes) {
            if (node.type === 'end') continue;
            const role = (node as { role?: string }).role;
            if (role === 'welcome' || role === 'help' || role === 'fallback') continue;
            const name = (node as { name?: string }).name;
            if (!name) continue;
            const safeName = sanitizeIdentifier(name);
            const owners = sanitizedToOwners.get(safeName) ?? [];
            owners.push({ name, id: node.id });
            sanitizedToOwners.set(safeName, owners);
        }
        for (const [safeName, owners] of sanitizedToOwners) {
            if (owners.length < 2) continue;
            const first = owners[0];
            if (!first) continue;
            // Ошибка вешается на каждый узел конфликта, кроме первого (как DUPLICATE_NAMES)
            for (const owner of owners.slice(1)) {
                errors.push({
                    code: 'DUPLICATE_SANITIZED_NAMES',
                    message: tf('validation.v.dupSanitizedNames', {
                        name: owner.name,
                        target: safeName,
                        other: first.name,
                    }),
                    nodeId: owner.id,
                    field: 'name',
                });
            }
        }
    }

    // INVALID_VARIABLE_NAMES — проверка валидности имён переменных
    for (const node of doc.nodes) {
        if (node.type === 'command' || node.type === 'step') {
            const saveTo = (node as CommandNodeData | StepNodeData).saveTo;
            if (saveTo !== undefined && saveTo !== '' && !isValidJSIdentifier(saveTo)) {
                errors.push({
                    code: 'INVALID_VAR_NAME',
                    message: tf('validation.v.invalidVarName', { name: saveTo }),
                    nodeId: node.id,
                    field: 'saveTo',
                });
            }
            if (saveTo !== undefined && saveTo === '') {
                errors.push({
                    code: 'EMPTY_SAVE_TO',
                    message: tf('validation.v.emptyVarName', {
                        name: (node as { name?: string }).name || node.id,
                    }),
                    nodeId: node.id,
                    field: 'saveTo',
                });
            }
        }
        if (node.type === 'action') {
            const actions = (node as { actions?: Array<{ field?: string }> }).actions ?? [];
            for (const action of actions) {
                if (
                    action.field !== undefined &&
                    action.field !== '' &&
                    !isValidJSIdentifier(action.field)
                ) {
                    errors.push({
                        code: 'INVALID_VAR_NAME',
                        message: tf('validation.v.invalidVarName', { name: action.field }),
                        nodeId: node.id,
                        field: 'actions',
                    });
                }
                if (action.field !== undefined && action.field === '') {
                    errors.push({
                        code: 'EMPTY_ACTION_FIELD',
                        message: tf('validation.v.actionVarEmpty', {
                            name: (node as { name?: string }).name || node.id,
                        }),
                        nodeId: node.id,
                        field: 'actions',
                    });
                }
            }
        }
    }

    // ACTION_MISSING_FIELDS — проверка обязательных полей в action-блоках
    for (const node of doc.nodes) {
        const allActions: Array<{
            type?: string;
            field?: string;
            value?: string;
            url?: string;
            min?: number;
            max?: number;
            body?: string;
        }> = [];
        if (node.type === 'action') {
            allActions.push(...((node as { actions?: typeof allActions }).actions ?? []));
        }
        if (node.type === 'command' || node.type === 'step') {
            allActions.push(...((node as CommandNodeData | StepNodeData).actions ?? []));
        }
        for (const action of allActions) {
            const actionIndex = allActions.indexOf(action);
            const nodeName = (node as { name?: string }).name || node.id;
            if (action.type === 'random_number' && !action.field) {
                errors.push({
                    code: 'ACTION_MISSING_FIELD',
                    message: tf('validation.v.randomNoField', { name: nodeName }),
                    nodeId: node.id,
                    field: 'actions',
                    actionIndex,
                });
            }
            // random_number: min должен быть <= max
            if (
                action.type === 'random_number' &&
                action.min !== undefined &&
                action.max !== undefined &&
                action.min > action.max
            ) {
                errors.push({
                    code: 'RANDOM_MIN_GT_MAX',
                    message: tf('validation.v.randomMinGtMax', {
                        name: nodeName,
                        min: action.min,
                        max: action.max,
                    }),
                    nodeId: node.id,
                    field: 'actions',
                    actionIndex,
                });
            }
            if (action.type === 'set_variable') {
                if (!action.field) {
                    errors.push({
                        code: 'ACTION_MISSING_FIELD',
                        message: tf('validation.v.setNoField', { name: nodeName }),
                        nodeId: node.id,
                        field: 'actions',
                        actionIndex,
                    });
                }
                if (
                    action.value === undefined ||
                    (typeof action.value === 'string' && action.value.trim() === '')
                ) {
                    errors.push({
                        code: 'ACTION_MISSING_VALUE',
                        message: tf('validation.v.setNoValue', { name: nodeName }),
                        nodeId: node.id,
                        field: 'actions',
                        actionIndex,
                    });
                }
            }
            if (action.type === 'http_request' && !action.url) {
                errors.push({
                    code: 'ACTION_MISSING_URL',
                    message: tf('validation.v.httpNoUrl', { name: nodeName }),
                    nodeId: node.id,
                    field: 'actions',
                    actionIndex,
                });
            }
            // http_request: body без {{vars}} должен быть валидным JSON
            if (action.type === 'http_request' && action.body && !action.body.includes('{{')) {
                try {
                    JSON.parse(action.body);
                } catch {
                    errors.push({
                        code: 'INVALID_JSON_BODY',
                        message: tf('validation.v.httpBadJson', { name: nodeName }),
                        nodeId: node.id,
                        field: 'actions',
                        actionIndex,
                    });
                }
            }
        }
    }

    // DUPLICATE_SLOTS
    const slotMap = new Map<string, string>();
    for (const node of doc.nodes) {
        if (node.type !== 'command') continue;
        const cmd = node as CommandNodeData;
        for (const slot of cmd.slots) {
            if (slotMap.has(slot)) {
                errors.push({
                    code: 'DUPLICATE_SLOTS',
                    message: tf('validation.v.dupSlot', {
                        slot,
                        a: slotMap.get(slot)!,
                        b: cmd.id,
                    }),
                    nodeId: cmd.id,
                    field: 'slots',
                });
            } else {
                slotMap.set(slot, cmd.id);
            }
        }
    }

    // INLINE_CONDITION_VALIDATION — проверка инлайн-условий в командах/шагах
    const NO_VALUE_OPERATORS = new Set([
        'isSayTrue',
        'isSayFalse',
        'isUrl',
        'isEmpty',
        'isNotEmpty',
    ]);
    for (const node of doc.nodes) {
        if (node.type === 'command' || node.type === 'step') {
            const conditions = (node as CommandNodeData | StepNodeData).conditions ?? [];
            for (let i = 0; i < conditions.length; i++) {
                const cond = conditions[i];
                if (!cond) continue;
                if (!cond.variable && !USER_INPUT_OPERATORS.has(cond.operator)) {
                    errors.push({
                        code: 'CONDITION_EMPTY_VARIABLE',
                        message: tf('validation.v.condNoVar', {
                            name: (node as { name?: string }).name || node.id,
                            idx: i + 1,
                        }),
                        nodeId: node.id,
                        field: 'conditions',
                    });
                }
                if (
                    !NO_VALUE_OPERATORS.has(cond.operator) &&
                    (cond.value === undefined || cond.value === '')
                ) {
                    errors.push({
                        code: 'CONDITION_EMPTY_VALUE',
                        message: tf('validation.v.condNoVal', {
                            name: (node as { name?: string }).name || node.id,
                            idx: i + 1,
                        }),
                        nodeId: node.id,
                        field: 'conditions',
                    });
                }
            }
        }
    }

    // Build adjacency for graph checks
    const adjOut = new Map<string, string[]>();
    const adjIn = new Map<string, string[]>();
    for (const node of doc.nodes) {
        adjOut.set(node.id, []);
        adjIn.set(node.id, []);
    }

    // Edges
    for (const edge of doc.edges) {
        if (!nodeIds.has(edge.from)) {
            errors.push({
                code: 'INVALID_TARGET',
                message: tf('validation.v.edgeFromMissing', { id: edge.from }),
                nodeId: edge.from,
            });
        }
        if (!nodeIds.has(edge.to)) {
            errors.push({
                code: 'INVALID_TARGET',
                message: tf('validation.v.edgeToMissing', { id: edge.to }),
                nodeId: edge.to,
            });
        }
        adjOut.get(edge.from)?.push(edge.to);
        adjIn.get(edge.to)?.push(edge.from);
    }

    // Button targetNodeId checks
    for (const node of doc.nodes) {
        for (const btn of nodeButtons(node)) {
            if (btn.targetNodeId && !nodeIds.has(btn.targetNodeId)) {
                errors.push({
                    code: 'INVALID_TARGET',
                    message: tf('validation.v.buttonTargetMissing', { id: btn.targetNodeId }),
                    nodeId: node.id,
                });
            }
        }
        if (node.type === 'step') {
            const step = node as StepNodeData;
            if (step.next && !nodeIds.has(step.next)) {
                errors.push({
                    code: 'INVALID_TARGET',
                    message: tf('validation.v.stepTargetMissing', { id: step.next }),
                    nodeId: step.id,
                });
            }
        }
    }

    // BLOCK_CYCLE — циклы через command/step допустимы (переход идёт через thisIntentName),
    // а цикл только из action/condition/response CLI генерирует как взаимную рекурсию функций:
    // `umbot create from-flow` отклоняет такой flow. Проверка повторяет validateFlowSchema CLI.
    const cycle = findBlockCycle(doc);
    if (cycle) {
        const names = cycle.map((id) => {
            const n = doc.nodes.find((node) => node.id === id) as { name?: string } | undefined;
            return n?.name || id;
        });
        errors.push({
            code: 'BLOCK_CYCLE',
            message: tf('validation.v.blockCycle', { path: [...names, names[0]].join(' → ') }),
            nodeId: cycle[0],
        });
    }

    // MISSING_NEXT (step without next and not last — i.e., has no outgoing edges from any type)
    for (const node of doc.nodes) {
        if (node.type === 'step') {
            const step = node as StepNodeData;
            const outEdges = (adjOut.get(step.id) ?? []).length;
            if (!step.next && outEdges === 0) {
                // Only warn if there are other nodes (step is not the only node)
                if (doc.nodes.length > 1) {
                    errors.push({
                        code: 'MISSING_NEXT',
                        message: tf('validation.v.stepNoNext', { name: step.name || step.id }),
                        nodeId: step.id,
                    });
                }
            }
        }
    }

    // CONDITION_MISSING_BRANCHES
    for (const node of doc.nodes) {
        if (node.type === 'condition') {
            const outEdges = adjOut.get(node.id) ?? [];
            const hasTrue = outEdges.some((target) =>
                doc.edges.some(
                    (e) => e.from === node.id && e.to === target && e.type === 'branch_true',
                ),
            );
            const hasFalse = outEdges.some((target) =>
                doc.edges.some(
                    (e) => e.from === node.id && e.to === target && e.type === 'branch_false',
                ),
            );
            if (!hasTrue || !hasFalse) {
                const missing = [];
                if (!hasTrue) missing.push(`«${t('condition.true')}»`);
                if (!hasFalse) missing.push(`«${t('condition.false')}»`);
                errors.push({
                    code: 'CONDITION_MISSING_BRANCHES',
                    message: tf('validation.v.condMissingBranches', {
                        name: (node as { name?: string }).name || node.id,
                        missing: missing.join(` ${t('validation.and')} `),
                    }),
                    nodeId: node.id,
                });
            }
        }
    }

    // CONDITION_MISSING_VARIABLE
    for (const node of doc.nodes) {
        if (node.type === 'condition') {
            const cond = node as ConditionNodeData;
            const condName = cond.name || cond.id;
            if (!cond.variable && !USER_INPUT_OPERATORS.has(cond.operator)) {
                errors.push({
                    code: 'CONDITION_MISSING_VARIABLE',
                    message: tf('validation.v.condMissingVar', { name: condName }),
                    nodeId: cond.id,
                    field: 'variable',
                });
            }
            if (
                !NO_VALUE_OPERATORS.has(cond.operator) &&
                (cond.value === undefined || cond.value === '')
            ) {
                errors.push({
                    code: 'CONDITION_EMPTY_VALUE',
                    message: tf('validation.v.condMissingVal', { name: condName }),
                    nodeId: cond.id,
                    field: 'value',
                });
            }
        }
    }

    // ORPHAN_NODE (node not connected to anything except end nodes which are allowed)
    const buttonTargetIds = getButtonTargetIds(doc);
    for (const node of doc.nodes) {
        if (node.type === 'end') continue;
        // Welcome, Help и Fallback команды могут быть standalone (не требуют связей)
        if (node.type === 'command') {
            const cmd = node as CommandNodeData;
            if (cmd.role === 'welcome' || cmd.role === 'help' || cmd.role === 'fallback') continue;
            // Команда со слотами самодостаточна: бот запускает её по слову-триггеру,
            // связи ей не нужны (FAQ-бот из отдельных команд — валидный сценарий)
            if ((cmd.slots ?? []).some((slot) => slot.trim())) continue;
        }
        const hasIncoming = (adjIn.get(node.id) ?? []).length > 0;
        const hasOutgoing = (adjOut.get(node.id) ?? []).length > 0;
        // Кнопка с переходом на блок — тоже связь
        const hasButtonRef = buttonTargetIds.has(node.id);
        if (!hasIncoming && !hasOutgoing && !hasButtonRef && doc.nodes.length > 1) {
            const nodeName = (node as { name?: string }).name || node.id;
            errors.push({
                code: 'ORPHAN_NODE',
                message: tf('validation.v.orphan', { name: nodeName }),
                nodeId: node.id,
            });
        }
    }

    return errors;
}

const BLOCK_TYPES = new Set(['action', 'condition', 'response']);

/**
 * Операторы, которые без переменной проверяют сам ввод пользователя
 * (в CLI — ctrl.userCommand): пустая переменная для них не ошибка.
 */
const USER_INPUT_OPERATORS = new Set(['isSayTrue', 'isSayFalse', 'isUrl']);

/**
 * Ищет цикл, состоящий только из блоков action/condition/response.
 * Возвращает id нод цикла по порядку или null.
 */
export function findBlockCycle(doc: FlowDocument): string[] | null {
    const blockIds = new Set(doc.nodes.filter((n) => BLOCK_TYPES.has(n.type)).map((n) => n.id));
    const adjacency = new Map<string, string[]>();
    for (const id of blockIds) adjacency.set(id, []);
    for (const e of doc.edges) {
        if (blockIds.has(e.from) && blockIds.has(e.to)) adjacency.get(e.from)!.push(e.to);
    }

    const visited = new Set<string>();
    const stack: string[] = [];
    const inStack = new Set<string>();
    const dfs = (id: string): string[] | null => {
        visited.add(id);
        stack.push(id);
        inStack.add(id);
        for (const next of adjacency.get(id) ?? []) {
            if (inStack.has(next)) return stack.slice(stack.indexOf(next));
            if (!visited.has(next)) {
                const found = dfs(next);
                if (found) return found;
            }
        }
        stack.pop();
        inStack.delete(id);
        return null;
    };
    for (const id of blockIds) {
        if (visited.has(id)) continue;
        const found = dfs(id);
        if (found) return found;
    }
    return null;
}

/** Кнопки ноды любого типа: ответ, шаг, действие и ветки инлайн-условий (как в CLI). */
function nodeButtons(n: FlowDocument['nodes'][number]): FlowButton[] {
    const buttons: FlowButton[] = [];
    const push = (list: FlowButton[] | undefined) => list && buttons.push(...list);
    if (n.type === 'command') push((n as CommandNodeData).response?.buttons);
    if (n.type === 'response') push((n as ResponseNodeData).response?.buttons);
    if (n.type === 'step') push((n as StepNodeData).prompt?.buttons);
    if (n.type === 'action') push((n as ActionNodeData).buttons);
    const conditions = (n as { conditions?: CommandNodeData['conditions'] }).conditions ?? [];
    for (const cond of conditions) {
        push(cond.responseTrue?.buttons);
        push(cond.responseFalse?.buttons);
    }
    return buttons;
}

/** id блоков, на которые ведут кнопки с переходом. */
function getButtonTargetIds(doc: FlowDocument): Set<string> {
    const ids = new Set<string>();
    for (const n of doc.nodes) {
        for (const btn of nodeButtons(n)) {
            if (btn.type !== 'link' && btn.targetNodeId) ids.add(btn.targetNodeId);
        }
    }
    return ids;
}

/**
 * Блоки (action/condition/response), которые CLI-генератор молча отбросит
 * при `create from-flow`: блоки без входящей связи или кнопки с переходом
 * не попадают в connectedBlocks и не генерируют обработчик.
 * Результат — имена блоков для предупреждения в ExportDialog.
 */
export function getUnconnectedBlocks(doc: FlowDocument): string[] {
    const buttonTargetIds = getButtonTargetIds(doc);
    const names: string[] = [];
    for (const n of doc.nodes) {
        if (!BLOCK_TYPES.has(n.type)) continue;
        if (!doc.edges.some((e) => e.to === n.id) && !buttonTargetIds.has(n.id)) {
            names.push((n as { name?: string }).name || n.id);
        }
    }
    return names;
}

/** Предупреждение о поведении сгенерированного бота (экспорт не блокирует). */
export interface FlowWarning {
    code: 'MULTIPLE_NEXT' | 'COMMAND_TEXT_HIDDEN' | 'BUTTONS_WITHOUT_TEXT';
    message: string;
    nodeId?: string;
}

function nodeName(n: { id: string; name?: unknown }): string {
    return (typeof n.name === 'string' && n.name) || n.id;
}

/** Кнопки и собственный текст/озвучка ответа ноды (команда, шаг, ответ, действие). */
function nodeReply(node: FlowDocument['nodes'][number]): { buttons: FlowButton[]; text: string } {
    switch (node.type) {
        case 'command':
        case 'response': {
            const r = (node as CommandNodeData | ResponseNodeData).response;
            return { buttons: r?.buttons ?? [], text: `${r?.text ?? ''}${r?.tts ?? ''}` };
        }
        case 'step': {
            const p = (node as StepNodeData).prompt;
            return { buttons: p?.buttons ?? [], text: `${p?.text ?? ''}${p?.tts ?? ''}` };
        }
        case 'action': {
            const a = node as ActionNodeData;
            return { buttons: a.buttons ?? [], text: a.text ?? '' };
        }
        default:
            return { buttons: [], text: '' };
    }
}

/**
 * Узлы, чей текст попадает в то же сообщение, что и ответ ноды: связанные блоки
 * (выполняются сразу) и узлы, из которых нода вызвана в том же ходе — напрямую
 * или через условие. Шаг начинает новый ход, поэтому его вход не учитывается.
 */
function sameTurnHasText(doc: FlowDocument, node: FlowDocument['nodes'][number]): boolean {
    const byId = new Map(doc.nodes.map((n) => [n.id, n]));
    const hasText = (id: string): boolean => {
        const n = byId.get(id);
        return !!n && nodeReply(n).text.trim() !== '';
    };
    const outgoing = doc.edges.filter((e) => e.from === node.id).map((e) => e.to);
    if (outgoing.some((id) => BLOCK_TYPES.has(byId.get(id)?.type ?? '') && hasText(id))) {
        return true;
    }
    if (node.type === 'step') return false;
    for (const edge of doc.edges.filter((e) => e.to === node.id)) {
        const source = byId.get(edge.from);
        if (!source) continue;
        if (hasText(source.id)) return true;
        if (source.type === 'condition') {
            if (doc.edges.some((e) => e.to === source.id && hasText(e.from))) return true;
        }
    }
    return false;
}

/**
 * Места, где сгенерированный бот поведёт себя не так, как обычно ожидают по схеме.
 * Превью показывает это поведение честно, а здесь — объяснение и подсказка.
 */
export function getFlowWarnings(doc: FlowDocument): FlowWarning[] {
    const warnings: FlowWarning[] = [];
    const byId = new Map(doc.nodes.map((n) => [n.id, n]));

    // Приветствие из настроек (без ноды welcome) с кнопками, но без текста
    const hasWelcomeNode = doc.nodes.some(
        (n) =>
            n.type === 'command' &&
            ((n as CommandNodeData).role === 'welcome' ||
                (n as CommandNodeData).name === 'welcome'),
    );
    if (
        !hasWelcomeNode &&
        !(doc.welcome?.text ?? '').trim() &&
        (doc.welcome?.buttons ?? []).some((b) => b.title?.trim())
    ) {
        warnings.push({
            code: 'BUTTONS_WITHOUT_TEXT',
            message: tf('validation.w.buttonsWithoutText', { name: t('db.welcome') }),
        });
    }

    for (const node of doc.nodes) {
        if (node.type === 'end' || node.type === 'condition') continue;

        // Кнопки без текста: Telegram не отправит сообщение (кнопки пропадут), Алиса получит пустой текст
        const reply = nodeReply(node);
        if (
            reply.buttons.some((b) => b.title?.trim()) &&
            !reply.text.trim() &&
            !sameTurnHasText(doc, node)
        ) {
            warnings.push({
                code: 'BUTTONS_WITHOUT_TEXT',
                message: tf('validation.w.buttonsWithoutText', { name: nodeName(node) }),
                nodeId: node.id,
            });
        }

        const nextEdges = doc.edges.filter((e) => e.from === node.id && e.type === 'next');

        // Несколько next: CLI вызывает все связанные блоки сразу — выбора у пользователя нет
        if (nextEdges.length > 1) {
            warnings.push({
                code: 'MULTIPLE_NEXT',
                message: tf('validation.w.multipleNext', {
                    name: nodeName(node),
                    count: nextEdges.length,
                }),
                nodeId: node.id,
            });
        }

        // Текст команды не отправляется, если связанный блок сам задаёт текст
        if (node.type === 'command' && (node as CommandNodeData).response?.text) {
            const textBlock = nextEdges
                .map((e) => byId.get(e.to))
                .find(
                    (b) =>
                        (b?.type === 'response' && !!(b as ResponseNodeData).response?.text) ||
                        (b?.type === 'action' && !!(b as ActionNodeData).text),
                );
            if (textBlock) {
                warnings.push({
                    code: 'COMMAND_TEXT_HIDDEN',
                    message: tf('validation.w.commandTextHidden', {
                        name: nodeName(node),
                        block: nodeName(textBlock),
                    }),
                    nodeId: node.id,
                });
            }
        }
    }
    return warnings;
}

/** Run full validation on a flow document. */
export function validate(doc: unknown): ValidationError[] {
    const schemaErrors = validateSchemaLevel(doc);
    if (schemaErrors.length > 0) return schemaErrors;
    return validateGraph(doc as FlowDocument);
}
