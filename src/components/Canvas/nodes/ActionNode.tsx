import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ActionNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { useT } from '../../../i18n/hook';
import NodeHelpButton from './NodeHelpButton';
import { getNodeClasses, getNodeStyles, NODE_COLORS } from './useNodeClasses';
import { useNodeErrorsMap, NodeErrorsBadge } from './useNodeErrors';
import { NodeIcon, type NodeIconName } from '../../ui/NodeIcons';

const ACTION_ICONS: Record<string, NodeIconName> = {
    set_variable: 'set_variable',
    random_number: 'random_number',
    http_request: 'http_request',
};

function ActionNodeComponent({ data, id }: NodeProps & { data: ActionNodeData }) {
    const t = useT();
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected;
    const nodeErrors = useNodeErrorsMap();
    const errors = nodeErrors.get(id);
    const hasErrors = (errors?.length ?? 0) > 0;
    const nodeColor = NODE_COLORS.action;

    return (
        <div
            className={`relative min-w-[200px] ${getNodeClasses('action', isSelected, isDimmed, false, hasErrors)}`}
            style={getNodeStyles('action', isSelected, false)}
            onClick={() => selectNode(id)}
        >
            <NodeErrorsBadge errors={errors} />
            <Handle
                type="target"
                position={Position.Top}
                className="!-top-3 !h-4 !w-4 !border-2 !border-white/30"
                style={{
                    backgroundColor: nodeColor.hex,
                    boxShadow: `0 0 8px rgba(${nodeColor.rgb},0.5)`,
                }}
            />

            <div className="mb-2 flex items-center gap-2">
                <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: `rgba(${nodeColor.rgb},0.25)` }}
                >
                    <NodeIcon name="action" size={12} />
                    {t('node.badge.action')}
                </span>
                <span className="font-semibold text-white">{data.name}</span>
                <NodeHelpButton content={t('help.actionDesc')} color={nodeColor.hex} />
            </div>

            {data.actions?.length ? (
                <div className="space-y-1">
                    {data.actions.slice(0, 3).map((action, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1.5 text-[10px] text-white/50"
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
                        <span className="text-[10px] text-white/30">
                            +{data.actions.length - 3}
                        </span>
                    )}
                </div>
            ) : (
                <div className="text-[10px] text-white/30 italic">{t('node.noActions')}</div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="!-bottom-3 !h-4 !w-4 !border-2 !border-white/30"
                style={{
                    backgroundColor: nodeColor.hex,
                    boxShadow: `0 0 8px rgba(${nodeColor.rgb},0.5)`,
                }}
            />
        </div>
    );
}

export const ActionNode = memo(ActionNodeComponent);
