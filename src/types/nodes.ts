import type { Node, Edge } from '@xyflow/react';
import type { FlowNodeData, FlowEdge as FlowEdgeData } from './flow';

/** React Flow node wrapping a flow node. */
export type FlowNode = Node<FlowNodeData, 'command' | 'step' | 'condition' | 'end'>;

/** React Flow edge. */
export type FlowEdgeType = Edge;

/** Convert FlowEdgeData to React Flow Edge. */
export function toReactFlowEdge(edge: FlowEdgeData, index: number): FlowEdgeType {
    return {
        id: `e-${edge.from}-${edge.to}-${index}`,
        source: edge.from,
        target: edge.to,
        type: 'flowEdge',
        data: { edgeType: edge.type, label: edge.label },
        animated: edge.type === 'branch_true' || edge.type === 'branch_false',
    };
}

/** Convert React Flow Edge to FlowEdgeData. */
export function fromReactFlowEdge(edge: FlowEdgeType): FlowEdgeData | null {
    const data = edge.data as { edgeType: FlowEdgeData['type']; label?: string } | undefined;
    if (!data) return null;
    return {
        from: edge.source,
        to: edge.target,
        type: data.edgeType,
        label: data.label,
    };
}
