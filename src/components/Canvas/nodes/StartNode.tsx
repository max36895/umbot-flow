import { memo } from 'react';
import { Position, type NodeProps } from '@xyflow/react';
import { RoundTerminalNode } from './RoundTerminalNode';

function StartNodeComponent({ id }: NodeProps) {
    return (
        <RoundTerminalNode
            nodeType="start"
            icon="start"
            handleType="source"
            handlePosition={Position.Bottom}
            id={id}
        />
    );
}

export const StartNode = memo(StartNodeComponent);
