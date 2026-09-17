import { describe, it, expect, beforeEach } from 'vitest';
import { startDialog, sendInput, type DialogState, type TurnResult } from '../utils/previewEngine';
import { buildStarterDocument } from '../utils/starterDoc';
import { setLocale } from '../i18n';
import type { FlowDocument, FlowNodeData, FlowEdge, CommandNodeData } from '../types/flow';

/**
 * Превью = симуляция бота, сгенерированного `umbot create from-flow`.
 * Семантика в этих тестах сверена прогоном настоящего сгенерированного бота
 * (umbot 3.1.1, BotTest): один ввод → одно сообщение, ждёт только Шаг,
 * текст шага — реакция на ответ, кнопка = ввод её текста.
 */

function makeDoc(nodes: FlowNodeData[], edges: FlowEdge[] = []): FlowDocument {
    return {
        schemaVersion: '1.0',
        name: 'test',
        version: '1.0.0',
        description: '',
        platforms: ['telegram'],
        database: { type: 'file', config: {} },
        mode: 'dev',
        isLocalStorage: true,
        nodes,
        edges,
        fallback: { text: 'Не понял' },
        welcome: { text: 'Meta welcome', buttons: [] },
        helpText: { text: '' },
        variables: {},
    };
}

const cmd = (id: string, text: string, extra: Partial<CommandNodeData> = {}): FlowNodeData => ({
    type: 'command',
    id,
    name: id,
    slots: [],
    isPattern: false,
    response: { text, buttons: [], sounds: [] },
    ...extra,
});

const resp = (id: string, text: string, buttons: string[] = []): FlowNodeData => ({
    type: 'response',
    id,
    name: id,
    response: { text, buttons: buttons.map((title) => ({ title, type: 'action' })), sounds: [] },
});

const step = (id: string, saveTo: string, text = ''): FlowNodeData => ({
    type: 'step',
    id,
    name: id,
    prompt: { text, buttons: [] },
    saveTo,
    saveAs: 'original',
});

const next = (from: string, to: string): FlowEdge => ({ from, to, type: 'next' });

/** Прогнать диалог: старт + вводы, вернуть тексты ответов бота по ходам. */
function play(doc: FlowDocument, inputs: string[]): { texts: string[]; last: TurnResult } {
    let turn = startDialog(doc);
    const texts = [turn.reply?.text ?? ''];
    let state: DialogState = turn.state;
    for (const input of inputs) {
        turn = sendInput(doc, state, input);
        state = turn.state;
        texts.push(turn.reply?.text ?? '');
    }
    return { texts, last: turn };
}

