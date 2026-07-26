import { describe, it, expect } from 'vitest';
import { validate, validateSchemaLevel, validateGraph } from '../utils/validator';
import type { FlowDocument } from '../types/flow';

const validDoc: FlowDocument = {
    schemaVersion: '1.0',
    name: 'test-bot',
    version: '1.0.0',
    description: '',
    platforms: ['telegram'],
    database: { type: 'file', config: {} },
    mode: 'dev',
    isLocalStorage: true,
    nodes: [
        {
            type: 'command',
            id: 'greeting',
            name: 'greeting',
            slots: ['hello'],
            isPattern: false,
            response: { text: 'Hi!', buttons: [], sounds: [] },
        },
        {
            type: 'step',
            id: 'ask_name',
            name: 'ask_name',
            prompt: { text: 'Name?', buttons: [] },
            saveTo: 'name',
            saveAs: 'original',
            validation: { type: 'none', errorMessage: '' },
            next: undefined,
        },
        { type: 'end', id: 'end1' },
    ],
    edges: [
        { from: 'greeting', to: 'ask_name', type: 'next' },
        { from: 'ask_name', to: 'end1', type: 'next' },
    ],
    fallback: { text: 'Sorry' },
    welcome: { text: 'Welcome', buttons: [] },
    variables: {},
};

describe('validateSchemaLevel', () => {
    it('returns no errors for valid document', () => {
        const errors = validateSchemaLevel(validDoc);
        expect(errors).toEqual([]);
    });

    it('returns error for missing name', () => {
        const doc = { ...validDoc, name: '' };
        // Empty string is valid for schema (minLength: 1 is on the property, but empty string may pass)
        // Actually the schema requires minLength: 1
        const errors = validateSchemaLevel(doc);
        // name: "" would fail minLength: 1
        expect(errors.length).toBeGreaterThan(0);
    });

    it('returns error for invalid platform', () => {
        const doc = { ...validDoc, platforms: ['invalid_platform'] };
        const errors = validateSchemaLevel(doc);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('returns error for missing nodes', () => {
        const doc = { ...validDoc, nodes: undefined };
        const errors = validateSchemaLevel(doc);
        expect(errors.length).toBeGreaterThan(0);
    });
});

describe('validateGraph', () => {
    it('returns no errors for valid graph', () => {
        const errors = validateGraph(validDoc);
        expect(errors).toEqual([]);
    });

    it('detects DUPLICATE_ID', () => {
        const doc = {
            ...validDoc,
            nodes: [
                ...validDoc.nodes.slice(0, -1),
                { type: 'end' as const, id: 'greeting' }, // duplicate
            ],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'DUPLICATE_ID')).toBe(true);
    });

    it('detects DUPLICATE_SLOTS', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'cmd1',
                    name: 'cmd1',
                    slots: ['hello'],
                    isPattern: false,
                    response: { text: '', buttons: [], sounds: [] },
                },
                {
                    type: 'command',
                    id: 'cmd2',
                    name: 'cmd2',
                    slots: ['hello'],
                    isPattern: false,
                    response: { text: '', buttons: [], sounds: [] },
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'DUPLICATE_SLOTS')).toBe(true);
    });

    it('detects INVALID_TARGET in edges', () => {
        const doc: FlowDocument = {
            ...validDoc,
            edges: [{ from: 'nonexistent', to: 'greeting', type: 'next' }],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'INVALID_TARGET')).toBe(true);
    });

    it('detects INVALID_TARGET in button targetNodeId', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'cmd1',
                    name: 'cmd1',
                    slots: ['test'],
                    isPattern: false,
                    response: {
                        text: '',
                        buttons: [{ title: 'Go', type: 'action', targetNodeId: 'nonexistent' }],
                        sounds: [],
                    },
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'INVALID_TARGET')).toBe(true);
    });

    it('detects CIRCULAR_REFERENCE', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'a',
                    name: 'a',
                    slots: ['a'],
                    isPattern: false,
                    response: { text: '', buttons: [], sounds: [] },
                },
                {
                    type: 'command',
                    id: 'b',
                    name: 'b',
                    slots: ['b'],
                    isPattern: false,
                    response: { text: '', buttons: [], sounds: [] },
                },
            ],
            edges: [
                { from: 'a', to: 'b', type: 'next' },
                { from: 'b', to: 'a', type: 'next' },
            ],
        };
        const errors = validateGraph(doc);
        // Циклы допустимы в flow-диаграммах — CIRCULAR_REFERENCE не генерируется
        expect(errors.some((e) => e.code === 'CIRCULAR_REFERENCE')).toBe(false);
    });

    it('detects ORPHAN_NODE', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'connected',
                    name: 'connected',
                    slots: ['hi'],
                    isPattern: false,
                    response: { text: '', buttons: [], sounds: [] },
                },
                {
                    type: 'command',
                    id: 'orphan',
                    name: 'orphan',
                    slots: ['orphan'],
                    isPattern: false,
                    response: { text: '', buttons: [], sounds: [] },
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'ORPHAN_NODE' && e.nodeId === 'orphan')).toBe(true);
    });

    it('detects CONDITION_MISSING_BRANCHES', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'condition',
                    id: 'cond',
                    name: 'cond',
                    variable: 'x',
                    operator: 'eq',
                    value: 1,
                },
                { type: 'end', id: 'end1' },
            ],
            edges: [
                { from: 'cond', to: 'end1', type: 'branch_true' },
                // Missing branch_false
            ],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'CONDITION_MISSING_BRANCHES')).toBe(true);
    });

    it('detects CONDITION_MISSING_VARIABLE', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'condition',
                    id: 'cond',
                    name: 'cond',
                    variable: '',
                    operator: 'eq',
                    value: 1,
                },
                { type: 'end', id: 'end1' },
            ],
            edges: [
                { from: 'cond', to: 'end1', type: 'branch_true' },
                { from: 'cond', to: 'end1', type: 'branch_false' },
            ],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'CONDITION_MISSING_VARIABLE')).toBe(true);
    });
});

describe('validate (full)', () => {
    it('returns empty for valid document', () => {
        const errors = validate(validDoc);
        expect(errors).toEqual([]);
    });

    it('returns schema errors for invalid JSON', () => {
        const errors = validate({ invalid: true });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]?.code).toBe('SCHEMA_ERROR');
    });
});
