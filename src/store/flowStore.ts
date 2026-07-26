import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type {
    FlowDocument,
    FlowMetadata,
    FlowNodeData as NodeData,
    CommandNodeData,
} from '../types/flow';
import { DEFAULT_METADATA } from '../types/flow';
import { toReactFlowEdge, fromReactFlowEdge } from '../types/nodes';

interface HistoryEntry {
    nodes: Node[];
    edges: Edge[];
}

interface FlowStore {
    nodes: Node[];
    edges: Edge[];
    metadata: FlowMetadata;

    /** Add a new node to the canvas. */
    addNode: (
        type: NodeData['type'] | 'welcome' | 'help',
        position: { x: number; y: number },
    ) => string;
    /** Update data of a specific node. */
    updateNodeData: (id: string, data: Partial<NodeData>) => void;
    /** Remove a node and all connected edges. */
    removeNode: (id: string) => void;
    /** Duplicate a node with offset position. */
    duplicateNode: (id: string) => string | null;
    /** Paste a node from clipboard data, preserving original properties. */
    pasteNode: (data: NodeData, position: { x: number; y: number }) => string;
    /** Add an edge between two nodes. */
    addEdge: (edge: Edge) => void;
    /** Remove an edge by id. */
    removeEdge: (id: string) => void;
    /** Set nodes directly (used by React Flow). */
    setNodes: (nodes: Node[]) => void;
    /** Set edges directly (used by React Flow). */
    setEdges: (edges: Edge[]) => void;
    /** Update metadata. */
    setMetadata: (meta: Partial<FlowMetadata>) => void;
    /** Undo last change. */
    undo: () => void;
    /** Redo last undone change. */
    redo: () => void;
    /** Export flow as JSON document. */
    toJSON: () => FlowDocument;
    /** Import flow from JSON document. */
    fromJSON: (doc: FlowDocument) => void;
    /** Auto-save to localStorage. */
    autoSave: () => void;
    /** Auto-load from localStorage. */
    autoLoad: () => void;
    /** Clear undo/redo history. */
    clearHistory: () => void;
}

const STORAGE_KEY = 'umbot-flow-editor';

let idCounter = 0;
function generateNodeId(): string {
    idCounter += 1;
    return `node_${Date.now()}_${idCounter}`;
}

