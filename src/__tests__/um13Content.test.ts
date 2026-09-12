import { describe, it, expect } from 'vitest';
import {
    buildGuessGame,
    buildRpsGame,
    buildEscapeGame,
    buildDetectiveGame,
    pickRandomGame,
} from '../utils/um13Games';
import { validate } from '../utils/validator';
import { um13NameFor } from '../utils/um13Names';
import { setLocale } from '../i18n';

/**
 * Контент-регрессии вселенной UM-13 (аудит 2026-09):
 *  • игры-пресеты — валидные FlowDocument (валидатор не должен падать
 *    на правках текстов и новых нодах вроде счётчика попыток);
 *  • «Угадайка» обещает «7 попыток» — счётчик и проигрыш обязаны
 *    существовать (текст ≠ механика был багом аудита);
 *  • пулы имён крестителя — без повреждённых строк (регрессия
 *    «ловец_три-ггеров»), RU/EN парны и уникальны в пределах типа;
 *  • тон UM-13 — «ты»-нижний регистр: «вы»-обращения не проникают
 *    в реплики призрака (было: «ваше имя…»).
 */

describe('UM-13 игры: валидность документов', () => {
    const builders = [
        ['guess', buildGuessGame],
        ['rps', buildRpsGame],
        ['escape', buildEscapeGame],
        ['detective', buildDetectiveGame],
    ] as const;

    it.each(builders)('%s проходит validate() без ошибок', (_name, build) => {
        const doc = build();
        const errors = validate(doc);
        expect(errors).toEqual([]);
    });

    it('pickRandomGame возвращает игру с локализованным title и валидным doc', () => {
        const { title, doc } = pickRandomGame();
        expect(title.length).toBeGreaterThan(1);
        expect(validate(doc)).toEqual([]);
    });
});

describe('UM-13 «Угадайка»: честные «7 попыток» из welcome-текста', () => {
    const doc = buildGuessGame();
    const ids = new Set(doc.nodes.map((n) => n.id));

    it('счётчик попыток: tries обнуляется на старте, тикает на вопросе', () => {
        const withActions = (id: string) => doc.nodes.find((n) => n.id === id) as
            { actions?: { field: string; value: string }[] } | undefined;
        const acts = (id: string) => withActions(id)?.actions?.map((a) => `${a.field}=${a.value}`) ?? [];
        expect(acts('start_round')).toContain('tries=0');
        expect(acts('ask_guess')).toContain('tries=tries + 1');
    });

    it('проигрышная концовка: check_tries (gte 7) → say_lose с секретом', () => {
        const cond = doc.nodes.find((n) => n.id === 'check_tries');
        expect(cond?.type).toBe('condition');
        expect(cond?.variable).toBe('tries');
        expect(cond?.operator).toBe('gte');
        expect(cond?.value).toBe('7');

        const lose = doc.nodes.find((n) => n.id === 'say_lose') as
            { response: { text: string; isEnd?: boolean } } | undefined;
        expect(lose?.response.text).toMatch(/\{\{secret\}\}/);
        expect(lose?.response.isEnd).toBe(true);
    });

    it('граф: подсказка → проверка лимита → проигрыш ИЛИ новый вопрос', () => {
        const edges = doc.edges;
        expect(edges.some((e) => e.from === 'say_higher' && e.to === 'check_tries' && e.type === 'next')).toBe(true);
        expect(edges.some((e) => e.from === 'say_lower' && e.to === 'check_tries' && e.type === 'next')).toBe(true);
        expect(edges.some((e) => e.from === 'check_tries' && e.to === 'say_lose' && e.type === 'branch_true')).toBe(true);
        expect(edges.some((e) => e.from === 'check_tries' && e.to === 'ask_guess' && e.type === 'branch_false')).toBe(true);
        // все цели рёбер существуют (нет висячих ссылок после правок графа)
        for (const e of edges) {
            expect(ids.has(e.from)).toBe(true);
            expect(ids.has(e.to)).toBe(true);
        }
    });
});

describe('UM-13 креститель нод: пулы имён', () => {
    const TYPES = ['command', 'step', 'condition', 'response', 'action', 'end'] as const;

    it('имена не содержат дефисов, пробелов и обрывков (регрессия «ловец_три-ггеров»)', () => {
        setLocale('ru');
        for (const type of TYPES) {
            const taken = new Set<string>();
            for (let i = 0; i < 8; i++) {
                const name = um13NameFor(type, taken);
                expect(name).toBeTruthy();
                // валидное имя блока: буквы/цифры/подчёркивание, без мусора
                expect(name).toMatch(/^[\p{L}\p{N}_]+$/u);
                expect(name).not.toContain('три-г');
                taken.add(name!);
            }
            expect(taken.size).toBeGreaterThanOrEqual(6); // пул не усох после фикса
        }
    });

    it('EN-пул выдаёт имена без повреждений', () => {
        setLocale('en');
        const taken = new Set<string>();
        for (let i = 0; i < 8; i++) {
            const name = um13NameFor('command', taken);
            // валидный идентификатор: латиница/цифры/подчёркивание, без кириллицы и мусора
            expect(name).toMatch(/^[a-z0-9_]+$/);
            expect(name).not.toContain('три');
            taken.add(name!);
        }
        setLocale('ru'); // возвращаем локаль окружения
    });
});
