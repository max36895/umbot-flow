import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StepNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { useT } from '../../../i18n/hook';
import NodeHelpButton from './NodeHelpButton';
import { getNodeClasses, getNodeStyles, NODE_COLORS } from './useNodeClasses';
import { useNodeErrorsMap, NodeErrorsBadge } from './useNodeErrors';
import { truncatePreview } from '../../../utils/truncate';
import { NodeIcon } from '../../ui/NodeIcons';

function StepNodeComponent({ data, id }: NodeProps & { data: StepNodeData }) {
    const t = useT();
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const activePreviewNodeId = useUiStore((s) => s.activePreviewNodeId);
    const nodeErrors = useNodeErrorsMap();
    const errors = nodeErrors.get(id);
    const hasErrors = (errors?.length ?? 0) > 0;
    const isActivePreview = activePreviewNodeId === id;
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected && !isActivePreview;
    const promptPreview = truncatePreview(data.prompt?.text, t('node.preview.noPrompt'));
    const nodeColor = NODE_COLORS.step;

    return (
        <div
            className={`relative min-w-[220px] ${getNodeClasses('step', isSelected, isDimmed, isActivePreview, hasErrors)}`}
            style={getNodeStyles('step', isSelected, isActivePreview)}
            onClick={() => selectNode(id)}
        >
            <NodeErrorsBadge errors={errors} />
            <Handle
                type="target"
                position={Position.Top}
                className="!-top-3 !h-4 !w-4 !border-2 !border-white/30"
                style={{ backgroundColor: nodeColor.hex, boxShadow: `0 0 8px rgba(${nodeColor.rgb},0.5)` }}
            />

            <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: `rgba(${nodeColor.rgb},0.25)` }}
                >
                    <NodeIcon name="step" size={12} />
                    {t('node.badge.step')}
                </span>
                <span className="font-semibold text-white">{data.name}</span>
                <NodeHelpButton content={t('help.stepDesc')} color={nodeColor.hex} />
            </div>

            <div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/60 italic">
                {promptPreview}
            </div>

            {data.saveTo && (
                <div className="mt-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                        backgroundColor: `rgba(${nodeColor.rgb},0.1)`,
                        color: nodeColor.hex,
                    }}
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
                className="!-bottom-3 !h-4 !w-4 !border-2 !border-white/30"
                style={{ backgroundColor: nodeColor.hex, boxShadow: `0 0 8px rgba(${nodeColor.rgb},0.5)` }}
            />
        </div>
    );
}

export const StepNode = memo(StepNodeComponent);
