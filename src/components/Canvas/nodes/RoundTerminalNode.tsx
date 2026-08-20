import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import useUiStore from '../../../store/uiStore';
import { NODE_COLORS, type NodeTypeKey } from './useNodeClasses';
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
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected;
    const color = NODE_COLORS[nodeType];

    return (
        <div
            className={`node-hover flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                isSelected
                    ? 'node-spotlight-active border-2'
                    : isDimmed
                      ? 'node-dimmed border bg-surface backdrop-blur-xl'
                      : 'border bg-surface backdrop-blur-xl'
            }`}
            style={{
                borderColor: isSelected ? color.hex : `rgba(${color.rgb},0.3)`,
                backgroundColor: isSelected
                    ? `rgba(${color.rgb},0.15)`
                    : 'rgba(30,30,35,0.8)',
                boxShadow: isSelected ? `0 0 20px rgba(${color.rgb},0.4)` : undefined,
            }}
            onClick={() => selectNode(id)}
        >
            {/* Обёртка для правильного абсолютного позиционирования Handle */}
            <div className="relative">
                <Handle
                    type={handleType}
                    position={handlePosition}
                    className="!absolute !h-4 !w-4 !border-2 !border-white/30"
                    style={{
                        backgroundColor: color.hex,
                        boxShadow: `0 0 8px rgba(${color.rgb},0.5)`,
                    }}
                />
                <span style={{ color: color.hex }}>
                    <NodeIcon name={icon} size={18} strokeWidth={2} />
                </span>
            </div>
        </div>
    );
}

export const RoundTerminalNode = memo(RoundTerminalNodeComponent);
