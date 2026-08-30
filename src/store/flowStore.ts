import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type {
    FlowDocument,
    FlowMetadata,
    FlowNodeData as NodeData,
    CommandNodeData,
    EdgeType,
} from '../types/flow';
import { DEFAULT_METADATA } from '../types/flow';
import { toReactFlowEdge, fromReactFlowEdge } from '../types/nodes';
import { t } from '../i18n';
import { evictProjectsForSpace } from '../utils/projectsStore';

interface HistoryEntry {
    nodes: Node[];
    edges: Edge[];
}

/** Статус автосохранения — по факту записи в localStorage, а не по факту изменения. */
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface FlowStore {
    nodes: Node[];
    edges: Edge[];
    metadata: FlowMetadata;
    /** Результат последней записи автосейва. 'error' = хранилище переполнено/недоступно,
     * данные НЕ сохранены — UI обязан показать предупреждение и путь спасения (экспорт). */
    saveState: SaveState;

    /** Add a new node to the canvas. */
    addNode: (
        type: NodeData['type'] | 'welcome' | 'help' | 'fallback',
        position: { x: number; y: number },
    ) => string;
    /** Update data of a specific node. */
    updateNodeData: (id: string, data: Partial<NodeData>) => void;
    /** Remove a node and all connected edges. */
    removeNode: (id: string) => void;
    /** Remove multiple nodes and edges in a single undo step (group delete). */
    removeSelection: (nodeIds: string[], edgeIds: string[]) => void;
    /** Duplicate a node with offset position. */
    duplicateNode: (id: string) => string | null;
    /** Paste a node from clipboard data, preserving original properties. */
    pasteNode: (data: NodeData, position: { x: number; y: number }) => string;
    /** Add an edge between two nodes. */
    addEdge: (edge: Edge) => void;
    /** Remove an edge by id. */
    removeEdge: (id: string) => void;
    /**
     * Установить следующий блок для step-ноды (поле «Следующий блок» в панели свойств).
     * Синхронизирует data.next И ребро next на холсте: поле — зеркало ребра,
     * единый источник правды. targetId = null удаляет и поле, и ребро.
     */
    setNextTarget: (nodeId: string, targetId: string | null) => void;
    /** Set nodes directly (used by React Flow). */
    setNodes: (nodes: Node[]) => void;
    /** Set edges directly (used by React Flow). */
    setEdges: (edges: Edge[]) => void;
    /** Update metadata. */
    setMetadata: (meta: Partial<FlowMetadata>) => void;
    /** Update node data AND metadata in a single set() — для встроенных узлов (welcome/help/fallback),
     * чтобы не было двойного прохода уведомлений подписчиков. */
    updateNodeDataWithMetadata: (
        id: string,
        data: Partial<NodeData>,
        meta: Partial<FlowMetadata>,
    ) => void;
    /** Push current state to undo history manually (used for drag operations). */
    pushHistory: () => void;
    /** Push a specific snapshot to undo history (used for drag operations to push PRE-drag state). */
    pushHistorySnapshot: (snapshot: HistoryEntry) => void;
    /** Undo last change. */
    undo: () => void;
    /** Redo last undone change. */
    redo: () => void;
    /** Export flow as JSON document. */
    toJSON: () => FlowDocument;
    /** Import flow from JSON document. */
    fromJSON: (doc: FlowDocument) => void;
    /** Auto-save to localStorage (debounced). */
    autoSave: () => void;
    /** Немедленная синхронная запись без debounce — для pagehide/visibilitychange. */
    flushSave: () => void;
    /** Auto-load from localStorage. */
    autoLoad: () => void;
    /** Clear undo/redo history. */
    clearHistory: () => void;
}

const STORAGE_KEY = 'umbot-flow-editor';

/** Текущая поддерживаемая версия схемы. При изменении — добавить миграцию. */
export const CURRENT_SCHEMA_VERSION = '1.0';

/** Источник metadata: корень flow.json (FlowDocument) или сохранённый metadata. */
type MetadataSource = Partial<FlowMetadata>;

