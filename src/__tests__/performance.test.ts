import { describe, it, expect } from 'vitest';
import { validate, validateGraph } from '../utils/validator';
import type { FlowDocument, FlowNodeData, FlowEdge } from '../types/flow';

/**
 * Нагрузочный тест производительности.
 * Генерирует большой граф и замеряет время валидации и операций store.
 */

/** Базовые метаданные для валидного FlowDocument. */
function makeMetadata() {
    return {
        schemaVersion: '1.0',
        name: 'Load Test Bot',
        version: '1.0.0',
        description: '',
        platforms: ['telegram'] as FlowDocument['platforms'],
        database: { type: 'file', config: {} } as FlowDocument['database'],
        mode: 'dev' as FlowDocument['mode'],
        isLocalStorage: true,
        fallback: { text: 'Sorry' },
        welcome: { text: 'Welcome', buttons: [] },
        variables: {},
        tokens: {},
    };
}

/** Генерирует граф с N узлами разных типов и рёбрами между ними. */
function generateLargeGraph(nodeCount: number): FlowDocument {
    const nodes: FlowNodeData[] = [];
    const edges: FlowEdge[] = [];

    for (let i = 0; i < nodeCount; i++) {
        const typeIdx = i % 5;
        const type =
            typeIdx === 0
                ? 'command'
                : typeIdx === 1
                  ? 'step'
                  : typeIdx === 2
                    ? 'condition'
                    : typeIdx === 3
                      ? 'action'
                      : 'response';
        const id = `node_${i}`;

        if (type === 'command') {
            nodes.push({
                type: 'command',
                id,
                name: `Node ${i}`,
                slots: ['привет', 'здравствуй'],
                isPattern: false,
                response: {
                    text: `Ответ ${i}`,
                    buttons: [],
                    sounds: [],
                },
            } as FlowNodeData);
        } else if (type === 'step') {
            nodes.push({
                type: 'step',
                id,
                name: `Node ${i}`,
                prompt: { text: `Шаг ${i}`, buttons: [], sounds: [] },
                saveTo: `var_${i}`,
                saveAs: 'original',
            } as FlowNodeData);
        } else if (type === 'condition') {
            nodes.push({
                type: 'condition',
                id,
                name: `Node ${i}`,
                variable: `var_${i}`,
                operator: 'eq',
                value: 'test',
            } as FlowNodeData);
        } else if (type === 'action') {
            nodes.push({
                type: 'action',
                id,
                name: `Node ${i}`,
                actions: [
                    { type: 'set_variable', field: `field_${i}`, value: `value_${i}` },
                    { type: 'http_request', url: 'https://example.com', method: 'GET' },
                ],
            } as FlowNodeData);
        } else {
            nodes.push({
                type: 'response',
                id,
                name: `Node ${i}`,
                response: { text: `Ответ ${i}`, buttons: [], sounds: [] },
            } as FlowNodeData);
        }

        // Соединяем узлы последовательно
        if (i > 0) {
            const prevType = (i - 1) % 5;
            const edgeType = prevType === 2 ? 'branch_true' : 'next';
            edges.push({ from: `node_${i - 1}`, to: id, type: edgeType });
        }
    }

    return { ...makeMetadata(), nodes, edges };
}

/** Пустой документ для очистки store. */
function emptyDoc(): FlowDocument {
    return { ...makeMetadata(), nodes: [], edges: [] };
}

describe('Performance: validation', () => {
    const NODE_COUNT = 150;
    const doc = generateLargeGraph(NODE_COUNT);

    it(`validateGraph with ${NODE_COUNT} nodes completes in < 50ms`, () => {
        const start = performance.now();
        const iterations = 10;
        for (let i = 0; i < iterations; i++) {
            validateGraph(doc);
        }
        const elapsed = (performance.now() - start) / iterations;

        console.log(`  validateGraph(${NODE_COUNT} nodes): ${elapsed.toFixed(2)}ms avg`);
        expect(elapsed).toBeLessThan(50);
    });

    it(`validate (schema + graph) with ${NODE_COUNT} nodes completes in < 100ms`, () => {
        const start = performance.now();
        const iterations = 10;
        for (let i = 0; i < iterations; i++) {
            validate(doc);
        }
        const elapsed = (performance.now() - start) / iterations;

        console.log(`  validate(${NODE_COUNT} nodes): ${elapsed.toFixed(2)}ms avg`);
        expect(elapsed).toBeLessThan(100);
    });

    it(`validateGraph with 300 nodes completes in < 100ms`, () => {
        const largeDoc = generateLargeGraph(300);
        const start = performance.now();
        const iterations = 5;
        for (let i = 0; i < iterations; i++) {
            validateGraph(largeDoc);
        }
        const elapsed = (performance.now() - start) / iterations;

        console.log(`  validateGraph(300 nodes): ${elapsed.toFixed(2)}ms avg`);
        expect(elapsed).toBeLessThan(100);
    });
});

describe('Performance: flowStore operations', () => {
    it('updateNodeData with 150 nodes is fast', async () => {
        const { default: useFlowStore } = await import('../store/flowStore');
        const doc = generateLargeGraph(150);

        // Загружаем граф в store
        useFlowStore.getState().fromJSON(doc);

        const start = performance.now();
        const iterations = 50;
        for (let i = 0; i < iterations; i++) {
            useFlowStore.getState().updateNodeData('node_75', { name: `Updated ${i}` });
        }
        const elapsed = (performance.now() - start) / iterations;

        console.log(`  updateNodeData (150 nodes): ${elapsed.toFixed(2)}ms avg`);
        expect(elapsed).toBeLessThan(10);

        // Cleanup
        useFlowStore.getState().fromJSON(emptyDoc());
    });

    it('undo/redo with 150 nodes is fast', async () => {
        const { default: useFlowStore } = await import('../store/flowStore');
        const doc = generateLargeGraph(150);
        useFlowStore.getState().fromJSON(doc);

        // Делаем несколько правок
        useFlowStore.getState().updateNodeData('node_10', { name: 'Changed 1' });
        useFlowStore.getState().updateNodeData('node_20', { name: 'Changed 2' });

        const start = performance.now();
        useFlowStore.getState().undo();
        const undoTime = performance.now() - start;

        const start2 = performance.now();
        useFlowStore.getState().redo();
        const redoTime = performance.now() - start2;

        console.log(`  undo (150 nodes): ${undoTime.toFixed(2)}ms`);
        console.log(`  redo (150 nodes): ${redoTime.toFixed(2)}ms`);
        expect(undoTime).toBeLessThan(20);
        expect(redoTime).toBeLessThan(20);

        // Cleanup
        useFlowStore.getState().fromJSON(emptyDoc());
    });
});
