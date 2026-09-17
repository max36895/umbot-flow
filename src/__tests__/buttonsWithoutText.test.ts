import { describe, it, expect, beforeEach } from 'vitest';
import { getFlowWarnings } from '../utils/validator';
import { setLocale } from '../i18n';
import type { FlowDocument, FlowNodeData, FlowEdge } from '../types/flow';

/**
 * Кнопки без текста ответа: Telegram не отправляет сообщение без текста (кнопки пропадают),
 * Алиса получает пустой ответ, а превью показывало кнопки — предупреждение BUTTONS_WITHOUT_TEXT.
 */

function makeDoc(nodes: FlowNodeData[], edges: FlowEdge[] = []): FlowDocument {
    return {
        schemaVersion: '1.0',
        name: 'test',
        version: '1.0.0',
        description: '',
        platforms: ['telegram'],
        database: { type: 'file', config: {} },
        mode: 'prod',
        isLocalStorage: true,
        nodes,
        edges,
        fallback: { text: 'Не понял' },
        welcome: { text: '', buttons: [] },
        helpText: { text: '' },
        variables: {},
    };
}

const btn = (title: string) => ({ title, type: 'action' as const });

const command = (id: string, text: string, buttons: string[] = []): FlowNodeData => ({
    type: 'command',
    id,
    name: id,
    slots: [id],
    isPattern: false,
    response: { text, buttons: buttons.map(btn), sounds: [] },
});

const response = (id: string, text: string, buttons: string[] = []): FlowNodeData => ({
    type: 'response',
    id,
    name: id,
    response: { text, buttons: buttons.map(btn), sounds: [] },
});

const codes = (doc: FlowDocument) =>
    getFlowWarnings(doc)
        .filter((w) => w.code === 'BUTTONS_WITHOUT_TEXT')
        .map((w) => w.nodeId ?? 'welcome-settings');

describe('getFlowWarnings: BUTTONS_WITHOUT_TEXT', () => {
    beforeEach(() => setLocale('ru'));

    it('команда с кнопками без текста', () => {
        expect(codes(makeDoc([command('menu', '', ['Пицца'])]))).toEqual(['menu']);
    });

    it('текст есть у самой ноды или у TTS — предупреждения нет', () => {
        const withTts: FlowNodeData = {
            ...command('voice', '', ['Да']),
            response: { text: '', tts: 'Скажите да', buttons: [btn('Да')], sounds: [] },
        } as FlowNodeData;
        expect(codes(makeDoc([command('menu', 'Выберите', ['Пицца']), withTts]))).toEqual([]);
    });

    it('текст приходит в то же сообщение от связанного блока или от вызывающей ноды', () => {
        // Команда с текстом → ответ только с кнопками: одно сообщение, текст есть
        const fromCaller = makeDoc(
            [command('menu', 'Выберите пиццу', []), response('choices', '', ['Маргарита'])],
            [{ from: 'menu', to: 'choices', type: 'next' }],
        );
        expect(codes(fromCaller)).toEqual([]);
        // Команда только с кнопками → связанный ответ с текстом
        const fromBlock = makeDoc(
            [command('menu', '', ['Маргарита']), response('text', 'Выберите пиццу')],
            [{ from: 'menu', to: 'text', type: 'next' }],
        );
        expect(codes(fromBlock)).toEqual([]);
    });

    it('приветствие из настроек с кнопками, но без текста', () => {
        const doc = { ...makeDoc([]), welcome: { text: '', buttons: [btn('Меню')] } };
        expect(codes(doc)).toEqual(['welcome-settings']);
    });

    it('пустые заголовки кнопок не считаются кнопками', () => {
        expect(codes(makeDoc([command('menu', '', ['  '])]))).toEqual([]);
    });
});
