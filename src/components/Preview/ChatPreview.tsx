import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import type { StepNodeData } from '../../types/flow';
import { MessageBubble } from './MessageBubble';
import { DebugVarsPanel } from './DebugVarsPanel';
import { ChatInput } from './ChatInput';
import { NodeIcon } from '../ui/NodeIcons';
import { t } from '../../i18n';
import {
    startDialog,
    sendInput,
    EMPTY_STATE,
    type DialogState,
    type PreviewButton,
    type PreviewMessage,
} from '../../utils/previewEngine';

/**
 * Превью чата. Вся логика диалога — в utils/previewEngine (симуляция бота,
 * сгенерированного CLI): один ввод → одно сообщение бота, шаг ждёт ввод.
 */
export default function ChatPreview() {
    const togglePreview = useUiStore((s) => s.togglePreview);
    const setActivePreviewNodeId = useUiStore((s) => s.setActivePreviewNodeId);
    const nodes = useFlowStore((s) => s.nodes);
    const edges = useFlowStore((s) => s.edges);
    const toJSON = useFlowStore((s) => s.toJSON);
    const [messages, setMessages] = useState<PreviewMessage[]>([]);
    const [input, setInput] = useState('');
    const [dialog, setDialog] = useState<DialogState>(EMPTY_STATE);
    const [debugMode, setDebugMode] = useState(false);
    const [animate, setAnimate] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Мемоизируем doc — пересоздаётся только при изменении nodes/edges
    const doc = useMemo(() => toJSON(), [nodes, edges, toJSON]);

    useEffect(() => {
        requestAnimationFrame(() => setAnimate(true));
    }, []);

    // Начальный ход: срабатывает welcome-команда (в боте — «привет»/старт диалога)
    const restart = useCallback(() => {
        const turn = startDialog(toJSON());
        setMessages(turn.reply ? [turn.reply] : []);
        setDialog(turn.state);
        setInput('');
    }, [toJSON]);

    useEffect(() => {
        restart();
    }, []);

    // Подсвечиваем на холсте шаг, который ждёт ввод
    useEffect(() => {
        setActivePreviewNodeId(dialog.waitStep);
    }, [dialog.waitStep, setActivePreviewNodeId]);

    const handleClose = () => {
        setAnimate(false);
        setActivePreviewNodeId(null);
        setTimeout(() => togglePreview(), 150);
    };

    // Автопрокрутка вниз при новых сообщениях
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /** Отправить ввод: текст из поля или заголовок нажатой кнопки (с её блоком-целью). */
    const submit = useCallback(
        (text: string, target?: string) => {
            const turn = sendInput(doc, dialog, text, target);
            setMessages((prev) => [
                ...prev,
                { role: 'user', text },
                // Бот может промолчать (например, шаг без текста в конце цепочки) —
                // показываем это явно, иначе кажется, что превью зависло
                turn.reply ?? { role: 'bot', text: t('preview.emptyReply') },
            ]);
            setDialog(turn.state);
        },
        [doc, dialog],
    );

    const handleSend = useCallback(() => {
        const text = input.trim();
        if (!text) return;
        submit(text);
        setInput('');
    }, [input, submit]);

    // Кнопка отправляет свой текст; кнопка с переходом выполняет свой блок-цель
    const handleButtonClick = useCallback(
        (btn: PreviewButton) => {
            if (btn.url) {
                if (btn.url.startsWith('http://') || btn.url.startsWith('https://')) {
                    window.open(btn.url, '_blank');
                }
                return;
            }
            // У кнопки картинки карточки цель приходит в targetNodeId (уже проверенная движком)
            submit(btn.title, btn.target ?? (btn as { targetNodeId?: string }).targetNodeId);
        },
        [submit],
    );

    const waitingStep = dialog.waitStep
        ? (doc.nodes.find((n) => n.id === dialog.waitStep) as StepNodeData | undefined)
        : undefined;

    return (
        <div
            className={`absolute bottom-6 right-4 z-preview flex h-[480px] w-80 flex-col rounded-xl border border-glass-border bg-surface-dim/95 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-150 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
            <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-accent to-info px-4 py-2">
                <span className="text-sm font-bold text-white">{t('preview.title')}</span>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={restart}
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
                    <div className="mt-8 text-center text-sm text-fg/50">{t('preview.empty')}</div>
                )}
                {messages.map((msg, i) => (
                    <MessageBubble
                        key={i}
                        role={msg.role}
                        text={msg.text}
                        buttons={msg.buttons}
                        card={msg.card}
                        onButtonClick={handleButtonClick}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {debugMode && (
                <DebugVarsPanel
                    variables={dialog.vars}
                    waitingForStepName={waitingStep ? waitingStep.name || waitingStep.id : null}
                />
            )}

            <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                waitingForVarName={waitingStep ? waitingStep.saveTo || '…' : undefined}
            />
        </div>
    );
}
