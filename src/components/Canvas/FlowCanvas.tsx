import { useCallback, useRef, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    type Connection,
    type NodeTypes,
    type EdgeTypes,
    type OnConnect,
    type OnNodesChange,
    type OnEdgesChange,
    type ReactFlowInstance,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import type { FlowNodeData } from '../../types/flow';
import { CommandNode } from './nodes/CommandNode';
import { StepNode } from './nodes/StepNode';
import { ConditionNode } from './nodes/ConditionNode';
import { ActionNode } from './nodes/ActionNode';
import { ResponseNode } from './nodes/ResponseNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { FlowEdge } from './edges/FlowEdge';
import ContextMenu from './ContextMenu';

const nodeTypes: NodeTypes = {
    command: CommandNode,
    step: StepNode,
    condition: ConditionNode,
    action: ActionNode,
    response: ResponseNode,
    start: StartNode,
    end: EndNode,
};

const edgeTypes: EdgeTypes = {
    flowEdge: FlowEdge,
};

export default function FlowCanvas() {
    const nodes = useFlowStore((s) => s.nodes);
    const edges = useFlowStore((s) => s.edges);
    const setNodes = useFlowStore((s) => s.setNodes);
    const setEdges = useFlowStore((s) => s.setEdges);
    const addEdgeToStore = useFlowStore((s) => s.addEdge);
    const addNode = useFlowStore((s) => s.addNode);
    const selectNode = useUiStore((s) => s.selectNode);
    const selectEdge = useUiStore((s) => s.selectEdge);
    const removeNode = useFlowStore((s) => s.removeNode);
    const removeEdge = useFlowStore((s) => s.removeEdge);
    const minimapVisible = useUiStore((s) => s.minimapVisible);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        flowX: number;
        flowY: number;
    } | null>(null);

    // Обработчик правой кнопки мыши
    const onContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const flowPos = reactFlowInstance.current?.screenToFlowPosition({
            x: e.clientX,
            y: e.clientY,
        }) ?? { x: e.clientX, y: e.clientY };
        setContextMenu({ x: e.clientX, y: e.clientY, flowX: flowPos.x, flowY: flowPos.y });
    }, []);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            setNodes(applyNodeChanges(changes, useFlowStore.getState().nodes));
        },
        [setNodes],
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            setEdges(applyEdgeChanges(changes, useFlowStore.getState().edges));
        },
        [setEdges],
    );

    const onConnect: OnConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target) return;

            const sourceNode = useFlowStore
                .getState()
                .nodes.find((n) => n.id === connection.source);
            let edgeType = 'next';
            if (sourceNode?.type === 'condition') {
                edgeType = connection.sourceHandle === 'true' ? 'branch_true' : 'branch_false';
            }

            const newEdge = {
                ...connection,
                id: `e-${connection.source}-${connection.target}-${Date.now()}`,
                type: 'flowEdge',
                data: { edgeType, label: '' },
                animated: edgeType === 'branch_true' || edgeType === 'branch_false',
            };

            addEdgeToStore(newEdge);
        },
        [addEdgeToStore],
    );

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: { id: string }) => {
            selectNode(node.id);
        },
        [selectNode],
    );

    const onEdgeClick = useCallback(
        (_: React.MouseEvent, edge: { id: string }) => {
            selectEdge(edge.id);
        },
        [selectEdge],
    );

    const onPaneClick = useCallback(() => {
        selectNode(null);
        selectEdge(null);
        setContextMenu(null);
    }, [selectNode, selectEdge]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('application/reactflow') as
                | FlowNodeData['type']
                | 'welcome'
                | 'help';
            if (!type) return;

            const position = reactFlowInstance.current?.screenToFlowPosition({
                x: e.clientX,
                y: e.clientY,
            }) ?? { x: e.clientX, y: e.clientY };

            const newId = addNode(type, position);
            // Даём React время отрендерить ноду, затем выбираем её
            setTimeout(() => selectNode(newId), 50);
        },
        [addNode, selectNode],
    );

    const onInit = useCallback((instance: ReactFlowInstance) => {
        reactFlowInstance.current = instance;
    }, []);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const isInput =
                e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
            if (isInput) return;

            // Delete — удаление ноды или ребра
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const selectedNodeId = useUiStore.getState().selectedNodeId;
                const selectedEdgeId = useUiStore.getState().selectedEdgeId;

                if (selectedNodeId) {
                    e.preventDefault();
                    removeNode(selectedNodeId);
                    selectNode(null);
                } else if (selectedEdgeId) {
                    e.preventDefault();
                    removeEdge(selectedEdgeId);
                    selectEdge(null);
                }
            }
        },
        [removeNode, removeEdge, selectNode, selectEdge],
    );

    return (
        <div
            ref={reactFlowWrapper}
            className="h-full w-full"
            onKeyDown={onKeyDown}
            onContextMenu={onContextMenu}
            tabIndex={0}
        >
            <ReactFlow
                onInit={onInit}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                deleteKeyCode={null}
                className="bg-[#0F0F14]"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1.5}
                    color="rgba(255, 255, 255, 0.05)"
                />
                <Controls />
                {minimapVisible && (
                    <MiniMap
                        nodeStrokeWidth={3}
                        nodeColor={(n) => {
                            switch (n.type) {
                                case 'command':
                                    return '#00f0ff';
                                case 'step':
                                    return '#bc13fe';
                                case 'condition':
                                    return '#ff0055';
                                case 'action':
                                    return '#ff9d00';
                                case 'response':
                                    return '#00ff9d';
                                case 'end':
                                    return '#ef4444';
                                default:
                                    return '#22c55e';
                            }
                        }}
                        className="!bg-[rgba(15,15,20,0.9)] !border-[rgba(255,255,255,0.1)]"
                        maskColor="rgba(15, 15, 20, 0.7)"
                    />
                )}
            </ReactFlow>
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    flowX={contextMenu.flowX}
                    flowY={contextMenu.flowY}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
