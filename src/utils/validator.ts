import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import type { FlowDocument, CommandNodeData, StepNodeData, ConditionNodeData } from '../types/flow';
import { JS_IDENTIFIER_REGEX } from './regex';

/** Validation error. */
export interface ValidationError {
    code: string;
    message: string;
    nodeId?: string;
}
import flowSchema from '../schemas/flow.schema.json';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

const validateSchema = ajv.compile(flowSchema);

/** Проверка, является ли строка валидным JS-идентификатором */
function isValidJSIdentifier(name: string): boolean {
    return JS_IDENTIFIER_REGEX.test(name);
}

/** Validate flow document against JSON schema. */
export function validateSchemaLevel(doc: unknown): ValidationError[] {
    const valid = validateSchema(doc);
    if (valid) return [];

    const typeMessages: Record<string, string> = {
        command: 'Команда',
        step: 'Шаг',
        condition: 'Условие',
        action: 'Действие',
        response: 'Ответ',
        end: 'Конец',
    };

    return (validateSchema.errors ?? []).map((err: ErrorObject) => {
        const path = err.instancePath || '/';
        let message = err.message ?? 'некорректное значение';

        // Упрощаем сообщения AJV
        if (message.includes('must be equal to constant')) {
            const parts = path.split('/');
            const lastPart = parts[parts.length - 1];
            if (lastPart === 'type') {
                // Пытаемся найти тип ноды
                const nodes = (doc as Record<string, unknown>)?.nodes as unknown[];
                const nodeIdx = parseInt(parts[1] || '0');
                const typeName = (nodes?.[nodeIdx] as Record<string, unknown>)?.type as
                    | string
                    | undefined;
                if (typeName && !typeMessages[typeName]) {
                    message = `Неизвестный тип блока "${typeName}". Допустимые: command, step, condition, action, response, end`;
                } else {
                    message = `Блок${nodeIdx >= 0 ? ' #' + (nodeIdx + 1) : ''}: некорректный тип${typeName ? ' "' + typeName + '"' : ''}`;
                }
            } else if (lastPart === 'operator') {
                message = `Неизвестный оператор. Допустимы: =, ≠, >, ≥, <, ≤, содержит, пусто, согласие, несогласие, ссылка`;
            } else {
                message = `Некорректное значение в поле "${lastPart}"`;
            }
        } else if (message.includes('must match exactly one schema in oneOf')) {
            message = `Блок не соответствует ни одному из известных типов. Проверьте поле "type"`;
        } else if (message.includes('must be equal to one of the allowed values')) {
            const parts = path.split('/');
            const lastPart = parts[parts.length - 1];
            if (lastPart === 'operator') {
                message = `Неизвестный оператор. Допустимы: =, ≠, >, ≥, <, ≤, содержит, пусто, согласие, несогласие, ссылка`;
            } else {
                message = `Некорректное значение в поле "${lastPart}"`;
            }
        } else if (message.includes('required')) {
            const field = path.split('/').pop() || 'поле';
            message = `Обязательное поле "${field}" отсутствует`;
        } else if (message.includes('must be string')) {
            message = `Ожидался текст в поле "${path.split('/').pop() || '?'}"`;
        } else if (message.includes('must be array')) {
            message = `Ожидался список в поле "${path.split('/').pop() || '?'}"`;
        } else if (message.includes('must be object')) {
            message = `Ожидался объект в поле "${path.split('/').pop() || '?'}"`;
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
                message: `Дублирующийся ID узла: "${node.id}"`,
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

        const name = (node as { name?: string }).name;
        if (!name) {
            errors.push({
                code: 'EMPTY_NAME',
                message: `Блок "${node.id}" не имеет имени. Заполните поле «Название».`,
                nodeId: node.id,
            });
            continue;
        }
        if (seenNames.has(name)) {
            errors.push({
                code: 'DUPLICATE_NAMES',
                message: `Имя блока «${name}» используется одновременно в «${seenNames.get(name)}» и «${node.id}». Имена должны быть уникальными.`,
                nodeId: node.id,
            });
        } else {
            seenNames.set(name, node.id);
        }
    }

    // INVALID_VARIABLE_NAMES — проверка валидности имён переменных
    for (const node of doc.nodes) {
        if (node.type === 'command' || node.type === 'step') {
            const saveTo = (node as CommandNodeData | StepNodeData).saveTo;
            if (saveTo !== undefined && saveTo !== '' && !isValidJSIdentifier(saveTo)) {
                errors.push({
                    code: 'INVALID_VAR_NAME',
                    message: `Имя переменной «${saveTo}» некорректно. Используйте буквы, цифры и знак подчёркивания (не начинайте с цифры).`,
                    nodeId: node.id,
                });
            }
            if (saveTo !== undefined && saveTo === '') {
                errors.push({
                    code: 'EMPTY_SAVE_TO',
                    message: `Блок «${(node as { name?: string }).name || node.id}»: имя переменной пустое. Заполните поле или удалите его.`,
                    nodeId: node.id,
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
                        message: `Имя переменной «${action.field}» некорректно. Используйте буквы, цифры и знак подчёркивания.`,
                        nodeId: node.id,
                    });
                }
                if (action.field !== undefined && action.field === '') {
                    errors.push({
                        code: 'EMPTY_ACTION_FIELD',
                        message: `Действие в блоке «${(node as { name?: string }).name || node.id}»: имя переменной пустое. Заполните поле или удалите его.`,
                        nodeId: node.id,
                    });
                }
            }
        }
    }

    // ACTION_MISSING_FIELDS — проверка обязательных полей в action-блоках
    for (const node of doc.nodes) {
        const allActions: Array<{ type?: string; field?: string; value?: string; url?: string }> =
            [];
        if (node.type === 'action') {
            allActions.push(...((node as { actions?: typeof allActions }).actions ?? []));
        }
        if (node.type === 'command' || node.type === 'step') {
            allActions.push(...((node as CommandNodeData | StepNodeData).actions ?? []));
        }
        for (const action of allActions) {
            const nodeName = (node as { name?: string }).name || node.id;
            if (action.type === 'random_number' && !action.field) {
                errors.push({
                    code: 'ACTION_MISSING_FIELD',
                    message: `Блок «${nodeName}»: действие «Случайное число» не имеет имени переменной. Заполните поле «Поле».`,
                    nodeId: node.id,
                });
            }
            if (action.type === 'set_variable') {
                if (!action.field) {
                    errors.push({
                        code: 'ACTION_MISSING_FIELD',
                        message: `Блок «${nodeName}»: действие «Установить переменную» не имеет имени переменной. Заполните поле «Поле».`,
                        nodeId: node.id,
                    });
                }
                if (action.value === undefined || action.value === '') {
                    errors.push({
                        code: 'ACTION_MISSING_VALUE',
                        message: `Блок «${nodeName}»: действие «Установить переменную» не имеет значения. Введите выражение.`,
                        nodeId: node.id,
                    });
                }
            }
            if (action.type === 'http_request' && !action.url) {
                errors.push({
                    code: 'ACTION_MISSING_URL',
                    message: `Блок «${nodeName}»: HTTP-запрос не имеет URL. Укажите адрес.`,
                    nodeId: node.id,
                });
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
                    message: `Слово-триггер «${slot}» используется одновременно в «${slotMap.get(slot)}» и «${cmd.id}». Триггеры должны быть уникальными.`,
                    nodeId: cmd.id,
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
                        message: `Блок «${(node as { name?: string }).name || node.id}»: условие #${i + 1} не имеет переменной. Выберите переменную или удалите условие.`,
                        nodeId: node.id,
                    });
                }
                if (
                    !NO_VALUE_OPERATORS.has(cond.operator) &&
                    (cond.value === undefined || cond.value === '')
                ) {
                    errors.push({
                        code: 'CONDITION_EMPTY_VALUE',
                        message: `Блок «${(node as { name?: string }).name || node.id}»: условие #${i + 1} не имеет значения для сравнения. Введите значение или удалите условие.`,
                        nodeId: node.id,
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
                message: `Связь от несуществующего узла: «${edge.from}»`,
                nodeId: edge.from,
            });
        }
        if (!nodeIds.has(edge.to)) {
            errors.push({
                code: 'INVALID_TARGET',
                message: `Связь к несуществующему узлу: «${edge.to}»`,
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
                        message: `Кнопка ссылается на несуществующий блок: «${btn.targetNodeId}»`,
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
                    message: `Шаг ссылается на несуществующий блок: «${step.next}»`,
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
                        message: `Шаг «${step.name || step.id}» не имеет следующего блока и не соединён с другими блоками.`,
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
                if (!hasTrue) missing.push('True (верная)');
                if (!hasFalse) missing.push('False (неверная)');
                errors.push({
                    code: 'CONDITION_MISSING_BRANCHES',
                    message: `Условие "${node.id}": не подключены ветки ${missing.join(' и ')}. Соедините выходы True и False с другими блоками.`,
                    nodeId: node.id,
                });
            }
        }
    }

    // CONDITION_MISSING_VARIABLE
    for (const node of doc.nodes) {
        if (node.type === 'condition') {
            const cond = node as ConditionNodeData;
            if (!cond.variable) {
                errors.push({
                    code: 'CONDITION_MISSING_VARIABLE',
                    message: `Условие "${cond.id}": не указана переменная. Откройте блок и выберите переменную из списка.`,
                    nodeId: cond.id,
                });
            }
            if (
                !NO_VALUE_OPERATORS.has(cond.operator) &&
                (cond.value === undefined || cond.value === '')
            ) {
                errors.push({
                    code: 'CONDITION_EMPTY_VALUE',
                    message: `Условие "${cond.id}": не указано значение для сравнения. Введите значение или удалите условие.`,
                    nodeId: cond.id,
                });
            }
        }
    }

    // ORPHAN_NODE (node not connected to anything except end nodes which are allowed)
    for (const node of doc.nodes) {
        if (node.type === 'end') continue;
        // Welcome и Help команды могут быть standalone (приветствие и справка не требуют связей)
        if (node.type === 'command') {
            const cmd = node as CommandNodeData;
            if (cmd.role === 'welcome' || cmd.role === 'help') continue;
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
            // Получаем имя ноды если есть
            const nodeName = (node as { name?: string }).name || node.id;
            errors.push({
                code: 'ORPHAN_NODE',
                message: `Блок "${nodeName}" не соединён ни с одним другим блоком. Соедините его с другими блоками или удалите.`,
                nodeId: node.id,
            });
        }
    }

    return errors;
}

/** Run full validation on a flow document. */
export function validate(doc: unknown): ValidationError[] {
    const schemaErrors = validateSchemaLevel(doc);
    if (schemaErrors.length > 0) return schemaErrors;
    return validateGraph(doc as FlowDocument);
}
