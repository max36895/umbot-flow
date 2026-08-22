import { memo, useCallback, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CommandNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { useT } from '../../../i18n/hook';
import NodeHelpButton from './NodeHelpButton';
import {
    getNodeClasses,
    getNodeStyles,
    NODE_COLORS,
    HANDLE_STYLES,
    BADGE_STYLES,
    type NodeTypeKey,
} from './useNodeClasses';
import { useNodeErrors, NodeErrorsBadge } from './useNodeErrors';
import { truncatePreview } from '../../../utils/truncate';
import { NodeIcon, type NodeIconName } from '../../ui/NodeIcons';

function CommandNodeComponent({ data, id }: NodeProps & { data: CommandNodeData }) {
    const t = useT();
    const selectNode = useUiStore((s) => s.selectNode);
    const isSelected = useUiStore((s) => s.selectedNodeId === id);
    const isActivePreview = useUiStore((s) => s.activePreviewNodeId === id);
    const isDimmed = useUiStore(
        (s) => s.selectedNodeId !== null && s.selectedNodeId !== id && s.activePreviewNodeId !== id,
    );
    const errors = useNodeErrors(id);
    const hasErrors = (errors?.length ?? 0) > 0;
    const slotCount = data.slots?.length ?? 0;
    const responsePreview = truncatePreview(data.response?.text, t('node.preview.noResponse'));

    const handleClick = useCallback(() => selectNode(id), [selectNode, id]);

    // role может быть 'welcome' | 'help' | 'fallback' | undefined
    const role = (data as { role?: string }).role;
    const nodeType: NodeTypeKey =
        role === 'welcome' || role === 'help' || role === 'fallback'
            ? (role as NodeTypeKey)
            : 'command';
    const nodeColor = NODE_COLORS[nodeType];
    const nodeStyles = useMemo(
        () => getNodeStyles(nodeType, isSelected, isActivePreview),
        [nodeType, isSelected, isActivePreview],
    );
    const badgeKey =
        role === 'welcome'
            ? 'node.badge.welcome'
            : role === 'help'
              ? 'node.badge.help'
              : role === 'fallback'
                ? 'node.badge.fallback'
                : 'node.badge.cmd';
    return (
        <div
            className={`relative min-w-[220px] ${getNodeClasses(nodeType, isSelected, isDimmed, isActivePreview, hasErrors)}`}
            style={nodeStyles}
            onClick={handleClick}
        >
            <NodeErrorsBadge errors={errors} />
            <Handle
                type="target"
                position={Position.Top}
                className="!-top-3 !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES[nodeType]}
            />

            <div className="mb-2 flex items-center gap-2">
                <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-fg"
                    style={BADGE_STYLES[nodeType]}
                >
                    <NodeIcon
                        name={
                            (nodeType === 'welcome' ||
                            nodeType === 'help' ||
                            nodeType === 'fallback'
                                ? nodeType
                                : 'command') as NodeIconName
                        }
                        size={12}
                    />
                    {t(badgeKey)}
                </span>
                <span className="font-semibold text-fg">
                    {data.role === 'welcome'
                        ? t('sidebar.welcome.label')
                        : data.role === 'help'
                          ? t('sidebar.help.label')
                          : data.role === 'fallback'
                            ? t('sidebar.fallback.label')
                            : data.name}
                </span>
                <NodeHelpButton
                    content={t(
                        data.role === 'welcome'
                            ? 'help.welcomeDesc'
                            : data.role === 'help'
                              ? 'help.helpNodeDesc'
                              : data.role === 'fallback'
                                ? 'sidebar.fallback.desc'
                                : 'help.cmdDesc',
                    )}
                    color={nodeColor.cssVar}
                />
            </div>

            <div className="mb-1.5 flex items-center gap-1 text-xs text-fg/50">
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <path d="M6 4v4M4 6h4" strokeLinecap="round" />
                    <circle cx="6" cy="6" r="4" />
                </svg>
                {slotCount > 0
                    ? data.slots.slice(0, 3).join(', ') + (slotCount > 3 ? '...' : '')
                    : data.isPattern
                      ? t('node.preview.patternMode')
                      : t('node.preview.noSlots')}
            </div>

            <div className="rounded-lg bg-fg/5 px-2.5 py-1.5 text-xs text-fg/60 italic">
                {responsePreview}
            </div>

            {data.response?.buttons?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                    {data.response.buttons.slice(0, 4).map((btn: { title: string }, i: number) => (
                        <span
                            key={i}
                            className="rounded-full bg-info/10 px-2 py-0.5 text-[11px] font-medium text-info"
                        >
                            {btn.title}
                        </span>
                    ))}
                    {data.response.buttons.length > 4 && (
                        <span className="text-[11px] text-fg/50">
                            +{data.response.buttons.length - 4}
                        </span>
                    )}
                </div>
            ) : null}

            <Handle
                type="source"
                position={Position.Bottom}
                className="!-bottom-3 !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES[nodeType]}
            />
        </div>
    );
}

export const CommandNode = memo(CommandNodeComponent);
