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
});
