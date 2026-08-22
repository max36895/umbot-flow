import { memo, useCallback, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ResponseNodeData } from '../../../types/flow';
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
import { truncatePreview } from '../../../utils/truncate';
import { NodeIcon } from '../../ui/NodeIcons';

function ResponseNodeComponent({ data, id }: NodeProps & { data: ResponseNodeData }) {
    const t = useT();
    const selectNode = useUiStore((s) => s.selectNode);
    const isSelected = useUiStore((s) => s.selectedNodeId === id);
    const isDimmed = useUiStore((s) => s.selectedNodeId !== null && s.selectedNodeId !== id);
    const errors = useNodeErrors(id);
    const hasErrors = (errors?.length ?? 0) > 0;
    const textPreview = truncatePreview(data.response?.text, t('node.preview.noResponse'));
    const nodeColor = NODE_COLORS.response;
    const nodeStyles = useMemo(() => getNodeStyles('response', isSelected, false), [isSelected]);
    const handleClick = useCallback(() => selectNode(id), [selectNode, id]);

    return (
        <div
            className={`relative min-w-[200px] ${getNodeClasses('response', isSelected, isDimmed, false, hasErrors)}`}
            style={nodeStyles}
            onClick={handleClick}
        >
            <NodeErrorsBadge errors={errors} />
            <Handle
                type="target"
                position={Position.Top}
                className="!-top-3 !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES_GLOW.response}
            />

            <div className="mb-2 flex items-center gap-2">
                <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-fg"
                    style={BADGE_STYLES.response}
                >
                    <NodeIcon name="response" size={12} />
                    {t('node.badge.response')}
                </span>
                <span className="font-semibold text-fg">{data.name}</span>
                <NodeHelpButton content={t('help.responseDesc')} color={nodeColor.cssVar} />
            </div>

            <div className="rounded-lg bg-fg/5 px-2.5 py-1.5 text-xs text-fg/60 italic">
                {textPreview}
            </div>

            {data.response?.buttons?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                    {data.response.buttons.slice(0, 3).map((btn: { title: string }, i: number) => (
                        <span
                            key={i}
                            className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
                        >
                            {btn.title}
                        </span>
                    ))}
                </div>
            ) : null}

            <Handle
                type="source"
                position={Position.Bottom}
                className="!-bottom-3 !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES_GLOW.response}
            />
        </div>
    );
}

export const ResponseNode = memo(ResponseNodeComponent);
