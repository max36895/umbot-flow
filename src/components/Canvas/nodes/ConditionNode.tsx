import { memo, useCallback, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ConditionNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { useT } from '../../../i18n/hook';
import NodeHelpButton from './NodeHelpButton';
import { OPERATOR_SYMBOLS } from '../../../types/operators';
import {
    getNodeClasses,
    getNodeStyles,
    NODE_COLORS,
    nodeColorAlpha,
    HANDLE_STYLES_GLOW,
    BADGE_STYLES,
} from './useNodeClasses';
import { useNodeErrors, NodeErrorsBadge } from './useNodeErrors';
import { NodeIcon } from '../../ui/NodeIcons';

/** Предвычисленные стили подписей веток True/False. */
const TRUE_LABEL_STYLE = {
    backgroundColor: nodeColorAlpha('response', 15),
    color: NODE_COLORS.response.cssVar,
} as const;
const FALSE_LABEL_STYLE = {
    backgroundColor: nodeColorAlpha('condition', 15),
    color: NODE_COLORS.condition.cssVar,
} as const;

/** Стиль False-handle с кастомным left. */
const FALSE_HANDLE_STYLE = {
    left: 'calc(100% - 13px)',
    backgroundColor: NODE_COLORS.condition.cssVar,
    boxShadow: `0 0 8px ${nodeColorAlpha('condition', 50)}`,
} as const;

/** Цвет имени переменной в превью условия. */
const VAR_COLOR_STYLE = { color: NODE_COLORS.condition.cssVar } as const;

function ConditionNodeComponent({ data, id }: NodeProps & { data: ConditionNodeData }) {
    const t = useT();
    const selectNode = useUiStore((s) => s.selectNode);
    const isSelected = useUiStore((s) => s.selectedNodeId === id);
    const isDimmed = useUiStore((s) => s.selectedNodeId !== null && s.selectedNodeId !== id);
    const operator = OPERATOR_SYMBOLS[data.operator as string] ?? '?';
    const errors = useNodeErrors(id);
    const hasErrors = (errors?.length ?? 0) > 0;
    const nodeStyles = useMemo(() => getNodeStyles('condition', isSelected, false), [isSelected]);
    const handleClick = useCallback(() => selectNode(id), [selectNode, id]);

    return (
        <div
            className={`relative min-w-[180px] ${getNodeClasses('condition', isSelected, isDimmed, false, hasErrors)}`}
            style={nodeStyles}
            onClick={handleClick}
        >
            <NodeErrorsBadge errors={errors} />
            <Handle
                type="target"
                position={Position.Top}
                className="!-top-3 !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES_GLOW.condition}
            />

            <div className="mb-2 flex items-center gap-2">
                <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-fg"
                    style={BADGE_STYLES.condition}
                >
                    <NodeIcon name="condition" size={12} />
                    {t('node.badge.if')}
                </span>
                <span className="font-semibold text-fg">{data.name}</span>
                <NodeHelpButton content={t('help.condDesc')} color={NODE_COLORS.condition.cssVar} />
            </div>

            <div className="rounded-lg bg-fg/5 px-2.5 py-1.5 text-xs">
                <span className="font-mono" style={VAR_COLOR_STYLE}>
                    {data.variable || '?'}
                </span>
                <span className="mx-1 font-bold text-fg/50">{operator}</span>
                <span className="font-mono text-fg/50">{String(data.value ?? '?')}</span>
            </div>

            {/* Подписи веток прямо на ноде — чтобы пользователь видел, куда тянуть */}
            <div className="pointer-events-none absolute -bottom-1.5 left-0 right-0 flex items-end justify-between px-6 text-[11px] font-medium">
                <span
                    className="inline-flex items-center gap-0.5 rounded px-1 py-0.5"
                    style={TRUE_LABEL_STYLE}
                >
                    <NodeIcon name="check" size={10} strokeWidth={2} />
                    {t('condition.true')}
                </span>
                <span
                    className="inline-flex items-center gap-0.5 rounded px-1 py-0.5"
                    style={FALSE_LABEL_STYLE}
                >
                    <NodeIcon name="cross" size={10} strokeWidth={2} />
                    {t('condition.false')}
                </span>
            </div>

            <div className="relative flex">
                {/* True — green handle */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="true"
                    className="!-bottom-3 !-left-[3px] !h-4 !w-4 !border-2 !border-fg/30"
                    style={HANDLE_STYLES_GLOW.response}
                />
                {/* False — red handle */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="false"
                    className="!-bottom-3 !h-4 !w-4 !border-2 !border-fg/30"
                    style={FALSE_HANDLE_STYLE}
                />
            </div>
        </div>
    );
}

export const ConditionNode = memo(ConditionNodeComponent);
