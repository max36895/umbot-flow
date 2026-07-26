import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StepNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { t } from '../../../i18n';
import NodeHelpButton from './NodeHelpButton';
import { getNodeClasses, getNodeStyles } from './useNodeClasses';

function StepNodeComponent({ data, id }: NodeProps & { data: StepNodeData }) {
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const activePreviewNodeId = useUiStore((s) => s.activePreviewNodeId);
    const isActivePreview = activePreviewNodeId === id;
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected && !isActivePreview;
    const promptPreview = data.prompt?.text
        ? data.prompt.text.length > 50
            ? data.prompt.text.slice(0, 50) + '...'
            : data.prompt.text
        : t('node.preview.noPrompt');

    return (
        <div
            className={getNodeClasses('step', isSelected, isDimmed, isActivePreview)}
            style={{ minWidth: 220, ...getNodeStyles('step', isSelected, isActivePreview) }}
            onClick={() => selectNode(id)}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#bc13fe] !shadow-[0_0_8px_rgba(188,19,254,0.5)]"
            />

            <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(188,19,254,0.25)] px-2.5 py-1 text-[10px] font-semibold text-white">
                    <span className="text-sm">📝</span>
                    {t('node.badge.step')}
                </span>
                <span className="font-semibold text-white">{data.name}</span>
                <NodeHelpButton content={t('help.stepDesc')} color="#bc13fe" />
            </div>

            <div className="rounded-lg bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 text-xs text-white/60 italic">
                {promptPreview}
            </div>

            {data.saveTo && (
                <div className="mt-2 flex items-center gap-1 rounded-full bg-[rgba(188,19,254,0.1)] px-2 py-0.5 text-[10px] font-medium text-[#bc13fe]">
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
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#bc13fe] !shadow-[0_0_8px_rgba(188,19,254,0.5)]"
            />
        </div>
    );
}

export const StepNode = memo(StepNodeComponent);