/**
 * Нормализует metadata до полного FlowMetadata, подставляя дефолты для опциональных полей.
 * Схема не требует fallback/welcome/database/version и др., поэтому «чужой» или старый
 * документ без этих полей уронил бы UI (ChatPreview читает fallback.text, BotSettingsModal —
 * database.type/welcome.text). Структурные поля берём из DEFAULT_METADATA, пользовательские
 * тексты — пустые, чтобы не подставлять чужой контент в импортируемого бота.
 */
function normalizeMetadata(src: MetadataSource): FlowMetadata {
    return {
        schemaVersion: src.schemaVersion ?? CURRENT_SCHEMA_VERSION,
        name: src.name ?? DEFAULT_METADATA.name,
        version: src.version ?? '1.0.0',
        description: src.description ?? '',
        platforms: src.platforms ?? DEFAULT_METADATA.platforms,
        database: src.database ?? DEFAULT_METADATA.database,
        mode: src.mode ?? DEFAULT_METADATA.mode,
        isLocalStorage: src.isLocalStorage ?? DEFAULT_METADATA.isLocalStorage,
        fallback: src.fallback ?? { text: '' },
        welcome: src.welcome ?? { text: '', buttons: [] },
        helpText: src.helpText ?? { text: '' },
        variables: src.variables ?? {},
        tokens: src.tokens ?? {},
    };
}

let idCounter = 0;
function generateNodeId(): string {
    idCounter += 1;
    return `node_${Date.now()}_${idCounter}`;
}

/**
 * Зеркальная синхронизация data.next ↔ ребро next для step-нод.
 * Ребро — единственный источник правды: поле в панели свойств всегда
 * отражает текущее ребро (или пусто, если ребра нет). Покрывает все пути
 * удаления/замены рёбер, включая applyEdgeChanges из React Flow.
 */
function syncNextMirrors(nodes: Node[], edges: Edge[]): Node[] {
    const nextBySource = new Map<string, string>();
    for (const e of edges) {
        const ed = e.data as { edgeType?: EdgeType } | undefined;
        if (ed?.edgeType === 'next') nextBySource.set(e.source, e.target);
    }
    let changed = false;
    const result = nodes.map((n) => {
        const data = n.data as { type?: string; next?: string };
        if (data?.type !== 'step') return n;
        const mirror = nextBySource.get(n.id);
        if ((data.next ?? undefined) !== mirror) {
            changed = true;
            const next = { ...(n.data as Record<string, unknown>) };
            if (mirror) next.next = mirror;
            else delete next.next;
            return { ...n, data: next as NodeData };
        }
        return n;
    });
    return changed ? result : nodes;
}

/**
 * Полная нормализация переходов step при загрузке сохранённого состояния
 * (autoLoad) и внешнего документа (fromJSON):
 * 1. data.next без ребра (старые сохранения/ручные JSON) → создаём ребро,
 *    иначе переход молча не работал в превью и генераторе;
 * 2. затем data.next приводится к зеркалу рёбер (висячие цели очищаются).
 */
function normalizeNextState(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const newEdges = [...edges];
    let counter = newEdges.length;
    for (const n of nodes) {
        const data = n.data as { type?: string; next?: string };
        if (data?.type !== 'step' || !data.next) continue;
        if (!nodes.some((t) => t.id === data.next)) continue;
        const hasEdge = newEdges.some((e) => {
            const ed = e.data as { edgeType?: EdgeType } | undefined;
            return e.source === n.id && ed?.edgeType === 'next';
        });
        if (!hasEdge) {
            newEdges.push({
                id: `e-${n.id}-${data.next}-sync-${++counter}`,
                source: n.id,
                target: data.next,
                type: 'flowEdge',
                data: { edgeType: 'next', label: '' },
                animated: false,
            });
        }
    }
    // Всегда возвращаем СВЕЖИЕ массивы: fromJSON мутирует flowNodes/flowEdges
    // через length=0/push — общая ссылка с входом приводила бы к потере данных.
    const mirrored = syncNextMirrors(nodes, newEdges);
    return { nodes: [...mirrored], edges: newEdges };
}

