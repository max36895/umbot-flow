import { describe, it, expect, beforeEach } from 'vitest';
import useFlowStore from '../store/flowStore';
import type { FlowDocument, FlowNodeData as NodeData } from '../types/flow';

// Reset store between tests
beforeEach(() => {
    useFlowStore.setState({
        nodes: [],
        edges: [],
        metadata: {
            schemaVersion: '1.0',
            name: 'test',
            version: '1.0.0',
            description: '',
            platforms: ['telegram'],
            database: { type: 'file', config: {} },
            mode: 'dev',
            isLocalStorage: true,
            fallback: { text: 'Sorry' },
            welcome: { text: 'Hi', buttons: [] },
            helpText: { text: '' },
            variables: {},
            tokens: {},
        },
    });
    useFlowStore.getState().clearHistory();
    localStorage.clear();
});

describe('flowStore', () => {
    it('adds a node', () => {
        const id = useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        const nodes = useFlowStore.getState().nodes;
        expect(nodes).toHaveLength(1);
        expect(nodes[0]?.id).toBe(id);
        expect(nodes[0]?.type).toBe('command');
    });

    it('updates node data', () => {
        const id = useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        useFlowStore.getState().updateNodeData(id, { name: 'greeting' });
        const node = useFlowStore.getState().nodes.find((n) => n.id === id);
        expect(node?.data.name).toBe('greeting');
    });

    it('removes a node and its edges', () => {
        const id1 = useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        const id2 = useFlowStore.getState().addNode('step', { x: 300, y: 0 });
        useFlowStore.getState().addEdge({
            id: 'e1',
            source: id1,
            target: id2,
            type: 'flowEdge',
        });
        expect(useFlowStore.getState().edges).toHaveLength(1);

        useFlowStore.getState().removeNode(id1);
        expect(useFlowStore.getState().nodes).toHaveLength(1);
        expect(useFlowStore.getState().edges).toHaveLength(0);
    });

    it('adds an edge', () => {
        const id1 = useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        const id2 = useFlowStore.getState().addNode('step', { x: 300, y: 0 });
        useFlowStore.getState().addEdge({
            id: 'e1',
            source: id1,
            target: id2,
            type: 'flowEdge',
        });
        expect(useFlowStore.getState().edges).toHaveLength(1);
    });

    it('prevents duplicate edges', () => {
        const id1 = useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        const id2 = useFlowStore.getState().addNode('step', { x: 300, y: 0 });
        useFlowStore.getState().addEdge({
            id: 'e1',
            source: id1,
            target: id2,
            type: 'flowEdge',
        });
        useFlowStore.getState().addEdge({
            id: 'e2',
            source: id1,
            target: id2,
            type: 'flowEdge',
        });
        expect(useFlowStore.getState().edges).toHaveLength(1);
    });

    it('undo/redo works', () => {
        useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        expect(useFlowStore.getState().nodes).toHaveLength(1);

        useFlowStore.getState().undo();
        expect(useFlowStore.getState().nodes).toHaveLength(0);

        useFlowStore.getState().redo();
        expect(useFlowStore.getState().nodes).toHaveLength(1);
    });

    it('toJSON generates valid document', () => {
        useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        const doc = useFlowStore.getState().toJSON();
        expect(doc.schemaVersion).toBe('1.0');
        expect(doc.name).toBe('test');
        expect(doc.nodes).toHaveLength(1);
        expect(doc.edges).toHaveLength(0);
    });

    it('fromJSON imports correctly', () => {
        const doc: FlowDocument = {
            schemaVersion: '1.0',
            name: 'imported',
            version: '1.0.0',
            description: '',
            platforms: ['telegram'],
            database: { type: 'file', config: {} },
            mode: 'dev',
            isLocalStorage: true,
            nodes: [
                {
                    type: 'command',
                    id: 'cmd1',
                    name: 'cmd1',
                    slots: ['hello'],
                    isPattern: false,
                    response: { text: 'Hi!', buttons: [], sounds: [] },
                },
            ],
            edges: [],
            fallback: { text: 'Sorry' },
            welcome: { text: 'Welcome', buttons: [] },
            variables: {},
            tokens: {},
        };

        useFlowStore.getState().fromJSON(doc);
        expect(useFlowStore.getState().nodes).toHaveLength(1);
        expect(useFlowStore.getState().metadata.name).toBe('imported');
    });

    it('metadata updates', () => {
        useFlowStore.getState().setMetadata({ name: 'new-name' });
        expect(useFlowStore.getState().metadata.name).toBe('new-name');
    });

    it('coalesces rapid same-shape updates into one undo step', () => {
        const id = useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        // Имитация ввода текста: быстрые правки одного поля
        useFlowStore.getState().updateNodeData(id, { name: 'a' });
        useFlowStore.getState().updateNodeData(id, { name: 'ab' });
        useFlowStore.getState().updateNodeData(id, { name: 'abc' });
        expect(useFlowStore.getState().nodes[0]?.data.name).toBe('abc');

        // Один undo откатывает всю серию к исходному имени
        useFlowStore.getState().undo();
        expect(useFlowStore.getState().nodes[0]?.data.name).toBe('command');
    });

    it('does not coalesce updates with different patch shapes', () => {
        const id = useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        useFlowStore.getState().updateNodeData(id, { name: 'renamed' });
        useFlowStore.getState().updateNodeData(id, { saveTo: 'userInput' });

        // Первый undo откатывает только saveTo
        useFlowStore.getState().undo();
        expect(useFlowStore.getState().nodes[0]?.data.name).toBe('renamed');
        expect((useFlowStore.getState().nodes[0]?.data as { saveTo?: string }).saveTo).toBeUndefined();

        // Второй undo откатывает name
        useFlowStore.getState().undo();
        expect(useFlowStore.getState().nodes[0]?.data.name).toBe('command');
    });

    it('removeSelection deletes multiple nodes and connected edges in one undo step', () => {
        const a = useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        const b = useFlowStore.getState().addNode('step', { x: 100, y: 0 });
        const c = useFlowStore.getState().addNode('response', { x: 200, y: 0 });
        useFlowStore.getState().addEdge({
            id: 'e1',
            source: a,
            target: b,
            type: 'flowEdge',
            data: { edgeType: 'next', label: '' },
        });
        useFlowStore.getState().addEdge({
            id: 'e2',
            source: b,
            target: c,
            type: 'flowEdge',
            data: { edgeType: 'next', label: '' },
        });

        useFlowStore.getState().removeSelection([a, b], []);

        // Удалены обе ноды и оба ребра (e2 — потому что source удалён)
        expect(useFlowStore.getState().nodes).toHaveLength(1);
        expect(useFlowStore.getState().nodes[0]?.id).toBe(c);
        expect(useFlowStore.getState().edges).toHaveLength(0);

        // Один undo восстанавливает всё
        useFlowStore.getState().undo();
        expect(useFlowStore.getState().nodes).toHaveLength(3);
        expect(useFlowStore.getState().edges).toHaveLength(2);
    });

    it('removeSelection with empty lists is a no-op', () => {
        useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        useFlowStore.getState().removeSelection([], []);
        expect(useFlowStore.getState().nodes).toHaveLength(1);
    });

    // --- Синхронизация поля «Следующий блок» ↔ ребро next (data.next — зеркало ребра) ---

    it('setNextTarget создаёт ребро next и поле data.next', () => {
        const step = useFlowStore.getState().addNode('step', { x: 0, y: 0 });
        const target = useFlowStore.getState().addNode('response', { x: 300, y: 0 });

        useFlowStore.getState().setNextTarget(step, target);

        const edges = useFlowStore.getState().edges;
        expect(edges).toHaveLength(1);
        expect(edges[0]?.source).toBe(step);
        expect(edges[0]?.target).toBe(target);
        expect(
            (edges[0]?.data as { edgeType?: string } | undefined)?.edgeType,
        ).toBe('next');
        const stepData = useFlowStore
            .getState()
            .nodes.find((n) => n.id === step)?.data as { next?: string };
        expect(stepData.next).toBe(target);
    });

    it('setNextTarget заменяет существующий переход (шаг = один next)', () => {
        const step = useFlowStore.getState().addNode('step', { x: 0, y: 0 });
        const first = useFlowStore.getState().addNode('response', { x: 300, y: 0 });
        const second = useFlowStore.getState().addNode('response', { x: 600, y: 0 });

        useFlowStore.getState().setNextTarget(step, first);
        useFlowStore.getState().setNextTarget(step, second);

        const edges = useFlowStore.getState().edges;
        expect(edges).toHaveLength(1);
        expect(edges[0]?.target).toBe(second);
        const stepData = useFlowStore
            .getState()
            .nodes.find((n) => n.id === step)?.data as { next?: string };
        expect(stepData.next).toBe(second);
    });

    it('setNextTarget(null) удаляет ребро и очищает поле', () => {
        const step = useFlowStore.getState().addNode('step', { x: 0, y: 0 });
        const target = useFlowStore.getState().addNode('response', { x: 300, y: 0 });

        useFlowStore.getState().setNextTarget(step, target);
        useFlowStore.getState().setNextTarget(step, null);

        expect(useFlowStore.getState().edges).toHaveLength(0);
        const stepData = useFlowStore
            .getState()
            .nodes.find((n) => n.id === step)?.data as { next?: string };
        expect(stepData.next).toBeUndefined();
    });

    it('удаление ребра next (setEdges) очищает зеркальное data.next', () => {
        const step = useFlowStore.getState().addNode('step', { x: 0, y: 0 });
        const target = useFlowStore.getState().addNode('response', { x: 300, y: 0 });
        useFlowStore.getState().setNextTarget(step, target);
        expect(useFlowStore.getState().edges).toHaveLength(1);

        // React Flow удаляет рёбра через applyEdgeChanges → setEdges([])
        useFlowStore.getState().setEdges([]);

        const stepData = useFlowStore
            .getState()
            .nodes.find((n) => n.id === step)?.data as { next?: string };
        expect(stepData.next).toBeUndefined();
    });

    it('удаление целевой ноды очищает data.next у ссылающегося шага', () => {
        const step = useFlowStore.getState().addNode('step', { x: 0, y: 0 });
        const target = useFlowStore.getState().addNode('response', { x: 300, y: 0 });
        useFlowStore.getState().setNextTarget(step, target);

        useFlowStore.getState().removeNode(target);

        const stepData = useFlowStore
            .getState()
            .nodes.find((n) => n.id === step)?.data as { next?: string };
        expect(stepData.next).toBeUndefined();
        expect(useFlowStore.getState().edges).toHaveLength(0);
    });

    it('fromJSON восстанавливает ребро из data.next без ребра (старые документы)', () => {
        const stepId = 'step_1';
        const respId = 'resp_1';
        const doc: FlowDocument = {
            schemaVersion: '1.0',
            name: 'legacy',
            version: '1.0.0',
            description: '',
            platforms: ['telegram'],
            database: { type: 'file', config: {} },
            mode: 'dev',
            isLocalStorage: true,
            fallback: { text: '' },
            welcome: { text: '', buttons: [] },
            helpText: { text: '' },
            variables: {},
            nodes: [
                {
                    type: 'step',
                    id: stepId,
                    name: 'ask',
                    prompt: { text: 'q', buttons: [] },
                    saveTo: 'x',
                    saveAs: 'original',
                    next: respId,
                },
                {
                    type: 'response',
                    id: respId,
                    name: 'answer',
                    response: { text: 'a', buttons: [], sounds: [] },
                },
            ],
            edges: [],
        };

        useFlowStore.getState().fromJSON(doc);

        const edges = useFlowStore.getState().edges;
        expect(edges).toHaveLength(1);
        expect(edges[0]?.source).toBe(stepId);
        expect(edges[0]?.target).toBe(respId);
        expect(
            (edges[0]?.data as { edgeType?: string } | undefined)?.edgeType,
        ).toBe('next');
    });

    it('undo откатывает и ребро, и поле data.next (единый шаг истории)', () => {
        const step = useFlowStore.getState().addNode('step', { x: 0, y: 0 });
        const target = useFlowStore.getState().addNode('response', { x: 300, y: 0 });

        useFlowStore.getState().setNextTarget(step, target);
        useFlowStore.getState().undo();

        expect(useFlowStore.getState().edges).toHaveLength(0);
        const stepData = useFlowStore
            .getState()
            .nodes.find((n) => n.id === step)?.data as { next?: string };
        expect(stepData.next).toBeUndefined();
    });

    it('autoLoad нормализует data.next без ребра из старых сохранений', () => {
        // Имитируем сохранение ДО фикса: data.next есть, ребра нет
        useFlowStore.setState({
            nodes: [
                {
                    id: 's1',
                    type: 'step',
                    position: { x: 0, y: 0 },
                    data: {
                        type: 'step',
                        id: 's1',
                        name: 'ask',
                        prompt: { text: 'q', buttons: [] },
                        saveTo: 'x',
                        saveAs: 'original',
                        next: 'r1',
                    },
                },
                {
                    id: 'r1',
                    type: 'response',
                    position: { x: 300, y: 0 },
                    data: {
                        type: 'response',
                        id: 'r1',
                        name: 'answer',
                        response: { text: 'a', buttons: [], sounds: [] },
                    },
                },
            ],
            edges: [],
        });
        localStorage.setItem(
            'umbot-flow-editor',
            JSON.stringify({
                nodes: useFlowStore.getState().nodes,
                edges: [],
                metadata: {
                    schemaVersion: '1.0',
                    name: 'legacy',
                    version: '1.0.0',
                    description: '',
                    platforms: ['telegram'],
                    database: { type: 'file', config: {} },
                    mode: 'dev',
                    isLocalStorage: true,
                    fallback: { text: '' },
                    welcome: { text: '', buttons: [] },
                    helpText: { text: '' },
                    variables: {},
                },
            }),
        );

        useFlowStore.setState({ nodes: [], edges: [] });
        useFlowStore.getState().autoLoad();

        // Ребро восстановлено из data.next — переход снова работает в превью
        const edges = useFlowStore.getState().edges;
        expect(edges).toHaveLength(1);
        expect(edges[0]?.source).toBe('s1');
        expect(edges[0]?.target).toBe('r1');
    });

    it('autoLoad очищает data.next с висячей целью (нода удалена в другом месте)', () => {
        useFlowStore.setState({
            nodes: [
                {
                    id: 's1',
                    type: 'step',
                    position: { x: 0, y: 0 },
                    data: {
                        type: 'step',
                        id: 's1',
                        name: 'ask',
                        prompt: { text: 'q', buttons: [] },
                        saveTo: 'x',
                        saveAs: 'original',
                        next: 'ghost',
                    },
                },
            ],
            edges: [],
        });
        localStorage.setItem(
            'umbot-flow-editor',
            JSON.stringify({
                nodes: useFlowStore.getState().nodes,
                edges: [],
                metadata: {
                    schemaVersion: '1.0',
                    name: 'legacy',
                    version: '1.0.0',
                    description: '',
                    platforms: ['telegram'],
                    database: { type: 'file', config: {} },
                    mode: 'dev',
                    isLocalStorage: true,
                    fallback: { text: '' },
                    welcome: { text: '', buttons: [] },
                    helpText: { text: '' },
                    variables: {},
                },
            }),
        );

        useFlowStore.setState({ nodes: [], edges: [] });
        useFlowStore.getState().autoLoad();

        const stepData = useFlowStore.getState().nodes[0]?.data as { next?: string };
        expect(stepData.next).toBeUndefined();
    });

    it('pasteNode не наследует data.next оригинала', () => {
        const step = useFlowStore.getState().addNode('step', { x: 0, y: 0 });
        const target = useFlowStore.getState().addNode('response', { x: 300, y: 0 });
        useFlowStore.getState().setNextTarget(step, target);

        const sourceData = useFlowStore
            .getState()
            .nodes.find((n) => n.id === step)?.data as NodeData;
        const newId = useFlowStore.getState().pasteNode(sourceData, { x: 100, y: 100 });

        const pasted = useFlowStore
            .getState()
            .nodes.find((n) => n.id === newId)?.data as { next?: string };
        expect(pasted.next).toBeUndefined();
    });
});
