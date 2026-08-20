import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ResponseNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { useT } from '../../../i18n/hook';
import NodeHelpButton from './NodeHelpButton';
import { getNodeClasses, getNodeStyles, NODE_COLORS } from './useNodeClasses';
import { useNodeErrorsMap, NodeErrorsBadge } from './useNodeErrors';
import { truncatePreview } from '../../../utils/truncate';
import { NodeIcon } from '../../ui/NodeIcons';

function ResponseNodeComponent({ data, id }: NodeProps & { data: ResponseNodeData }) {
    const t = useT();
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected;
    const nodeErrors = useNodeErrorsMap();
    const errors = nodeErrors.get(id);
    const hasErrors = (errors?.length ?? 0) > 0;
    const textPreview = truncatePreview(data.response?.text, t('node.preview.noResponse'));
    const nodeColor = NODE_COLORS.response;

    return (
        <div
            className={`relative min-w-[200px] ${getNodeClasses('response', isSelected, isDimmed, false, hasErrors)}`}
            style={getNodeStyles('response', isSelected, false)}
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
                    <NodeIcon name="response" size={12} />
                    {t('node.badge.response')}
                </span>
                <span className="font-semibold text-white">{data.name}</span>
                <NodeHelpButton content={t('help.responseDesc')} color={nodeColor.hex} />
            </div>

            <div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/60 italic">
                {textPreview}
            </div>

            {data.response?.buttons?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                    {data.response.buttons.slice(0, 3).map((btn: { title: string }, i: number) => (
                        <span
                            key={i}
                            className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success"
                        >
                            {btn.title}
                        </span>
                    ))}
                </div>
            ) : null}

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

export const ResponseNode = memo(ResponseNodeComponent);