const useFlowStore = create<FlowStore>((set, get) => {    /** Пушит текущее состояние в undo-историю и очищает redo. */
    const pushHistoryEntry = () => {
        const { nodes, edges } = get();
        const history = getHistory();
        // Shallow-копия массивов достаточна: store полностью иммутабелен,
        // объекты нод/рёбер никогда не мутируются in-place.
        history.push({ nodes: [...nodes], edges: [...edges] });
        setHistory(history);
        setRedoStack([]);
    };

    /** Применяет частичное обновление data ноды. */
    const applyNodeData = (id: string, data: Partial<NodeData>) => {
        const { nodes } = get();
        set({
            nodes: nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, ...data } as NodeData } : n,
            ),
        });
        get().autoSave();
    };

    return {
    nodes: [],
    edges: [],
    metadata: { ...DEFAULT_METADATA },
    saveState: 'idle',

    addNode: (type: NodeData['type'] | 'welcome' | 'help' | 'fallback', position) => {
        const id = generateNodeId();
        const { nodes, metadata } = get();

        // Push current state to history before mutation
        pushHistoryEntry();

        const defaultData = getDefaultNodeData(type, id, nodes);
        // Welcome/Help/Fallback ноды — это command с role
        const isRoleNode = type === 'welcome' || type === 'help' || type === 'fallback';
        const nodeType = isRoleNode ? 'command' : type;

        // Копируем текст из настроек бота в ноду
        if (isRoleNode) {
            const cmdData = defaultData as CommandNodeData;
            const sourceText =
                type === 'welcome'
                    ? metadata.welcome.text
                    : type === 'help'
                      ? (metadata.helpText?.text ?? '')
                      : (metadata.fallback?.text ?? '');
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
        // Коалесцинг быстрых правок: ввод текста в одно поле генерирует
        // обновление на каждый символ; правки одной ноды с одинаковой формой
        // патча в пределах окна схлопываются в один шаг undo.
        const now = Date.now();
        const coalesceKey = `${id}:${Object.keys(data).sort().join(',')}`;
        const shouldCoalesce =
            lastCoalesceKey === coalesceKey && now - lastCoalesceTime < COALESCE_WINDOW_MS;
        lastCoalesceKey = coalesceKey;
        lastCoalesceTime = now;
        if (!shouldCoalesce) {
            pushHistoryEntry();
        }
        applyNodeData(id, data);
    },

    removeNode: (id) => {
        const { nodes, edges } = get();
        pushHistoryEntry();

        const nextEdges = edges.filter((e) => e.source !== id && e.target !== id);
        set({
            nodes: syncNextMirrors(nodes.filter((n) => n.id !== id), nextEdges),
            edges: nextEdges,
        });
        get().autoSave();
    },

    removeSelection: (nodeIds, edgeIds) => {
        if (nodeIds.length === 0 && edgeIds.length === 0) return;
        const { nodes, edges } = get();
        pushHistoryEntry();

        const nodeSet = new Set(nodeIds);
        const edgeSet = new Set(edgeIds);
        const nextEdges = edges.filter(
            (e) => !edgeSet.has(e.id) && !nodeSet.has(e.source) && !nodeSet.has(e.target),
        );
        set({
            nodes: syncNextMirrors(nodes.filter((n) => !nodeSet.has(n.id)), nextEdges),
            edges: nextEdges,
        });
        get().autoSave();
    },

    duplicateNode: (id) => {
        const { nodes, edges } = get();
        const sourceNode = nodes.find((n) => n.id === id);
        if (!sourceNode) return null;

        pushHistoryEntry();

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
                name: `${(sourceNode.data as { name?: string })?.name ?? 'node'}_${t('node.copySuffix')}`,
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

        pushHistoryEntry();

        const newId = generateNodeId();
        const cloned = structuredClone(data) as Record<string, unknown>;
        // Вставленный шаг не наследует переход оригинала: его data.next указывал
        // бы на чужую цель без ребра, а ребро — источник правды (поле = зеркало).
        delete cloned.next;
        const newNode: Node = {
            id: newId,
            type: data.type as NodeData['type'],
            position,
            data: {
                ...cloned,
                id: newId,
            } as NodeData,
        };

        set({ nodes: [...nodes, newNode] });
        get().autoSave();
        return newId;
    },

    addEdge: (edge) => {
        const { edges } = get();
        pushHistoryEntry();

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
        const { edges, nodes } = get();
        pushHistoryEntry();

        const nextEdges = edges.filter((e) => e.id !== id);
        set({ nodes: syncNextMirrors(nodes, nextEdges), edges: nextEdges });
        get().autoSave();
    },

    setNextTarget: (nodeId, targetId) => {
        const { nodes, edges } = get();
        const node = nodes.find((n) => n.id === nodeId);
        if (!node || node.type !== 'step') return;
        pushHistoryEntry();

        // Шаг может иметь только один переход next: убираем старое ребро, ставим новое.
        // data.next пересчитает syncNextMirrors — поле всегда зеркало ребра.
        const cleanedEdges = edges.filter((e) => {
            const data = e.data as { edgeType?: EdgeType } | undefined;
            return !(e.source === nodeId && data?.edgeType === 'next');
        });

        const newEdges = [...cleanedEdges];
        if (targetId) {
            newEdges.push({
                id: `e-${nodeId}-${targetId}-${Date.now()}`,
                source: nodeId,
                target: targetId,
                type: 'flowEdge',
                data: { edgeType: 'next', label: '' },
                animated: false,
            });
        }

        set({ nodes: syncNextMirrors(nodes, newEdges), edges: newEdges });
        get().autoSave();
    },

    setNodes: (nodes) => {
        set({ nodes });
        get().autoSave();
    },

    setEdges: (edges) => {
        const { nodes } = get();
        set({ nodes: syncNextMirrors(nodes, edges), edges });
        get().autoSave();
    },

    setMetadata: (meta) => {
        set((state) => ({ metadata: { ...state.metadata, ...meta } }));
        get().autoSave();
    },

    updateNodeDataWithMetadata: (id, data, meta) => {
        // Коалесцинг — как в updateNodeData
        const now = Date.now();
        const coalesceKey = `${id}:${Object.keys(data).sort().join(',')}`;
        const shouldCoalesce =
            lastCoalesceKey === coalesceKey && now - lastCoalesceTime < COALESCE_WINDOW_MS;
        lastCoalesceKey = coalesceKey;
        lastCoalesceTime = now;
        if (!shouldCoalesce) {
            pushHistoryEntry();
        }
        // Один set() — один проход уведомлений подписчиков
        set((state) => ({
            nodes: state.nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, ...data } as NodeData } : n,
            ),
            metadata: { ...state.metadata, ...meta },
        }));
        get().autoSave();
    },

    pushHistory: () => {
        pushHistoryEntry();
    },

    pushHistorySnapshot: (snapshot) => {
        const history = getHistory();
        history.push({
            nodes: [...snapshot.nodes],
            edges: [...snapshot.edges],
        });
        setHistory(history);
        setRedoStack([]);
    },

    undo: () => {
        const history = getHistory();
        if (history.length === 0) return;

        // Сбрасываем коалесцинг — следующая правка должна начать новый шаг
        lastCoalesceKey = null;
        lastCoalesceTime = 0;

        const { nodes, edges } = get();
        const redoStack = getRedoStack();
        redoStack.push({ nodes: [...nodes], edges: [...edges] });
        setRedoStack(redoStack);

        const prev = history.pop()!;
        set({ nodes: prev.nodes, edges: prev.edges });
        get().autoSave();
    },

    redo: () => {
        const redoStack = getRedoStack();
        if (redoStack.length === 0) return;

        // Сбрасываем коалесцинг — следующая правка должна начать новый шаг
        lastCoalesceKey = null;
        lastCoalesceTime = 0;

        const { nodes, edges } = get();
        const history = getHistory();
        history.push({ nodes: [...nodes], edges: [...edges] });
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
            const name = (n as { name?: string }).name;
            const role =
                n.type === 'command' && name === 'welcome'
                    ? 'welcome'
                    : n.type === 'command' && name === 'help'
                      ? 'help'
                      : n.type === 'command' && name === 'fallback'
                        ? 'fallback'
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

        // Нормализация переходов step: data.next без ребра → создаём ребро,
        // затем поле приводится к зеркалу рёбер (общая логика с autoLoad).
        const normalized = normalizeNextState(flowNodes, flowEdges);
        flowNodes.length = 0;
        flowNodes.push(...normalized.nodes);
        flowEdges.length = 0;
        flowEdges.push(...normalized.edges);

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

        // Сохраняем предыдущее состояние в историю — чтобы можно было отменить импорт/переключение
        pushHistoryEntry();

        set({
            nodes: flowNodes,
            edges: flowEdges,
            metadata: normalizeMetadata(doc),
        });
        get().autoSave();
    },

    autoSave: () => {
        // Откладываем сохранение для уменьшения нагрузки
        if (saveTimeout) clearTimeout(saveTimeout);
        set({ saveState: 'saving' });
        saveTimeout = setTimeout(() => {
            persistNow();
        }, SAVE_DELAY);
    },

    flushSave: () => {
        // Записываем только если есть несохранённые изменения (ждёт debounce).
        // Иначе каждое переключение вкладки писало бы одно и то же состояние.
        if (!saveTimeout) return;
        clearTimeout(saveTimeout);
        saveTimeout = null;
        persistNow();
    },

    autoLoad: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.nodes && data.edges && data.metadata) {
                // Проверка schemaVersion — если версия не поддерживается, сбрасываем
                const savedVersion = data.metadata.schemaVersion;
                if (savedVersion && savedVersion !== CURRENT_SCHEMA_VERSION) {
                    console.warn(
                        `[umbot-flow] localStorage содержит schemaVersion=${savedVersion}, ожидается ${CURRENT_SCHEMA_VERSION}. Сбрасываем состояние.`,
                    );
                    localStorage.removeItem(STORAGE_KEY);
                    return;
                }
                // Нормализация переходов из старых сохранений: data.next без ребра
                // → создаём ребро (как fromJSON), затем поле — зеркало рёбер.
                const restored = normalizeNextState(data.nodes, data.edges);
                set({
                    nodes: restored.nodes,
                    edges: restored.edges,
                    metadata: normalizeMetadata(data.metadata),
                });
            }
        } catch {
            // Corrupted data
        }
    },

    clearHistory: () => {
        undoStack = [];
        redoStackRef = [];
        lastCoalesceKey = null;
        lastCoalesceTime = 0;
    },
    };
});

