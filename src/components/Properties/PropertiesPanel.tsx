import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import useUiStore from '../../store/uiStore';
import useFlowStore from '../../store/flowStore';
import { CommandProps } from './CommandProps';
import { StepProps } from './StepProps';
import { ConditionProps } from './ConditionProps';
import { ActionProps } from './ActionProps';
import { ResponseProps } from './ResponseProps';
import { t } from '../../i18n';

/** Проверка валидности JS-идентификатора */
function isValidJSIdentifier(name: string): boolean {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

/** Валидация выбранного узла */
function useNodeValidation(
    nodeId: string | null,
    nodes: { id: string; type?: string; data?: Record<string, unknown> }[],
) {
    return useMemo(() => {
        if (!nodeId) return [];
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return [];

        const errors: string[] = [];
        const data = node.data ?? {};

        if (node.type !== 'end') {
            const name = data.name as string | undefined;
            if (!name || name.trim() === '') {
                errors.push(t('validation.emptyName'));
            }
        }

        if (node.type === 'command' || node.type === 'step') {
            const saveTo = data.saveTo as string | undefined;
            if (saveTo && !isValidJSIdentifier(saveTo)) {
                errors.push(`${saveTo} — ${t('validation.invalidVarName')}`);
            }
        }

        if (node.type === 'action') {
            const actions = (data.actions ?? []) as Array<{ field?: string; type: string }>;
            for (const action of actions) {
                if (action.field && !isValidJSIdentifier(action.field)) {
                    errors.push(`${action.field} — ${t('validation.invalidVarName')}`);
                }
            }
        }

        if (node.type !== 'end') {
            const name = data.name as string | undefined;
            if (name) {
                const duplicate = nodes.find(
                    (n) => n.id !== nodeId && (n.data as { name?: string })?.name === name,
                );
                if (duplicate) {
                    errors.push(`${t('validation.duplicateName')}: "${name}"`);
                }
            }
        }

        return errors;
    }, [nodeId, nodes]);
}

export default function PropertiesPanel() {
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const nodes = useFlowStore((s) => s.nodes);
    const removeNode = useFlowStore((s) => s.removeNode);
    const panelMode = useUiStore((s) => s.propertiesPanelMode);
    const panelPosition = useUiStore((s) => s.propertiesPanelPosition);
    const setPanelPosition = useUiStore((s) => s.setPropertiesPanelPosition);
    const togglePanelMode = useUiStore((s) => s.togglePropertiesPanelMode);
    const [collapsed, setCollapsed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasEntered, setHasEntered] = useState(false);
    const [contentKey, setContentKey] = useState(0);
    const dragOffset = useRef({ x: 0, y: 0 });
    const prevSelectedNodeId = useRef<string | null>(null);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    const validationErrors = useNodeValidation(selectedNodeId, nodes);

    // Анимация появления панели
    useEffect(() => {
        if (selectedNodeId && !hasEntered) {
            // Небольшая задержка для trigger анимации
            requestAnimationFrame(() => setHasEntered(true));
        }
        if (!selectedNodeId) {
            setHasEntered(false);
        }
    }, [selectedNodeId, hasEntered]);

    // Fade-эффект при смене ноды
    useEffect(() => {
        if (selectedNodeId !== prevSelectedNodeId.current) {
            setContentKey((k) => k + 1);
            prevSelectedNodeId.current = selectedNodeId;
        }
    }, [selectedNodeId]);

    // Сброс collapsed при смене ноды
    useEffect(() => {
        setCollapsed(false);
    }, [selectedNodeId]);

    const typeLabel: Record<string, string> = {
        command: t('sidebar.command.label'),
        step: t('sidebar.step.label'),
        condition: t('sidebar.condition.label'),
        action: t('sidebar.custom.label'),
        response: t('sidebar.response.label'),
        end: t('sidebar.end.label'),
    };

    // Обработчик перетаскивания (для floating режима)
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;
            setIsDragging(true);
            dragOffset.current = {
                x: e.clientX - panelPosition.x,
                y: e.clientY - panelPosition.y,
            };
        },
        [panelPosition],
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;
            setPanelPosition({
                x: e.clientX - dragOffset.current.x,
                y: Math.max(0, e.clientY - dragOffset.current.y),
            });
        },
        [isDragging, setPanelPosition],
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Определяем CSS-класс анимации для панели
    const panelAnimationClass = !selectedNodeId
        ? ''
        : panelMode === 'docked'
          ? 'panel-docked-enter'
          : 'panel-floating-enter';

    const floatingTransitionClass =
        panelMode === 'floating' && !isDragging ? 'panel-floating-transition' : '';
    const draggingClass = isDragging
        ? 'panel-dragging'
        : panelMode === 'floating'
          ? 'panel-dragging-release'
          : '';

    // Если нет выбранной ноды
    if (!selectedNode) {
        if (panelMode === 'floating') {
            return (
                <div
                    className="fixed z-40 flex min-w-[48px] flex-col rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(30,30,35,0.9)] backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.4)]"
                    style={{ left: panelPosition.x, top: panelPosition.y }}
                >
                    <div className="flex items-center justify-center border-b border-[rgba(255,255,255,0.08)] py-2">
                        <button
                            onClick={togglePanelMode}
                            className="rounded-lg p-2 text-white/40 transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white/70"
                            title={t('props.dockedMode')}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            >
                                <rect x="1" y="3" width="14" height="10" rx="1" />
                                <path d="M10 3v10" />
                            </svg>
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex min-w-[48px] flex-col border-l border-[rgba(255,255,255,0.08)] bg-[rgba(20,20,25,0.95)] backdrop-blur-xl">
                <div className="flex items-center justify-center border-b border-[rgba(255,255,255,0.08)] py-3">
                    <button
                        onClick={togglePanelMode}
                        className="rounded-lg p-2 text-white/40 transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white/70"
                        title={t('props.floatingMode')}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="2" y="3" width="8" height="10" rx="1" />
                            <path d="M10 6l4-2v8l-4-2" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    // Свёрнутый вид
    if (collapsed) {
        const CollapsedContent = (
            <div className="flex flex-col items-center gap-2 border-b border-[rgba(255,255,255,0.08)] py-3">
                <button
                    onClick={() => setCollapsed(false)}
                    className="rounded-lg p-2 text-white/40 transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white/70"
                    title={t('props.expand')}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M6 4l4 4-4 4" />
                    </svg>
                </button>
                <button
                    onClick={() => {
                        if (window.confirm(t('props.deleteConfirm'))) {
                            removeNode(selectedNode.id);
                        }
                    }}
                    className="rounded-lg p-2 text-[#ff0055] transition-colors hover:bg-[rgba(255,0,85,0.15)]"
                    title={t('props.delete')}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" />
                        <path d="M6.667 7.333v4M10 7.333v4" />
                    </svg>
                </button>
                <button
                    onClick={togglePanelMode}
                    className="rounded-lg p-2 text-white/40 transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white/70"
                    title={panelMode === 'docked' ? t('props.floatingMode') : t('props.dockedMode')}
                >
                    {panelMode === 'docked' ? (
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="2" y="3" width="8" height="10" rx="1" />
                            <path d="M10 6l4-2v8l-4-2" />
                        </svg>
                    ) : (
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="1" y="3" width="10" height="10" rx="1" />
                            <path d="M11 6h3v7a1 1 0 0 1-1 1H5" />
                        </svg>
                    )}
                </button>
            </div>
        );

        if (panelMode === 'floating') {
            return (
                <div
                    className={`fixed z-40 flex w-[48px] flex-col rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(30,30,35,0.9)] backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.4)] ${floatingTransitionClass} ${draggingClass}`}
                    style={{ left: panelPosition.x, top: panelPosition.y }}
                    onMouseDown={handleMouseDown}
                >
                    {CollapsedContent}
                </div>
            );
        }
        return (
            <div className="flex w-[48px] min-w-[48px] flex-col border-l border-[rgba(255,255,255,0.08)] bg-[rgba(20,20,25,0.95)] backdrop-blur-xl">
                {CollapsedContent}
            </div>
        );
    }

    // Полный вид
    const FullContent = (
        <>
            {/* Header */}
            <div
                className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-4 py-3"
                onMouseDown={panelMode === 'floating' ? handleMouseDown : undefined}
                style={panelMode === 'floating' ? { cursor: 'move' } : undefined}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={() => setCollapsed(true)}
                        className="flex-shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white/70"
                        title={t('props.collapse')}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10 4l-4 4 4 4" />
                        </svg>
                    </button>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-white/90">
                            {typeLabel[selectedNode.type ?? ''] ?? selectedNode.type?.toUpperCase()}
                        </h2>
                        <p className="truncate text-xs text-white/40">
                            {selectedNode.data?.name as string}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={togglePanelMode}
                        className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white/70"
                        title={
                            panelMode === 'docked' ? t('props.floatingMode') : t('props.dockedMode')
                        }
                    >
                        {panelMode === 'docked' ? (
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="2" y="3" width="8" height="10" rx="1" />
                                <path d="M10 6l4-2v8l-4-2" />
                            </svg>
                        ) : (
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="1" y="3" width="10" height="10" rx="1" />
                                <path d="M11 6h3v7a1 1 0 0 1-1 1H5" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm(t('props.deleteConfirm'))) {
                                removeNode(selectedNode.id);
                            }
                        }}
                        className="flex-shrink-0 rounded-lg bg-[rgba(255,0,85,0.15)] px-2 py-1 text-xs text-[#ff0055] transition-colors hover:bg-[rgba(255,0,85,0.25)]"
                    >
                        {t('props.delete')}
                    </button>
                </div>
            </div>

            {/* Validation errors */}
            {validationErrors.length > 0 && (
                <div className="mx-4 mt-3 rounded-lg border border-[rgba(255,0,85,0.3)] bg-[rgba(255,0,85,0.1)] p-3">
                    {validationErrors.map((err, i) => (
                        <p key={i} className="text-xs text-[#ff0055]">
                            ⚠️ {err}
                        </p>
                    ))}
                </div>
            )}

            {/* Properties content — с fade-эффектом при смене ноды */}
            <div key={contentKey} className="min-w-0 flex-1 overflow-y-auto p-6 content-fade-enter">
                {selectedNode.type === 'command' && <CommandProps nodeId={selectedNode.id} />}
                {selectedNode.type === 'step' && <StepProps nodeId={selectedNode.id} />}
                {selectedNode.type === 'condition' && <ConditionProps nodeId={selectedNode.id} />}
                {selectedNode.type === 'action' && <ActionProps nodeId={selectedNode.id} />}
                {selectedNode.type === 'response' && <ResponseProps nodeId={selectedNode.id} />}
                {selectedNode.type === 'end' && (
                    <div className="text-sm text-white/50">
                        <p>{t('help.endDesc')}</p>
                    </div>
                )}
            </div>
        </>
    );

    if (panelMode === 'floating') {
        return (
            <div
                className={`fixed z-40 flex h-[600px] w-[320px] flex-col rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(30,30,35,0.9)] backdrop-blur-xl shadow-[-10px_0_40px_rgba(0,0,0,0.5)] ${panelAnimationClass} ${floatingTransitionClass} ${draggingClass}`}
                style={{ left: panelPosition.x, top: panelPosition.y }}
            >
                {FullContent}
            </div>
        );
    }

    return (
        <div
            className={`flex w-[320px] min-w-[320px] flex-col border-l border-[rgba(255,255,255,0.08)] bg-[rgba(20,20,25,0.95)] backdrop-blur-xl overflow-hidden ${panelAnimationClass}`}
        >
            {FullContent}
        </div>
    );
}
