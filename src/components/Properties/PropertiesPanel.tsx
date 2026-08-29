import { useState, useRef, useCallback, useEffect } from 'react';
import useUiStore from '../../store/uiStore';
import useFlowStore from '../../store/flowStore';
import useValidationStore from '../../store/validationStore';
import { CommandProps } from './CommandProps';
import { StepProps } from './StepProps';
import { ConditionProps } from './ConditionProps';
import { ActionProps } from './ActionProps';
import { ResponseProps } from './ResponseProps';
import { t } from '../../i18n';
import { NodeIcon } from '../ui/NodeIcons';

export default function PropertiesPanel() {
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    // Селектим конкретный узел — ре-рендер только при изменении этого узла
    const selectedNode = useFlowStore((s) =>
        selectedNodeId ? s.nodes.find((n) => n.id === selectedNodeId) : undefined,
    );
    // Ошибки валидации из централизованного store (один вызов validateGraph на весь граф)
    const validationErrors = useValidationStore((s) =>
        selectedNodeId ? s.nodeErrors[selectedNodeId] : undefined,
    );
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
    // Save indicator — показываем "✓ Сохранено" на 1 сек после каждого изменения
    const [justSaved, setJustSaved] = useState(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Пока нода меняется — скрываем индикатор
    useEffect(() => {
        setJustSaved(false);
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    }, [selectedNodeId]);

    // При изменении выбранной ноды — показываем "Сохранено"
    useEffect(() => {
        if (!selectedNodeId) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setJustSaved(true), 300);
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [selectedNode, selectedNodeId]);


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
                    className="fixed z-40 flex min-w-[48px] flex-col rounded-xl border border-glass-border bg-surface-panel backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.4)]"
                    style={{ left: panelPosition.x, top: panelPosition.y }}
                >
                    <div className="flex items-center justify-center border-b border-outline-variant py-2">
                        <button
                            onClick={togglePanelMode}
                            className="rounded-lg p-2 text-fg/55 transition-colors hover:bg-fg/10 hover:text-fg/70"
                            title={t('props.dockedMode')}
                        >
                            <NodeIcon name="panelDocked" size={16} />
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex min-w-[48px] flex-col border-l border-outline-variant bg-surface-panel-docked backdrop-blur-xl">
                <div className="flex items-center justify-center border-b border-outline-variant py-3">
                    <button
                        onClick={togglePanelMode}
                        className="rounded-lg p-2 text-fg/55 transition-colors hover:bg-fg/10 hover:text-fg/70"
                        title={t('props.floatingMode')}
                    >
                        <NodeIcon name="panelFloating" size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // Свёрнутый вид
    if (collapsed) {
        const CollapsedContent = (
            <div className="flex flex-col items-center gap-2 border-b border-outline-variant py-3">
                <button
                    onClick={() => setCollapsed(false)}
                    className="rounded-lg p-2 text-fg/55 transition-colors hover:bg-fg/10 hover:text-fg/70"
                    title={t('props.expand')}
                >
                    <NodeIcon name="chevronLeft" size={16} />
                </button>
                <button
                    onClick={() => removeNode(selectedNode.id)}
                    className="rounded-lg p-2 text-error transition-colors hover:bg-error/15"
                    title={t('props.delete')}
                >
                    <NodeIcon name="trash" size={16} />
                </button>
                <button
                    onClick={togglePanelMode}
                    className="rounded-lg p-2 text-fg/55 transition-colors hover:bg-fg/10 hover:text-fg/70"
                    title={panelMode === 'docked' ? t('props.floatingMode') : t('props.dockedMode')}
                >
                    <NodeIcon
                        name={panelMode === 'docked' ? 'panelFloating' : 'panelDocked'}
                        size={16}
                    />
                </button>
            </div>
        );

        if (panelMode === 'floating') {
            return (
                <div
                    className={`fixed z-40 flex w-[48px] flex-col rounded-xl border border-glass-border bg-surface-panel backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.4)] ${floatingTransitionClass} ${draggingClass}`}
                    style={{ left: panelPosition.x, top: panelPosition.y }}
                    onMouseDown={handleMouseDown}
                >
                    {CollapsedContent}
                </div>
            );
        }
        return (
            <div className="flex w-[48px] min-w-[48px] flex-col border-l border-outline-variant bg-surface-panel-docked backdrop-blur-xl">
                {CollapsedContent}
            </div>
        );
    }

    // Полный вид
    const FullContent = (
        <>
            {/* Header */}
            <div
                className="flex items-center justify-between border-b border-outline-variant px-4 py-3"
                onMouseDown={panelMode === 'floating' ? handleMouseDown : undefined}
                style={panelMode === 'floating' ? { cursor: 'move' } : undefined}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={() => setCollapsed(true)}
                        className="flex-shrink-0 rounded-lg p-1.5 text-fg/55 transition-colors hover:bg-fg/10 hover:text-fg/70"
                        title={t('props.collapse')}
                    >
                        <NodeIcon name="chevronRight" size={16} />
                    </button>
                    <div className="min-w-0">
                        <h2 className="flex items-center gap-2 truncate text-sm font-bold text-fg/90">
                            <span className="truncate">
                                {typeLabel[selectedNode.type ?? ''] ?? selectedNode.type?.toUpperCase()}
                            </span>
                            {justSaved && (
                                <span
                                    className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
                                    title={t('statusbar.saved')}
                                >
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 8l3 3 7-7" />
                                    </svg>
                                </span>
                            )}
                        </h2>
                        <p className="truncate text-xs text-fg/55">
                            {selectedNode.data?.name as string}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={togglePanelMode}
                        className="rounded-lg p-1.5 text-fg/55 transition-colors hover:bg-fg/10 hover:text-fg/70"
                        title={
                            panelMode === 'docked' ? t('props.floatingMode') : t('props.dockedMode')
                        }
                    >
                        <NodeIcon
                            name={panelMode === 'docked' ? 'panelFloating' : 'panelDocked'}
                            size={16}
                        />
                    </button>
                    <button
                        onClick={() => removeNode(selectedNode.id)}
                        className="flex-shrink-0 rounded-lg bg-error/15 px-2 py-1 text-xs text-error transition-colors hover:bg-error/25"
                    >
                        {t('props.delete')}
                    </button>
                </div>
            </div>

            {/* Validation errors */}
            {validationErrors && validationErrors.length > 0 && (
                <div className="mx-4 mt-3 rounded-lg border border-error/30 bg-error/10 p-3">
                    {validationErrors.map((err, i) => (
                        <p key={i} className="flex items-start gap-1.5 text-xs text-error">
                            <NodeIcon name="warning" size={12} className="mt-0.5 flex-shrink-0" />
                            <span>{err}</span>
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
                    <div className="text-sm text-fg/50">
                        <p>{t('help.endDesc')}</p>
                    </div>
                )}
            </div>
        </>
    );

    if (panelMode === 'floating') {
        return (
            <div
                className={`fixed z-40 flex h-[600px] w-[320px] flex-col rounded-2xl border border-glass-border bg-surface-panel backdrop-blur-xl shadow-[-10px_0_40px_rgba(0,0,0,0.5)] ${panelAnimationClass} ${floatingTransitionClass} ${draggingClass}`}
                style={{ left: panelPosition.x, top: panelPosition.y }}
            >
                {FullContent}
            </div>
        );
    }

    return (
        <div
            className={`flex w-[320px] min-w-[320px] flex-col border-l border-outline-variant bg-surface-panel-docked backdrop-blur-xl overflow-hidden ${panelAnimationClass}`}
        >
            {FullContent}
        </div>
    );
}