// History management (outside store to avoid re-renders)
const MAX_HISTORY = 50;
let undoStack: HistoryEntry[] = [];
let redoStackRef: HistoryEntry[] = [];

/**
 * Синхронная запись текущего состояния в localStorage с честным результатом.
 *
 * При QuotaExceededError спасает место: удаляет САМЫЕ СТАРЫЕ снапшоты из истории
 * недавних проектов (umbot-flow-projects), где хранятся полные копии до 8 ботов.
 * Текущий документ (umbot-flow-editor) не трогаем — он всегда важнее истории.
 * Если после эвикции запись всё ещё не проходит — saveState='error', UI показывает
 * предупреждение с призывом экспортировать JSON.
 */
function persistNow(): void {
    const state = useFlowStore.getState();
    const data = JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        metadata: state.metadata,
    });
    try {
        localStorage.setItem(STORAGE_KEY, data);
        useFlowStore.setState({ saveState: 'saved' });
    } catch {
        // QuotaExceededError или storage unavailable. Пытаемся освободить место:
        // удаляем самые старые снапшоты истории, но не текущий проект.
        try {
            if (
                evictProjectsForSpace(
                    data.length,
                    useFlowStore.getState().metadata.name,
                )
            ) {
                localStorage.setItem(STORAGE_KEY, data);
                useFlowStore.setState({ saveState: 'saved' });
                return;
            }
        } catch {
            // эвикция сама упала — ниже переведём в 'error'
        }
        useFlowStore.setState({ saveState: 'error' });
    }
}

// Коалесцинг быстрых правок (ввод текста): окно, в котором правки
// одной ноды с одной формой патча считаются одним шагом undo
const COALESCE_WINDOW_MS = 1000;
let lastCoalesceKey: string | null = null;
let lastCoalesceTime = 0;

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
    type: NodeData['type'] | 'welcome' | 'help' | 'fallback',
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
        case 'fallback':
            return {
                type: 'command',
                id,
                name: 'fallback',
                slots: [],
                isPattern: false,
                response: { text: '', buttons: [], sounds: [] },
                role: 'fallback',
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
            return { type: 'end', id, name };
    }
}

export default useFlowStore;
