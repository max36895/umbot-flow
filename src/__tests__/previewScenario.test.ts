import { describe, it, expect, beforeEach } from 'vitest';
import { buildInitialTurn } from '../components/Preview/ChatPreview';
import { buildStarterDocument } from '../utils/starterDoc';
import { setLocale } from '../i18n';
import type { FlowDocument, CommandNodeData, StepNodeData } from '../types/flow';

/**
 * Тесты начального хода превью: Welcome обязан проигрывать свою цепочку
 * до первого Step, иначе первый ответ пользователя уходит в fallback.
 */
const starterDoc: FlowDocument = {
    schemaVersion: '1.0',
    name: 'starter',
    version: '1.0.0',
    description: '',
    platforms: ['telegram'],
    database: { type: 'file', config: {} },
    mode: 'dev',
    isLocalStorage: true,
    nodes: [
        {
            type: 'command',
            id: 'welcome',
            name: 'welcome',
            slots: [],
            isPattern: false,
            response: { text: 'Привет! Как тебя зовут?', buttons: [], sounds: [] },
            role: 'welcome',
        },
        {
            type: 'step',
            id: 'ask_name',
            name: 'ask_name',
            prompt: { text: 'Напишите ваше имя:', buttons: [] },
            saveTo: 'userName',
            saveAs: 'original',
        },
        {
            type: 'condition',
            id: 'check',
            name: 'check',
            variable: 'userName',
            operator: 'isNotEmpty',
            value: '',
        },
        {
            type: 'response',
            id: 'greet',
            name: 'greet',
            response: { text: 'Привет, {{userName}}!', buttons: [], sounds: [] },
        },
        { type: 'end', id: 'end1' },
    ],
    edges: [
        { from: 'welcome', to: 'ask_name', type: 'next' },
        { from: 'ask_name', to: 'check', type: 'next' },
        { from: 'check', to: 'greet', type: 'branch_true' },
        { from: 'check', to: 'end1', type: 'branch_false' },
    ],
    fallback: { text: 'Не понял' },
    welcome: { text: 'Meta welcome', buttons: [] },
    variables: {},
};

