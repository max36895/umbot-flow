import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import type {
    CommandNodeData,
    StepNodeData,
    ActionNodeData,
    ResponseNodeData,
    FlowDocument,
    FlowNodeData,
    FlowCard,
    FlowButton,
} from '../../types/flow';
import { MessageBubble } from './MessageBubble';
import { DebugVarsPanel } from './DebugVarsPanel';
import { ChatInput } from './ChatInput';
import { NodeIcon } from '../ui/NodeIcons';
import { t, tf } from '../../i18n';
import {
    TEMPLATE_VAR_REGEX,
    IS_SAY_TRUE_REGEX,
    IS_SAY_FALSE_REGEX,
    URL_REGEX,
} from '../../utils/regex';
import { safeEvalExpression } from '../../utils/safeMath';

interface Message {
    role: 'user' | 'bot';
    text: string;
    buttons?: { title: string; targetNodeId?: string; url?: string }[];
    card?: FlowCard;
}

/** Найти исходящее ребро из ноды. */
function findEdge(doc: FlowDocument, fromId: string, edgeType?: string): string | null {
    const edge = doc.edges.find((e) => e.from === fromId && (!edgeType || e.type === edgeType));
    return edge?.to ?? null;
}

/** Кэш регулярных выражений для substituteVars. */
const substituteVarRegexCache = new Map<string, RegExp>();

/** Кэш отсортированных имён переменных (по ссылке объекта vars). */
const sortedVarNamesCache = new WeakMap<Record<string, string>, string[]>();

/** Получает скомпилированное RegExp из кэша (или создаёт новое). */
function getSubstituteRegex(name: string): RegExp {
    const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = `\\b${safeName}\\b`;
    let re = substituteVarRegexCache.get(pattern);
    if (!re) {
        re = new RegExp(pattern, 'g');
        substituteVarRegexCache.set(pattern, re);
    }
    return re;
}

/**
 * Подставляет переменные из vars в выражение.
 * Сортирует по длине имени (длинные первые) чтобы num10 не ломал num1.
 * Использует кэш для избежания повторной сортировки.
 */
function substituteVars(expr: string, vars: Record<string, string>): string {
    let result = expr;
    let varNames = sortedVarNamesCache.get(vars);
    if (!varNames) {
        varNames = Object.keys(vars).sort((a, b) => b.length - a.length);
        sortedVarNamesCache.set(vars, varNames);
    }
    for (const name of varNames) {
        const val = vars[name];
        if (val !== undefined && result.includes(name)) {
            const num = Number(val);
            const replacement = isNaN(num) ? JSON.stringify(val) : String(num);
            const re = getSubstituteRegex(name);
            re.lastIndex = 0;
            result = result.replace(re, replacement);
        }
    }
    return result;
}

/**
 * Безопасное вычисление арифметики без eval(): парсер допускает только
 * числа, строки в кавычках, операторы и скобки. Если вход — не арифметика,
 * возвращается исходная строка.
 */
function safeEval(expr: string, vars: Record<string, string> = {}): string {
    const sanitized = substituteVars(expr, vars);
    return safeEvalExpression(sanitized) ?? sanitized;
}

/** Проверяет, является ли имя переменной безопасным (нет prototype pollution). */
function isSafeVarName(name: string): boolean {
    return name !== '__proto__' && name !== 'constructor' && name !== 'prototype';
}

/** Выполнить блоки действий и вернуть обновлённые переменные. */
function executeActions(
    actions: ActionNodeData['actions'],
    vars: Record<string, string>,
): Record<string, string> {
    const newVars = { ...vars };

    for (const action of actions ?? []) {
        switch (action.type) {
            case 'set_variable':
                if (action.field && action.value && isSafeVarName(action.field)) {
                    // Сначала подставляем все переменные, затем вычисляем
                    const substituted = substituteVars(action.value, newVars);
                    newVars[action.field] = safeEval(substituted, {});
                }
                break;
            case 'random_number':
                if (action.field && isSafeVarName(action.field)) {
                    const min = action.min ?? 1;
                    const max = action.max ?? 10;
                    newVars[action.field] = String(
                        Math.floor(Math.random() * (max - min + 1)) + min,
                    );
                }
                break;
            case 'http_request':
                // Превью — имитация: запрос не выполняется, подставляем тестовое значение
                if (action.saveResponseTo && isSafeVarName(action.saveResponseTo)) {
                    newVars[action.saveResponseTo] = `(${t('preview.httpMockData')})`;
                }
                break;
        }
    }

    return newVars;
}

