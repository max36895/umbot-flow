import { useState, useMemo, useCallback } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import { t, tf } from '../../i18n';
import type { ActionBlock, DatabaseType, BotMode } from '../../types/flow';
import { TextArea } from '../ui/TextArea';
import HelpButton from '../ui/HelpButton';
import { Modal } from '../ui/Modal';
import { PrimaryButton } from '../ui/PrimaryButton';

/** Информация о переменной */
interface VariableInfo {
    name: string;
    comment: string;
    definedIn: { nodeId: string; nodeName: string; type: string }[];
    usedIn: { nodeId: string; nodeName: string; type: string }[];
}

/** Сканирует все ноды и собирает информацию о переменных */
function collectVariables(nodes: { data: Record<string, unknown> }[]): VariableInfo[] {
    const varMap = new Map<string, VariableInfo>();

    const ensureVar = (name: string) => {
        if (!varMap.has(name)) {
            varMap.set(name, { name, comment: '', definedIn: [], usedIn: [] });
        }
        return varMap.get(name)!;
    };

    const addRef = (list: VariableInfo['definedIn'], node: Record<string, unknown>) => {
        list.push({
            nodeId: node.id as string,
            nodeName: (node.name as string) || (node.id as string),
            type: (node.type as string) || 'unknown',
        });
    };

    const checkText = (text: string, node: Record<string, unknown>) => {
        if (!text) return;
        const matches = text.match(/\{\{(\w+)\}\}/g);
        if (!matches) return;
        for (const m of matches) {
            const varName = m.slice(2, -2);
            const info = ensureVar(varName);
            addRef(info.usedIn, node);
        }
    };

    const checkActions = (actions: ActionBlock[] | undefined, node: Record<string, unknown>) => {
        if (!actions) return;
        for (const action of actions) {
            if (action.field) {
                const info = ensureVar(action.field);
                addRef(info.definedIn, node);
                if (action.fieldComment) info.comment = action.fieldComment;
            }
            if (action.saveResponseTo) {
                const info = ensureVar(action.saveResponseTo);
                addRef(info.definedIn, node);
            }
            if (action.value) checkText(action.value, node);
            if (action.body) checkText(action.body, node);
        }
    };

    for (const { data: node } of nodes) {
        const saveTo = node.saveTo as string | undefined;
        if (saveTo) {
            const info = ensureVar(saveTo);
            addRef(info.definedIn, node);
            const varComment = node.varComment as string | undefined;
            if (varComment) info.comment = varComment;
        }

        const nodeActions = node.actions as ActionBlock[] | undefined;
        checkActions(nodeActions, node);

        const response = node.response as { text?: string } | undefined;
        if (response?.text) checkText(response.text, node);

        const prompt = node.prompt as { text?: string } | undefined;
        if (prompt?.text) checkText(prompt.text, node);

        const nodeText = node.text as string | undefined;
        if (nodeText) checkText(nodeText, node);

        const conditionVar = node.variable as string | undefined;
        if (conditionVar) {
            const info = ensureVar(conditionVar);
            addRef(info.usedIn, node);
        }
    }

    return Array.from(varMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Метки типов блоков для вывода в списке использования переменных. */
const TYPE_LABEL_KEYS: Record<string, string> = {
    command: 'sidebar.command.label',
    step: 'sidebar.step.label',
    condition: 'sidebar.condition.label',
    action: 'sidebar.custom.label',
    response: 'sidebar.response.label',
    end: 'sidebar.end.label',
};

export default function BotSettingsModal() {
    const toggleBotSettings = useUiStore((s) => s.toggleBotSettings);
    const selectNode = useUiStore((s) => s.selectNode);
    const metadata = useFlowStore((s) => s.metadata);
    const setMetadata = useFlowStore((s) => s.setMetadata);
    const nodes = useFlowStore((s) => s.nodes);
    const updateNodeData = useFlowStore((s) => s.updateNodeData);
    const [expandedVar, setExpandedVar] = useState<string | null>(null);
    const [tokensOpen, setTokensOpen] = useState(false);
    const [textsOpen, setTextsOpen] = useState(false);

    const variables = useMemo(() => collectVariables(nodes), [nodes]);

    const toggleExpand = (name: string) => {
        setExpandedVar(expandedVar === name ? null : name);
    };

    /** Переход к блоку: закрываем модалку и выбираем ноду */
    const goToNode = useCallback(
        (nodeId: string) => {
            toggleBotSettings();
            // Даём время модалке закрыться, затем выбираем ноду
            setTimeout(() => selectNode(nodeId), 200);
        },
        [selectNode, toggleBotSettings],
    );

    /** Обновление комментария переменной в связанных нодах */
    const updateComment = useCallback(
        (varName: string, newComment: string) => {
            // Обновляем в metadata.variables
            setMetadata({
                variables: {
                    ...metadata.variables,
                    [varName]: newComment,
                },
            });

            // Обновляем varComment в нодах с saveTo === varName
            for (const node of nodes) {
                const data = node.data as Record<string, unknown>;
                if (data.saveTo === varName) {
                    updateNodeData(node.id, { varComment: newComment });
                }
                // Обновляем fieldComment в action-блоках
                const actions = data.actions as ActionBlock[] | undefined;
                if (actions) {
                    let changed = false;
                    const updated = actions.map((a) => {
                        if (a.field === varName) {
                            changed = true;
                            return { ...a, fieldComment: newComment };
                        }
                        return a;
                    });
                    if (changed) updateNodeData(node.id, { actions: updated });
                }
            }
        },
        [metadata.variables, nodes, setMetadata, updateNodeData],
    );

    return (
        <Modal title={t('settings.title')} onClose={toggleBotSettings} maxWidth="lg">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                    {/* Тексты бота (спойлер) */}
                    <div>
                        <button
                            onClick={() => setTextsOpen(!textsOpen)}
                            className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-fg/[0.03] px-3 py-2 text-xs transition-colors hover:bg-fg/5"
                        >
                            <span className="font-medium text-fg/60">{t('db.texts')}</span>
                            <span className="text-[11px] text-fg/50">
                                {textsOpen ? '▾' : '▸'}
                            </span>
                        </button>
                        {textsOpen && (
                            <div className="mt-2 rounded-lg border border-outline-variant bg-fg/[0.03] p-3 space-y-3">
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-fg/55">
                                        {t('db.welcome')}
                                    </label>
                                    <TextArea
                                        value={metadata.welcome.text}
                                        onChange={(e) =>
                                            setMetadata({
                                                welcome: {
                                                    ...metadata.welcome,
                                                    text: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder={t('db.welcomePlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-fg/55">
                                        {t('db.fallback')}
                                    </label>
                                    <TextArea
                                        value={metadata.fallback.text}
                                        onChange={(e) =>
                                            setMetadata({ fallback: { text: e.target.value } })
                                        }
                                        placeholder={t('db.fallbackPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-fg/55">
                                        {t('db.helpText')}
                                    </label>
                                    <TextArea
                                        value={metadata.helpText?.text ?? ''}
                                        onChange={(e) =>
                                            setMetadata({ helpText: { text: e.target.value } })
                                        }
                                        placeholder={t('db.helpTextPlaceholder')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Тип БД */}
                    <div>
                        <div className="mb-1 flex items-center gap-1">
                            <label className="text-xs font-medium text-fg/55">
                                {t('db.type')}
                            </label>
                            <HelpButton content={t('settings.dbTypeHelp')} />
                        </div>
                        <div className="flex gap-2">
                            {['file', 'mongo', 'none'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() =>
                                        setMetadata({
                                            database: { ...metadata.database, type: type as DatabaseType },
                                        })
                                    }
                                    className={`flex-1 rounded-lg px-3 py-2 text-xs transition-colors ${
                                        metadata.database.type === type
                                            ? 'bg-info/15 text-info border border-info/30'
                                            : 'bg-fg/5 text-fg/50 border border-outline-variant hover:bg-fg/10'
                                    }`}
                                >
                                    {t(`db.type${type.charAt(0).toUpperCase() + type.slice(1)}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Сохранение данных */}
                    <div>
                        <div className="mb-1 flex items-center gap-1">
                            <label className="text-xs font-medium text-fg/55">
                                {t('db.localStorage')}
                            </label>
                            <HelpButton content={t('settings.localStorageHelp')} />
                        </div>
                        <button
                            onClick={() =>
                                setMetadata({ isLocalStorage: !metadata.isLocalStorage })
                            }
                            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-xs transition-colors ${
                                metadata.isLocalStorage
                                    ? 'border-info/30 bg-info/10 text-info'
                                    : 'border-outline-variant bg-fg/5 text-fg/50'
                            }`}
                        >
                            <div
                                className={`flex h-4 w-7 items-center rounded-full transition-colors ${
                                    metadata.isLocalStorage ? 'bg-info' : 'bg-fg/20'
                                }`}
                            >
                                <div
                                    className={`h-3 w-3 rounded-full bg-white transition-transform ${
                                        metadata.isLocalStorage
                                            ? 'translate-x-3.5'
                                            : 'translate-x-0.5'
                                    }`}
                                />
                            </div>
                            <span>{t('db.localStorageDesc')}</span>
                        </button>
                    </div>

                    {/* Режим бота */}
                    <div>
                        <div className="mb-1 flex items-center gap-1">
                            <label className="text-xs font-medium text-fg/55">
                                {t('db.mode')}
                            </label>
                            <HelpButton content={t('settings.modeHelp')} />
                        </div>
                        <div className="flex gap-2">
                            {(['dev', 'prod', 'strict_prod'] as BotMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setMetadata({ mode })}
                                    className={`flex-1 rounded-lg px-3 py-2 text-xs transition-colors ${
                                        metadata.mode === mode
                                            ? 'bg-info/15 text-info border border-info/30'
                                            : 'bg-fg/5 text-fg/50 border border-outline-variant hover:bg-fg/10'
                                    }`}
                                >
                                    {t(`settings.mode.${mode}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Токены платформ */}
                    <div>
                        <button
                            onClick={() => setTokensOpen(!tokensOpen)}
                            className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-fg/[0.03] px-3 py-2 text-xs transition-colors hover:bg-fg/5"
                        >
                            <span className="font-medium text-fg/60">
                                {t('db.tokens')} ({metadata.platforms.length})
                            </span>
                            <span className="text-[11px] text-fg/50">
                                {tokensOpen ? '▾' : '▸'}
                            </span>
                        </button>
                        {tokensOpen && (
                            <div className="mt-2 space-y-2 rounded-lg border border-outline-variant bg-fg/[0.03] p-2">
                                {metadata.platforms.length === 0 ? (
                                    <p className="text-[11px] text-fg/50">
                                        {t('db.tokensEmpty')}
                                    </p>
                                ) : (
                                    metadata.platforms.map((platform) => (
                                        <div key={platform}>
                                            <label className="mb-0.5 block text-[11px] font-medium text-fg/55">
                                                {t(`platform.${platform}`)}
                                            </label>
                                            <input
                                                type="password"
                                                value={metadata.tokens?.[platform] ?? ''}
                                                onChange={(e) =>
                                                    setMetadata({
                                                        tokens: {
                                                            ...metadata.tokens,
                                                            [platform]: e.target.value,
                                                        },
                                                    })
                                                }
                                                placeholder={t('db.tokenPlaceholder')}
                                                className="w-full rounded border border-outline-variant bg-fg/5 px-2 py-1 text-[11px] text-fg/80 placeholder-fg/20 focus:border-info focus:ring-0"
                                            />
                                        </div>
                                    ))
                                )}
                                <p className="text-[11px] text-fg/50">{t('db.tokensHint')}</p>
                            </div>
                        )}
                    </div>

                    {/* Переменные */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-fg/55">
                            {t('userData.title')} ({variables.length})
                        </label>
                        <div className="max-h-48 overflow-y-auto rounded-lg border border-outline-variant bg-fg/[0.03] p-2">
                            {variables.length === 0 ? (
                                <p className="text-xs text-fg/50">{t('userData.empty')}</p>
                            ) : (
                                variables.map((v) => (
                                    <div
                                        key={v.name}
                                        className="border-b border-outline-variant last:border-b-0"
                                    >
                                        <button
                                            onClick={() => toggleExpand(v.name)}
                                            className="flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-fg/5 rounded"
                                        >
                                            <span className="font-mono text-xs text-info">
                                                {v.name}
                                            </span>
                                            {v.comment && (
                                                <span
                                                    className="max-w-[100%] truncate text-[11px] text-fg/50"
                                                    title={v.comment}
                                                >
                                                    — {v.comment}
                                                </span>
                                            )}
                                            <span className="ml-auto text-[11px] text-fg/40">
                                                {expandedVar === v.name ? '▾' : '▸'}
                                            </span>
                                        </button>
                                        {expandedVar === v.name && (
                                            <div className="px-2 pb-2 space-y-2">
                                                {/* Поле комментария */}
                                                <div>
                                                    <label className="mb-0.5 block text-[11px] font-medium text-fg/55">
                                                        {t('userData.comment')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={v.comment}
                                                        onChange={(e) =>
                                                            updateComment(v.name, e.target.value)
                                                        }
                                                        placeholder={t('userData.commentPlaceholder')}
                                                        className="w-full rounded border border-outline-variant bg-fg/5 px-2 py-1 text-[11px] text-fg/80 placeholder-fg/20 focus:border-info focus:ring-0"
                                                    />
                                                </div>

                                                {v.definedIn.length > 0 && (
                                                    <div>
                                                        <p className="text-[11px] font-medium text-fg/55 mb-0.5">
                                                            {t('userData.definedIn')}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {v.definedIn.map((ref, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        goToNode(ref.nodeId);
                                                                    }}
                                                                    className="cursor-pointer rounded bg-success/10 px-1.5 py-0.5 text-[11px] text-success border border-success/15 transition-colors hover:bg-success/25 hover:border-success/30"
                                                                    title={tf('settings.goToNode', {
                                                                        name: ref.nodeName,
                                                                    })}
                                                                >
                                                                    {t(TYPE_LABEL_KEYS[ref.type] ?? 'sidebar.command.label') ||
                                                                        ref.type}
                                                                    : {ref.nodeName}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {v.usedIn.length > 0 && (
                                                    <div>
                                                        <p className="text-[11px] font-medium text-fg/55 mb-0.5">
                                                            {t('userData.usedIn')}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {v.usedIn.map((ref, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        goToNode(ref.nodeId);
                                                                    }}
                                                                    className="cursor-pointer rounded bg-info/10 px-1.5 py-0.5 text-[11px] text-info border border-info/15 transition-colors hover:bg-info/25 hover:border-info/30"
                                                                    title={tf('settings.goToNode', {
                                                                        name: ref.nodeName,
                                                                    })}
                                                                >
                                                                    {t(TYPE_LABEL_KEYS[ref.type] ?? 'sidebar.command.label') ||
                                                                        ref.type}
                                                                    : {ref.nodeName}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {v.definedIn.length === 0 &&
                                                    v.usedIn.length === 0 && (
                                                        <p className="text-[11px] text-fg/50">
                                                            {t('userData.notFound')}
                                                        </p>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            <div className="flex justify-end border-t border-outline-variant px-6 py-4">
                <PrimaryButton onClick={toggleBotSettings}>{t('help.close')}</PrimaryButton>
            </div>
        </Modal>
    );
}
