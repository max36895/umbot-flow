import { describe, it, expect } from 'vitest';
import { validate, validateSchemaLevel, validateGraph, getFlowWarnings } from '../utils/validator';
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
        // Циклы через команды/шаги допустимы — переход идёт через thisIntentName
        expect(errors.some((e) => e.code === 'CIRCULAR_REFERENCE')).toBe(false);
        expect(errors.some((e) => e.code === 'BLOCK_CYCLE')).toBe(false);
    });

    it('detects BLOCK_CYCLE: цикл только из ответов/условий (CLI отклоняет такой flow)', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'start',
                    name: 'start',
                    slots: ['go'],
                    isPattern: false,
                    response: { text: '', buttons: [], sounds: [] },
                },
                {
                    type: 'response',
                    id: 'r1',
                    name: 'room',
                    response: { text: 'Комната', buttons: [], sounds: [] },
                },
                {
                    type: 'response',
                    id: 'r2',
                    name: 'hall',
                    response: { text: 'Коридор', buttons: [], sounds: [] },
                },
            ],
            edges: [
                { from: 'start', to: 'r1', type: 'next' },
                { from: 'r1', to: 'r2', type: 'next' },
                { from: 'r2', to: 'r1', type: 'next' },
            ],
        };
        const cycle = validateGraph(doc).filter((e) => e.code === 'BLOCK_CYCLE');
        expect(cycle).toHaveLength(1);
        expect(cycle[0]?.message).toContain('room → hall → room');
    });

    it('BLOCK_CYCLE не срабатывает, если цикл проходит через шаг', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                ...validDoc.nodes.slice(0, 2),
                {
                    type: 'response',
                    id: 'again',
                    name: 'again',
                    response: { text: 'Ещё раз', buttons: [], sounds: [] },
                },
            ],
            edges: [
                { from: 'greeting', to: 'ask_name', type: 'next' },
                { from: 'ask_name', to: 'again', type: 'next' },
                { from: 'again', to: 'ask_name', type: 'next' },
            ],
        };
        expect(validateGraph(doc).some((e) => e.code === 'BLOCK_CYCLE')).toBe(false);
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
                    slots: [],
                    isPattern: false,
                    response: { text: '', buttons: [], sounds: [] },
                },
                {
                    type: 'response',
                    id: 'lost',
                    name: 'lost',
                    response: { text: 'x', buttons: [], sounds: [] },
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        // Команда без слотов и без связей недостижима — сирота
        expect(errors.some((e) => e.code === 'ORPHAN_NODE' && e.nodeId === 'orphan')).toBe(true);
        expect(errors.some((e) => e.code === 'ORPHAN_NODE' && e.nodeId === 'lost')).toBe(true);
    });

    it('команда со слотами без связей — не сирота: бот запускает её по слову-триггеру', () => {
        // Регрессия: FAQ-бот из отдельных команд и секрет «конец связи» в UM-13 блокировали экспорт
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'prices',
                    name: 'prices',
                    slots: ['цены'],
                    isPattern: false,
                    response: { text: 'Пицца — 500 ₽', buttons: [], sounds: [] },
                },
                {
                    type: 'command',
                    id: 'address',
                    name: 'address',
                    slots: ['адрес'],
                    isPattern: false,
                    response: { text: 'ул. Флоу, 13', buttons: [], sounds: [] },
                },
            ],
            edges: [],
        };
        expect(validateGraph(doc).some((e) => e.code === 'ORPHAN_NODE')).toBe(false);
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

    it('условие «согласие/отказ/ссылка» без переменной проверяет ввод — не ошибка', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                ...validDoc.nodes,
                {
                    type: 'condition',
                    id: 'yes',
                    name: 'yes',
                    variable: '',
                    operator: 'isSayTrue',
                    value: '',
                },
            ],
            edges: [
                ...validDoc.edges,
                { from: 'ask_name', to: 'yes', type: 'next' },
                { from: 'yes', to: 'end1', type: 'branch_true' },
                { from: 'yes', to: 'end1', type: 'branch_false' },
            ],
        };
        expect(validateGraph(doc).some((e) => e.code === 'CONDITION_MISSING_VARIABLE')).toBe(false);
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

