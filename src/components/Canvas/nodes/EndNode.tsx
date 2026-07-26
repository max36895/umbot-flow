import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import useUiStore from '../../../store/uiStore';

function EndNodeComponent({ id }: NodeProps) {
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected;

    return (
        <div
            className={`node-hover flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                isSelected
                    ? 'node-spotlight-active border-2 border-[#ef4444] bg-[rgba(239,68,68,0.15)] shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : isDimmed
                      ? 'node-dimmed border border-[rgba(239,68,68,0.3)] bg-[rgba(30,30,35,0.8)] backdrop-blur-xl'
                      : 'border border-[rgba(239,68,68,0.3)] bg-[rgba(30,30,35,0.8)] backdrop-blur-xl'
            }`}
            onClick={() => selectNode(id)}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#ef4444] !shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            />
            <span className="text-lg font-bold text-[#ef4444]">⏹</span>
        </div>
    );
}

export const EndNode = memo(EndNodeComponent);
