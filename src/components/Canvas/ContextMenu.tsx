import { useState, useEffect, useRef } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import type { FlowNodeData } from '../../types/flow';
import { t } from '../../i18n';

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

    const menuItems = [
        { type: 'divider' as const, label: '' },
        {
            type: 'node' as const,
            icon: '💬',
            label: t('contextMenu.command'),
            nodeType: 'command' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: '📝',
            label: t('contextMenu.step'),
            nodeType: 'step' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: '📢',
            label: t('contextMenu.response'),
            nodeType: 'response' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: '⚡',
            label: t('contextMenu.action'),
            nodeType: 'action' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: '🔀',
            label: t('contextMenu.condition'),
            nodeType: 'condition' as FlowNodeData['type'],
        },
        {
            type: 'node' as const,
            icon: '⏹',
            label: t('contextMenu.end'),
            nodeType: 'end' as FlowNodeData['type'],
        },
        { type: 'divider' as const, label: '' },
        {
            type: 'action' as const,
            icon: '📋',
            label: t('contextMenu.duplicate'),
            action: handleDuplicate,
            disabled: !selectedNodeId,
        },
    ];

    return (
        <div
            ref={ref}
            className={`fixed z-50 w-56 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(30,30,35,0.95)] py-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-100 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{ left: x, top: y }}
        >
            {menuItems.map((item, i) => {
                if (item.type === 'divider') {
                    return (
                        <div key={i} className="my-1 border-t border-[rgba(255,255,255,0.08)]" />
                    );
                }
                if (item.type === 'node') {
                    return (
                        <button
                            key={i}
                            onClick={() => handleAddNode(item.nodeType)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </button>
                    );
                }
                return (
                    <button
                        key={i}
                        onClick={item.action}
                        disabled={item.disabled}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-40"
                    >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