describe('Action block validation (extended)', () => {
    it('catches random_number min > max', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'action',
                    id: 'act1',
                    name: 'action1',
                    actions: [{ type: 'random_number', field: 'rand', min: 100, max: 1 }],
                    text: '',
                    buttons: [],
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'RANDOM_MIN_GT_MAX')).toBe(true);
    });

    it('passes random_number with valid min/max', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'action',
                    id: 'act1',
                    name: 'action1',
                    actions: [{ type: 'random_number', field: 'rand', min: 1, max: 100 }],
                    text: 'ok',
                    buttons: [],
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'RANDOM_MIN_GT_MAX')).toBe(false);
    });

    it('catches http_request with invalid JSON body (no vars)', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'action',
                    id: 'act1',
                    name: 'action1',
                    actions: [
                        {
                            type: 'http_request',
                            url: 'https://api.example.com',
                            method: 'POST',
                            body: '{"key": }',
                        },
                    ],
                    text: '',
                    buttons: [],
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'INVALID_JSON_BODY')).toBe(true);
    });

    it('passes http_request with template variables in body', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'action',
                    id: 'act1',
                    name: 'action1',
                    actions: [
                        {
                            type: 'http_request',
                            url: 'https://api.example.com',
                            method: 'POST',
                            body: '{"name": "{{userName}}"}',
                        },
                    ],
                    text: '',
                    buttons: [],
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'INVALID_JSON_BODY')).toBe(false);
    });

    it('catches set_variable with whitespace-only value', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'action',
                    id: 'act1',
                    name: 'action1',
                    actions: [{ type: 'set_variable', field: 'x', value: '   ' }],
                    text: '',
                    buttons: [],
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'ACTION_MISSING_VALUE')).toBe(true);
    });

    it('catches set_variable in inline command actions with whitespace', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'cmd1',
                    name: 'cmd1',
                    slots: ['go'],
                    isPattern: false,
                    response: { text: 'ok', buttons: [], sounds: [] },
                    actions: [{ type: 'set_variable', field: 'x', value: '  ' }],
                },
            ],
            edges: [],
        };
        const errors = validateGraph(doc);
        expect(errors.some((e) => e.code === 'ACTION_MISSING_VALUE')).toBe(true);
    });
});

