import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import type {
    CommandNodeData,
    StepNodeData,
    ActionNodeData,
    FlowDocument,
    FlowNodeData,
    FlowCard,
} from '../../types/flow';
import { MessageBubble } from './MessageBubble';
import { t } from '../../i18n';
import {
    TEMPLATE_VAR_REGEX,
    IS_SAY_TRUE_REGEX,
    IS_SAY_FALSE_REGEX,
    URL_REGEX,
} from '../../utils/regex';

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

/** Allowlist regex for safe math evaluation - created once. */
const MATH_ONLY_REGEX = /^[0-9+\-*/().,%\s'"]+$/;

/**
 * Safe math evaluation - only allows digits, operators, parens, spaces, dots, quotes.
 * Uses allowlist instead of blocklist for security.
 */
function safeEval(expr: string, vars: Record<string, string> = {}): string {
    const sanitized = substituteVars(expr, vars);
    if (!MATH_ONLY_REGEX.test(sanitized)) {
        return sanitized;
    }
    try {
        // eslint-disable-next-line no-eval
        const result = eval(sanitized);
        return String(result);
    } catch {
        return sanitized;
    }
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
    const { togglePreview, setActivePreviewNodeId } = useUiStore();
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

    // Показать приветственное сообщение при открытии чата
    useEffect(() => {
        const doc = toJSON();
        // Ищем ноду Welcome — приоритет ноде, затем metadata
        const welcomeNode = doc.nodes.find(
            (n) => n.type === 'command' && (n as CommandNodeData).role === 'welcome',
        );
        const welcomeText = welcomeNode
            ? (welcomeNode as CommandNodeData).response.text
            : doc.welcome.text;
        if (welcomeText) {
            setMessages([{ role: 'bot', text: welcomeText }]);
        }
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
                    msgs.push({
                        role: 'bot',
                        text: substitute(cmd.response.text, vars),
                        buttons: cmd.response.buttons.map((b) => ({
                            title: substitute(b.title, vars),
                            targetNodeId: b.targetNodeId,
                            url: b.url,
                        })),
                        card: cmd.response.card
                            ? {
                                  ...cmd.response.card,
                                  title: substitute(cmd.response.card.title, vars),
                                  images: cmd.response.card.images.map((img) => ({
                                      ...img,
                                      src: substitute(img.src, vars),
                                      title: substitute(img.title, vars),
                                      description: substitute(img.description, vars),
                                      button: img.button
                                          ? {
                                                ...img.button,
                                                title: substitute(img.button.title, vars),
                                            }
                                          : undefined,
                                  })),
                              }
                            : undefined,
                    });
                    currentId = findEdge(doc, currentId);
                    continue;
                }

                if (node.type === 'response') {
                    const resp = node as unknown as CommandNodeData;
                    msgs.push({
                        role: 'bot',
                        text: substitute(resp.response.text, vars),
                        buttons: resp.response.buttons.map((b) => ({
                            title: substitute(b.title, vars),
                            targetNodeId: b.targetNodeId,
                            url: b.url,
                        })),
                        card: resp.response.card
                            ? {
                                  ...resp.response.card,
                                  title: substitute(resp.response.card.title, vars),
                                  images: resp.response.card.images.map((img) => ({
                                      ...img,
                                      src: substitute(img.src, vars),
                                      title: substitute(img.title, vars),
                                      description: substitute(img.description, vars),
                                      button: img.button
                                          ? {
                                                ...img.button,
                                                title: substitute(img.button.title, vars),
                                            }
                                          : undefined,
                                  })),
                              }
                            : undefined,
                    });
                    currentId = findEdge(doc, currentId);
                    continue;
                }

                if (node.type === 'step') {
                    const step = node as StepNodeData;
                    // Выполняем inline-действия шага
                    if (step.actions) Object.assign(vars, executeActions(step.actions, vars));
                    msgs.push({
                        role: 'bot',
                        text: substitute(step.prompt.text, vars),
                        buttons: step.prompt.buttons?.map((b) => ({
                            title: substitute(b.title, vars),
                            targetNodeId: b.targetNodeId,
                            url: b.url,
                        })),
                    });
                    waitStep = step.id;
                    break;
                }

                if (node.type === 'action') {
                    const actionNode = node as ActionNodeData;
                    Object.assign(vars, executeActions(actionNode.actions, vars));

                    if (actionNode.text) {
                        msgs.push({
                            role: 'bot',
                            text: substitute(actionNode.text, vars),
                            buttons: actionNode.buttons?.map((b) => ({
                                title: substitute(b.title, vars),
                                targetNodeId: b.targetNodeId,
                                url: b.url,
                            })),
                        });
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
                const lower = btnText.toLowerCase();
                let matched = null;
                for (const node of doc.nodes) {
                    if (node.type !== 'command') continue;
                    const cmd = node as CommandNodeData;
                    if (!cmd.slots || cmd.slots.length === 0) continue;
                    for (const slot of cmd.slots) {
                        if (cmd.isPattern) {
                            try {
                                const slotRe = getSlotRegex(slot);
                                if (slotRe && slotRe.test(btnText)) {
                                    matched = cmd;
                                    break;
                                }
                            } catch {
                                /* невалидный regex */
                            }
                        } else if (lower.includes(slot.toLowerCase())) {
                            matched = cmd;
                            break;
                        }
                    }
                    if (matched) break;
                }

                if (matched) {
                    // Выполняем inline-действия команды (random_number, set_variable и т.д.)
                    const updatedVars = { ...variables };
                    if (matched.actions)
                        Object.assign(updatedVars, executeActions(matched.actions, updatedVars));

                    newMessages.push({
                        role: 'bot',
                        text: substitute(matched.response.text, updatedVars),
                        buttons: matched.response.buttons.map((b) => ({
                            title: substitute(b.title, updatedVars),
                            targetNodeId: b.targetNodeId,
                            url: b.url,
                        })),
                        card: matched.response.card
                            ? {
                                  ...matched.response.card,
                                  title: substitute(matched.response.card.title, updatedVars),
                                  images: matched.response.card.images.map((img) => ({
                                      ...img,
                                      src: substitute(img.src, updatedVars),
                                      title: substitute(img.title, updatedVars),
                                      description: substitute(img.description, updatedVars),
                                      button: img.button
                                          ? {
                                                ...img.button,
                                                title: substitute(img.button.title, updatedVars),
                                            }
                                          : undefined,
                                  })),
                              }
                            : undefined,
                    });

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
                        text: substitute(doc.fallback.text, variables),
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
                (lower === 'help' || lower === 'помощь' || lower === 'помощь')
            ) {
                matched = helpCmd;
            }
        }

        if (!matched) {
            for (const node of doc.nodes) {
                if (node.type !== 'command') continue;
                const cmd = node as CommandNodeData;
                if (!cmd.slots || cmd.slots.length === 0) continue;
                for (const slot of cmd.slots) {
                    if (cmd.isPattern) {
                        try {
                            const slotRe = getSlotRegex(slot);
                            if (slotRe && slotRe.test(text)) {
                                matched = cmd;
                                break;
                            }
                        } catch {
                            /* невалидный regex */
                        }
                    } else if (lower.includes(slot.toLowerCase())) {
                        matched = cmd;
                        break;
                    }
                }
                if (matched) break;
            }
        }

        if (matched) {
            // Выполняем inline-действия команды (random_number, set_variable и т.д.)
            const updatedVars = { ...variables };
            if (matched.actions)
                Object.assign(updatedVars, executeActions(matched.actions, updatedVars));

            newMessages.push({
                role: 'bot',
                text: substitute(matched.response.text, updatedVars),
                buttons: matched.response.buttons.map((b) => ({
                    title: substitute(b.title, updatedVars),
                    targetNodeId: b.targetNodeId,
                    url: b.url,
                })),
                card: matched.response.card
                    ? {
                          ...matched.response.card,
                          title: substitute(matched.response.card.title, updatedVars),
                          images: matched.response.card.images.map((img) => ({
                              ...img,
                              src: substitute(img.src, updatedVars),
                              title: substitute(img.title, updatedVars),
                              description: substitute(img.description, updatedVars),
                              button: img.button
                                  ? {
                                        ...img.button,
                                        title: substitute(img.button.title, updatedVars),
                                    }
                                  : undefined,
                          })),
                      }
                    : undefined,
            });

            setVariables(updatedVars);
            const nextId = findEdge(doc, matched.id);
            if (nextId) {
                const result = processChain(nextId, updatedVars);
                newMessages.push(...result.msgs);
                setVariables(result.vars);
                setWaitingForStep(result.waitStep);
            }
        } else {
            newMessages.push({ role: 'bot', text: substitute(doc.fallback.text, variables) });
        }

        setMessages(newMessages);
        setInput('');
    }, [input, messages, waitingForStep, variables, doc, processChain]);

    return (
        <div
            className={`absolute bottom-4 right-4 z-30 flex h-[480px] w-80 flex-col rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,15,20,0.95)] shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-150 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
            <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-[#bc13fe] to-[#00f0ff] px-4 py-2">
                <span className="text-sm font-bold text-white">{t('preview.title')}</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDebugMode(!debugMode)}
                        className={`rounded px-1.5 py-0.5 text-[10px] ${debugMode ? 'bg-[rgba(188,19,254,0.2)] text-[#bc13fe]' : 'text-white/60 hover:text-white'}`}
                        title={t('preview.debug')}
                    >
                        {'{ }'}
                    </button>
                    <button onClick={handleClose} className="text-white/60 hover:text-white">
                        ✕
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                {messages.length === 0 && (
                    <div className="mt-8 text-center text-sm text-white/30">
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
                <div className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(20,20,25,0.9)] p-2 text-[10px]">
                    <div className="mb-1 font-bold text-white/40">{t('preview.debugVars')}</div>
                    {Object.keys(variables).length === 0 ? (
                        <div className="text-white/30">{t('userData.empty')}</div>
                    ) : (
                        <div className="max-h-24 overflow-y-auto">
                            {Object.entries(variables).map(([key, val]) => (
                                <div key={key} className="flex gap-2">
                                    <span className="font-mono text-[#00f0ff]">{key}:</span>
                                    <span className="truncate text-white/60">{val}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {waitingForStep && (
                        <div className="mt-1 text-[#ff9d00]">
                            {t('preview.waiting')}: {waitingForStep}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 border-t border-[rgba(255,255,255,0.08)] p-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('preview.placeholder')}
                    className="min-w-0 flex-1 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm text-white/90 placeholder-white/30 focus:border-[#00f0ff] focus:outline-none"
                />
                <button
                    onClick={handleSend}
                    className="flex-shrink-0 rounded-lg bg-gradient-to-r from-[#bc13fe] to-[#00f0ff] px-3 py-1.5 text-sm text-white shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                >
                    {t('preview.send')}
                </button>
            </div>
        </div>
    );
}
