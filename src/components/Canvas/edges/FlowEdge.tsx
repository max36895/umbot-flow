import { memo, useState, useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import useFlowStore from '../../../store/flowStore';
import useUiStore from '../../../store/uiStore';
import { useT } from '../../../i18n/hook';
import { NodeIcon } from '../../ui/NodeIcons';

const EDGE_COLORS: Record<string, string> = {
    next: 'rgba(255, 255, 255, 0.3)',
    slot_match: '#00ff9d',
    branch_true: '#00ff9d',
    branch_false: '#ff0055',
};

const EDGE_GLOW_COLORS: Record<string, string> = {
    next: 'rgba(255, 255, 255, 0.15)',
    slot_match: 'rgba(0, 255, 157, 0.4)',
    branch_true: 'rgba(0, 255, 157, 0.4)',
    branch_false: 'rgba(255, 0, 85, 0.4)',
};

const DEFAULT_EDGE_COLOR = 'rgba(255, 255, 255, 0.3)';
const PREVIEW_COLOR = '#00f0ff';

function FlowEdgeComponent({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    target,
    data,
    style,
}: EdgeProps) {
    const edgeType = (data as { edgeType?: string; label?: string })?.edgeType ?? 'next';
    const label = (data as { edgeType?: string; label?: string })?.label;
    const t = useT();
    const color = EDGE_COLORS[edgeType] ?? DEFAULT_EDGE_COLOR;
    const glowColor = EDGE_GLOW_COLORS[edgeType] ?? 'rgba(255, 255, 255, 0.15)';
    const [hovered, setHovered] = useState(false);
    const selectedEdgeId = useUiStore((s) => s.selectedEdgeId);
    const activePreviewNodeId = useUiStore((s) => s.activePreviewNodeId);
    const selectEdge = useUiStore((s) => s.selectEdge);
    const removeEdge = useFlowStore((s) => s.removeEdge);

    const isSelected = selectedEdgeId === id;
    const isCondition = edgeType === 'branch_true' || edgeType === 'branch_false';
    const isActiveTarget = target === activePreviewNodeId;

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            removeEdge(id);
            selectEdge(null);
        },
        [id, removeEdge, selectEdge],
    );

    const showDeleteButton = hovered || isSelected;

    // Единая логика выбора цвета линии — вычисляется один раз
    const strokeColor = isSelected
        ? '#ff0055'
        : hovered
          ? '#ffffff'
          : isActiveTarget
            ? color === DEFAULT_EDGE_COLOR
                ? PREVIEW_COLOR
                : color
            : color;

    const glowDropShadow = isSelected
        ? '#ff0055'
        : hovered
          ? '#ffffff'
          : glowColor;

    // Позиция конца линии для светящегося круга
    const lastCmd = edgePath.split(' ').pop();
    const endCoords = lastCmd?.split(',');
    const endX = endCoords?.[0] ? parseFloat(endCoords[0]) : targetX;
    const endY = endCoords?.[1] ? parseFloat(endCoords[1]) : targetY;

    return (
        <>
            {/* Широкая зона для наведения */}
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    selectEdge(id);
                }}
                className="cursor-pointer"
            />

            {/* Glow-слой для condition рёбер */}
            {isCondition && (
                <path
                    d={edgePath}
                    fill="none"
                    stroke={glowColor}
                    strokeWidth={hovered || isSelected ? 6 : 4}
                    strokeLinecap="round"
                    className="blur-sm transition-[stroke-width] duration-150"
                />
            )}

            {/* Основная линия */}
            <BaseEdge
                path={edgePath}
                style={{
                    ...style,
                    stroke: strokeColor,
                    strokeWidth: hovered || isSelected ? 3 : isActiveTarget ? 3 : 2,
                    transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
                    ...(isActiveTarget
                        ? {
                              strokeDasharray: '8 4',
                              animation: 'edgeFlow 0.6s linear infinite',
                              filter: `drop-shadow(0 0 6px ${glowColor})`,
                          }
                        : isCondition
                          ? {
                                strokeDasharray: '8 4',
                                animation: 'edgeFlow 0.8s linear infinite',
                            }
                          : {}),
                }}
            />

            {/* Светящийся круг на конце линии (вместо стрелки) */}
            <circle
                cx={endX}
                cy={endY}
                r={isActiveTarget ? 4 : 3}
                fill={strokeColor}
                className="transition-[fill,r] duration-150"
                style={{
                    filter: `drop-shadow(0 0 ${isActiveTarget ? '8px' : '4px'} ${glowDropShadow})`,
                }}
            />

            {/* Кнопка удаления */}
            {showDeleteButton && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2}px)`,
                            pointerEvents: 'all',
                        }}
                    >
                        <button
                            onClick={handleDelete}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-error text-xs font-bold text-white shadow-glow-pink transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(255,0,85,0.7)]"
                            title={t('canvas.edgeDelete')}
                        >
                            <NodeIcon name="close" size={12} strokeWidth={2} />
                        </button>
                    </div>
                </EdgeLabelRenderer>
            )}

            {/* Лейбл */}
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="rounded-full border border-glass-border bg-surface-panel px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-sm"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}

            {/* Капсулы True/False на condition рёбрах */}
            {isCondition && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2 - 12}px)`,
                            pointerEvents: 'none',
                        }}
                    >
                        <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                edgeType === 'branch_true'
                                    ? 'bg-success/20 text-success border border-success/30'
                                    : 'bg-error/20 text-error border border-error/30'
                            }`}
                        >
                            {edgeType === 'branch_true'
                                ? t('condition.true')
                                : t('condition.false')}
                        </span>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export const FlowEdge = memo(FlowEdgeComponent);