/** Получить значение системной переменной */
function getSystemVar(name: string): string {
    switch (name) {
        case '__currentTime': {
            const now = new Date();
            return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }
        case '__currentDate': {
            const now = new Date();
            return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
        }
        case '__currentTimestamp':
            return String(Math.floor(Date.now() / 1000));
        case '__randomNumber':
            return String(Math.floor(Math.random() * 101));
        case '__userName':
            return t('system.userName');
        default:
            return `{{${name}}}`;
    }
}

/** Подставить {{переменные}} в текст. */
function substitute(text: string, vars: Record<string, string>): string {
    return text.replace(TEMPLATE_VAR_REGEX, (_, key: string) => {
        // Сначала проверяем пользовательские переменные
        if (vars[key] !== undefined) return vars[key];
        // Затем системные
        if (key.startsWith('__')) return getSystemVar(key);
        return `{{${key}}}`;
    });
}

/** Маппинг кнопок с подстановкой переменных. */
function mapButtons(
    buttons: FlowButton[] | undefined,
    vars: Record<string, string>,
): Message['buttons'] {
    return buttons?.map((b) => ({
        title: substitute(b.title, vars),
        targetNodeId: b.targetNodeId,
        url: b.url,
    }));
}

/** Маппинг карточки с подстановкой переменных. */
function mapCard(
    card: FlowCard | undefined,
    vars: Record<string, string>,
): FlowCard | undefined {
    if (!card) return undefined;
    return {
        ...card,
        title: substitute(card.title, vars),
        images: card.images.map((img) => ({
            ...img,
            src: substitute(img.src, vars),
            title: substitute(img.title, vars),
            description: substitute(img.description, vars),
            button: img.button
                ? { ...img.button, title: substitute(img.button.title, vars) }
                : undefined,
        })),
    };
}

/** Собрать сообщение бота из response/prompt-блока. */
function buildMessage(
    source: { text: string; buttons?: FlowButton[]; card?: FlowCard },
    vars: Record<string, string>,
): Message {
    return {
        role: 'bot',
        text: substitute(source.text, vars),
        buttons: mapButtons(source.buttons, vars),
        card: mapCard(source.card, vars),
    };
}

/** Найти ноду Welcome по role (или undefined). */
function findWelcomeNode(doc: FlowDocument): CommandNodeData | undefined {
    return doc.nodes.find(
        (n) => n.type === 'command' && (n as CommandNodeData).role === 'welcome',
    ) as CommandNodeData | undefined;
}

/**
 * Начальный ход превью: проигрывает цепочку от Welcome-ноды, а не только её текст.
 * Welcome связан рёбром next с первым блоком (например, Step «Как тебя зовут?»),
 * поэтому превью обязано дойти до Step и встать в ожидание ввода — иначе первый
 * ответ пользователя уйдёт в fallback, хотя бот спроектирован корректно.
 * Если Welcome-ноды нет — показываем только текст welcome из metadata.
 */
