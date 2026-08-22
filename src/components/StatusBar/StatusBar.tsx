import { useState, useEffect } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import { useValidationErrors } from '../../hooks/useValidationDoc';
import { t } from '../../i18n';
import { NodeIcon } from '../ui/NodeIcons';

/**
 * Нижний статус-бар: показывает количество ошибок и предупреждений.
 * Клик по ошибке — выбирает узел на канвасе.
 */
export default function StatusBar() {
    const nodes = useFlowStore((s) => s.nodes);
    const edges = useFlowStore((s) => s.edges);
    const metadata = useFlowStore((s) => s.metadata);
    const selectNode = useUiStore((s) => s.selectNode);
    const toggleExportDialog = useUiStore((s) => s.toggleExportDialog);
    const locale = useUiStore((s) => s.locale);

    const errors = useValidationErrors();
    const errorCount = errors.length;

    // Индикатор автосохранения — используем nodes/edges/metadata как триггер изменения
    const [savedState, setSavedState] = useState<'idle' | 'saving' | 'saved'>('idle');
    useEffect(() => {
        setSavedState('saving');
        const timer = setTimeout(() => setSavedState('saved'), 600);
        return () => clearTimeout(timer);
    }, [nodes, edges, metadata]);

    // Склонение существительных в зависимости от языка
    const pluralize = (n: number): string => {
        if (locale === 'en') return n === 1 ? 'error' : 'errors';
        // RU plural rules
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) return 'ошибка';
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'ошибки';
        return 'ошибок';
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 z-panel flex h-7 items-center gap-3 border-t border-outline-variant bg-surface-dim/90 px-3 text-[11px] backdrop-blur-xl">
            <button
                onClick={toggleExportDialog}
                className={`flex cursor-pointer items-center gap-1.5 rounded px-2 py-0.5 transition-colors ${
                    errorCount === 0
                        ? 'text-success hover:bg-success/10'
                        : 'text-error hover:bg-error/10'
                }`}
                title={errorCount === 0 ? t('statusbar.ok') : t('statusbar.errors')}
            >
                {errorCount === 0 ? (
                    <>
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        {t('statusbar.ok')}
                    </>
                ) : (
                    <>
                        <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" />
                        {errorCount} {pluralize(errorCount)}
                    </>
                )}
            </button>

            {errorCount > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto">
                    {(() => {
                        // Группируем ошибки по nodeId — один чип = одна нода
                        const byNode = new Map<string, typeof errors>();
                        for (const err of errors) {
                            if (!err.nodeId) continue;
                            const arr = byNode.get(err.nodeId) ?? [];
                            arr.push(err);
                            byNode.set(err.nodeId, arr);
                        }
                        const uniqueNodes = [...byNode.entries()];
                        return (
                            <>
                                {uniqueNodes.slice(0, 5).map(([nodeId, nodeErrors], i) => {
                                    const node = nodes.find((n) => n.id === nodeId);
                                    const nodeLabel =
                                        (node?.data as { name?: string } | undefined)?.name ||
                                        nodeId;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => selectNode(nodeId)}
                                            className="flex shrink-0 cursor-pointer items-center gap-1 rounded border border-error/30 bg-error/10 px-1.5 py-0.5 text-[11px] text-error transition-colors hover:bg-error/20 hover:text-white"
                                            title={nodeErrors.map((e) => e.message).join('\n')}
                                        >
                                            <span className="truncate">{nodeLabel}</span>
                                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-error text-[11px] font-bold text-white">
                                                {nodeErrors.length}
                                            </span>
                                        </button>
                                    );
                                })}
                                {uniqueNodes.length > 5 && (
                                    <span className="text-[11px] text-fg/50">
                                        +{uniqueNodes.length - 5} {t('statusbar.more')}
                                    </span>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}

            <div className="flex-1" />

            <span
                className={`flex items-center gap-1 text-[11px] transition-colors ${
                    savedState === 'saved' ? 'text-success/60' : 'text-fg/40'
                }`}
            >
                {savedState === 'saved' && <NodeIcon name="check" size={10} strokeWidth={2} />}
                {savedState === 'saved' ? t('statusbar.saved') : t('statusbar.saving')}
            </span>

            <span className="text-fg/50">
                {nodes.length} {t('export.nodes')} · {edges.length} {t('export.edges')}
            </span>
        </div>
    );
}
