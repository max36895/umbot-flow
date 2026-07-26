import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CommandNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { t } from '../../../i18n';
import NodeHelpButton from './NodeHelpButton';
import { getNodeClasses, getNodeStyles, type NodeTypeKey } from './useNodeClasses';

function CommandNodeComponent({ data, id }: NodeProps & { data: CommandNodeData }) {
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const activePreviewNodeId = useUiStore((s) => s.activePreviewNodeId);
    const isActivePreview = activePreviewNodeId === id;
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected && !isActivePreview;
    const slotCount = data.slots?.length ?? 0;
    const responsePreview = data.response?.text
        ? data.response.text.length > 50
            ? data.response.text.slice(0, 50) + '...'
            : data.response.text
        : t('node.preview.noResponse');

    const nodeType: NodeTypeKey = (data.role as NodeTypeKey) || 'command';
    const badgeKey =
        data.role === 'welcome'
            ? 'node.badge.welcome'
            : data.role === 'help'
              ? 'node.badge.help'
              : 'node.badge.cmd';

    return (
        <div
            className={getNodeClasses(nodeType, isSelected, isDimmed, isActivePreview)}
            style={{ minWidth: 220, ...getNodeStyles(nodeType, isSelected, isActivePreview) }}
            onClick={() => selectNode(id)}
        >
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    backgroundColor:
                        nodeType === 'welcome'
                            ? '#22c55e'
                            : nodeType === 'help'
                              ? '#eab308'
                              : '#00f0ff',
                }}
            />

            <div className="mb-2 flex items-center gap-2">
                <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                    style={{
                        backgroundColor:
                            nodeType === 'welcome'
                                ? 'rgba(34,197,94,0.25)'
                                : nodeType === 'help'
                                  ? 'rgba(234,179,8,0.25)'
                                  : 'rgba(0,240,255,0.25)',
                    }}
                >
                    <span className="text-sm">
                        {nodeType === 'welcome' ? '🚀' : nodeType === 'help' ? '❓' : '💬'}
                    </span>
                    {t(badgeKey)}
                </span>
                <span className="font-semibold text-white">
                    {data.role === 'welcome'
                        ? t('sidebar.welcome.label')
                        : data.role === 'help'
                          ? t('sidebar.help.label')
                          : data.name}
                </span>
                <NodeHelpButton
                    content={t(
                        data.role === 'welcome'
                            ? 'help.welcomeDesc'
                            : data.role === 'help'
                              ? 'help.helpNodeDesc'
                              : 'help.cmdDesc',
                    )}
                    color={
                        nodeType === 'welcome'
                            ? '#22c55e'
                            : nodeType === 'help'
                              ? '#eab308'
                              : '#00f0ff'
                    }
                />
            </div>

            <div className="mb-1.5 flex items-center gap-1 text-xs text-white/50">
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <path d="M6 2v4M4 4h4" strokeLinecap="round" />
                    <circle cx="6" cy="6" r="4" />
                </svg>
                {slotCount > 0
                    ? data.slots.slice(0, 3).join(', ') + (slotCount > 3 ? '...' : '')
                    : data.isPattern
                      ? t('node.preview.patternMode')
                      : t('node.preview.noSlots')}
            </div>

            <div className="rounded-lg bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 text-xs text-white/60 italic">
                {responsePreview}
            </div>

            {data.response?.buttons?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                    {data.response.buttons.slice(0, 4).map((btn: { title: string }, i: number) => (
                        <span
                            key={i}
                            className="rounded-full bg-[rgba(0,240,255,0.1)] px-2 py-0.5 text-[10px] font-medium text-[#00f0ff]"
                        >
                            {btn.title}
                        </span>
                    ))}
                    {data.response.buttons.length > 4 && (
                        <span className="text-[10px] text-white/30">
                            +{data.response.buttons.length - 4}
                        </span>
                    )}
                </div>
            ) : null}

            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    backgroundColor:
                        nodeType === 'welcome'
                            ? '#22c55e'
                            : nodeType === 'help'
                              ? '#eab308'
                              : '#00f0ff',
                }}
            />
        </div>
    );
}

export const CommandNode = memo(CommandNodeComponent);