const useFlowStore = create<FlowStore>((set, get) => ({
    nodes: [],
    edges: [],
    metadata: { ...DEFAULT_METADATA },

    addNode: (type: NodeData['type'] | 'welcome' | 'help', position) => {
        const id = generateNodeId();
        const { nodes, metadata } = get();

        // Push current state to history before mutation
        const history = getHistory();
        history.push({ nodes: structuredClone(nodes), edges: structuredClone(get().edges) });
        setHistory(history);

        const defaultData = getDefaultNodeData(type, id, nodes);
        // Welcome/Help ноды — это command с role
        const nodeType = type === 'welcome' || type === 'help' ? 'command' : type;

        // Копируем текст из настроек бота в ноду
        if (type === 'welcome' || type === 'help') {
            const cmdData = defaultData as CommandNodeData;
            const sourceText =
                type === 'welcome' ? metadata.welcome.text : (metadata.helpText?.text ?? '');
            cmdData.response = { ...cmdData.response, text: sourceText };
        }

        const newNode: Node = {
            id,
            type: nodeType,
            position,
            data: defaultData,
        };
        set({ nodes: [...nodes, newNode] });
        get().autoSave();
        return id;
    },

    updateNodeData: (id, data) => {
        const { nodes } = get();
        const history = getHistory();
        history.push({ nodes: structuredClone(nodes), edges: structuredClone(get().edges) });
        setHistory(history);

        set({
            nodes: nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, ...data } as NodeData } : n,
            ),
        });
        get().autoSave();
    },

    removeNode: (id) => {
        const { nodes, edges } = get();
        const history = getHistory();
        history.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
        setHistory(history);

        set({
            nodes: nodes.filter((n) => n.id !== id),
            edges: edges.filter((e) => e.source !== id && e.target !== id),
        });
        get().autoSave();
    },

    duplicateNode: (id) => {
        const { nodes, edges } = get();
        const sourceNode = nodes.find((n) => n.id === id);
        if (!sourceNode) return null;

        const history = getHistory();
        history.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
        setHistory(history);

        const newId = generateNodeId();
        const newNode: Node = {
            id: newId,
            type: sourceNode.type,
            position: {
                x: sourceNode.position.x + 50,
                y: sourceNode.position.y + 50,
            },
            data: {
                ...structuredClone(sourceNode.data),
                id: newId,
                name: `${(sourceNode.data as { name?: string })?.name ?? 'node'}_copy`,
            } as NodeData,
        };

        // Копируем связанные рёбра с обновлением ID
        const newEdges: Edge[] = edges
            .filter((e) => e.source === id || e.target === id)
            .map((e) => ({
                ...e,
                id: `e-${newId}-${e.source === id ? e.target : e.source}-${Date.now()}-${Math.random()}`,
                source: e.source === id ? newId : e.source,
                target: e.target === id ? newId : e.target,
            }));

        set({
            nodes: [...nodes, newNode],
            edges: [...edges, ...newEdges],
        });
        get().autoSave();
        return newId;
    },

    pasteNode: (data, position) => {
        const { nodes } = get();

        const history = getHistory();
        history.push({ nodes: structuredClone(nodes), edges: structuredClone(get().edges) });
        setHistory(history);

        const newId = generateNodeId();
        const newNode: Node = {
            id: newId,
            type: data.type as NodeData['type'],
            position,
            data: {
                ...structuredClone(data),
                id: newId,
            } as NodeData,
        };

        set({ nodes: [...nodes, newNode] });
        get().autoSave();
        return newId;
    },

    addEdge: (edge) => {
        const { edges } = get();
        const history = getHistory();
        history.push({ nodes: structuredClone(get().nodes), edges: structuredClone(edges) });
        setHistory(history);

        // Prevent duplicate edges
        const exists = edges.some(
            (e) => e.source === edge.source && e.target === edge.target && e.type === edge.type,
        );
        if (!exists) {
            set({ edges: [...edges, edge] });
            get().autoSave();
        }
    },

    removeEdge: (id) => {
        const { edges } = get();
        const history = getHistory();
        history.push({ nodes: structuredClone(get().nodes), edges: structuredClone(edges) });
        setHistory(history);

        set({ edges: edges.filter((e) => e.id !== id) });
        get().autoSave();
    },

    setNodes: (nodes) => {
        set({ nodes });
        get().autoSave();
    },

    setEdges: (edges) => {
        set({ edges });
        get().autoSave();
    },

    setMetadata: (meta) => {
        set((state) => ({ metadata: { ...state.metadata, ...meta } }));
        get().autoSave();
    },

    undo: () => {
        const history = getHistory();
        if (history.length === 0) return;

        const { nodes, edges } = get();
        const redoStack = getRedoStack();
        redoStack.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
        setRedoStack(redoStack);

        const prev = history.pop()!;
        set({ nodes: prev.nodes, edges: prev.edges });
        get().autoSave();
    },

    redo: () => {
        const redoStack = getRedoStack();
        if (redoStack.length === 0) return;

        const { nodes, edges } = get();
        const history = getHistory();
        history.push({ nodes: structuredClone(nodes), edges: structuredClone(edges) });
        setHistory(history);

        const next = redoStack.pop()!;
        set({ nodes: next.nodes, edges: next.edges });
        get().autoSave();
    },

    toJSON: () => {
        const { nodes, edges, metadata } = get();
        return {
            ...metadata,
            nodes: nodes.map((n) => n.data as NodeData),
            edges: edges.map((e) => fromReactFlowEdge(e)).filter(Boolean) as FlowDocument['edges'],
        };
    },

    fromJSON: (doc) => {
        const flowNodes: Node[] = doc.nodes.map((n) => {
            // Определяем role для команд с базовыми именами
            const role =
                n.type === 'command' && (n as { name?: string }).name === 'welcome'
                    ? 'welcome'
                    : n.type === 'command' && (n as { name?: string }).name === 'help'
                      ? 'help'
                      : (n as { role?: string }).role;
            return {
                id: n.id,
                type: n.type,
                position: { x: 0, y: 0 },
                data: role ? { ...n, role } : n,
            };
        });

        // Layout nodes in a simple grid
        const COLS = 4;
        const X_GAP = 300;
        const Y_GAP = 200;
        flowNodes.forEach((node, i) => {
            node.position = {
                x: (i % COLS) * X_GAP,
                y: Math.floor(i / COLS) * Y_GAP,
            };
        });

        const flowEdges: Edge[] = doc.edges.map((e, i) => toReactFlowEdge(e, i)).filter(Boolean);

        // Auto-layout: simple force-directed approximation
        // Sort by topological position for better layout
        const adjacency = new Map<string, string[]>();
        const inDegree = new Map<string, number>();
        for (const n of flowNodes) {
            adjacency.set(n.id, []);
            inDegree.set(n.id, 0);
        }
        for (const e of flowEdges) {
            adjacency.get(e.source)?.push(e.target);
            inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
        }

        // Topological sort
        const queue: string[] = [];
        for (const [id, deg] of inDegree) {
            if (deg === 0) queue.push(id);
        }

        const layers: string[][] = [];
        const visited = new Set<string>();
        while (queue.length > 0) {
            const layer: string[] = [];
            const nextQueue: string[] = [];
            for (const id of queue) {
                if (visited.has(id)) continue;
                visited.add(id);
                layer.push(id);
                for (const child of adjacency.get(id) ?? []) {
                    const deg = (inDegree.get(child) ?? 1) - 1;
                    inDegree.set(child, deg);
                    if (deg === 0) nextQueue.push(child);
                }
            }
            layers.push(layer);
            queue.length = 0;
            queue.push(...nextQueue);
        }

        // Position by layers
        const nodeMap = new Map(flowNodes.map((n) => [n.id, n]));
        layers.forEach((layer, layerIdx) => {
            layer.forEach((id, posIdx) => {
                const node = nodeMap.get(id);
                if (node) {
                    node.position = {
                        x: layerIdx * X_GAP,
                        y: posIdx * Y_GAP,
                    };
                }
            });
        });

        // Position unvisited nodes
        const lastLayer = layers[layers.length - 1];
        let maxY = lastLayer ? lastLayer.length * Y_GAP : 0;
        for (const node of flowNodes) {
            if (!visited.has(node.id)) {
                node.position = { x: 0, y: maxY };
                maxY += Y_GAP;
            }
        }

        set({
            nodes: flowNodes,
            edges: flowEdges,
            metadata: {
                schemaVersion: doc.schemaVersion,
                name: doc.name,
                version: doc.version,
                description: doc.description,
                platforms: doc.platforms,
                database: doc.database,
                mode: doc.mode,
                isLocalStorage: doc.isLocalStorage,
                fallback: doc.fallback,
                welcome: doc.welcome,
                helpText: doc.helpText ?? { text: '' },
                variables: doc.variables,
                tokens: doc.tokens ?? {},
            },
        });

        // Очищаем историю после импорта нового документа
        undoStack = [];
        redoStackRef = [];
    },

    autoSave: () => {
        // Откладываем сохранение для уменьшения нагрузки
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            try {
                const state = get();
                const data = {
                    nodes: state.nodes,
                    edges: state.edges,
                    metadata: state.metadata,
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch {
                // Storage full or unavailable
            }
        }, SAVE_DELAY);
    },

    autoLoad: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.nodes && data.edges && data.metadata) {
                set({
                    nodes: data.nodes,
                    edges: data.edges,
                    metadata: data.metadata,
                });
            }
        } catch {
            // Corrupted data
        }
    },

    clearHistory: () => {
        undoStack = [];
        redoStackRef = [];
    },
}));

