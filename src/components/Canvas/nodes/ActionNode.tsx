import { memo, useCallback, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ActionNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { useT } from '../../../i18n/hook';
import NodeHelpButton from './NodeHelpButton';
import {
    getNodeClasses,
    getNodeStyles,
    NODE_COLORS,
    HANDLE_STYLES_GLOW,
    BADGE_STYLES,
} from './useNodeClasses';
import { useNodeErrors, NodeErrorsBadge } from './useNodeErrors';
import { NodeIcon, type NodeIconName } from '../../ui/NodeIcons';

const ACTION_ICONS: Record<string, NodeIconName> = {
    set_variable: 'set_variable',
    random_number: 'random_number',
    http_request: 'http_request',
};

function ActionNodeComponent({ data, id }: NodeProps & { data: ActionNodeData }) {
    const t = useT();
    const selectNode = useUiStore((s) => s.selectNode);
    const isSelected = useUiStore((s) => s.selectedNodeId === id);
    const isDimmed = useUiStore((s) => s.selectedNodeId !== null && s.selectedNodeId !== id);
    const errors = useNodeErrors(id);
    const hasErrors = (errors?.length ?? 0) > 0;
    const nodeColor = NODE_COLORS.action;
    const nodeStyles = useMemo(() => getNodeStyles('action', isSelected, false), [isSelected]);
    const handleClick = useCallback(() => selectNode(id), [selectNode, id]);

    return (
        <div
            className={`relative min-w-[200px] ${getNodeClasses('action', isSelected, isDimmed, false, hasErrors)}`}
            style={nodeStyles}
            onClick={handleClick}
        >
            <NodeErrorsBadge errors={errors} />
            <Handle
                type="target"
                position={Position.Top}
                className="!-top-3 !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES_GLOW.action}
            />

            <div className="mb-2 flex items-center gap-2">
                <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-fg"
                    style={BADGE_STYLES.action}
                >
                    <NodeIcon name="action" size={12} />
                    {t('node.badge.action')}
                </span>
                <span className="font-semibold text-fg">{data.name}</span>
                <NodeHelpButton content={t('help.actionDesc')} color={nodeColor.cssVar} />
            </div>

            {data.actions?.length ? (
                <div className="space-y-1">
                    {data.actions.slice(0, 3).map((action, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1.5 text-[11px] text-fg/60"
                        >
                            <NodeIcon name={ACTION_ICONS[action.type] ?? 'gear'} size={12} />
                            <span className="truncate">
                                {action.type === 'set_variable' &&
                                    `${action.field} = ${action.value}`}
                                {action.type === 'random_number' && `${action.field} = rand`}
                                {action.type === 'http_request' && `${action.method ?? 'GET'}`}
                            </span>
                        </div>
                    ))}
                    {data.actions.length > 3 && (
                        <span className="text-[11px] text-fg/50">
                            +{data.actions.length - 3}
                        </span>
                    )}
                </div>
            ) : (
                <div className="text-[11px] text-fg/50 italic">{t('node.noActions')}</div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="!-bottom-3 !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES_GLOW.action}
            />
        </div>
    );
}

export const ActionNode = memo(ActionNodeComponent);
