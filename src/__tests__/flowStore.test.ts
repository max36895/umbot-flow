import { describe, it, expect, beforeEach } from 'vitest';
import useFlowStore from '../store/flowStore';
import type { FlowDocument } from '../types/flow';

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
});
