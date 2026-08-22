import { memo, useCallback, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StepNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { useT } from '../../../i18n/hook';
import NodeHelpButton from './NodeHelpButton';
import {
    getNodeClasses,
    getNodeStyles,
    NODE_COLORS,
    nodeColorAlpha,
    HANDLE_STYLES_GLOW,
    BADGE_STYLES,
} from './useNodeClasses';
import { useNodeErrors, NodeErrorsBadge } from './useNodeErrors';
import { truncatePreview } from '../../../utils/truncate';
import { NodeIcon } from '../../ui/NodeIcons';

/** Стиль бейджа saveTo — константа на уровне модуля. */
const SAVE_TO_BADGE_STYLE = {
    backgroundColor: nodeColorAlpha('step', 10),
    color: NODE_COLORS.step.cssVar,
} as const;

function StepNodeComponent({ data, id }: NodeProps & { data: StepNodeData }) {
    const t = useT();
    const selectNode = useUiStore((s) => s.selectNode);
    const isSelected = useUiStore((s) => s.selectedNodeId === id);
    const isActivePreview = useUiStore((s) => s.activePreviewNodeId === id);
    const isDimmed = useUiStore(
        (s) => s.selectedNodeId !== null && s.selectedNodeId !== id && s.activePreviewNodeId !== id,
    );
    const errors = useNodeErrors(id);
    const hasErrors = (errors?.length ?? 0) > 0;
    const promptPreview = truncatePreview(data.prompt?.text, t('node.preview.noPrompt'));
    const nodeColor = NODE_COLORS.step;
    const nodeStyles = useMemo(
        () => getNodeStyles('step', isSelected, isActivePreview),
        [isSelected, isActivePreview],
    );
    const handleClick = useCallback(() => selectNode(id), [selectNode, id]);

    return (
        <div
            className={`relative min-w-[220px] ${getNodeClasses('step', isSelected, isDimmed, isActivePreview, hasErrors)}`}
            style={nodeStyles}
            onClick={handleClick}
        >
            <NodeErrorsBadge errors={errors} />
            <Handle
                type="target"
                position={Position.Top}
                className="!-top-3 !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES_GLOW.step}
            />

            <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-fg"
                    style={BADGE_STYLES.step}
                >
                    <NodeIcon name="step" size={12} />
                    {t('node.badge.step')}
                </span>
                <span className="font-semibold text-fg">{data.name}</span>
                <NodeHelpButton content={t('help.stepDesc')} color={nodeColor.cssVar} />
            </div>

            <div className="rounded-lg bg-fg/5 px-2.5 py-1.5 text-xs text-fg/60 italic">
                {promptPreview}
            </div>

            {data.saveTo && (
                <div className="mt-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={SAVE_TO_BADGE_STYLE}
                >
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path d="M5 2v4M3 4h4" strokeLinecap="round" />
                        <rect x="1" y="1" width="8" height="8" rx="1" />
                    </svg>
                    {t('node.saveTo')} {data.saveTo}
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="!-bottom-3 !h-4 !w-4 !border-2 !border-fg/30"
                style={HANDLE_STYLES_GLOW.step}
            />
        </div>
    );
}

export const StepNode = memo(StepNodeComponent);