describe('previewEngine: модель umbot', () => {
    beforeEach(() => setLocale('ru'));

    it('шаг ждёт ввод; его текст отправляется ПОСЛЕ ответа пользователя', () => {
        const doc = makeDoc(
            [
                cmd('welcome', 'Как тебя зовут?', { role: 'welcome' }),
                step('ask', 'name', 'Приятно, {{name}}!'),
            ],
            [next('welcome', 'ask')],
        );
        const start = startDialog(doc);
        expect(start.reply?.text).toBe('Как тебя зовут?');
        expect(start.state.waitStep).toBe('ask');

        const turn = sendInput(doc, start.state, 'Иван');
        expect(turn.reply?.text).toBe('Приятно, Иван!');
        expect(turn.state.vars.name).toBe('Иван');
        expect(turn.state.waitStep).toBeNull();
    });

    it('цепочка ответов — одно сообщение, без ожидания пользователя', () => {
        const doc = makeDoc(
            [
                cmd('welcome', '', { role: 'welcome' }),
                resp('a', 'Первый'),
                resp('b', 'Второй', ['Ок']),
            ],
            [next('welcome', 'a'), next('a', 'b')],
        );
        const start = startDialog(doc);
        expect(start.reply?.text).toBe('Первый\nВторой');
        expect(start.reply?.buttons?.map((b) => b.title)).toEqual(['Ок']);
        expect(start.state.waitStep).toBeNull();
    });

    it('несколько next выполняются все сразу (регрессия пасхальных квестов)', () => {
        const doc = makeDoc(
            [
                cmd('welcome', '', { role: 'welcome' }),
                resp('a', 'A'),
                resp('b', 'B'),
                resp('c', 'C'),
            ],
            [next('welcome', 'a'), next('a', 'b'), next('a', 'c')],
        );
        expect(startDialog(doc).reply?.text).toBe('A\nB\nC');
    });

    it('текст команды не отправляется, если связанный блок задаёт свой текст (как в CLI)', () => {
        const doc = makeDoc(
            [cmd('welcome', 'Скрытый текст', { role: 'welcome' }), resp('a', 'Текст ответа')],
            [next('welcome', 'a')],
        );
        expect(startDialog(doc).reply?.text).toBe('Текст ответа');
    });

    it('кнопка отправляет свой текст как обычный ввод: выбор разбирает условие после шага', () => {
        const doc = makeDoc(
            [
                cmd('welcome', '', { role: 'welcome' }),
                resp('scene', 'Куда?', ['Налево', 'Направо']),
                { ...step('pick', 'choice'), saveAs: 'lowercase' },
                {
                    type: 'condition',
                    id: 'is_left',
                    name: 'is_left',
                    variable: 'choice',
                    operator: 'eq',
                    value: 'налево',
                },
                resp('left', 'Ты пошёл налево'),
                resp('right', 'Ты пошёл направо'),
            ],
            [
                next('welcome', 'scene'),
                next('scene', 'pick'),
                next('pick', 'is_left'),
                { from: 'is_left', to: 'left', type: 'branch_true' },
                { from: 'is_left', to: 'right', type: 'branch_false' },
            ],
        );
        const start = startDialog(doc);
        expect(start.reply?.buttons?.map((b) => b.title)).toEqual(['Налево', 'Направо']);
        expect(start.state.waitStep).toBe('pick');
        expect(sendInput(doc, start.state, 'Налево').reply?.text).toBe('Ты пошёл налево');
        expect(sendInput(doc, start.state, 'Направо').reply?.text).toBe('Ты пошёл направо');
    });

    it('кнопка с переходом выполняет блок-цель, минуя ожидающий шаг', () => {
        const doc = makeDoc(
            [
                {
                    ...cmd('welcome', 'Имя?', { role: 'welcome' }),
                    response: {
                        text: 'Имя?',
                        buttons: [{ title: 'Меню', type: 'action', targetNodeId: 'menu' }],
                        sounds: [],
                    },
                },
                step('ask', 'name', 'Привет, {{name}}!'),
                resp('menu', 'Это меню'),
            ],
            [next('welcome', 'ask')],
        );
        const start = startDialog(doc);
        expect(start.reply?.buttons).toEqual([{ title: 'Меню', url: undefined, target: 'menu' }]);
        expect(start.state.waitStep).toBe('ask');

        const pressed = sendInput(doc, start.state, 'Меню', 'menu');
        expect(pressed.reply?.text).toBe('Это меню');
        expect(pressed.state.waitStep).toBeNull();
        // Напечатанный текст «Меню» — это обычный ответ шагу
        expect(sendInput(doc, start.state, 'Меню').reply?.text).toBe('Привет, Меню!');
    });

    it('кнопка на шаг: текст кнопки становится ответом шагу; кнопка на команду выполняет её', () => {
        const doc = makeDoc(
            [
                cmd('welcome', 'Готов?', { role: 'welcome' }),
                step('confirm', 'answer', 'Ответ: {{answer}}'),
                cmd('help', 'Справка', { slots: ['справка'], saveTo: 'asked' }),
            ],
            [],
        );
        const turn = sendInput(doc, startDialog(doc).state, 'Да', 'confirm');
        expect(turn.reply?.text).toBe('Ответ: Да');
        expect(turn.state.vars.answer).toBe('Да');

        const help = sendInput(doc, startDialog(doc).state, 'Помощь', 'help');
        expect(help.reply?.text).toBe('Справка');
        expect(help.state.vars.asked).toBe('Помощь');
    });

    it('eq сравнивает значения строками: ввод "42" равен числу 42 из действия', () => {
        const doc = makeDoc(
            [
                cmd('welcome', 'Число?', {
                    role: 'welcome',
                    actions: [{ type: 'set_variable', field: 'secret', value: '42' }],
                }),
                step('ask', 'guess'),
                {
                    type: 'condition',
                    id: 'win',
                    name: 'win',
                    variable: 'guess',
                    operator: 'eq',
                    value: 'secret',
                },
                resp('yes', 'Угадал'),
                resp('no', 'Мимо'),
            ],
            [
                next('welcome', 'ask'),
                next('ask', 'win'),
                { from: 'win', to: 'yes', type: 'branch_true' },
                { from: 'win', to: 'no', type: 'branch_false' },
            ],
        );
        expect(play(doc, ['42']).texts[1]).toBe('Угадал');
        expect(play(doc, ['42.0']).texts[1]).toBe('Мимо');
    });

    it('незаданная переменная: в тексте пусто, в арифметике — ноль (как в CLI)', () => {
        const doc = makeDoc([
            cmd('welcome', 'Привет', { role: 'welcome' }),
            cmd('count', 'Счёт {{cnt}}, имя «{{userName}}»', {
                slots: ['счёт'],
                actions: [
                    { type: 'set_variable', field: 'cnt', value: 'cnt + 1' },
                    { type: 'set_variable', field: 'half', value: '(cnt * 3) / 2' },
                ],
            }),
        ]);
        const { texts, last } = play(doc, ['счёт', 'счёт']);
        expect(texts[1]).toBe('Счёт 1, имя «»');
        expect(texts[2]).toBe('Счёт 2, имя «»');
        expect(last.state.vars.half).toBe('3');
    });

    it('saveTo команды сохраняет исходный ввод до действий и текста', () => {
        const doc = makeDoc([
            cmd('welcome', 'Привет', { role: 'welcome' }),
            cmd('repeat', 'Ты сказал: {{said}}', { slots: ['повтори'], saveTo: 'said' }),
        ]);
        expect(play(doc, ['ПОВТОРИ это']).texts[1]).toBe('Ты сказал: ПОВТОРИ это');
    });

    it('isEmpty: "0" не пусто, незаданная переменная — пусто', () => {
        const doc = makeDoc(
            [
                cmd('welcome', '', {
                    role: 'welcome',
                    actions: [{ type: 'set_variable', field: 'z', value: '0' }],
                }),
                {
                    type: 'condition',
                    id: 'z',
                    name: 'z',
                    variable: 'z',
                    operator: 'isEmpty',
                    value: '',
                },
                {
                    type: 'condition',
                    id: 'm',
                    name: 'm',
                    variable: 'missing',
                    operator: 'isEmpty',
                    value: '',
                },
                resp('z_empty', 'z пусто'),
                resp('m_empty', 'missing пусто'),
                resp('m_full', 'missing не пусто'),
            ],
            [
                next('welcome', 'z'),
                { from: 'z', to: 'z_empty', type: 'branch_true' },
                { from: 'z', to: 'm', type: 'branch_false' },
                { from: 'm', to: 'm_empty', type: 'branch_true' },
                { from: 'm', to: 'm_full', type: 'branch_false' },
            ],
        );
        expect(startDialog(doc).reply?.text).toBe('missing пусто');
    });

    it('кнопка картинки карточки с переходом выполняет блок-цель', () => {
        const doc = makeDoc([
            {
                ...cmd('welcome', 'Витрина', { role: 'welcome' }),
                response: {
                    text: 'Витрина',
                    buttons: [],
                    sounds: [],
                    card: {
                        type: 'single',
                        title: '',
                        images: [
                            {
                                src: 'a.png',
                                title: 'A',
                                description: '',
                                button: { title: 'Купить', type: 'action', targetNodeId: 'buy' },
                            },
                        ],
                    },
                },
            },
            resp('buy', 'Куплено'),
        ]);
        const start = startDialog(doc);
        const button = start.reply?.card?.images[0]?.button;
        expect(button?.targetNodeId).toBe('buy');
        expect(sendInput(doc, start.state, 'Купить', button?.targetNodeId).reply?.text).toBe(
            'Куплено',
        );
    });

    it('переход на команду — не ожидание: следующий ввод подбирает команду по слотам', () => {
        const doc = makeDoc(
            [
                cmd('welcome', 'Скажи старт', { role: 'welcome' }),
                cmd('start', 'Поехали', { slots: ['старт'] }),
            ],
            [next('welcome', 'start')],
        );
        const start = startDialog(doc);
        expect(start.reply?.text).toBe('Скажи старт');
        expect(start.state.waitStep).toBeNull();
        expect(sendInput(doc, start.state, 'старт').reply?.text).toBe('Поехали');
        expect(sendInput(doc, start.state, 'что-то').reply?.text).toBe('Не понял');
    });

    it('активный шаг перехватывает ввод раньше команд', () => {
        const doc = makeDoc(
            [
                cmd('welcome', 'Имя?', { role: 'welcome' }),
                cmd('other', 'Команда', { slots: ['иван'] }),
                step('ask', 'name', 'Ок'),
            ],
            [next('welcome', 'ask')],
        );
        const start = startDialog(doc);
        expect(sendInput(doc, start.state, 'Иван').reply?.text).toBe('Ок');
    });

    it('шаг: действия выполняются до текста — в реакции видны свежие значения', () => {
        const doc = makeDoc(
            [
                cmd('welcome', 'Число?', { role: 'welcome' }),
                {
                    ...step('ask', 'n', '{{n}} × 2 = {{n2}}'),
                    actions: [{ type: 'set_variable', field: 'n2', value: 'n * 2' }],
                },
            ],
            [next('welcome', 'ask')],
        );
        const { texts } = play(doc, ['21']);
        expect(texts[1]).toBe('21 × 2 = 42');
    });

    it('действие + условие ведут диалог в том же ходе, цикл через шаг ждёт снова', () => {
        const doc = makeDoc(
            [
                cmd('welcome', 'Число?', { role: 'welcome' }),
                {
                    ...step('ask', 'n'),
                    actions: [{ type: 'set_variable', field: 'n2', value: 'n * 2' }],
                },
                {
                    type: 'condition',
                    id: 'big',
                    name: 'big',
                    variable: 'n2',
                    operator: 'gte',
                    value: '20',
                },
                resp('yes', 'Много: {{n2}}'),
                resp('again', 'Мало, ещё:'),
            ],
            [
                next('welcome', 'ask'),
                next('ask', 'big'),
                { from: 'big', to: 'yes', type: 'branch_true' },
                { from: 'big', to: 'again', type: 'branch_false' },
                next('again', 'ask'),
            ],
        );
        const { texts, last } = play(doc, ['3', '15']);
        expect(texts).toEqual(['Число?', 'Мало, ещё:', 'Много: 30']);
        expect(last.state.waitStep).toBeNull();
    });

    it('welcome по умолчанию срабатывает на «привет», help — на «помощь»', () => {
        const doc = makeDoc([
            cmd('welcome', 'Здравствуй', { role: 'welcome' }),
            cmd('help', 'Справка', { role: 'help' }),
        ]);
        const start = startDialog(doc);
        expect(sendInput(doc, start.state, 'Привет').reply?.text).toBe('Здравствуй');
        expect(sendInput(doc, start.state, 'помощь').reply?.text).toBe('Справка');
    });

    it('без welcome-ноды используется текст welcome из настроек', () => {
        const doc = makeDoc([cmd('c', 'x', { slots: ['x'] })]);
        const start = startDialog(doc);
        expect(start.reply?.text).toBe('Meta welcome');
        expect(start.state.waitStep).toBeNull();
    });

    it('цикл без шага останавливается предохранителем с пометкой', () => {
        const doc = makeDoc(
            [cmd('welcome', '', { role: 'welcome' }), resp('r1', 'r1'), resp('r2', 'r2')],
            [next('welcome', 'r1'), next('r1', 'r2'), next('r2', 'r1')],
        );
        const text = startDialog(doc).reply?.text ?? '';
        expect(text).toContain('превью остановлено');
        expect(text.split('\n').length).toBeLessThan(300);
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
        expect(doc.fallback.text).toContain('Sorry');
    });

    it('структура стартера идентична в обеих локалях', () => {
        const ru = buildStarterDocument('ru');
        const en = buildStarterDocument('en');
        expect(ru.nodes.map((n) => n.id)).toEqual(en.nodes.map((n) => n.id));
        expect(ru.edges).toEqual(en.edges);
        expect(ru.nodes[1]).toMatchObject({ saveTo: 'userName' });
        expect(en.nodes[1]).toMatchObject({ saveTo: 'userName' });
    });

    it('стартер: вопрос в welcome, после имени — одно приветствие без лишнего текста шага', () => {
        const doc = buildStarterDocument('ru');
        const { texts } = play(doc, ['Иван']);
        expect(texts[0]).toBe('Привет! Я демо-бот. Как тебя зовут?');
        expect(texts[1]).toMatch(/^Приятно познакомиться, Иван!/);
        expect(texts[1]).not.toContain('\n');
    });
});

