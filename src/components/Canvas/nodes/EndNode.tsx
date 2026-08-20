import { memo } from 'react';
import { Position, type NodeProps } from '@xyflow/react';
import { RoundTerminalNode } from './RoundTerminalNode';

function EndNodeComponent({ id }: NodeProps) {
    return (
        <RoundTerminalNode
            nodeType="end"
            icon="end"
            handleType="target"
            handlePosition={Position.Top}
            id={id}
        />
    );
}

export const EndNode = memo(EndNodeComponent);