describe('buildInitialTurn (превью: начальный ход от Welcome)', () => {
    it('проигрывает цепочку Welcome → Step и встаёт в ожидание ввода', () => {
        const turn = buildInitialTurn(starterDoc);

        // Оба сообщения: welcome-текст + prompt шага
        expect(turn.msgs).toHaveLength(2);
        expect(turn.msgs[0]?.text).toBe('Привет! Как тебя зовут?');
        expect(turn.msgs[1]?.text).toBe('Напишите ваше имя:');

        // Ключевое: Step ждёт ввод — иначе первый ответ уйдёт в fallback
        expect(turn.waitStep).toBe('ask_name');
    });

    it('не выходит за Step: condition/response в начальной цепочке не выполняются', () => {
        const turn = buildInitialTurn(starterDoc);
        // condition идёт ПОСЛЕ step — не должен был выполниться
        expect(turn.msgs.some((m) => m.text.includes('Привет,'))).toBe(false);
    });

    it('Welcome без next-рёбер: только текст, без ожидания', () => {
        const doc: FlowDocument = {
            ...starterDoc,
            edges: [],
            nodes: starterDoc.nodes.slice(0, 1),
        };
        const turn = buildInitialTurn(doc);
        expect(turn.msgs).toHaveLength(1);
        expect(turn.waitStep).toBeNull();
    });

    it('Welcome → Action → Step: action-текст и шаг выполняются', () => {
        const doc: FlowDocument = {
            ...starterDoc,
            nodes: [
                starterDoc.nodes[0] as CommandNodeData,
                {
                    type: 'action',
                    id: 'act1',
                    name: 'act1',
                    actions: [{ type: 'random_number', field: 'dice', min: 1, max: 6 }],
                    text: 'Бросаю кубик...',
                    buttons: [],
                },
                starterDoc.nodes[1] as StepNodeData,
            ],
            edges: [
                { from: 'welcome', to: 'act1', type: 'next' },
                { from: 'act1', to: 'ask_name', type: 'next' },
            ],
        };
        const turn = buildInitialTurn(doc);
        expect(turn.msgs.map((m) => m.text)).toEqual([
            'Привет! Как тебя зовут?',
            'Бросаю кубик...',
            'Напишите ваше имя:',
        ]);
        expect(turn.waitStep).toBe('ask_name');
        // random_number выполнился в начальной цепочке
        expect(turn.vars.dice).toBeDefined();
    });

    it('Welcome → Condition (без шагов): идёт по branch_false, не падает', () => {
        const doc: FlowDocument = {
            ...starterDoc,
            nodes: [starterDoc.nodes[0] as CommandNodeData, starterDoc.nodes[2]!],
            edges: [{ from: 'welcome', to: 'check', type: 'next' }],
        };
        const turn = buildInitialTurn(doc);
        // Переменная пуста → isNotEmpty false → branch_false → end
        expect(turn.msgs).toHaveLength(1);
        expect(turn.waitStep).toBeNull();
    });

    it('без Welcome-ноды использует текст welcome из metadata', () => {
        const doc: FlowDocument = {
            ...starterDoc,
            nodes: [starterDoc.nodes[1] as StepNodeData],
            edges: [],
        };
        const turn = buildInitialTurn(doc);
        expect(turn.msgs).toHaveLength(1);
        expect(turn.msgs[0]?.text).toBe('Meta welcome');
        expect(turn.waitStep).toBeNull();
    });

    it('бесконечный цикл рёбер останавливается предохранителем', () => {
        // a → b → a (цикл без Step)
        const doc: FlowDocument = {
            ...starterDoc,
            nodes: [
                starterDoc.nodes[0] as CommandNodeData,
                {
                    type: 'response',
                    id: 'r1',
                    name: 'r1',
                    response: { text: 'r1', buttons: [], sounds: [] },
                },
                {
                    type: 'response',
                    id: 'r2',
                    name: 'r2',
                    response: { text: 'r2', buttons: [], sounds: [] },
                },
            ],
            edges: [
                { from: 'welcome', to: 'r1', type: 'next' },
                { from: 'r1', to: 'r2', type: 'next' },
                { from: 'r2', to: 'r1', type: 'next' },
            ],
        };
        const turn = buildInitialTurn(doc);
        // Предохранитель safety < 50 — не зависает, возвращает что успело
        expect(turn.msgs.length).toBeLessThan(60);
    });
});

describe('buildStarterDocument (локализация демо-контента)', () => {
    beforeEach(() => {
        setLocale('ru');
    });

    it('RU-локаль: демо-тексты на русском', () => {
        const doc = buildStarterDocument('ru');
        const welcome = doc.nodes[0] as CommandNodeData;
        expect(welcome.response.text).toContain('демо-бот');
        expect(doc.fallback.text).toContain('Извините');
    });

    it('EN-локаль: демо-тексты на английском', () => {
        const doc = buildStarterDocument('en');
        const welcome = doc.nodes[0] as CommandNodeData;
        expect(welcome.response.text).toContain('demo bot');
        expect(doc.fallback.text).toContain("Sorry");
    });

    it('структура стартера идентична в обеих локалях', () => {
        const ru = buildStarterDocument('ru');
        const en = buildStarterDocument('en');
        expect(ru.nodes.map((n) => n.id)).toEqual(en.nodes.map((n) => n.id));
        expect(ru.edges).toEqual(en.edges);
        expect(ru.nodes[1]).toMatchObject({ saveTo: 'userName' });
        expect(en.nodes[1]).toMatchObject({ saveTo: 'userName' });
    });

    it('стартер совместим с buildInitialTurn: встаёт в ожидание имени', () => {
        setLocale('ru');
        const doc = buildStarterDocument('ru');
        const turn = buildInitialTurn(doc);
        expect(turn.waitStep).toBe('ask_name');
        expect(turn.msgs.length).toBe(2);
    });
});