describe('ValidationError.field — для подсветки полей в UI', () => {
    it('EMPTY_NAME помечает field=name', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'c1',
                    name: '',
                    slots: ['go'],
                    isPattern: false,
                    response: { text: 'ok', buttons: [], sounds: [] },
                },
            ],
            edges: [],
        };
        const err = validateGraph(doc).find((e) => e.code === 'EMPTY_NAME');
        expect(err).toBeDefined();
        expect(err?.field).toBe('name');
        expect(err?.nodeId).toBe('c1');
    });

    it('DUPLICATE_NAMES помечает field=name', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'c1',
                    name: 'same',
                    slots: ['a'],
                    isPattern: false,
                    response: { text: 'x', buttons: [], sounds: [] },
                },
                {
                    type: 'step',
                    id: 's1',
                    name: 'same',
                    prompt: { text: 'q', buttons: [] },
                    saveTo: 'x',
                    saveAs: 'original',
                },
            ],
            edges: [{ from: 'c1', to: 's1', type: 'next' }],
        };
        const err = validateGraph(doc).find((e) => e.code === 'DUPLICATE_NAMES');
        expect(err?.field).toBe('name');
    });

    it('INVALID_VAR_NAME для saveTo помечает field=saveTo', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'step',
                    id: 's1',
                    name: 's1',
                    prompt: { text: 'q', buttons: [] },
                    saveTo: '123invalid',
                    saveAs: 'original',
                },
            ],
            edges: [],
        };
        const err = validateGraph(doc).find((e) => e.code === 'INVALID_VAR_NAME');
        expect(err?.field).toBe('saveTo');
    });

    it('ACTION_MISSING_VALUE помечает field=actions', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'c1',
                    name: 'c1',
                    slots: ['go'],
                    isPattern: false,
                    response: { text: 'ok', buttons: [], sounds: [] },
                    actions: [{ type: 'set_variable', field: 'x', value: '' }],
                },
            ],
            edges: [],
        };
        const err = validateGraph(doc).find((e) => e.code === 'ACTION_MISSING_VALUE');
        expect(err?.field).toBe('actions');
    });

    it('RANDOM_MIN_GT_MAX помечает field=actions', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'action',
                    id: 'a1',
                    name: 'a1',
                    actions: [{ type: 'random_number', field: 'r', min: 100, max: 1 }],
                    text: '',
                    buttons: [],
                },
            ],
            edges: [],
        };
        const err = validateGraph(doc).find((e) => e.code === 'RANDOM_MIN_GT_MAX');
        expect(err?.field).toBe('actions');
    });

    it('CONDITION_MISSING_VARIABLE для standalone condition помечает field=variable', () => {
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
                { type: 'end', id: 'e1' },
                { type: 'end', id: 'e2' },
            ],
            edges: [
                { from: 'cond', to: 'e1', type: 'branch_true' },
                { from: 'cond', to: 'e2', type: 'branch_false' },
            ],
        };
        const err = validateGraph(doc).find((e) => e.code === 'CONDITION_MISSING_VARIABLE');
        expect(err?.field).toBe('variable');
    });

    it('DUPLICATE_SLOTS помечает field=slots', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'c1',
                    name: 'c1',
                    slots: ['hi'],
                    isPattern: false,
                    response: { text: 'a', buttons: [], sounds: [] },
                },
                {
                    type: 'command',
                    id: 'c2',
                    name: 'c2',
                    slots: ['hi'],
                    isPattern: false,
                    response: { text: 'b', buttons: [], sounds: [] },
                },
            ],
            edges: [],
        };
        const err = validateGraph(doc).find((e) => e.code === 'DUPLICATE_SLOTS');
        expect(err?.field).toBe('slots');
    });
});

describe('DUPLICATE_SANITIZED_NAMES (collisions after sanitizeIdentifier)', () => {
    const node = (id: string, name: string) => ({
        type: 'command' as const,
        id,
        name,
        slots: ['x'],
        isPattern: false,
        response: { text: 'a', buttons: [], sounds: [] },
    });

    it('flags names that differ only by characters sanitized to underscore', () => {
        // «my cmd» и «my-cmd» → оба становятся my_cmd в сгенерированном коде
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [node('c1', 'my cmd'), node('c2', 'my-cmd')],
            edges: [],
        };
        const errors = validateGraph(doc).filter((e) => e.code === 'DUPLICATE_SANITIZED_NAMES');
        expect(errors).toHaveLength(1);
        expect(errors[0]?.nodeId).toBe('c2');
        expect(errors[0]?.field).toBe('name');
        expect(errors[0]?.message).toContain('my_cmd');
    });

    it('does not flag unique sanitized names', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [node('c1', 'my cmd'), node('c2', 'other')],
            edges: [],
        };
        const errors = validateGraph(doc).filter((e) => e.code === 'DUPLICATE_SANITIZED_NAMES');
        expect(errors).toHaveLength(0);
    });

    it('underscore in original name collides with space in another (my_cmd vs my cmd)', () => {
        // sanitizeIdentifier сохраняет «_» и заменяет пробел на «_»: оба имени → my_cmd
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [node('c1', 'my cmd'), node('c2', 'my_cmd')],
            edges: [],
        };
        const errors = validateGraph(doc).filter((e) => e.code === 'DUPLICATE_SANITIZED_NAMES');
        expect(errors).toHaveLength(1);
    });

    it('cyrillic letters are preserved by sanitizer (no false collision with underscores)', () => {
        // Кириллица — это \\p{L}: sanitizeIdentifier её сохраняет, «блок» ≠ «____»
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [node('c1', 'блок'), node('c2', '____')],
            edges: [],
        };
        const errors = validateGraph(doc).filter((e) => e.code === 'DUPLICATE_SANITIZED_NAMES');
        expect(errors).toHaveLength(0);
    });

    it('three-way collision reports each node after the first', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [node('c1', 'a b'), node('c2', 'a-b'), node('c3', 'a.b')],
            edges: [],
        };
        const errors = validateGraph(doc).filter((e) => e.code === 'DUPLICATE_SANITIZED_NAMES');
        expect(errors.map((e) => e.nodeId)).toEqual(['c2', 'c3']);
    });

    it('role nodes (welcome/help/fallback) are excluded from the check', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [
                { ...node('w1', 'welcome'), role: 'welcome' },
                node('c1', 'welcome'), // обычная команда с тем же sanitized именем
            ],
            edges: [],
        };
        const errors = validateGraph(doc).filter((e) => e.code === 'DUPLICATE_SANITIZED_NAMES');
        expect(errors).toHaveLength(0);
    });
});

