import { memo, useCallback, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import useUiStore from '../../../store/uiStore';
import { NODE_COLORS, nodeColorAlpha, HANDLE_STYLES_GLOW, type NodeTypeKey } from './useNodeClasses';
import { NodeIcon, type NodeIconName } from '../../ui/NodeIcons';

interface RoundTerminalNodeProps {
    /** Тип ноды для определения цвета */
    nodeType: NodeTypeKey;
    /** Имя SVG-иконки внутри круга */
    icon: NodeIconName;
    /** Тип хендла — target (вход) или source (выход) */
    handleType: 'target' | 'source';
    /** Позиция хендла */
    handlePosition: Position;
    /** id ноды от React Flow */
    id: NodeProps['id'];
}

/**
 * Круглый терминальный узел (Start / End).
 * Заменяет 95% идентичный код в StartNode.tsx и EndNode.tsx.
 */
function RoundTerminalNodeComponent({
    nodeType,
    icon,
    handleType,
    handlePosition,
    id,
}: RoundTerminalNodeProps) {
    const selectNode = useUiStore((s) => s.selectNode);
    const isSelected = useUiStore((s) => s.selectedNodeId === id);
    const isDimmed = useUiStore((s) => s.selectedNodeId !== null && s.selectedNodeId !== id);
    const color = NODE_COLORS[nodeType];
    const handleClick = useCallback(() => selectNode(id), [selectNode, id]);

    // Стиль корня зависит от isSelected — мемоизируем
    const rootStyle = useMemo(
        () => ({
            borderColor: isSelected ? color.cssVar : nodeColorAlpha(nodeType, 30),
            backgroundColor: isSelected ? nodeColorAlpha(nodeType, 15) : 'var(--surface-container-low)',
            boxShadow: isSelected ? `0 0 20px ${nodeColorAlpha(nodeType, 40)}` : undefined,
        }),
        [isSelected, color, nodeType],
    );

    // Стиль иконки — константа для данного nodeType
    const iconStyle = useMemo(() => ({ color: color.cssVar }), [color]);

    return (
        <div
            className={`node-hover relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                isSelected
                    ? 'node-spotlight-active border-2'
                    : isDimmed
                      ? 'node-dimmed border bg-surface backdrop-blur-xl'
                      : 'border bg-surface backdrop-blur-xl'
            }`}
            style={rootStyle}
            onClick={handleClick}
        >
            {/* Handle позиционируется относительно самого круга, а не иконки внутри */}
            <Handle
                type={handleType}
                position={handlePosition}
                className="!absolute !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES_GLOW[nodeType]}
            />
            <span style={iconStyle}>
                <NodeIcon name={icon} size={18} strokeWidth={2} />
            </span>
        </div>
    );
}

export const RoundTerminalNode = memo(RoundTerminalNodeComponent);
