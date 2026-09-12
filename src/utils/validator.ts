import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import type { FlowDocument, CommandNodeData, StepNodeData, ConditionNodeData } from '../types/flow';
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
                if (!cond.variable) {
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
        if (node.type === 'command') {
            const cmd = node as CommandNodeData;
            for (const btn of cmd.response.buttons) {
                if (btn.targetNodeId && !nodeIds.has(btn.targetNodeId)) {
                    errors.push({
                        code: 'INVALID_TARGET',
                        message: tf('validation.v.buttonTargetMissing', { id: btn.targetNodeId }),
                        nodeId: cmd.id,
                    });
                }
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

    // CIRCULAR_REFERENCE — пропускаем, циклы допустимы в flow-диаграммах

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
            if (!cond.variable) {
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
    for (const node of doc.nodes) {
        if (node.type === 'end') continue;
        // Welcome, Help и Fallback команды могут быть standalone (не требуют связей)
        if (node.type === 'command') {
            const cmd = node as CommandNodeData;
            if (cmd.role === 'welcome' || cmd.role === 'help' || cmd.role === 'fallback')
                continue;
        }
        const hasIncoming = (adjIn.get(node.id) ?? []).length > 0;
        const hasOutgoing = (adjOut.get(node.id) ?? []).length > 0;
        // Check if any button points to this node
        let hasButtonRef = false;
        for (const n of doc.nodes) {
            if (n.type === 'command') {
                const cmd = n as CommandNodeData;
                for (const btn of cmd.response.buttons) {
                    if (btn.targetNodeId === node.id) hasButtonRef = true;
                }
            }
        }
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

/**
 * Блоки (action/condition/response), которые CLI-генератор молча отбросит
 * при `create from-flow`: standalone-блоки без входящего ребра не попадают
 * в connectedBlocks и не генерируют обработчик. Кнопки с targetNodeId
 * считаются входом — как и в генераторе (кнопка выставляет thisIntentName).
 * Результат — имена блоков для предупреждения в ExportDialog.
 */
export function getUnconnectedBlocks(doc: FlowDocument): string[] {
    const referencedByButton = new Set<string>();
    for (const n of doc.nodes) {
        if (n.type === 'command') {
            for (const btn of (n as CommandNodeData).response.buttons) {
                if (btn.targetNodeId) referencedByButton.add(btn.targetNodeId);
            }
        }
    }
    const names: string[] = [];
    for (const n of doc.nodes) {
        if (n.type !== 'action' && n.type !== 'condition' && n.type !== 'response') continue;
        const hasIncoming = doc.edges.some((e) => e.to === n.id) || referencedByButton.has(n.id);
        if (!hasIncoming) {
            names.push((n as { name?: string }).name || n.id);
        }
    }
    return names;
}

/** Run full validation on a flow document. */
export function validate(doc: unknown): ValidationError[] {
    const schemaErrors = validateSchemaLevel(doc);
    if (schemaErrors.length > 0) return schemaErrors;
    return validateGraph(doc as FlowDocument);
}
