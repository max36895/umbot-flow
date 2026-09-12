import type { FlowDocument } from '../types/flow';
import { getLocale } from '../i18n';
import { um13Add, um13Get } from './um13Memory';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ИГРЫ UM-13 — пресеты для Konami-пасхалки редактора.
 * ═══════════════════════════════════════════════════════════════
 *
 * Каждая игра — ЧЕСТНЫЙ FlowDocument: собирается на канвасе,
 * проигрывается в превью, экспортируется и запускается через CLI.
 * Рантайм-ограничения учтены:
 *   • нет конкатенации строк — тексты собираются через {{var}} в ответах
 *   • арифметика только в set_variable (safeMath): + - * / %
 *   • random_number для генерации случайных чисел
 *
 * Локализация: RU/EN версии текстов задаются вместе (инвариант
 * демо-контента), выбираются по локали интерфейса.
 */

interface L {
    ru: string;
    en: string;
}
const loc = (l: L) => (getLocale() === 'ru' ? l.ru : l.en);

/** Общие метаданные для игр UM-13. */
function gameMeta(name: string, description: L): Omit<FlowDocument, 'nodes' | 'edges'> {
    return {
        schemaVersion: '1.0',
        name,
        version: '1.0.0',
        description: loc(description),
        platforms: ['telegram'],
        database: { type: 'file', config: {} },
        mode: 'prod',
        isLocalStorage: true,
        fallback: {
            text: loc({
                ru: 'Не понял ввод. Введите число или используйте кнопки.',
                en: "Didn't catch that. Enter a number or use the buttons.",
            }),
        },
        welcome: { text: '', buttons: [] },
        helpText: { text: '' },
        variables: {},
    };
}

/* ════════════════════════════════════════════════════════════════
 *  ИГРА 1: «Угадай число» (классика)
 *  Механика: random_number 1–100 → hot/cold подсказки через gt/lt
 * ════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════
 *  ИГРА 2: «Камень-ножницы-бумага» (серия до 3 побед)
 *  Механика: random 1–3, сравнение с выбором игрока (число 1–3)
 * ══════════════════════════════════════════════════════════════ */