/**
 * Регрессии аудита «превью ≠ сгенерированный бот» (сверено прогоном ботов,
 * сгенерированных CLI, как навыков Алисы и Telegram-ботов).
 */
describe('previewEngine: старт диалога, настройки, условия и подбор команд как в боте', () => {
    beforeEach(() => setLocale('ru'));

    const cond = (id: string, variable: string, operator: string): FlowNodeData =>
        ({ type: 'condition', id, name: id, variable, operator, value: '' }) as FlowNodeData;
    const yes = (from: string, to: string): FlowEdge => ({ from, to, type: 'branch_true' });
    const no = (from: string, to: string): FlowEdge => ({ from, to, type: 'branch_false' });

    it('без приветствия (ни ноды, ни текста в настройках) диалог начинается с fallback', () => {
        const doc = {
            ...makeDoc([cmd('menu', 'Меню', { slots: ['меню'] })]),
            welcome: { text: '', buttons: [] },
        };
        expect(startDialog(doc).reply?.text).toBe('Не понял');
    });

    it('/start запускает приветствие и пропускает ожидающий шаг', () => {
        const doc = makeDoc(
            [
                cmd('welcome', 'Как тебя зовут?', { role: 'welcome' }),
                step('ask', 'name', 'Привет, {{name}}!'),
            ],
            [next('welcome', 'ask')],
        );
        const { texts, last } = play(doc, ['/start', 'Макс']);
        expect(texts).toEqual(['Как тебя зовут?', 'Как тебя зовут?', 'Привет, Макс!']);
        expect(last.state.waitStep).toBeNull();
        // Во время ожидания шага /start начинает диалог заново, а не сохраняется ответом
        const again = play(doc, ['/start deep-link']);
        expect(again.texts[1]).toBe('Как тебя зовут?');
        expect(again.last.state.vars.name).toBeUndefined();
    });

    it('без нод welcome/help на «привет» и «помощь» отвечают тексты из настроек, с кнопками', () => {
        const doc = {
            ...makeDoc([cmd('menu', 'Это меню', { slots: ['меню'] })]),
            welcome: {
                text: 'Добро пожаловать!',
                buttons: [{ title: 'Меню', type: 'action' as const }],
            },
            helpText: { text: 'Я принимаю заказы' },
        };
        const start = startDialog(doc);
        expect(start.reply?.text).toBe('Добро пожаловать!');
        expect(start.reply?.buttons?.map((b) => b.title)).toEqual(['Меню']);
        expect(sendInput(doc, start.state, 'привет').reply?.text).toBe('Добро пожаловать!');
        expect(sendInput(doc, start.state, '/start').reply?.text).toBe('Добро пожаловать!');
        expect(sendInput(doc, start.state, 'помощь').reply?.text).toBe('Я принимаю заказы');
        // Без текста справки «помощь» уходит в fallback — как в боте
        const noHelp = { ...doc, helpText: { text: '' } };
        expect(sendInput(noHelp, start.state, 'помощь').reply?.text).toBe('Не понял');
    });

    it('согласие и отказ — отдельными словами, как Text.isSayTrue/isSayFalse umbot', () => {
        const doc = makeDoc(
            [
                cmd('welcome', 'Заказываем?', { role: 'welcome' }),
                step('confirm', 'answer'),
                cond('is_yes', 'answer', 'isSayTrue'),
                resp('ok', 'ПРИНЯТ'),
                cond('is_no', 'answer', 'isSayFalse'),
                resp('cancel', 'ОТМЕНА'),
                resp('other', 'НЕПОНЯТНО'),
            ],
            [
                next('welcome', 'confirm'),
                next('confirm', 'is_yes'),
                yes('is_yes', 'ok'),
                no('is_yes', 'is_no'),
                yes('is_no', 'cancel'),
                no('is_no', 'other'),
            ],
        );
        const answer = (text: string) => play(doc, [text]).texts[1];
        for (const text of ['да', 'Да!', 'конечно', 'согласен', 'подтверждаю']) {
            expect(answer(text), text).toBe('ПРИНЯТ');
        }
        for (const text of ['нет', 'неа', 'не знаю']) {
            expect(answer(text), text).toBe('ОТМЕНА');
        }
        // Подстрока «да»/«не» и слова, которых нет в umbot, согласием/отказом не считаются
        for (const text of [
            'ок',
            'ага',
            'хорошо',
            'когда',
            'абракадабра',
            'линия',
            'никак',
            'отказ',
        ]) {
            expect(answer(text), text).toBe('НЕПОНЯТНО');
        }
    });

    it('isUrl: по вводу — без учёта регистра, строка должна разбираться как URL', () => {
        const doc = makeDoc([
            cmd('check', '', {
                slots: ['ссылка'],
                conditions: [
                    {
                        variable: '',
                        operator: 'isUrl',
                        value: '',
                        responseTrue: { text: 'URL' },
                        responseFalse: { text: 'НЕ URL' },
                    },
                ],
            }),
        ]);
        const say = (text: string) => sendInput(doc, startDialog(doc).state, text).reply?.text;
        expect(say('ссылка')).toBe('НЕ URL');
        const urlDoc = makeDoc([
            cmd('check', '', {
                slots: ['http'],
                conditions: [
                    {
                        variable: '',
                        operator: 'isUrl',
                        value: '',
                        responseTrue: { text: 'URL' },
                        responseFalse: { text: 'НЕ URL' },
                    },
                ],
            }),
        ]);
        const sayUrl = (text: string) =>
            sendInput(urlDoc, startDialog(urlDoc).state, text).reply?.text;
        expect(sayUrl('HTTPS://Example.com/path')).toBe('URL');
        expect(sayUrl('http://')).toBe('НЕ URL');
    });

    it('точное совпадение слота важнее вхождения (как в umbot)', () => {
        const doc = makeDoc([
            cmd('cat', 'КОТ', { slots: ['кот'] }),
            cmd('kitten', 'КОТИК', { slots: ['котик'] }),
        ]);
        const state = startDialog(doc).state;
        expect(sendInput(doc, state, 'Котик').reply?.text).toBe('КОТИК');
        // Не точное совпадение — первая команда по порядку, слот которой входит в ввод
        expect(sendInput(doc, state, 'котик пришёл').reply?.text).toBe('КОТ');
    });

    it('{{__currentTimestamp}} — миллисекунды, как Date.now() в сгенерированном боте', () => {
        const doc = makeDoc([cmd('welcome', '{{__currentTimestamp}}', { role: 'welcome' })]);
        const before = Date.now();
        const value = Number(startDialog(doc).reply?.text);
        expect(value).toBeGreaterThanOrEqual(before);
        expect(value).toBeLessThanOrEqual(Date.now());
    });
});
