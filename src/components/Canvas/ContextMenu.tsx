import { useState, useEffect, useRef } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import type { FlowNodeData } from '../../types/flow';
import { t } from '../../i18n';
import { NodeIcon, type NodeIconName } from '../ui/NodeIcons';

interface ContextMenuProps {
    x: number;
    y: number;
    flowX: number;
    flowY: number;
    onClose: () => void;
}

/** Красивое контекстное меню при правом клике на холсте */
export default function ContextMenu({ x, y, flowX, flowY, onClose }: ContextMenuProps) {
    const addNode = useFlowStore((s) => s.addNode);
    const selectNode = useUiStore((s) => s.selectNode);
    const duplicateNode = useFlowStore((s) => s.duplicateNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const ref = useRef<HTMLDivElement>(null);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setAnimate(true));
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const handleAddNode = (type: FlowNodeData['type']) => {
        const newId = addNode(type, { x: flowX, y: flowY });
        setTimeout(() => selectNode(newId), 50);
        onClose();
    };

    const handleDuplicate = () => {
        if (selectedNodeId) {
            const newId = duplicateNode(selectedNodeId);
            if (newId) setTimeout(() => selectNode(newId), 50);
        }
        onClose();
    };

    const removeNode = useFlowStore((s) => s.removeNode);

    const handleDelete = () => {
        if (selectedNodeId) {
            removeNode(selectedNodeId);
            selectNode(null);
        }
        onClose();
    };

    const handlePreviewFromHere = () => {
        if (selectedNodeId) {
            // Открываем превью и выставляем стартовую ноду
            const uiState = useUiStore.getState();
            if (!uiState.previewOpen) uiState.togglePreview();
            // Сообщаем превью через кастомное событие (чтобы не связывать сторы)
            setTimeout(() => {
                window.dispatchEvent(
                    new CustomEvent('umbot:preview-from', { detail: { nodeId: selectedNodeId } }),
                );
            }, 100);
        }
        onClose();
    };

    const menuItems = [
        { type: 'divider' as const, label: '' },
        {
            type: 'node' as const,
            icon: 'command' as NodeIconName,
            label: t('contextMenu.command'),
            nodeType: 'command' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: 'step' as NodeIconName,
            label: t('contextMenu.step'),
            nodeType: 'step' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: 'response' as NodeIconName,
            label: t('contextMenu.response'),
            nodeType: 'response' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: 'action' as NodeIconName,
            label: t('contextMenu.action'),
            nodeType: 'action' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: 'condition' as NodeIconName,
            label: t('contextMenu.condition'),
            nodeType: 'condition' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: 'end' as NodeIconName,
            label: t('contextMenu.end'),
            nodeType: 'end' as FlowNodeData['type'],
        },
        { type: 'divider' as const, label: '' },
        {
            type: 'action' as const,
            icon: 'copy' as NodeIconName,
            label: t('contextMenu.duplicate'),
            action: handleDuplicate,
            disabled: !selectedNodeId,
        },
        {
            type: 'action' as const,
            icon: 'play' as NodeIconName,
            label: t('contextMenu.previewFrom'),
            action: handlePreviewFromHere,
            disabled: !selectedNodeId,
        },
        {
            type: 'action' as const,
            icon: 'trash' as NodeIconName,
            label: t('contextMenu.delete'),
            action: handleDelete,
            disabled: !selectedNodeId,
        },
    ];

    return (
        <div
            ref={ref}
            className={`fixed z-popover w-56 rounded-xl border border-glass-border bg-surface-panel py-1.5 shadow-panel-lg backdrop-blur-xl transition-all duration-100 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{ left: x, top: y }}
        >
            {menuItems.map((item, i) => {
                if (item.type === 'divider') {
                    return (
                        <div key={i} className="my-1 border-t border-outline-variant" />
                    );
                }
                if (item.type === 'node') {
                    return (
                        <button
                            key={i}
                            onClick={() => handleAddNode(item.nodeType)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-fg/80 transition-colors hover:bg-fg/10"
                        >
                            <NodeIcon name={item.icon} size={15} className="flex-shrink-0" />
                            <span className="min-w-0">{item.label}</span>
                        </button>
                    );
                }
                return (
                    <button
                        key={i}
                        onClick={item.action}
                        disabled={item.disabled}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-fg/80 transition-colors hover:bg-fg/10 disabled:opacity-40"
                    >
                        <NodeIcon name={item.icon} size={15} className="flex-shrink-0" />
                        <span className="min-w-0">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