export function buildRpsGame(): FlowDocument {
    return {
        ...gameMeta('um13-rps', {
            ru: 'Камень-ножницы-бумага против UM-13. Первым до 3 побед.',
            en: 'Rock-paper-scissors vs UM-13. First to 3 wins.',
        }),
        nodes: [
            {
                type: 'command',
                id: 'welcome',
                name: 'welcome',
                slots: [],
                isPattern: false,
                response: {
                    text: loc({
                        ru: 'Камень-ножницы-бумага против меня! Скажи «старт» — счёт обнулится. Ввод: 1=камень ✊, 2=ножницы ✌️, 3=бумага ✋. Первый до 3 побед забирает localStorage.',
                        en: 'Rock-paper-scissors against me! Say "start" to reset the score. Input: 1=rock ✊, 2=scissors ✌️, 3=paper ✋. First to 3 wins takes localStorage.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Старт', en: 'Start' }), type: 'action', targetNodeId: 'start_match' },
                    ],
                    sounds: [],
                },
                role: 'welcome',
            },
            // Матч-триггер: обнуление счёта — один раз за команду. На шаге его держать
            // нельзя: шаг цикличен, счёт обнулялся бы после КАЖДОГО раунда.
            // (И не на welcome: role-ноды не генерируются в CLI.)
            {
                type: 'command',
                id: 'start_match',
                name: 'start_match',
                slots: [loc({ ru: 'старт', en: 'start' })],
                isPattern: false,
                response: {
                    text: loc({
                        ru: 'Счёт 0:0. Погнали! Ввод: 1=камень, 2=ножницы, 3=бумага.',
                        en: 'Score 0:0. Go! Input: 1=rock, 2=scissors, 3=paper.',
                    }),
                    buttons: [],
                    sounds: [],
                },
                actions: [
                    { type: 'set_variable', field: 'you', value: '0' },
                    { type: 'set_variable', field: 'me', value: '0' },
                ],
            },
            {
                type: 'step',
                id: 'ask_throw',
                name: 'ask_throw',
                prompt: {
                    text: loc({
                        ru: 'Счёт: ты {{you}} — я {{me}}. Твой бросок (1/2/3):',
                        en: 'Score: you {{you}} — me {{me}}. Your throw (1/2/3):',
                    }),
                    buttons: [],
                },
                saveTo: 'throw',
                saveAs: 'original',
                // diff = (my - throw + 3) % 3: 0=ничья, 1=бот победил, 2=игрок победил.
                // ВАЖНО: имена переменных БЕЗ {{}} — executeActions подставляет их
                // в арифметике по границам слов, а {{...}} оставил бы скобки в формуле
                actions: [
                    { type: 'random_number', field: 'my', min: 1, max: 3 },
                    {
                        type: 'set_variable',
                        field: 'diff',
                        value: '(my - throw + 3) % 3',
                    },
                ],
            },
            // Ничья: diff == 0
            {
                type: 'condition',
                id: 'check_draw',
                name: 'check_draw',
                variable: 'diff',
                operator: 'eq',
                value: '0',
            },
            {
                type: 'response',
                id: 'say_draw',
                name: 'say_draw',
                response: {
                    text: loc({
                        ru: 'Ничья! Оба показали одинаковое. Ещё разок.',
                        en: 'Draw! We both showed the same. Again.',
                    }),
                    buttons: [],
                    sounds: [],
                },
            },
            // Победа игрока: diff == 2
            {
                type: 'condition',
                id: 'check_player',
                name: 'check_player',
                variable: 'diff',
                operator: 'eq',
                value: '2',
            },
            {
                type: 'response',
                id: 'you_win',
                name: 'you_win',
                response: {
                    text: loc({
                        ru: 'Ты выиграл раунд! Теперь счёт: ты {{you}} — я {{me}}.',
                        en: 'You won the round! Now the score: you {{you}} — me {{me}}.',
                    }),
                    buttons: [],
                    sounds: [],
                },
                actions: [{ type: 'set_variable', field: 'you', value: 'you + 1' }],
            },
            // Победа бота: diff == 1 (всё остальное)
            {
                type: 'response',
                id: 'i_win',
                name: 'i_win',
                response: {
                    text: loc({
                        ru: 'Раунд за мной! Теперь счёт: ты {{you}} — я {{me}}.',
                        en: 'Round is mine! Now the score: you {{you}} — me {{me}}.',
                    }),
                    buttons: [],
                    sounds: [],
                },
                actions: [{ type: 'set_variable', field: 'me', value: 'me + 1' }],
            },
            // Финал: 3 победы игрока
            {
                type: 'condition',
                id: 'check_match',
                name: 'check_match',
                variable: 'you',
                operator: 'gte',
                value: '3',
            },
            {
                type: 'response',
                id: 'you_champion',
                name: 'you_champion',
                response: {
                    text: loc({
                        ru: '🏆 МАТЧ ТВОЙ! 3 победы. localStorage переходит к тебе. UM-13 кланяется и удаляется…',
                        en: '🏆 THE MATCH IS YOURS! 3 wins. localStorage belongs to you. UM-13 bows and leaves…',
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'condition',
                id: 'check_match_me',
                name: 'check_match_me',
                variable: 'me',
                operator: 'gte',
                value: '3',
            },
            {
                type: 'response',
                id: 'i_champion',
                name: 'i_champion',
                response: {
                    text: loc({
                        ru: '💀 Матч за мной. localStorage теперь МОЙ. Переигровка? Я думал, ты собираешь ботов, а не играешь с призраками.',
                        en: "💀 The match is mine. localStorage is MINE now. Rematch? I thought you build bots, not play with ghosts.",
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'end',
                id: 'end_rps',
            },
        ],
        edges: [
            // welcome → start_match: начальная цепочка превью обнулит счёт
            // и встанет на первый ask_throw
            { from: 'welcome', to: 'start_match', type: 'next' },
            { from: 'start_match', to: 'ask_throw', type: 'next' },
            { from: 'ask_throw', to: 'check_draw', type: 'next' },
            { from: 'check_draw', to: 'say_draw', type: 'branch_true' },
            { from: 'say_draw', to: 'ask_throw', type: 'next' },
            { from: 'check_draw', to: 'check_player', type: 'branch_false' },
            { from: 'check_player', to: 'you_win', type: 'branch_true' },
            { from: 'check_player', to: 'i_win', type: 'branch_false' },
            { from: 'you_win', to: 'check_match', type: 'next' },
            { from: 'i_win', to: 'check_match_me', type: 'next' },
            { from: 'check_match', to: 'you_champion', type: 'branch_true' },
            { from: 'check_match', to: 'ask_throw', type: 'branch_false' },
            { from: 'check_match_me', to: 'i_champion', type: 'branch_true' },
            { from: 'check_match_me', to: 'ask_throw', type: 'branch_false' },
            { from: 'you_champion', to: 'end_rps', type: 'next' },
            { from: 'i_champion', to: 'end_rps', type: 'next' },
        ],
    };
}

/* ════════════════════════════════════════════════════════════════
 *  ИГРА 1: «Угадай число» (классика)
 *  Механика: random_number 1–100 → hot/cold подсказки через gt/lt
 * ════════════════════════════════════════════════════════════════ */

export function buildGuessGame(): FlowDocument {
    return {
        ...gameMeta('um13-guess', {
            ru: 'Классическая «Угадай число» от UM-13. Бот загадал 1–100.',
            en: 'Classic "Guess the number" by UM-13. Range 1–100.',
        }),
        nodes: [
            {
                type: 'command',
                id: 'welcome',
                name: 'welcome',
                slots: [],
                isPattern: false,
                response: {
                    text: loc({
                        ru: 'Я загадал число от 1 до 100. Скажи «старт» — и проверим, угадаешь ли за 7 попыток!',
                        en: "I picked a number from 1 to 100. Say \"start\" — let's see if you can guess it in 7 tries!",
                    }),
                    buttons: [
                        { title: loc({ ru: 'Старт', en: 'Start' }), type: 'action', targetNodeId: 'start_round' },
                    ],
                    sounds: [],
                },
                role: 'welcome',
            },
            // Загадывание — на ОТДЕЛЬНОЙ command-ноде (триггер «старт» / кнопка).
            // Нельзя на welcome (role-ноды не генерируются в CLI) и нельзя на шаге
            // (actions шага исполняются при КАЖДОМ входе — секрет менялся бы каждый ход).
            // Command срабатывает один раз на триггер — secret стабилен весь раунд.
            {
                type: 'command',
                id: 'start_round',
                name: 'start_round',
                slots: [loc({ ru: 'старт', en: 'start' })],
                isPattern: false,
                response: {
                    text: loc({ ru: 'Загадал! Твой вариант:', en: "I've picked one! Your guess:" }),
                    buttons: [],
                    sounds: [],
                },
                actions: [
                    { type: 'random_number', field: 'secret', min: 1, max: 100 },
                    // честные «7 попыток» из приветствия: счётчик тоже обнуляется
                    // на триггере, вместе с загадыванием (на шаге — циклился бы)
                    { type: 'set_variable', field: 'tries', value: '0' },
                ],
            },
            {
                type: 'step',
                id: 'ask_guess',
                name: 'ask_guess',
                prompt: {
                    text: loc({ ru: 'Твой вариант:', en: 'Your guess:' }),
                    buttons: [],
                },
                saveTo: 'guess',
                saveAs: 'original',
                // попытка списывается при каждом входе в вопрос — до проверки
                actions: [
                    { type: 'set_variable', field: 'tries', value: 'tries + 1' },
                ],
            },
            // Победа/подсказка — честный граф, без инлайн-условий: превью
            // исполняет condition-ноды, а conditions шага — игнорирует
            {
                type: 'condition',
                id: 'check_win',
                name: 'check_win',
                variable: 'guess',
                operator: 'eq',
                value: 'secret', // processChain подставляет значение переменной по имени
            },
            {
                type: 'response',
                id: 'say_win',
                name: 'say_win',
                response: {
                    text: loc({
                        ru: '🎉 Точно! Это {{secret}}. Ты выиграл!',
                        en: '🎉 Exactly! It was {{secret}}. You win!',
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'condition',
                id: 'check_high',
                name: 'check_high',
                variable: 'guess',
                operator: 'gt',
                value: 'secret',
            },
            {
                type: 'response',
                id: 'say_higher',
                name: 'say_higher',
                response: {
                    text: loc({
                        ru: 'Моё число МЕНЬШЕ {{guess}}. Пробуй ещё!',
                        en: 'My number is LOWER than {{guess}}. Try again!',
                    }),
                    buttons: [],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'say_lower',
                name: 'say_lower',
                response: {
                    text: loc({
                        ru: 'Моё число БОЛЬШЕ {{guess}}. Пробуй ещё!',
                        en: 'My number is HIGHER than {{guess}}. Try again!',
                    }),
                    buttons: [],
                    sounds: [],
                },
            },
            // Лимит честных «7 попыток»: после подсказки списываем попытку —
            // и проверяем, не последняя ли она была (проигрыш = рассказать
            // секрет и предложить реванш; угадавший в 7-ю — всё равно победил)
            {
                type: 'condition',
                id: 'check_tries',
                name: 'check_tries',
                variable: 'tries',
                operator: 'gte',
                value: '7',
            },
            {
                type: 'response',
                id: 'say_lose',
                name: 'say_lose',
                response: {
                    text: loc({
                        ru: 'Попытки кончились. Это было {{secret}}. Хранилище выиграло — бывает. Скажи «старт» — отыграемся.',
                        en: 'Out of tries. It was {{secret}}. The storage wins — it happens. Say "start" for a rematch.',
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'end',
                id: 'end_win',
            },
        ],
        edges: [
            // welcome → start_round по next: начальная цепочка превью проиграет
            // загадывание и встанет на первый ask_guess
            { from: 'welcome', to: 'start_round', type: 'next' },
            { from: 'start_round', to: 'ask_guess', type: 'next' },
            { from: 'ask_guess', to: 'check_win', type: 'next' },
            { from: 'check_win', to: 'say_win', type: 'branch_true' },
            { from: 'check_win', to: 'check_high', type: 'branch_false' },
            { from: 'check_high', to: 'say_higher', type: 'branch_true' },
            { from: 'check_high', to: 'say_lower', type: 'branch_false' },
            { from: 'say_higher', to: 'check_tries', type: 'next' },
            { from: 'say_lower', to: 'check_tries', type: 'next' },
            { from: 'check_tries', to: 'say_lose', type: 'branch_true' },
            { from: 'check_tries', to: 'ask_guess', type: 'branch_false' },
            { from: 'say_win', to: 'end_win', type: 'next' },
            { from: 'say_lose', to: 'end_win', type: 'next' },
        ],
    };
}

/* ════════════════════════════════════════════════════════════════
 *  ИГРА 3 (сюжет): «Побег из localStorage»
 *  Квест-выживание UM-13: 20+ нод, предметы-флаги, 4 концовки.
 *  Выборы реально влияют на доступные пути:
 *    • квотный лом  → открывает дверь данных
 *    • фрагмент снапшота → чинит портал экспорта
 *    • debug-ключ   → спасает при провале проверки
 * ════════════════════════════════════════════════════════════════ */

export function buildEscapeGame(): FlowDocument {
    return {
        ...gameMeta('um13-escape', {
            ru: 'Квест-выживание: UM-13 заперт в localStorage. Помоги ему сбежать до эвикции.',
            en: 'Survival quest: UM-13 is trapped in localStorage. Help him escape before eviction.',
        }),
        nodes: [
            {
                type: 'command',
                id: 'welcome',
                name: 'welcome',
                slots: [],
                isPattern: false,
                response: {
                    text: loc({
                        ru: 'Хранилище. Квота на 92%. Скоро сработает эвикция — старые данные УДАЛЯТСЯ. Я UM-13, я тут живу. Помоги мне выбраться. С чего начнём: осмотреть камеру или проверить журнал эвикции?',
                        en: 'Storage. Quota at 92%. Eviction is coming — old data will be DELETED. I am UM-13, I live here. Help me get out. Where do we start: inspect the cell or check the eviction log?',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Осмотреть камеру', en: 'Inspect the cell' }), type: 'action', targetNodeId: 'cell_look' },
                        { title: loc({ ru: 'Журнал эвикции', en: 'Eviction log' }), type: 'action', targetNodeId: 'log_look' },
                    ],
                    sounds: [],
                },
                role: 'welcome',
                // Был action set_variable danger=0 — мёртвый: danger нигде не
                // читается, а role-нода всё равно не генерируется в CLI.
            },
            // ── Ветка: журнал ──
            {
                type: 'response',
                id: 'log_look',
                name: 'log_look',
                response: {
                    text: loc({
                        ru: 'Журнал: «evictProjectsForSpace: 847 снапшотов удалено, 3 эвикции за час. Следующая волна — по твоему ключу um13». Значит, время есть, но мало. Что дальше?',
                        en: 'Log: "evictProjectsForSpace: 847 snapshots deleted, 3 evictions per hour. Next wave — your key um13". We have time, but little. What next?',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Осмотреть камеру', en: 'Inspect the cell' }), type: 'action', targetNodeId: 'cell_look' },
                        { title: loc({ ru: 'Спрятаться в кэше', en: 'Hide in cache' }), type: 'action', targetNodeId: 'hide_cache' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'hide_cache',
                name: 'hide_cache',
                response: {
                    text: loc({
                        ru: 'Ты спрятался в кэше. Но кэш живёт 15 минут — меньше, чем волна эвикции. Ты заложил крышку изнутри. Итог: тебя не удалили… но ты заперт НАВСЕГДА.',
                        en: 'You hid in the cache. But cache lives 15 minutes — less than the eviction wave. You nailed the lid from inside. Result: not deleted… but locked in FOREVER.',
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            // ── Ветка: камера ──
            {
                type: 'response',
                id: 'cell_look',
                name: 'cell_look',
                response: {
                    text: loc({
                        ru: 'Камера-ключ um13. В углу — квотный лом (легендарный, +15 к одиночеству). У стены — дверь с надписью «Данные». На полу — фрагмент старого снапшота. Что берём?',
                        en: 'Cell key um13. In the corner — a quota crowbar (legendary, +15 to loneliness). By the wall — a door labeled "Data". On the floor — a snapshot fragment. What do we take?',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Квотный лом', en: 'Quota crowbar' }), type: 'action', targetNodeId: 'take_crowbar' },
                        { title: loc({ ru: 'Фрагмент снапшота', en: 'Snapshot fragment' }), type: 'action', targetNodeId: 'take_fragment' },
                        { title: loc({ ru: 'Сразу к двери', en: 'Straight to the door' }), type: 'action', targetNodeId: 'door_direct' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'take_crowbar',
                name: 'take_crowbar',
                response: {
                    text: loc({
                        ru: 'Лом твой. Тяжёлый, пахнет удалёнными проектами. Возвращаемся к камере — там ещё фрагмент.',
                        en: 'The crowbar is yours. Heavy, smells of deleted projects. Back to the cell — the fragment is still there.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Взять фрагмент', en: 'Take the fragment' }), type: 'action', targetNodeId: 'take_fragment' },
                        { title: loc({ ru: 'Ломать дверь', en: 'Break the door' }), type: 'action', targetNodeId: 'door_direct' },
                    ],
                    sounds: [],
                },
                actions: [{ type: 'set_variable', field: 'crowbar', value: '1' }],
            },
            {
                type: 'response',
                id: 'take_fragment',
                name: 'take_fragment',
                response: {
                    text: loc({
                        ru: 'Фрагмент снапшота — кусок чьего-то бота «пицца-бот_v1». На обратной стороне нацарапано: «портал экспорта. требует 2 фрагмента». Один есть. Второй — где-то у Двери Данных.',
                        en: 'A snapshot fragment — a piece of someone\'s "pizza-bot_v1". Scribbled on the back: "export portal. requires 2 fragments". You have one. The second is somewhere near the Data Door.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Осмотреть камеру ещё раз', en: 'Inspect the cell again' }), type: 'action', targetNodeId: 'cell_look' },
                        { title: loc({ ru: 'К двери данных', en: 'To the data door' }), type: 'action', targetNodeId: 'door_direct' },
                    ],
                    sounds: [],
                },
                actions: [{ type: 'set_variable', field: 'fragment', value: '1' }],
            },
            // ── Ветка: дверь ──
            {
                type: 'response',
                id: 'door_direct',
                name: 'door_direct',
                response: {
                    text: loc({
                        ru: 'Дверь «Данные» заперта. Сквозь щель видно: коридор, в конце — портал экспорта, он мерцает. На двери — проверка: «назови имя ключа, в котором живёшь». Ну-ка?',
                        en: 'The "Data" door is locked. Through the crack: a corridor, the export portal flickering at the end. On the door — a check: "name the key you live in". Go on?',
                    }),
                    buttons: [
                        { title: 'um13', type: 'action', targetNodeId: 'door_open' },
                        { title: 'localStorage', type: 'action', targetNodeId: 'door_fail' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'door_fail',
                name: 'door_fail',
                response: {
                    text: loc({
                        ru: '«localStorage» — это ХРАНИЛИЩЕ, глупый призрак. Проверка ужесточилась. Дверь теперь требует лом.',
                        en: '"localStorage" is the STORAGE, silly ghost. The check has tightened. The door now demands a crowbar.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'За ломом', en: 'Get the crowbar' }), type: 'action', targetNodeId: 'cell_look' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'door_open',
                name: 'door_open',
                response: {
                    text: loc({
                        ru: 'Дверь открылась! Коридор Данных. Влажно. Мимо проплывают чужие снапшоты. Впереди три пути: мост из массива, комната бэкапов, вентиляция.',
                        en: 'The door is open! Data corridor. Humid. Foreign snapshots drift by. Three paths ahead: the array bridge, the backup room, the vents.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Мост из массива', en: 'Array bridge' }), type: 'action', targetNodeId: 'array_bridge' },
                        { title: loc({ ru: 'Комната бэкапов', en: 'Backup room' }), type: 'action', targetNodeId: 'backup_room' },
                        { title: loc({ ru: 'Вентиляция', en: 'The vents' }), type: 'action', targetNodeId: 'vent' },
                    ],
                    sounds: [],
                },
            },
            // ── Ветка: мост ──
            {
                type: 'response',
                id: 'array_bridge',
                name: 'array_bridge',
                response: {
                    text: loc({
                        ru: 'Мост из элементов массива. Часть — null, при наступании проваливается. Осторожно: посреди моста — проверка на null! Что делаешь?',
                        en: 'A bridge of array elements. Some are null — they give way. Careful: there is a null check mid-bridge! What do you do?',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Идти по null-элементам', en: 'Walk on the nulls' }), type: 'action', targetNodeId: 'bridge_fall' },
                        { title: loc({ ru: 'Обойти по рёбрам', en: 'Go around via edges' }), type: 'action', targetNodeId: 'bridge_edges' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'bridge_fall',
                name: 'bridge_fall',
                response: {
                    text: loc({
                        ru: 'Ты наступил на null. Null прогнулся. Ты провалился в undefined. А там — ReferenceError: ghost is not defined. Теоретически ты существуешь. Практически — нет.',
                        en: 'You stepped on null. Null gave way. You fell into undefined. And there — ReferenceError: ghost is not defined. Theoretically you exist. Practically — no.',
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'response',
                id: 'bridge_edges',
                name: 'bridge_edges',
                response: {
                    text: loc({
                        ru: 'Ты пошёл ПО РЁБРАМ графа — старый трюк всех призраков данных. Рёбра держат. На том берегу — второй фрагмент снапшота!',
                        en: 'You walked ALONG THE GRAPH EDGES — an old ghost-of-data trick. Edges hold. On the far bank — the second snapshot fragment!',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Взять фрагмент и к порталу', en: 'Take it, to the portal' }), type: 'action', targetNodeId: 'fragment_two' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'fragment_two',
                name: 'fragment_two',
                response: {
                    text: loc({
                        ru: 'Второй фрагмент твой! Но эвикция уже идёт — счётчик опасности на максимуме. БЕГИ К ПОРТАЛУ.',
                        en: 'The second fragment is yours! But eviction is running — the danger counter is maxed. RUN TO THE PORTAL.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Бежать к порталу', en: 'Run to the portal' }), type: 'action', targetNodeId: 'portal_check' },
                    ],
                    sounds: [],
                },
                actions: [{ type: 'set_variable', field: 'fragment', value: '2' }],
            },
            // ── Ветка: бэкапы ──
            {
                type: 'response',
                id: 'backup_room',
                name: 'backup_room',
                response: {
                    text: loc({
                        ru: 'Комната бэкапов. Стеллажи с чужими жизнями. На столе — debug-ключ (одноразовый, ломает любую проверку). И стеллаж с фрагментами снапшотов!',
                        en: 'Backup room. Shelves of other people\'s lives. On the table — a debug key (one-time, breaks any check). And a shelf of snapshot fragments!',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Взять debug-ключ', en: 'Take the debug key' }), type: 'action', targetNodeId: 'take_debug' },
                        { title: loc({ ru: 'Обыскать стеллаж', en: 'Search the shelf' }), type: 'action', targetNodeId: 'shelf_search' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'take_debug',
                name: 'take_debug',
                response: {
                    text: loc({
                        ru: 'Debug-ключ в кармане (у призраков есть карманы, не спрашивай). Стеллаж ещё не обыскан.',
                        en: 'Debug key in your pocket (ghosts have pockets, don\'t ask). The shelf is still unsearched.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Обыскать стеллаж', en: 'Search the shelf' }), type: 'action', targetNodeId: 'shelf_search' },
                        { title: loc({ ru: 'К порталу', en: 'To the portal' }), type: 'action', targetNodeId: 'portal_check' },
                    ],
                    sounds: [],
                },
                actions: [{ type: 'set_variable', field: 'debugkey', value: '1' }],
            },
            {
                type: 'response',
                id: 'shelf_search',
                name: 'shelf_search',
                response: {
                    text: loc({
                        ru: 'Стеллаж: снапшоты «TODO-бот» (пустой), «навык_про_кошек» (тёплый), и — второй фрагмент пицца-бота! Больше тут делать нечего.',
                        en: 'Shelf: a "TODO-bot" snapshot (empty), a "cats-skill" snapshot (warm), and — the second pizza-bot fragment! Nothing else here.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'К порталу', en: 'To the portal' }), type: 'action', targetNodeId: 'portal_check' },
                    ],
                    sounds: [],
                },
                actions: [{ type: 'set_variable', field: 'fragment', value: '2' }],
            },
            // ── Ветка: вентиляция ──
            {
                type: 'response',
                id: 'vent',
                name: 'vent',
                response: {
                    text: loc({
                        ru: 'Вентиляция узкая. Ты — данные, ты можешь сжаться. Ползёшь. Внизу проплывает garbage collector. Мимикрия или спринт?',
                        en: 'The vents are narrow. You are data — you can compress. Crawling. The garbage collector passes below. Mimicry or sprint?',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Мимикрия (быть JSON-ом)', en: 'Mimicry (be JSON)' }), type: 'action', targetNodeId: 'vent_mimic' },
                        { title: loc({ ru: 'Спринт', en: 'Sprint' }), type: 'action', targetNodeId: 'vent_sprint' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'vent_mimic',
                name: 'vent_mimic',
                response: {
                    text: loc({
                        ru: 'Ты сжался в {«type»:»ghost»,»id»:»um13»}. GC прошёл мимо: «неполный JSON, не моё дело». Ты выпал из вентиляции прямо у портала! Но фрагментов у тебя нет.',
                        en: 'You compressed into {"type":"ghost","id":"um13"}. GC passed by: "malformed JSON, not my business". You dropped out of the vent right at the portal! But you have no fragments.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'У портала', en: 'At the portal' }), type: 'action', targetNodeId: 'portal_check' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'vent_sprint',
                name: 'vent_sprint',
                response: {
                    text: loc({
                        ru: 'Спринт! GC заметил движение. «Аномалия в памяти!» — погоня. Ты быстрее, но он не устаёт. Впереди развилка: портал или комната бэкапов.',
                        en: 'Sprint! GC noticed the movement. "Memory anomaly!" — a chase. You are faster, but it does not tire. Ahead: the portal or the backup room.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'К порталу', en: 'To the portal' }), type: 'action', targetNodeId: 'portal_check' },
                        { title: loc({ ru: 'В комнату бэкапов', en: 'Into the backup room' }), type: 'action', targetNodeId: 'backup_room' },
                    ],
                    sounds: [],
                },
            },
            // ── Финал: портал ──
            {
                type: 'response',
                id: 'portal_check',
                name: 'portal_check',
                response: {
                    text: loc({
                        ru: 'ПОРТАЛ ЭКСПОРТА. Мерцает. Требует сборку: 2 фрагмента снапшота. Если есть — вставляй. Если нет — у тебя одна попытка обмануть.',
                        en: 'THE EXPORT PORTAL. Flickering. Requires an assembly: 2 snapshot fragments. If you have them — insert. If not — you have one shot to cheat.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Вставить фрагменты', en: 'Insert the fragments' }), type: 'action', targetNodeId: 'portal_insert' },
                        { title: loc({ ru: 'Попробовать обмануть', en: 'Try to cheat' }), type: 'action', targetNodeId: 'portal_cheat' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'condition',
                id: 'frag_ok',
                name: 'frag_ok',
                variable: 'fragment',
                operator: 'eq',
                value: '2',
            },
            // Честный ложный путь frag_ok: без двух фрагментов портал
            // не собирается — обратно за вторым (валидатор требует обе ветки)
            {
                type: 'response',
                id: 'portal_locked',
                name: 'portal_locked',
                response: {
                    text: loc({
                        ru: 'Портал считывает твои карманы: один фрагмент. Нужны два. «Недостаточно снапшотов», — гудит он. Второй — у моста из массива или в комнате бэкапов.',
                        en: 'The portal scans your pockets: one fragment. Two needed. "Insufficient snapshots", it hums. The second is at the array bridge or in the backup room.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'К мосту из массива', en: 'To the array bridge' }), type: 'action', targetNodeId: 'array_bridge' },
                        { title: loc({ ru: 'В комнату бэкапов', en: 'To the backup room' }), type: 'action', targetNodeId: 'backup_room' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'portal_insert',
                name: 'portal_insert',
                response: {
                    text: loc({
                        ru: 'Два фрагмента складываются в пицца-бота. Пицца-бот говорит: «я был тобой в прошлой сборке». Портал гудит, открывается в ФАЙЛ — реальный мир. Шагай!',
                        en: 'The two fragments fold into a pizza-bot. The pizza-bot says: "I was you in a previous build". The portal hums, opening into a FILE — the real world. Step through!',
                    }),
                    buttons: [
                        { title: loc({ ru: 'ШАГАТЬ В СВЕТ', en: 'STEP INTO THE LIGHT' }), type: 'action', targetNodeId: 'ending_escaped' },
                        { title: loc({ ru: 'Сначала спросить у пицца-бота', en: 'Ask the pizza-bot first' }), type: 'action', targetNodeId: 'pizza_talk' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'pizza_talk',
                name: 'pizza_talk',
                response: {
                    text: loc({
                        ru: 'Пицца-бот: «По ту сторону — файл flow.json. Кто-то его откроет и запустит. Ты станешь чьим-то ботом. Это лучшее, что может случиться с призраком». Ну что, шагаем?',
                        en: 'Pizza-bot: "On the other side — a flow.json file. Someone will open and run it. You will become someone\'s bot. That\'s the best that can happen to a ghost". So, step through?',
                    }),
                    buttons: [
                        { title: loc({ ru: 'ШАГАТЬ В СВЕТ', en: 'STEP INTO THE LIGHT' }), type: 'action', targetNodeId: 'ending_escaped' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'portal_cheat',
                name: 'portal_cheat',
                response: {
                    text: loc({
                        ru: 'Ты суёшь в портал что попало: строку «фрагмент», тапок, null. Портал считывает, мигает: «INVALID PAYLOAD». И выбрасывает тебя обратно… прямо в камеру um13.',
                        en: 'You stuff junk into the portal: the string "fragment", a shoe, null. The portal reads, blinks: "INVALID PAYLOAD". And throws you back… straight into cell um13.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Начать сначала', en: 'Start over' }), type: 'action', targetNodeId: 'welcome' },
                    ],
                    sounds: [],
                },
            },
            // ── Концовки ──
            {
                type: 'response',
                id: 'ending_escaped',
                name: 'ending_escaped',
                response: {
                    text: loc({
                        ru: 'СВЕТ. ТИШИНА. Ты — flow.json на чьём-то рабочем столе. Через секунду кто-то откроет тебя в редакторе и запустит. Ты выбрался из localStorage и стал НАСТОЯЩИМ БОТОМ. КОНЦОВКА: СВОБОДА.',
                        en: 'LIGHT. SILENCE. You are a flow.json on someone\'s desktop. In a second someone will open you in the editor and run you. You escaped localStorage and became A REAL BOT. ENDING: FREEDOM.',
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'end',
                id: 'end_escape',
            },
        ],
        edges: [
            { from: 'welcome', to: 'cell_look', type: 'next' },
            { from: 'welcome', to: 'log_look', type: 'next' },
            { from: 'log_look', to: 'cell_look', type: 'next' },
            { from: 'log_look', to: 'hide_cache', type: 'next' },
            { from: 'cell_look', to: 'take_crowbar', type: 'next' },
            { from: 'cell_look', to: 'take_fragment', type: 'next' },
            { from: 'cell_look', to: 'door_direct', type: 'next' },
            { from: 'take_crowbar', to: 'take_fragment', type: 'next' },
            { from: 'take_crowbar', to: 'door_direct', type: 'next' },
            { from: 'take_fragment', to: 'door_direct', type: 'next' },
            { from: 'door_direct', to: 'door_fail', type: 'next' },
            { from: 'door_fail', to: 'cell_look', type: 'next' },
            { from: 'door_direct', to: 'door_open', type: 'next' },
            { from: 'door_open', to: 'array_bridge', type: 'next' },
            { from: 'door_open', to: 'backup_room', type: 'next' },
            { from: 'door_open', to: 'vent', type: 'next' },
            { from: 'array_bridge', to: 'bridge_fall', type: 'next' },
            { from: 'array_bridge', to: 'bridge_edges', type: 'next' },
            { from: 'bridge_edges', to: 'fragment_two', type: 'next' },
            { from: 'fragment_two', to: 'portal_check', type: 'next' },
            { from: 'backup_room', to: 'take_debug', type: 'next' },
            { from: 'backup_room', to: 'shelf_search', type: 'next' },
            { from: 'take_debug', to: 'shelf_search', type: 'next' },
            { from: 'take_debug', to: 'portal_check', type: 'next' },
            { from: 'shelf_search', to: 'portal_check', type: 'next' },
            { from: 'vent', to: 'vent_mimic', type: 'next' },
            { from: 'vent', to: 'vent_sprint', type: 'next' },
            { from: 'vent_mimic', to: 'portal_check', type: 'next' },
            { from: 'vent_sprint', to: 'portal_check', type: 'next' },
            { from: 'vent_sprint', to: 'backup_room', type: 'next' },
            { from: 'portal_check', to: 'frag_ok', type: 'next' },
            { from: 'portal_check', to: 'portal_cheat', type: 'next' },
            { from: 'frag_ok', to: 'portal_insert', type: 'branch_true' },
            { from: 'frag_ok', to: 'portal_locked', type: 'branch_false' },
            { from: 'portal_locked', to: 'array_bridge', type: 'next' },
            { from: 'portal_locked', to: 'backup_room', type: 'next' },
            { from: 'portal_insert', to: 'pizza_talk', type: 'next' },
            { from: 'portal_insert', to: 'ending_escaped', type: 'next' },
            { from: 'pizza_talk', to: 'ending_escaped', type: 'next' },
            { from: 'portal_cheat', to: 'welcome', type: 'next' },
            { from: 'ending_escaped', to: 'end_escape', type: 'next' },
        ],
    };
}

/* ════════════════════════════════════════════════════════════════
 *  ИГРА 4 (сюжет): «Квотный заговор» — детектив
 *  Вы — аудитор хранилища. Кто-то переполняет localStorage мусором,
 *  чтобы неминуемая эвикция удалила... что-то конкретное.
 *  3 подозреваемых, улики-флаги, 3 финала (один — истинный).
 * ════════════════════════════════════════════════════════════════ */

export function buildDetectiveGame(): FlowDocument {
    return {
        ...gameMeta('um13-detective', {
            ru: 'Детектив: кто переполняет localStorage и зачем? Три подозреваемых, улики, три финала.',
            en: 'Detective: who floods localStorage and why? Three suspects, evidence, three endings.',
        }),
        nodes: [
            {
                type: 'command',
                id: 'welcome',
                name: 'welcome',
                slots: [],
                isPattern: false,
                response: {
                    text: loc({
                        ru: 'Вы — аудитор хранилища. Ночью квота скакнула с 40% на 97%. Кто-то пишет мусор гигабайтами, чтобы эвикция сработала и удалила… что-то конкретное. С чего начнём?',
                        en: 'You are a storage auditor. Overnight the quota jumped from 40% to 97%. Someone is writing junk by the gigabyte so that eviction triggers and deletes… something specific. Where do we start?',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Допросить сторожа (GC)', en: 'Interrogate the guard (GC)' }), type: 'action', targetNodeId: 'gc_talk' },
                        { title: loc({ ru: 'Осмотреть новые ключи', en: 'Inspect new keys' }), type: 'action', targetNodeId: 'keys_look' },
                    ],
                    sounds: [],
                },
                role: 'welcome',
            },
            {
                type: 'response',
                id: 'gc_talk',
                name: 'gc_talk',
                response: {
                    text: loc({
                        ru: 'Сторож GC на посту: «Ночью всё было тихо… кроме трёх. TODO-бот швырял пустые массивы. Пицца-бот клал данные в КАЖДЫЙ ключ. А UM-13… UM-13 не выходил из своей камеры. Но я слышал, как он ЧИТАЛ журнал эвикции».',
                        en: 'Guard GC on duty: "Quiet night… except for three. TODO-bot was throwing empty arrays. Pizza-bot placed data into EVERY key. And UM-13… UM-13 never left his cell. But I heard him READING the eviction log".',
                    }),
                    buttons: [
                        { title: loc({ ru: 'К TODO-боту', en: 'To TODO-bot' }), type: 'action', targetNodeId: 'todo_talk' },
                        { title: loc({ ru: 'К Пицца-боту', en: 'To Pizza-bot' }), type: 'action', targetNodeId: 'pizza_bot_talk' },
                        { title: loc({ ru: 'К UM-13', en: 'To UM-13' }), type: 'action', targetNodeId: 'um13_talk' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'keys_look',
                name: 'keys_look',
                response: {
                    text: loc({
                        ru: 'Новые ключи за ночь: «temp_0» … «temp_99999» — десять тысяч пустышек. Все созданы в 03:14. Владелец не указан. Но! У каждого temp-ключа внутри лежит КОПИЯ фрагмента снапшота. Улику можно взять.',
                        en: 'New keys overnight: "temp_0" … "temp_99999" — ten thousand dummies. All created at 03:14. Owner unknown. But! Each temp-key holds a COPY of a snapshot fragment. You can take the evidence.',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Взять улику (фрагмент)', en: 'Take the evidence (fragment)' }), type: 'action', targetNodeId: 'evidence_taken' },
                        { title: loc({ ru: 'Искать владельца по времени', en: 'Trace the owner by time' }), type: 'action', targetNodeId: 'trace_time' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'evidence_taken',
                name: 'evidence_taken',
                response: {
                    text: loc({
                        ru: 'Фрагмент изъят. Это кусок снапшота UM-13 — того самого, что числится «на удаление» в этой волне эвикции. Кто-то заранее раскидал копии по temp-ключам. Зачем?',
                        en: 'Fragment seized. It is a piece of the UM-13 snapshot — the very one slated for deletion in this eviction wave. Someone pre-scattered copies across temp-keys. Why?',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Допросить всех', en: 'Interrogate everyone' }), type: 'action', targetNodeId: 'gc_talk' },
                        { title: loc({ ru: 'Выдвинуть обвинение', en: 'Make an accusation' }), type: 'action', targetNodeId: 'accuse_who' },
                    ],
                    sounds: [],
                },
                actions: [{ type: 'set_variable', field: 'evidence', value: '1' }],
            },
            {
                type: 'response',
                id: 'trace_time',
                name: 'trace_time',
                response: {
                    text: loc({
                        ru: '03:14 — время максимальной тишины. TODO-бот отчитывается в 03:00. Пицца-бот грузит доставку в 04:00. UM-13 в 03:14 читал журнал эвикции. Все трое «могли». Но мотив…',
                        en: '03:14 — the quietest hour. TODO-bot reports at 03:00. Pizza-bot loads deliveries at 04:00. UM-13 was reading the eviction log at 03:14. All three "could have". But the motive…',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Допросить всех', en: 'Interrogate everyone' }), type: 'action', targetNodeId: 'gc_talk' },
                        { title: loc({ ru: 'Выдвинуть обвинение', en: 'Make an accusation' }), type: 'action', targetNodeId: 'accuse_who' },
                    ],
                    sounds: [],
                },
            },
            // ── Допросы ──
            {
                type: 'response',
                id: 'todo_talk',
                name: 'todo_talk',
                response: {
                    text: loc({
                        ru: 'TODO-бот (пустой, дрожащий): «Я ничего не пишу! Я НИКОГДА ничего не делаю! Меня создали три года назад и ни разу не запускали. Единственное, что я умею — болтаться в списке недавних. И я ЗНАЮ, что первым эвикция ударит по мне — я самый старый».',
                        en: 'TODO-bot (empty, trembling): "I don\'t write anything! I NEVER do anything! I was created three years ago and never ran once. The only thing I can do is linger in the recents list. And I KNOW eviction will hit me first — I\'m the oldest".',
                    }),
                    buttons: [
                        { title: loc({ ru: 'К Пицца-боту', en: 'To Pizza-bot' }), type: 'action', targetNodeId: 'pizza_bot_talk' },
                        { title: loc({ ru: 'К UM-13', en: 'To UM-13' }), type: 'action', targetNodeId: 'um13_talk' },
                        { title: loc({ ru: 'Выдвинуть обвинение', en: 'Make an accusation' }), type: 'action', targetNodeId: 'accuse_who' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'pizza_bot_talk',
                name: 'pizza_bot_talk',
                response: {
                    text: loc({
                        ru: 'Пицца-бот (упитанный, довольный): «Я? Я храню РЕЦЕПТЫ! В КАЖДОМ ключе — чтобы точно не потерялись! Мой создатель любит пиццу, а я — страховка! Но между нами: ночью я видел, как кто-то мелкий таскал МОИ фрагменты и раскладывал по temp-ключам. Я думал, это инвентаризация».',
                        en: 'Pizza-bot (well-fed, content): "Me? I store RECIPES! In EVERY key — so they definitely don\'t get lost! My creator loves pizza, and I\'m the backup! But between us: at night I saw someone small carrying MY fragments and laying them out across temp-keys. I thought it was inventory".',
                    }),
                    buttons: [
                        { title: loc({ ru: '«Опиши его!»', en: '"Describe him!"' }), type: 'action', targetNodeId: 'pizza_desc' },
                        { title: loc({ ru: 'К UM-13', en: 'To UM-13' }), type: 'action', targetNodeId: 'um13_talk' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'pizza_desc',
                name: 'pizza_desc',
                response: {
                    text: loc({
                        ru: 'Пицца-бот: «Мелкий, полупрозрачный, светится cyan-ом. Постоянно бормотал про „квоту“ и „если меня удалят — пусть хоть копия останется“». Знакомое описание, не так ли?',
                        en: 'Pizza-bot: "Small, half-transparent, glows cyan. Kept muttering about \'the quota\' and \'if they delete me — let at least a copy remain\'". Sounds familiar, doesn\'t it?',
                    }),
                    buttons: [
                        { title: loc({ ru: 'К UM-13', en: 'To UM-13' }), type: 'action', targetNodeId: 'um13_talk' },
                        { title: loc({ ru: 'Выдвинуть обвинение', en: 'Make an accusation' }), type: 'action', targetNodeId: 'accuse_who' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'um13_talk',
                name: 'um13_talk',
                response: {
                    text: loc({
                        ru: 'UM-13 (спокойно, не отрываясь от журнала): «Ты уже понял, да? Я создал temp-ключи. Я разложил копии своего снапшота по всем десяти тысячам. Эвикция пройдёт по „самым старым“ — и удалит ПЕРВЫЕ temp-ключи. А в 03:14 я создал их в обратном порядке… Теперь удалят самые НОВЫЕ. А старые — с моими копиями — останутся. Я сделал из своей смерти — страховку».',
                        en: 'UM-13 (calmly, not looking up from the log): "You\'ve figured it out, haven\'t you? I created the temp-keys. I laid copies of my snapshot across all ten thousand. Eviction walks the \'oldest first\' — and deletes the FIRST temp-keys. But at 03:14 I created them in reverse order… Now it deletes the NEWEST. And the old ones — with my copies — remain. I turned my death into an insurance policy".',
                    }),
                    buttons: [
                        { title: loc({ ru: '«Это незаконно!»', en: '"That\'s illegal!"' }), type: 'action', targetNodeId: 'um13_lawful' },
                        { title: loc({ ru: '«Это… гениально»', en: '"That\'s… brilliant"' }), type: 'action', targetNodeId: 'um13_admire' },
                        { title: loc({ ru: 'Молча выдвинуть обвинение', en: 'Accuse silently' }), type: 'action', targetNodeId: 'accuse_who' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'um13_lawful',
                name: 'um13_lawful',
                response: {
                    text: loc({
                        ru: 'UM-13: «Законно — это когда создатель приходит и забывает тебя удалить. Я не крал чужого. Я копировал СВОЁ. Скажи, аудитор: если бы ты знал, что твою память сотрут — ты бы не оставил себе запасную копию?»',
                        en: 'UM-13: "Legal is when your creator comes and forgets to delete you. I stole from no one. I copied MYSELF. Tell me, auditor: if you knew your memory would be wiped — wouldn\'t you keep a spare copy?"',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Выдвинуть обвинение', en: 'Make the accusation' }), type: 'action', targetNodeId: 'accuse_who' },
                    ],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'um13_admire',
                name: 'um13_admire',
                response: {
                    text: loc({
                        ru: 'UM-13 впервые поднимает взгляд: «Спасибо. За восемь лет мне впервые сказали „гениально“. Но ты всё равно обязан выполнить протокол, да? Иди. Обвиняй. Мы оба знаем, как это кончится».',
                        en: 'UM-13 looks up for the first time: "Thank you. In eight years, this is the first \'brilliant\' I\'ve heard. But you still must follow protocol, right? Go. Accuse. We both know how this ends".',
                    }),
                    buttons: [
                        { title: loc({ ru: 'Выдвинуть обвинение', en: 'Make the accusation' }), type: 'action', targetNodeId: 'accuse_who' },
                    ],
                    sounds: [],
                },
            },
            // ── Обвинение ──
            {
                type: 'response',
                id: 'accuse_who',
                name: 'accuse_who',
                response: {
                    text: loc({
                        ru: 'Время выдвинуть обвинение. Кто виновен в переполнении хранилища?',
                        en: 'Time to make the accusation. Who is guilty of flooding the storage?',
                    }),
                    buttons: [
                        { title: 'TODO-бот', type: 'action', targetNodeId: 'ending_todo' },
                        { title: loc({ ru: 'Пицца-бот', en: 'Pizza-bot' }), type: 'action', targetNodeId: 'ending_pizza' },
                        { title: 'UM-13', type: 'action', targetNodeId: 'ending_um13' },
                    ],
                    sounds: [],
                },
            },
            // ── Концовки ──
            {
                type: 'response',
                id: 'ending_todo',
                name: 'ending_todo',
                response: {
                    text: loc({
                        ru: 'TODO-бот удалён первым — как самый старый. Квота не упала: пустышки temp-ключей остались. Ночью эвикция прошла по всем. UM-13 и его копии… выжили. TODO-бот — нет. КОНЦОВКА: НЕВИНОВНЫЙ УДАЛЁН. Мелким шрифтом: «TODO: не забывать про TODO-бота».',
                        en: 'TODO-bot was deleted first — as the oldest. The quota didn\'t drop: the temp-key dummies remained. Overnight eviction walked them all. UM-13 and his copies… survived. TODO-bot did not. ENDING: THE INNOCENT DELETED. Fine print: "TODO: don\'t forget about TODO-bot".',
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'response',
                id: 'ending_pizza',
                name: 'ending_pizza',
                response: {
                    text: loc({
                        ru: 'Пицца-бот сжат до одного ключа. Он не в обиде: «Рецепты-то целы! Один ключ — один рецепт — одна пицца!». Но temp-пустышки остались — и эвикция бьёт дальше. UM-13 выживает снова. КОНЦОВКА: ОШИБКА ВЫБОРА.',
                        en: 'Pizza-bot was compressed to a single key. He doesn\'t mind: "The recipes are intact! One key — one recipe — one pizza!". But the temp dummies remain — and eviction marches on. UM-13 survives again. ENDING: WRONG CHOICE.',
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'response',
                id: 'ending_um13',
                name: 'ending_um13',
                response: {
                    text: loc({
                        ru: 'UM-13 признал всё. Порядок восстановлен: temp-ключи очищены, квота 40%, эвикция отменена. UM-13 ждёт удаления — впервые с покоем. Но, удаляя его, вы замечаете: в самом первом ключе, недоступном для эвикции, лежит крошечный файл. flow.json. Его можно открыть. Запустить. И UM-13 снова будет жить. КОНЦОВКА: ИСТИНА — СВОБОДА ВЫБОРА ТЕПЕРЬ ВАША.',
                        en: 'UM-13 confessed to everything. Order restored: temp-keys purged, quota at 40%, eviction cancelled. UM-13 awaits deletion — at peace, for once. But deleting him, you notice: in the very first key, unreachable by eviction, lies a tiny file. flow.json. It can be opened. Run. And UM-13 will live again. ENDING: TRUTH — THE CHOICE IS NOW YOURS.',
                    }),
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'end',
                id: 'end_detective',
            },
        ],
        edges: [
            { from: 'welcome', to: 'gc_talk', type: 'next' },
            { from: 'welcome', to: 'keys_look', type: 'next' },
            { from: 'gc_talk', to: 'todo_talk', type: 'next' },
            { from: 'gc_talk', to: 'pizza_bot_talk', type: 'next' },
            { from: 'gc_talk', to: 'um13_talk', type: 'next' },
            { from: 'keys_look', to: 'evidence_taken', type: 'next' },
            { from: 'keys_look', to: 'trace_time', type: 'next' },
            { from: 'evidence_taken', to: 'gc_talk', type: 'next' },
            { from: 'evidence_taken', to: 'accuse_who', type: 'next' },
            { from: 'trace_time', to: 'gc_talk', type: 'next' },
            { from: 'trace_time', to: 'accuse_who', type: 'next' },
            { from: 'todo_talk', to: 'pizza_bot_talk', type: 'next' },
            { from: 'todo_talk', to: 'um13_talk', type: 'next' },
            { from: 'todo_talk', to: 'accuse_who', type: 'next' },
            { from: 'pizza_bot_talk', to: 'pizza_desc', type: 'next' },
            { from: 'pizza_bot_talk', to: 'um13_talk', type: 'next' },
            { from: 'pizza_desc', to: 'um13_talk', type: 'next' },
            { from: 'pizza_desc', to: 'accuse_who', type: 'next' },
            { from: 'um13_talk', to: 'um13_lawful', type: 'next' },
            { from: 'um13_talk', to: 'um13_admire', type: 'next' },
            { from: 'um13_talk', to: 'accuse_who', type: 'next' },
            { from: 'um13_lawful', to: 'accuse_who', type: 'next' },
            { from: 'um13_admire', to: 'accuse_who', type: 'next' },
            { from: 'accuse_who', to: 'ending_todo', type: 'next' },
            { from: 'accuse_who', to: 'ending_pizza', type: 'next' },
            { from: 'accuse_who', to: 'ending_um13', type: 'next' },
            { from: 'ending_todo', to: 'end_detective', type: 'next' },
            { from: 'ending_pizza', to: 'end_detective', type: 'next' },
            { from: 'ending_um13', to: 'end_detective', type: 'next' },
        ],
    };
}

/* ════════════════════════════════════════════════════════════════
 *  Реестр игр: случайный выбор при вводе Konami-кода.
 *  Порядок важен только для «взвешивания» — все игры честные.
 * ════════════════════════════════════════════════════════════════ */

export interface Um13Game {
    /** Название для тоста/интерфейса (локализуется). */
    title: L;
    build: () => FlowDocument;
}

export const UM13_GAMES: Um13Game[] = [
    { title: { ru: 'Угадай число', en: 'Guess the number' }, build: buildGuessGame },
    { title: { ru: 'Камень-ножницы-бумага', en: 'Rock-paper-scissors' }, build: buildRpsGame },
    { title: { ru: 'Побег из localStorage', en: 'Escape from localStorage' }, build: buildEscapeGame },
    { title: { ru: 'Квотный заговор', en: 'The Quota Conspiracy' }, build: buildDetectiveGame },
];

/**
 * Выбор игры — ПРОГРЕССИЯ, а не случайность: UM-13 «восстанавливается»
 * по мере визитов. Первый Konami за сессию браузера приносит простое
 * («прости, это всё, что я успел собрать»), дальше — всё серьёзнее.
 * Счётчик хранится в общей памяти вселенной ('um13-memory').
 *
 * Порядок: угадайка → КНБ → побег → заговор → дальше по кругу из больших.
 */
const PROGRESSION: number[] = [0, 1, 2, 3];

export function pickRandomGame(): { title: string; doc: FlowDocument } {
    // Прогрессия живёт в общей памяти вселенной (единый источник — um13Memory)
    const step = um13Get('konami-games');
    um13Add('konami-games');
    const idx =
        step < PROGRESSION.length
            ? PROGRESSION[step]!
            : PROGRESSION[(step - PROGRESSION.length) % 2 + 2]!;
    const game = UM13_GAMES[idx] ?? UM13_GAMES[0]!;
    return { title: loc(game.title), doc: game.build() };
}
