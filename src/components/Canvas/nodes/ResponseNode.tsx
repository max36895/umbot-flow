import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ResponseNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { t } from '../../../i18n';
import NodeHelpButton from './NodeHelpButton';
import { getNodeClasses, getNodeStyles } from './useNodeClasses';

function ResponseNodeComponent({ data, id }: NodeProps & { data: ResponseNodeData }) {
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected;
    const textPreview = data.response?.text
        ? data.response.text.length > 50
            ? data.response.text.slice(0, 50) + '...'
            : data.response.text
        : t('node.preview.noResponse');

    return (
        <div
            className={getNodeClasses('response', isSelected, isDimmed, false)}
            style={{ minWidth: 200, ...getNodeStyles('response', isSelected, false) }}
            onClick={() => selectNode(id)}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#00ff9d] !shadow-[0_0_8px_rgba(0,255,157,0.5)]"
            />

            <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(0,255,157,0.25)] px-2.5 py-1 text-[10px] font-semibold text-white">
                    <span className="text-sm">📢</span>
                    {t('node.badge.response')}
                </span>
                <span className="font-semibold text-white">{data.name}</span>
                <NodeHelpButton content={t('help.responseDesc')} color="#00ff9d" />
            </div>

            <div className="rounded-lg bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 text-xs text-white/60 italic">
                {textPreview}
            </div>

            {data.response?.buttons?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                    {data.response.buttons.slice(0, 3).map((btn: { title: string }, i: number) => (
                        <span
                            key={i}
                            className="rounded-full bg-[rgba(0,255,157,0.1)] px-2 py-0.5 text-[10px] font-medium text-[#00ff9d]"
                        >
                            {btn.title}
                        </span>
                    ))}
                </div>
            ) : null}

            <Handle
                type="source"
                position={Position.Bottom}
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#00ff9d] !shadow-[0_0_8px_rgba(0,255,157,0.5)]"
            />
        </div>
    );
}

export const ResponseNode = memo(ResponseNodeComponent);