describe('getFlowWarnings (как поведёт себя сгенерированный бот)', () => {
    const response = (id: string, text: string, targetNodeId?: string) => ({
        type: 'response' as const,
        id,
        name: id,
        response: {
            text,
            buttons: targetNodeId
                ? [{ title: 'Дальше', type: 'action' as const, targetNodeId }]
                : [],
            sounds: [],
        },
    });
    const command = (text: string) => ({
        type: 'command' as const,
        id: 'cmd',
        name: 'cmd',
        slots: ['go'],
        isPattern: false,
        response: { text, buttons: [], sounds: [] },
    });

    it('MULTIPLE_NEXT: несколько next из одного блока', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [command(''), response('a', 'A'), response('b', 'B'), response('c', 'C')],
            edges: [
                { from: 'cmd', to: 'a', type: 'next' },
                { from: 'a', to: 'b', type: 'next' },
                { from: 'a', to: 'c', type: 'next' },
            ],
        };
        const warnings = getFlowWarnings(doc);
        expect(warnings.map((w) => [w.code, w.nodeId])).toEqual([['MULTIPLE_NEXT', 'a']]);
    });

    it('COMMAND_TEXT_HIDDEN: текст команды перекрыт связанным ответом', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [command('Привет'), response('a', 'Ответ')],
            edges: [{ from: 'cmd', to: 'a', type: 'next' }],
        };
        expect(getFlowWarnings(doc).map((w) => w.code)).toEqual(['COMMAND_TEXT_HIDDEN']);
    });

    it('COMMAND_TEXT_HIDDEN не срабатывает, если у команды нет текста', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [command(''), response('a', 'Ответ')],
            edges: [{ from: 'cmd', to: 'a', type: 'next' }],
        };
        expect(getFlowWarnings(doc)).toEqual([]);
    });

    it('кнопка с переходом: блок-цель не сирота и без предупреждений', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [command(''), response('a', 'Ответ', 'b'), response('b', 'B')],
            edges: [{ from: 'cmd', to: 'a', type: 'next' }],
        };
        expect(getFlowWarnings(doc)).toEqual([]);
        expect(validateGraph(doc).some((e) => e.code === 'ORPHAN_NODE')).toBe(false);
    });

    it('INVALID_TARGET: кнопка ответа ведёт на несуществующий блок', () => {
        const doc: FlowDocument = {
            ...validDoc,
            nodes: [command(''), response('a', 'Ответ', 'missing')],
            edges: [{ from: 'cmd', to: 'a', type: 'next' }],
        };
        const errors = validateGraph(doc).filter((e) => e.code === 'INVALID_TARGET');
        expect(errors.map((e) => e.nodeId)).toEqual(['a']);
    });
});
