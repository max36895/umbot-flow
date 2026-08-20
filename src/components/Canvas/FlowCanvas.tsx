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
    type Node,
    type Edge,
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
import { NODE_COLORS, type NodeTypeKey } from './nodes/nodeColors';
import { t } from '../../i18n';

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

/** Цвет ноды на MiniMap — вычисляется один раз на уровне модуля. */
function minimapNodeColor(n: { type?: string }): string {
    const key = (n.type ?? 'start') as NodeTypeKey;
    return NODE_COLORS[key]?.hex ?? NODE_COLORS.start.hex;
}

export default function FlowCanvas() {
    const nodes = useFlowStore((s) => s.nodes);
    const edges = useFlowStore((s) => s.edges);
    const setNodes = useFlowStore((s) => s.setNodes);
    const setEdges = useFlowStore((s) => s.setEdges);
    const addEdgeToStore = useFlowStore((s) => s.addEdge);
    const addNode = useFlowStore((s) => s.addNode);
    const selectNode = useUiStore((s) => s.selectNode);
    const selectEdge = useUiStore((s) => s.selectEdge);
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

    // Правый клик по ноде — выбираем её и сразу показываем контекстное меню
    const onNodeContextMenu = useCallback(
        (e: React.MouseEvent, node: { id: string }) => {
            e.preventDefault();
            selectNode(node.id);
            const flowPos = reactFlowInstance.current?.screenToFlowPosition({
                x: e.clientX,
                y: e.clientY,
            }) ?? { x: e.clientX, y: e.clientY };
            setContextMenu({ x: e.clientX, y: e.clientY, flowX: flowPos.x, flowY: flowPos.y });
        },
        [selectNode],
    );

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            // Для позиционных изменений при перетаскивании — не пушим в историю каждый фрейм,
            // история пушится один раз в onNodeDragStop.
            setNodes(applyNodeChanges(changes, useFlowStore.getState().nodes));
        },
        [setNodes],
    );

    // Запоминаем snapshot ДО drag, чтобы onNodeDragStop запушил его в историю
    const dragSnapshotRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);

    const onNodeDragStart = useCallback(() => {
        const s = useFlowStore.getState();
        dragSnapshotRef.current = {
            nodes: structuredClone(s.nodes),
            edges: structuredClone(s.edges),
        };
    }, []);

    const onNodeDragStop = useCallback(() => {
        const snapshot = dragSnapshotRef.current;
        dragSnapshotRef.current = null;
        if (snapshot) {
            // Пушим PRE-drag состояние — undo вернёт туда
            useFlowStore.getState().pushHistorySnapshot(snapshot);
        }
    }, []);

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

    // Подсветка канваса во время drag — чтобы пользователь видел зону дропа
    const [isDraggingBlock, setIsDraggingBlock] = useState(false);

    const onDragEnter = useCallback((e: React.DragEvent) => {
        if (e.dataTransfer.types.includes('application/reactflow')) {
            setIsDraggingBlock(true);
        }
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        // Отключаем подсветку только если покинули сам канвас-обёртку (а не дочерний элемент)
        if (e.currentTarget === e.target) {
            setIsDraggingBlock(false);
        }
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDraggingBlock(false);
            const type = e.dataTransfer.getData('application/reactflow') as
                FlowNodeData['type'] | 'welcome' | 'help' | 'fallback';
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

            // Delete — удаление выделенных нод и рёбер (поддерживается мультивыделение)
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const state = useFlowStore.getState();
                const nodeIds = new Set(
                    state.nodes.filter((n) => n.selected).map((n) => n.id),
                );
                const edgeIds = new Set(
                    state.edges.filter((ed) => ed.selected).map((ed) => ed.id),
                );
                const uiNodeId = useUiStore.getState().selectedNodeId;
                const uiEdgeId = useUiStore.getState().selectedEdgeId;
                if (uiNodeId) nodeIds.add(uiNodeId);
                if (uiEdgeId) edgeIds.add(uiEdgeId);

                if (nodeIds.size > 0 || edgeIds.size > 0) {
                    e.preventDefault();
                    state.removeSelection([...nodeIds], [...edgeIds]);
                    selectNode(null);
                    selectEdge(null);
                }
            }
        },
        [selectNode, selectEdge],
    );

    return (
        <div
            ref={reactFlowWrapper}
            className="h-full w-full transition-shadow"
            onKeyDown={onKeyDown}
            onContextMenu={onContextMenu}
            tabIndex={0}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
        >
            {isDraggingBlock && (
                <div className="pointer-events-none absolute inset-0 z-overlay flex items-center justify-center">
                    <div className="rounded-xl border-2 border-dashed border-info/60 bg-info/5 px-6 py-4 text-sm text-info shadow-[0_0_30px_rgba(0,240,255,0.2)] backdrop-blur-sm">
                        {t('canvas.dropHere')}
                    </div>
                </div>
            )}
            <ReactFlow
                onInit={onInit}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onNodeContextMenu={onNodeContextMenu}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                deleteKeyCode={null}
                className="bg-surface-dim"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1.5}
                    color="rgba(255, 255, 255, 0.05)"
                />
                <Controls />
                {minimapVisible && <MiniMap nodeStrokeWidth={3} nodeColor={minimapNodeColor} />}
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
