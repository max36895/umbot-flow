import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ActionNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { t } from '../../../i18n';
import NodeHelpButton from './NodeHelpButton';
import { getNodeClasses, getNodeStyles } from './useNodeClasses';

const ACTION_ICONS: Record<string, string> = {
    set_variable: '💾',
    random_number: '🎲',
    http_request: '🌐',
};

function ActionNodeComponent({ data, id }: NodeProps & { data: ActionNodeData }) {
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected;

    return (
        <div
            className={getNodeClasses('action', isSelected, isDimmed, false)}
            style={{ minWidth: 200, ...getNodeStyles('action', isSelected, false) }}
            onClick={() => selectNode(id)}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#ff9d00] !shadow-[0_0_8px_rgba(255,157,0,0.5)]"
            />

            <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,157,0,0.25)] px-2.5 py-1 text-[10px] font-semibold text-white">
                    <span className="text-sm">⚡</span>
                    {t('node.badge.action')}
                </span>
                <span className="font-semibold text-white">{data.name}</span>
                <NodeHelpButton content={t('help.actionDesc')} color="#ff9d00" />
            </div>

            {data.actions?.length ? (
                <div className="space-y-1">
                    {data.actions.slice(0, 3).map((action, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1.5 text-[10px] text-white/50"
                        >
                            <span className="text-sm">{ACTION_ICONS[action.type] ?? '⚙️'}</span>
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
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#ff9d00] !shadow-[0_0_8px_rgba(255,157,0,0.5)]"
            />
        </div>
    );
}

export const ActionNode = memo(ActionNodeComponent);