export function buildInitialTurn(doc: FlowDocument): {
    msgs: Message[];
    waitStep: string | null;
    vars: Record<string, string>;
} {
    const welcomeNode = findWelcomeNode(doc);
    if (!welcomeNode) {
        const text = doc.welcome?.text ?? '';
        return {
            msgs: text ? [{ role: 'bot', text }] : [],
            waitStep: null,
            vars: {},
        };
    }

    // Прогоняем цепочку от Welcome: сам welcome-ответ + всё, что связано с ним next-рёбрами
    const msgs: Message[] = [];
    const vars: Record<string, string> = {};
    let waitStep: string | null = null;

    if (welcomeNode.actions) Object.assign(vars, executeActions(welcomeNode.actions, vars));
    msgs.push(buildMessage(welcomeNode.response, vars));

    // Следуем по next-рёбрам до Step/End (та же логика, что в processChain)
    let currentId: string | null = findEdge(doc, welcomeNode.id);
    let safety = 0;
    while (currentId && safety < 50) {
        safety++;
        const node = doc.nodes.find((n) => n.id === currentId);
        if (!node) break;

        if (node.type === 'command') {
            const cmd = node as CommandNodeData;
            if (cmd.actions) Object.assign(vars, executeActions(cmd.actions, vars));
            msgs.push(buildMessage(cmd.response, vars));
            currentId = findEdge(doc, node.id);
            continue;
        }
        if (node.type === 'response') {
            // Standalone response может нести actions (счёт игр и т.п.) —
            // выполняем до рендера текста, чтобы {{you}} показывал уже новый счёт
            const resp = node as ResponseNodeData;
            if (resp.actions) Object.assign(vars, executeActions(resp.actions, vars));
            msgs.push(buildMessage(resp.response, vars));
            currentId = findEdge(doc, node.id);
            continue;
        }
        if (node.type === 'step') {
            const step = node as StepNodeData;
            if (step.actions) Object.assign(vars, executeActions(step.actions, vars));
            msgs.push(buildMessage(step.prompt, vars));
            waitStep = step.id;
            break;
        }
        if (node.type === 'action') {
            const actionNode = node as ActionNodeData;
            Object.assign(vars, executeActions(actionNode.actions, vars));
            if (actionNode.text) {
                msgs.push(buildMessage({ text: actionNode.text, buttons: actionNode.buttons }, vars));
            }
            currentId = findEdge(doc, node.id);
            continue;
        }
        if (node.type === 'condition') {
            // Условие в начальной цепочке: переменная ещё пуста — идём по branch_false,
            // как это сделал бы боты при первом входе
            currentId = findEdge(doc, node.id, 'branch_false');
            continue;
        }
        if (node.type === 'end') break;
        break;
    }

    return { msgs, waitStep, vars };
}

/** Найти команду, совпадающую с вводом (по слотам или regex-паттерну). */
function matchCommand(doc: FlowDocument, text: string): CommandNodeData | null {
    const lower = text.toLowerCase();
    for (const node of doc.nodes) {
        if (node.type !== 'command') continue;
        const cmd = node as CommandNodeData;
        if (!cmd.slots || cmd.slots.length === 0) continue;
        for (const slot of cmd.slots) {
            if (cmd.isPattern) {
                try {
                    const slotRe = getSlotRegex(slot);
                    if (slotRe && slotRe.test(text)) return cmd;
                } catch {
                    /* невалидный regex */
                }
            } else if (lower.includes(slot.toLowerCase())) {
                return cmd;
            }
        }
    }
    return null;
}

/** Проверка regex на потенциальный ReDoS — запрещаем вложенные квантификаторы */
function isSafeRegex(pattern: string): boolean {
    // Паттерны, которые могут вызвать catastrophic backtracking
    const dangerous = /(\([^)]*[+*][^)]*\))[+*]|(\[[^\]]*\])[+*][+*]|[+*]\([^)]*\)[+*]/;
    return !dangerous.test(pattern);
}

/** Кэш регулярных выражений для slot pattern matching. */
const slotRegexCache = new Map<string, RegExp>();

/** Получает скомпилированное RegExp для slot pattern из кэша. */
function getSlotRegex(slot: string): RegExp | null {
    if (!isSafeRegex(slot)) return null;
    let re = slotRegexCache.get(slot);
    if (!re) {
        re = new RegExp(slot, 'i');
        slotRegexCache.set(slot, re);
    }
    return re;
}

