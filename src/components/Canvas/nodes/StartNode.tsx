import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import useUiStore from '../../../store/uiStore';

function StartNodeComponent({ id }: NodeProps) {
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected;

    return (
        <div
            className={`node-hover flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                isSelected
                    ? 'node-spotlight-active border-2 border-[#22c55e] bg-[rgba(34,197,94,0.15)] shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : isDimmed
                      ? 'node-dimmed border border-[rgba(34,197,94,0.3)] bg-[rgba(30,30,35,0.8)] backdrop-blur-xl'
                      : 'border border-[rgba(34,197,94,0.3)] bg-[rgba(30,30,35,0.8)] backdrop-blur-xl'
            }`}
            onClick={() => selectNode(id)}
        >
            <Handle
                type="source"
                position={Position.Bottom}
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#22c55e] !shadow-[0_0_8px_rgba(34,197,94,0.5)]"
            />
            <span className="text-lg font-bold text-[#22c55e]">▶</span>
        </div>
    );
}

export const StartNode = memo(StartNodeComponent);
