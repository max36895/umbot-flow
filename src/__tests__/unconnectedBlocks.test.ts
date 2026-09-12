import { describe, it, expect } from 'vitest';
import { getUnconnectedBlocks, validate } from '../utils/validator';
import type { FlowDocument } from '../types/flow';

/** Минимальный валидный документ-заготовка (валидация схемы требует platforms и др.). */
function baseDoc(nodes: FlowDocument['nodes'], edges: FlowDocument['edges']): FlowDocument {
    return {
        schemaVersion: '1.0',
        name: 'test',
        version: '1.0.0',
        description: '',
        platforms: ['telegram'],
        database: { type: 'file', config: {} },
        mode: 'dev',
        isLocalStorage: true,
        fallback: { text: 'x' },
        welcome: { text: 'x', buttons: [] },
        helpText: { text: '' },
        variables: {},
        tokens: {},
        nodes,
        edges,
    };
}

describe('getUnconnectedBlocks (предупреждение ExportDialog)', () => {
    it('видит action/condition/response без входящего ребра', () => {
        const doc = baseDoc(
            [
                {
                    type: 'command',
                    id: 'cmd1',
                    name: 'start',
                    slots: ['старт'],
                    isPattern: false,
                    response: { text: 'go', buttons: [], sounds: [] },
                },
                {
                    type: 'action',
                    id: 'act1',
                    name: 'rand_action',
                    actions: [{ type: 'random_number', field: 'dice', min: 1, max: 10 }],
                    text: '',
                    buttons: [],
                },
                {
                    type: 'condition',
                    id: 'cond1',
                    name: 'check',
                    variable: 'dice',
                    operator: 'gt',
                    value: '5',
                },
            ],
            [
                // cond1 имеет вход от act1, а сам act1 — осиротевший
                { from: 'act1', to: 'cond1', type: 'next', label: '' },
            ],
        );
        expect(getUnconnectedBlocks(doc)).toEqual(['rand_action']);
    });

    it('не ругается на блоки, подключённые ребром', () => {
        const doc = baseDoc(
            [
                {
                    type: 'command',
                    id: 'cmd1',
                    name: 'start',
                    slots: ['старт'],
                    isPattern: false,
                    response: { text: 'go', buttons: [], sounds: [] },
                },
                {
                    type: 'response',
                    id: 'resp1',
                    name: 'answer',
                    response: { text: 'ok', buttons: [], sounds: [] },
                },
            ],
            [{ from: 'cmd1', to: 'resp1', type: 'next', label: '' }],
        );
        expect(getUnconnectedBlocks(doc)).toEqual([]);
    });

    it('кнопка с targetNodeId считается входом (как в CLI-генераторе)', () => {
        const doc = baseDoc(
            [
                {
                    type: 'command',
                    id: 'cmd1',
                    name: 'start',
                    slots: ['старт'],
                    isPattern: false,
                    response: {
                        text: 'go',
                        buttons: [{ title: 'Дальше', type: 'action', targetNodeId: 'resp1' }],
                        sounds: [],
                    },
                },
                {
                    type: 'response',
                    id: 'resp1',
                    name: 'answer',
                    response: { text: 'ok', buttons: [], sounds: [] },
                },
            ],
            [],
        );
        expect(getUnconnectedBlocks(doc)).toEqual([]);
    });

    it('command/step/end не попадают в список (CLI их не отбрасывает)', () => {
        const doc = baseDoc(
            [
                {
                    type: 'command',
                    id: 'cmd1',
                    name: 'solo',
                    slots: ['соло'],
                    isPattern: false,
                    response: { text: 'x', buttons: [], sounds: [] },
                },
                { type: 'end', id: 'end1', name: 'end' },
            ],
            [],
        );
        expect(getUnconnectedBlocks(doc)).toEqual([]);
        // При этом валидация по-прежнему ловит такие узлы как ORPHAN_NODE:
        const errors = validate(doc);
        expect(errors.some((e) => e.code === 'ORPHAN_NODE' && e.nodeId === 'cmd1')).toBe(
            true,
        );
    });
});