export default function ChatPreview() {
    const togglePreview = useUiStore((s) => s.togglePreview);
    const setActivePreviewNodeId = useUiStore((s) => s.setActivePreviewNodeId);
    const nodes = useFlowStore((s) => s.nodes);
    const edges = useFlowStore((s) => s.edges);
    const toJSON = useFlowStore((s) => s.toJSON);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [waitingForStep, setWaitingForStep] = useState<string | null>(null);
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [debugMode, setDebugMode] = useState(false);
    const [animate, setAnimate] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        requestAnimationFrame(() => setAnimate(true));
    }, []);

    // Начальный ход при открытии чата: проигрываем цепочку от Welcome (не только текст),
    // чтобы следующий за Welcome Step встал в ожидание ввода
    useEffect(() => {
        const turn = buildInitialTurn(toJSON());
        setMessages(turn.msgs);
        setWaitingForStep(turn.waitStep);
        setVariables(turn.vars);
    }, []);

    // Устанавливаем активный шаг при ожидании ввода
    useEffect(() => {
        setActivePreviewNodeId(waitingForStep);
    }, [waitingForStep, setActivePreviewNodeId]);

    // Очищаем активный шаг при закрытии превью
    const handleClose = () => {
        setAnimate(false);
        setActivePreviewNodeId(null);
        setTimeout(() => togglePreview(), 150);
    };

    // Сброс превью к начальному состоянию — заново проигрываем цепочку от Welcome
    const handleReset = () => {
        const turn = buildInitialTurn(toJSON());
        setMessages(turn.msgs);
        setWaitingForStep(turn.waitStep);
        setVariables(turn.vars);
        setInput('');
    };

    // Мемоизируем doc — пересоздаётся только при изменении nodes/edges
    const doc = useMemo(() => toJSON(), [nodes, edges, toJSON]);

    // Автопрокрутка вниз при изменении сообщений
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /**
     * Обработать цепочку нод, начиная с nodeId.
     * Следует по рёбрам автоматически, пока не встретит Step (ожидание ввода) или End.
     * Возвращает накопленные сообщения и шаг для ожидания (или null).
     */
    const processChain = useCallback(
        (
            startNodeId: string,
            initVars?: Record<string, string>,
        ): { msgs: Message[]; waitStep: string | null; vars: Record<string, string> } => {
            const msgs: Message[] = [];
            let currentId: string | null = startNodeId;
            let waitStep: string | null = null;
            const vars = { ...(initVars ?? variables) };
            let safety = 0;

            while (currentId && safety < 50) {
                safety++;
                const node = doc.nodes.find((n) => n.id === currentId);
                if (!node) break;

                if (node.type === 'command') {
                    const cmd = node as CommandNodeData;
                    // Выполняем inline-действия команды (random_number, set_variable и т.д.)
                    if (cmd.actions) Object.assign(vars, executeActions(cmd.actions, vars));
                    msgs.push(buildMessage(cmd.response, vars));
                    currentId = findEdge(doc, currentId);
                    continue;
                }

                if (node.type === 'response') {
                    const resp = node as ResponseNodeData;
                    // Actions standalone-респонса (счёт игр) — до текста
                    if (resp.actions) Object.assign(vars, executeActions(resp.actions, vars));
                    msgs.push(buildMessage(resp.response, vars));
                    currentId = findEdge(doc, currentId);
                    continue;
                }

                if (node.type === 'step') {
                    const step = node as StepNodeData;
                    // Выполняем inline-действия шага
                    if (step.actions) Object.assign(vars, executeActions(step.actions, vars));
                    msgs.push(buildMessage(step.prompt, vars));
                    waitStep = step.id;
                    break;
                }

                if (node.type === 'action') {
                    const actionNode = node as ActionNodeData;
                    // Показываем, что HTTP-запросы здесь не выполняются — пользователю важно это видеть
                    const httpActions = (actionNode.actions ?? []).filter(
                        (a) => a.type === 'http_request',
                    );
                    for (const http of httpActions) {
                        msgs.push({
                            role: 'bot',
                            text: tf('preview.httpMock', {
                                method: http.method ?? 'GET',
                                url: http.url || '?',
                            }),
                        });
                    }

                    Object.assign(vars, executeActions(actionNode.actions, vars));

                    if (actionNode.text) {
                        msgs.push(
                            buildMessage(
                                { text: actionNode.text, buttons: actionNode.buttons },
                                vars,
                            ),
                        );
                    }
                    currentId = findEdge(doc, currentId);
                    continue;
                }

                if (node.type === 'condition') {
                    const condVar = vars[(node as FlowNodeData).variable as string] ?? '';
                    let condValue: string | number = ((node as FlowNodeData).value as string) ?? '';
                    const condOp = (node as FlowNodeData).operator as string;

                    if (typeof condValue === 'string' && vars[condValue] !== undefined) {
                        condValue = vars[condValue] ?? condValue;
                    }

                    const numVar = Number(condVar);
                    const numVal = Number(condValue);
                    const useNumbers = !isNaN(numVar) && !isNaN(numVal);

                    let result = false;
                    switch (condOp) {
                        case 'eq':
                            result = useNumbers ? numVar === numVal : condVar === String(condValue);
                            break;
                        case 'neq':
                            result = useNumbers ? numVar !== numVal : condVar !== String(condValue);
                            break;
                        case 'gt':
                            result = useNumbers ? numVar > numVal : condVar > String(condValue);
                            break;
                        case 'gte':
                            result = useNumbers ? numVar >= numVal : condVar >= String(condValue);
                            break;
                        case 'lt':
                            result = useNumbers ? numVar < numVal : condVar < String(condValue);
                            break;
                        case 'lte':
                            result = useNumbers ? numVar <= numVal : condVar <= String(condValue);
                            break;
                        case 'contains':
                            result = condVar.includes(String(condValue));
                            break;
                        case 'isEmpty':
                            result = !condVar || condVar === '';
                            break;
                        case 'isNotEmpty':
                            result = !!condVar && condVar !== '';
                            break;
                        case 'isSayTrue':
                            result = IS_SAY_TRUE_REGEX.test(condVar);
                            break;
                        case 'isSayFalse':
                            result = IS_SAY_FALSE_REGEX.test(condVar);
                            break;
                        case 'isUrl':
                            result = URL_REGEX.test(condVar);
                            break;
                    }

                    currentId = findEdge(doc, currentId, result ? 'branch_true' : 'branch_false');
                    continue;
                }

                if (node.type === 'end') break;
                break;
            }

            return { msgs, waitStep, vars };
        },
        [doc, variables],
    );

    /** Обработать клик по кнопке: показать сообщение пользователя, затем обработать целевую ноду. */
    const processButtonClick = useCallback(
        (btn: { title: string; targetNodeId?: string; url?: string }) => {
            if (btn.url && (btn.url.startsWith('http://') || btn.url.startsWith('https://'))) {
                window.open(btn.url, '_blank');
                return;
            }

            const btnText = btn.title;
            const newMessages: Message[] = [...messages, { role: 'user', text: btnText }];

            // Если ожидаем ввод шага — обрабатываем как ввод (как handleSend)
            if (waitingForStep) {
                const stepNode = doc.nodes.find((n) => n.id === waitingForStep);
                if (stepNode?.type === 'step') {
                    const step = stepNode as StepNodeData;
                    const value = step.saveAs === 'lowercase' ? btnText.toLowerCase() : btnText;
                    const newVars = { ...variables };
                    if (step.saveTo) newVars[step.saveTo] = value;

                    const nextId = findEdge(doc, waitingForStep);
                    if (nextId) {
                        const result = processChain(nextId, newVars);
                        newMessages.push(...result.msgs);
                        setVariables(result.vars);
                        setWaitingForStep(result.waitStep);
                    } else {
                        setWaitingForStep(null);
                    }
                }
                setMessages(newMessages);
                return;
            }

            if (btn.targetNodeId) {
                // Есть целевая нода — обрабатываем её
                const result = processChain(btn.targetNodeId);
                newMessages.push(...result.msgs);
                setMessages(newMessages);
                setVariables(result.vars);
                setWaitingForStep(result.waitStep);
            } else {
                // Нет целевой ноды — обрабатываем текст кнопки как ввод пользователя (как handleSend)
                const matched = matchCommand(doc, btnText);

                if (matched) {
                    // Выполняем inline-действия команды (random_number, set_variable и т.д.)
                    const updatedVars = { ...variables };
                    if (matched.actions)
                        Object.assign(updatedVars, executeActions(matched.actions, updatedVars));

                    newMessages.push(buildMessage(matched.response, updatedVars));

                    setVariables(updatedVars);
                    const nextId = findEdge(doc, matched.id);
                    if (nextId) {
                        const result = processChain(nextId, updatedVars);
                        newMessages.push(...result.msgs);
                        setVariables(result.vars);
                        setWaitingForStep(result.waitStep);
                    }
                } else {
                    newMessages.push({
                        role: 'bot',
                        text: substitute(doc.fallback?.text ?? '', variables),
                    });
                }

                setMessages(newMessages);
            }
        },
        [messages, variables, processChain, doc],
    );

    const handleSend = useCallback(() => {
        const text = input.trim();
        if (!text) return;

        const newMessages: Message[] = [...messages, { role: 'user', text }];

        // Если ожидаем ввод шага — сохранить и продолжить цепочку
        if (waitingForStep) {
            const stepNode = doc.nodes.find((n) => n.id === waitingForStep);
            if (stepNode?.type === 'step') {
                const step = stepNode as StepNodeData;
                const value = step.saveAs === 'lowercase' ? text.toLowerCase() : text;
                const newVars = { ...variables };
                if (step.saveTo) newVars[step.saveTo] = value;

                const nextId = findEdge(doc, waitingForStep);
                if (nextId) {
                    const result = processChain(nextId, newVars);
                    newMessages.push(...result.msgs);
                    setVariables(result.vars);
                    setWaitingForStep(result.waitStep);
                } else {
                    setWaitingForStep(null);
                }
            }
            setMessages(newMessages);
            setInput('');
            return;
        }

        // Ищем совпадение по слотам
        const lower = text.toLowerCase();
        let matched: CommandNodeData | null = null;

        // Проверяем команду Help (по встроенному имени)
        const helpNode = doc.nodes.find(
            (n) => n.type === 'command' && (n as CommandNodeData).role === 'help',
        );
        if (helpNode) {
            const helpCmd = helpNode as CommandNodeData;
            if (
                helpCmd.response.text &&
                (lower === 'help' || lower === 'помощь')
            ) {
                matched = helpCmd;
            }
        }

        if (!matched) {
            matched = matchCommand(doc, text);
        }

        if (matched) {
            // Выполняем inline-действия команды (random_number, set_variable и т.д.)
            const updatedVars = { ...variables };
            if (matched.actions)
                Object.assign(updatedVars, executeActions(matched.actions, updatedVars));

            newMessages.push(buildMessage(matched.response, updatedVars));

            setVariables(updatedVars);
            const nextId = findEdge(doc, matched.id);
            if (nextId) {
                const result = processChain(nextId, updatedVars);
                newMessages.push(...result.msgs);
                setVariables(result.vars);
                setWaitingForStep(result.waitStep);
            }
        } else {
            newMessages.push({ role: 'bot', text: substitute(doc.fallback?.text ?? '', variables) });
        }

        setMessages(newMessages);
        setInput('');
    }, [input, messages, waitingForStep, variables, doc, processChain]);

    return (
        <div
            className={`absolute bottom-6 right-4 z-preview flex h-[480px] w-80 flex-col rounded-xl border border-glass-border bg-surface-dim/95 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-150 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
            <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-accent to-info px-4 py-2">
                <span className="text-sm font-bold text-white">{t('preview.title')}</span>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleReset}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-black/25 text-white/90 transition-colors hover:bg-black/40 hover:text-white"
                        title={t('preview.reset')}
                    >
                        <NodeIcon name="refresh" size={13} />
                    </button>
                    <button
                        onClick={() => setDebugMode(!debugMode)}
                        className={`flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors ${
                            debugMode
                                ? 'bg-black/40 text-white'
                                : 'bg-black/25 text-white/90 hover:bg-black/40 hover:text-white'
                        }`}
                        title={t('preview.debug')}
                    >
                        <NodeIcon name="gear" size={11} />
                        {t('preview.varsTitle')}
                    </button>
                    <button
                        onClick={handleClose}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-black/25 text-white/90 transition-colors hover:bg-black/40 hover:text-white"
                        title={t('help.close')}
                    >
                        <NodeIcon name="close" size={12} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                {messages.length === 0 && (
                    <div className="mt-8 text-center text-sm text-fg/50">
                        {t('preview.empty')}
                    </div>
                )}
                {messages.map((msg, i) => (
                    <MessageBubble
                        key={i}
                        role={msg.role}
                        text={msg.text}
                        buttons={msg.buttons}
                        card={msg.card}
                        onButtonClick={processButtonClick}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {debugMode && (
                <DebugVarsPanel
                    variables={variables}
                    waitingForStepName={
                        waitingForStep
                            ? ((doc.nodes.find((n) => n.id === waitingForStep)?.data as
                                  | { name?: string }
                                  | undefined)?.name ?? waitingForStep)
                            : null
                    }
                />
            )}

            <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                waitingForVarName={
                    waitingForStep
                        ? ((doc.nodes.find((n) => n.id === waitingForStep) as StepNodeData | undefined)
                              ?.saveTo ?? '…')
                        : undefined
                }
            />
        </div>
    );
}