// History management (outside store to avoid re-renders)
const MAX_HISTORY = 50;
let undoStack: HistoryEntry[] = [];
let redoStackRef: HistoryEntry[] = [];

// Debounce для autoSave
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DELAY = 300;

function getHistory(): HistoryEntry[] {
    return undoStack;
}

function setHistory(stack: HistoryEntry[]) {
    // Обрезаем историю при превышении лимита
    if (stack.length > MAX_HISTORY) {
        stack.splice(0, stack.length - MAX_HISTORY);
    }
    undoStack = stack;
}

function getRedoStack(): HistoryEntry[] {
    return redoStackRef;
}

function setRedoStack(stack: HistoryEntry[]) {
    redoStackRef = stack;
}

function getDefaultNodeData(
    type: NodeData['type'] | 'welcome' | 'help',
    id: string,
    existingNodes: Node[],
): NodeData {
    // Auto-generate unique name
    const baseNames: Record<string, string> = {
        command: 'command',
        step: 'step',
        condition: 'condition',
        action: 'action',
        end: 'end',
        response: 'response',
    };
    const baseName = baseNames[type] ?? 'node';
    let name = baseName;
    let counter = 1;
    const existingNames = new Set(
        existingNodes.map((n) => (n.data as { name?: string })?.name).filter(Boolean),
    );
    while (existingNames.has(name)) {
        name = `${baseName}_${counter}`;
        counter++;
    }

    switch (type) {
        case 'command':
            return {
                type: 'command',
                id,
                name,
                slots: [],
                isPattern: false,
                response: { text: '', buttons: [], sounds: [] },
            };
        case 'welcome':
            return {
                type: 'command',
                id,
                name: 'welcome',
                slots: [],
                isPattern: false,
                response: { text: '', buttons: [], sounds: [] },
                role: 'welcome',
            };
        case 'help':
            return {
                type: 'command',
                id,
                name: 'help',
                slots: [],
                isPattern: false,
                response: { text: '', buttons: [], sounds: [] },
                role: 'help',
            };
        case 'step':
            return {
                type: 'step',
                id,
                name,
                prompt: { text: '', buttons: [] },
                saveTo: '',
                saveAs: 'original',
            };
        case 'condition':
            return { type: 'condition', id, name, variable: '', operator: 'eq', value: '' };
        case 'action':
            return { type: 'action', id, name, actions: [], text: '', buttons: [] };
        case 'response':
            return { type: 'response', id, name, response: { text: '', buttons: [], sounds: [] } };
        case 'end':
            return { type: 'end', id };
    }
}

export default useFlowStore;
