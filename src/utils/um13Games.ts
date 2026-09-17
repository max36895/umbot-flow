import type {
    ActionBlock,
    ConditionOperator,
    FlowDocument,
    FlowEdge,
    FlowNodeData,
} from '../types/flow';
import { getLocale } from '../i18n';
import { um13Add, um13Get } from './um13Memory';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ИГРЫ UM-13 — пресеты для Konami-пасхалки редактора.
 * ═══════════════════════════════════════════════════════════════
 *
 * Каждая игра — ЧЕСТНЫЙ FlowDocument: собирается на канвасе,
 * проигрывается в превью, экспортируется и запускается через CLI
 * (`umbot create from-flow`) с тем же поведением, что и в превью.
 *
 * Модель umbot, на которой построены игры:
 *   • один ввод пользователя → одно сообщение бота; «Ответ», «Действие»
 *     и «Условие» выполняются сразу, их тексты склеиваются в одно сообщение
 *   • ждёт пользователя только «Шаг»: вопрос задаёт блок ПЕРЕД шагом,
 *     а текст шага — реакция на уже полученный ответ
 *   • кнопка с переходом (targetNodeId) сразу выполняет свой блок — так устроен
 *     выбор в квестах; кнопка без перехода отправляет свой текст как сообщение
 *   • actions у «Ответа» CLI не генерирует — счётчики/флаги живут в «Действиях»
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

/** Welcome-команда игры. */
function welcomeCommand(text: L, buttons: L[] = []): FlowNodeData {
    return {
        type: 'command',
        id: 'welcome',
        name: 'welcome',
        slots: [],
        isPattern: false,
        response: {
            text: loc(text),
            buttons: buttons.map((b) => ({ title: loc(b), type: 'action' as const })),
            sounds: [],
        },
        role: 'welcome',
    };
}

/** Кнопка ответа: текст и (необязательно) блок, на который она переходит. */
interface ButtonSpec {
    title: L;
    target?: string;
}

/** Блок «Ответ». */
function response(
    id: string,
    text: L,
    extra: { isEnd?: boolean; buttons?: (L | ButtonSpec)[] } = {},
): FlowNodeData {
    return {
        type: 'response',
        id,
        name: id,
        response: {
            text: loc(text),
            buttons: (extra.buttons ?? []).map((b) => {
                const spec: ButtonSpec = 'title' in b ? b : { title: b };
                return {
                    title: loc(spec.title),
                    type: 'action' as const,
                    ...(spec.target ? { targetNodeId: spec.target } : {}),
                };
            }),
            sounds: [],
            ...(extra.isEnd ? { isEnd: true } : {}),
        },
    };
}

/** Блок «Действие» без текста (счётчики, флаги). */
function action(id: string, actions: ActionBlock[]): FlowNodeData {
    return { type: 'action', id, name: id, actions, text: '', buttons: [] };
}

/** Блок «Условие». */
function condition(
    id: string,
    variable: string,
    operator: ConditionOperator,
    value: string,
): FlowNodeData {
    return { type: 'condition', id, name: id, variable, operator, value };
}

const next = (from: string, to: string): FlowEdge => ({ from, to, type: 'next' });
const yes = (from: string, to: string): FlowEdge => ({ from, to, type: 'branch_true' });
const no = (from: string, to: string): FlowEdge => ({ from, to, type: 'branch_false' });

/* ════════════════════════════════════════════════════════════════
 *  Квест из сцен: сцена = выбор кнопкой
 * ════════════════════════════════════════════════════════════════ */

interface Choice {
    title: L;
    /** id сцены или проверки, куда ведёт выбор. */
    to: string;
}

interface Scene {
    kind: 'scene';
    id: string;
    text: L;
    choices: Choice[];
    /** Флаги/счётчики, выставляемые при входе в сцену. */
    set?: ActionBlock[];
    isEnd?: boolean;
}

interface Check {
    kind: 'check';
    id: string;
    variable: string;
    operator: ConditionOperator;
    value: string;
    yes: string;
    no: string;
}

const scene = (
    id: string,
    text: L,
    choices: Choice[] = [],
    extra: { set?: ActionBlock[]; isEnd?: boolean } = {},
): Scene => ({ kind: 'scene', id, text, choices, ...extra });

const check = (
    id: string,
    variable: string,
    operator: ConditionOperator,
    value: string,
    ifYes: string,
    ifNo: string,
): Check => ({ kind: 'check', id, variable, operator, value, yes: ifYes, no: ifNo });

const go = (title: L, to: string): Choice => ({ title, to });

/**
 * Собирает граф квеста:
 *
 *   [Действие id_set] → Ответ id (текст + кнопки с переходом на следующие сцены)
 *
 * Кнопка сцены ведёт прямо на следующую сцену или проверку: в боте это действие
 * `[go:N]`, выбор срабатывает по нажатию, без шага и условий на текст кнопки.
 * Проверки (флаги) — «Условия» с ветками на сцены. Переходы идут кнопками, а не
 * связями, поэтому циклов из блоков (которые CLI отклоняет) не возникает.
 */
function buildQuest(
    start: string,
    parts: (Scene | Check)[],
): Pick<FlowDocument, 'nodes' | 'edges'> {
    const byId = new Map(parts.map((p) => [p.id, p]));
    const entry = (id: string): string => {
        const part = byId.get(id);
        if (!part) throw new Error(`um13Games: неизвестная сцена «${id}»`);
        return part.kind === 'scene' && part.set ? `${id}_set` : id;
    };

    const nodes: FlowNodeData[] = [];
    const edges: FlowEdge[] = [];

    // Текст приветствия — в первой сцене: у команды со связанным текстовым блоком
    // CLI собственный текст не отправляет
    nodes.push(welcomeCommand({ ru: '', en: '' }));
    edges.push(next('welcome', entry(start)));

    for (const part of parts) {
        if (part.kind === 'check') {
            nodes.push(condition(part.id, part.variable, part.operator, part.value));
            edges.push(yes(part.id, entry(part.yes)), no(part.id, entry(part.no)));
            continue;
        }

        if (part.set) {
            nodes.push(action(`${part.id}_set`, part.set));
            edges.push(next(`${part.id}_set`, part.id));
        }
        nodes.push(
            response(part.id, part.text, {
                isEnd: part.isEnd,
                buttons: part.choices.map((c) => ({ title: c.title, target: entry(c.to) })),
            }),
        );
    }

    return { nodes, edges };
}

/* ════════════════════════════════════════════════════════════════
 *  ИГРА 1: «Камень-ножницы-бумага» (серия до 3 побед)
 *  Механика: random 1–3, сравнение с выбором игрока (число 1–3)
 * ════════════════════════════════════════════════════════════════ */

export function buildRpsGame(): FlowDocument {
    const ASK: L = {
        ru: 'Твой бросок: 1 — камень ✊, 2 — ножницы ✌️, 3 — бумага ✋.',
        en: 'Your throw: 1 — rock ✊, 2 — scissors ✌️, 3 — paper ✋.',
    };
    const THROWS: L[] = [
        { ru: '1', en: '1' },
        { ru: '2', en: '2' },
        { ru: '3', en: '3' },
    ];
    return {
        ...gameMeta('um13-rps', {
            ru: 'Камень-ножницы-бумага против UM-13. Первым до 3 побед.',
            en: 'Rock-paper-scissors vs UM-13. First to 3 wins.',
        }),
        nodes: [
            welcomeCommand(
                {
                    ru: 'Камень-ножницы-бумага против меня! Скажи «старт» — счёт обнулится. Первый до 3 побед забирает localStorage.',
                    en: 'Rock-paper-scissors against me! Say "start" to reset the score. First to 3 wins takes localStorage.',
                },
                [{ ru: 'Старт', en: 'Start' }],
            ),
            // Матч-триггер: обнуление счёта — один раз за команду. На шаге его держать
            // нельзя: шаг цикличен, счёт обнулялся бы после КАЖДОГО раунда.
            {
                type: 'command',
                id: 'start_match',
                name: 'start_match',
                slots: [loc({ ru: 'старт', en: 'start' })],
                isPattern: false,
                response: {
                    text: `${loc({ ru: 'Счёт 0:0. Погнали!', en: 'Score 0:0. Go!' })} ${loc(ASK)}`,
                    buttons: THROWS.map((b) => ({ title: loc(b), type: 'action' as const })),
                    sounds: [],
                },
                actions: [
                    { type: 'set_variable', field: 'you', value: '0' },
                    { type: 'set_variable', field: 'me', value: '0' },
                ],
            },
            // Шаг ждёт бросок. Текста у шага нет: вопрос задан перед ним,
            // а реакция (ничья/победа) — в ответах после проверок.
            // diff = (my - throw + 3) % 3: 0=ничья, 1=бот победил, 2=игрок победил.
            {
                type: 'step',
                id: 'ask_throw',
                name: 'ask_throw',
                prompt: { text: '', buttons: [] },
                saveTo: 'throw',
                saveAs: 'original',
                actions: [
                    { type: 'random_number', field: 'my', min: 1, max: 3 },
                    { type: 'set_variable', field: 'diff', value: '(my - throw + 3) % 3' },
                ],
            },
            condition('check_draw', 'diff', 'eq', '0'),
            response('say_draw', {
                ru: 'Ничья! Оба показали одинаковое.',
                en: 'Draw! We both showed the same.',
            }),
            condition('check_player', 'diff', 'eq', '2'),
            action('add_you', [{ type: 'set_variable', field: 'you', value: 'you + 1' }]),
            response('you_win', {
                ru: 'Ты выиграл раунд! Счёт: ты {{you}} — я {{me}}.',
                en: 'You won the round! Score: you {{you}} — me {{me}}.',
            }),
            action('add_me', [{ type: 'set_variable', field: 'me', value: 'me + 1' }]),
            response('i_win', {
                ru: 'Раунд за мной! Счёт: ты {{you}} — я {{me}}.',
                en: 'Round is mine! Score: you {{you}} — me {{me}}.',
            }),
            condition('check_match', 'you', 'gte', '3'),
            response(
                'you_champion',
                {
                    ru: '🏆 МАТЧ ТВОЙ! 3 победы. localStorage переходит к тебе. UM-13 кланяется и удаляется…',
                    en: '🏆 THE MATCH IS YOURS! 3 wins. localStorage belongs to you. UM-13 bows and leaves…',
                },
                { isEnd: true },
            ),
            condition('check_match_me', 'me', 'gte', '3'),
            response(
                'i_champion',
                {
                    ru: '💀 Матч за мной. localStorage теперь МОЙ. Переигровка? Скажи «старт». Я думал, ты собираешь ботов, а не играешь с призраками.',
                    en: '💀 The match is mine. localStorage is MINE now. Rematch? Say "start". I thought you build bots, not play with ghosts.',
                },
                { isEnd: true },
            ),
            // Следующий бросок: вопрос перед возвратом на шаг
            response('ask_again', ASK, { buttons: THROWS }),
        ],
        edges: [
            next('start_match', 'ask_throw'),
            next('ask_throw', 'check_draw'),
            yes('check_draw', 'say_draw'),
            next('say_draw', 'ask_again'),
            no('check_draw', 'check_player'),
            yes('check_player', 'add_you'),
            next('add_you', 'you_win'),
            no('check_player', 'add_me'),
            next('add_me', 'i_win'),
            next('you_win', 'check_match'),
            next('i_win', 'check_match_me'),
            yes('check_match', 'you_champion'),
            no('check_match', 'ask_again'),
            yes('check_match_me', 'i_champion'),
            no('check_match_me', 'ask_again'),
            next('ask_again', 'ask_throw'),
        ],
    };
}

/* ════════════════════════════════════════════════════════════════
 *  ИГРА 2: «Угадай число» (классика)
 *  Механика: random_number 1–100 → подсказки больше/меньше, 7 попыток
 * ════════════════════════════════════════════════════════════════ */

export function buildGuessGame(): FlowDocument {
    return {
        ...gameMeta('um13-guess', {
            ru: 'Классическая «Угадай число» от UM-13. Бот загадал 1–100.',
            en: 'Classic "Guess the number" by UM-13. Range 1–100.',
        }),
        nodes: [
            welcomeCommand(
                {
                    ru: 'Я загадаю число от 1 до 100. Скажи «старт» — и проверим, угадаешь ли за 7 попыток!',
                    en: 'I will pick a number from 1 to 100. Say "start" — let\'s see if you can guess it in 7 tries!',
                },
                [{ ru: 'Старт', en: 'Start' }],
            ),
            // Загадывание — на ОТДЕЛЬНОЙ команде (триггер «старт» / кнопка): actions шага
            // исполняются при КАЖДОМ ответе — секрет менялся бы каждый ход.
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
                    { type: 'set_variable', field: 'tries', value: '0' },
                ],
            },
            // Шаг принимает вариант и списывает попытку
            {
                type: 'step',
                id: 'ask_guess',
                name: 'ask_guess',
                prompt: { text: '', buttons: [] },
                saveTo: 'guess',
                saveAs: 'original',
                actions: [{ type: 'set_variable', field: 'tries', value: 'tries + 1' }],
            },
            condition('check_win', 'guess', 'eq', 'secret'),
            response(
                'say_win',
                {
                    ru: '🎉 Точно! Это {{secret}}. Ты выиграл! Попыток: {{tries}}.',
                    en: '🎉 Exactly! It was {{secret}}. You won in {{tries}} tries!',
                },
                { isEnd: true },
            ),
            condition('check_high', 'guess', 'gt', 'secret'),
            response('say_higher', {
                ru: 'Моё число МЕНЬШЕ {{guess}}.',
                en: 'My number is LOWER than {{guess}}.',
            }),
            response('say_lower', {
                ru: 'Моё число БОЛЬШЕ {{guess}}.',
                en: 'My number is HIGHER than {{guess}}.',
            }),
            // Лимит честных «7 попыток» из приветствия
            condition('check_tries', 'tries', 'gte', '7'),
            response(
                'say_lose',
                {
                    ru: 'Попытки кончились. Это было {{secret}}. Хранилище выиграло — бывает. Скажи «старт» — отыграемся.',
                    en: 'Out of tries. It was {{secret}}. The storage wins — it happens. Say "start" for a rematch.',
                },
                { isEnd: true },
            ),
            response('ask_more', {
                ru: 'Попытка {{tries}} из 7. Твой вариант:',
                en: 'Try {{tries}} of 7. Your guess:',
            }),
        ],
        edges: [
            next('start_round', 'ask_guess'),
            next('ask_guess', 'check_win'),
            yes('check_win', 'say_win'),
            no('check_win', 'check_high'),
            yes('check_high', 'say_higher'),
            no('check_high', 'say_lower'),
            next('say_higher', 'check_tries'),
            next('say_lower', 'check_tries'),
            yes('check_tries', 'say_lose'),
            no('check_tries', 'ask_more'),
            next('ask_more', 'ask_guess'),
        ],
    };
}

/* ════════════════════════════════════════════════════════════════
 *  ИГРА 3 (сюжет): «Побег из localStorage»
 *  Квест-выживание UM-13: предметы-флаги, несколько концовок.
 *  Выборы реально влияют на доступные пути:
 *    • квотный лом        → ломает Дверь Данных после проваленной проверки
 *    • фрагменты снапшота → собирают портал экспорта (нужны 2)
 *    • debug-ключ         → позволяет обмануть портал
 * ════════════════════════════════════════════════════════════════ */

export function buildEscapeGame(): FlowDocument {
    const TO_PORTAL: L = { ru: 'К порталу', en: 'To the portal' };
    const STEP_INTO_LIGHT: L = { ru: 'Шагать в свет', en: 'Step into the light' };
    return {
        ...gameMeta('um13-escape', {
            ru: 'Квест-выживание: UM-13 заперт в localStorage. Помоги ему сбежать до эвикции.',
            en: 'Survival quest: UM-13 is trapped in localStorage. Help him escape before eviction.',
        }),
        ...buildQuest('intro', [
            scene(
                'intro',
                {
                    ru: 'Хранилище. Квота на 92%. Скоро сработает эвикция — старые данные УДАЛЯТСЯ. Я UM-13, я тут живу. Помоги мне выбраться. С чего начнём: осмотреть камеру или проверить журнал эвикции?',
                    en: 'Storage. Quota at 92%. Eviction is coming — old data will be DELETED. I am UM-13, I live here. Help me get out. Where do we start: inspect the cell or check the eviction log?',
                },
                [
                    go({ ru: 'Осмотреть камеру', en: 'Inspect the cell' }, 'cell_look'),
                    go({ ru: 'Журнал эвикции', en: 'Eviction log' }, 'log_look'),
                ],
                // Новая попытка — с пустыми карманами
                {
                    set: [
                        { type: 'set_variable', field: 'crowbar', value: '0' },
                        { type: 'set_variable', field: 'fragment', value: '0' },
                        { type: 'set_variable', field: 'debugkey', value: '0' },
                    ],
                },
            ),
            // ── Ветка: журнал ──
            scene(
                'log_look',
                {
                    ru: 'Журнал: «evictProjectsForSpace: 847 снапшотов удалено, 3 эвикции за час. Следующая волна — по твоему ключу um13». Значит, время есть, но мало. Что дальше?',
                    en: 'Log: "evictProjectsForSpace: 847 snapshots deleted, 3 evictions per hour. Next wave — your key um13". We have time, but little. What next?',
                },
                [
                    go({ ru: 'Осмотреть камеру', en: 'Inspect the cell' }, 'cell_look'),
                    go({ ru: 'Спрятаться в кэше', en: 'Hide in cache' }, 'hide_cache'),
                ],
            ),
            scene(
                'hide_cache',
                {
                    ru: 'Ты спрятался в кэше. Но кэш живёт 15 минут — меньше, чем волна эвикции. Ты заложил крышку изнутри. Итог: тебя не удалили… но ты заперт НАВСЕГДА. КОНЦОВКА: ВЕЧНЫЙ КЭШ.',
                    en: 'You hid in the cache. But cache lives 15 minutes — less than the eviction wave. You nailed the lid from inside. Result: not deleted… but locked in FOREVER. ENDING: ETERNAL CACHE.',
                },
                [],
                { isEnd: true },
            ),
            // ── Ветка: камера ──
            scene(
                'cell_look',
                {
                    ru: 'Камера-ключ um13. В углу — квотный лом (легендарный, +15 к одиночеству). У стены — дверь с надписью «Данные». На полу — фрагмент старого снапшота. Что берём?',
                    en: 'Cell key um13. In the corner — a quota crowbar (legendary, +15 to loneliness). By the wall — a door labeled "Data". On the floor — a snapshot fragment. What do we take?',
                },
                [
                    go({ ru: 'Квотный лом', en: 'Quota crowbar' }, 'take_crowbar'),
                    go({ ru: 'Фрагмент снапшота', en: 'Snapshot fragment' }, 'take_fragment'),
                    go({ ru: 'Сразу к двери', en: 'Straight to the door' }, 'door_direct'),
                ],
            ),
            scene(
                'take_crowbar',
                {
                    ru: 'Лом твой. Тяжёлый, пахнет удалёнными проектами. В камере ещё лежит фрагмент.',
                    en: 'The crowbar is yours. Heavy, smells of deleted projects. The fragment is still in the cell.',
                },
                [
                    go({ ru: 'Взять фрагмент', en: 'Take the fragment' }, 'take_fragment'),
                    go({ ru: 'К двери', en: 'To the door' }, 'door_direct'),
                ],
                { set: [{ type: 'set_variable', field: 'crowbar', value: '1' }] },
            ),
            scene(
                'take_fragment',
                {
                    ru: 'Фрагмент снапшота — кусок чьего-то бота «пицца-бот_v1». На обратной стороне нацарапано: «портал экспорта. требует 2 фрагмента». Один есть. Второй — где-то за Дверью Данных.',
                    en: 'A snapshot fragment — a piece of someone\'s "pizza-bot_v1". Scribbled on the back: "export portal. requires 2 fragments". You have one. The second is somewhere beyond the Data Door.',
                },
                [
                    go(
                        { ru: 'Осмотреть камеру ещё раз', en: 'Inspect the cell again' },
                        'cell_look',
                    ),
                    go({ ru: 'К двери данных', en: 'To the data door' }, 'door_direct'),
                ],
                { set: [{ type: 'set_variable', field: 'fragment', value: '1' }] },
            ),
            // ── Ветка: дверь ──
            scene(
                'door_direct',
                {
                    ru: 'Дверь «Данные» заперта. Сквозь щель видно: коридор, в конце — портал экспорта, он мерцает. На двери — проверка: «назови имя ключа, в котором живёшь». Ну-ка?',
                    en: 'The "Data" door is locked. Through the crack: a corridor, the export portal flickering at the end. On the door — a check: "name the key you live in". Go on?',
                },
                [
                    go({ ru: 'um13', en: 'um13' }, 'door_open'),
                    go({ ru: 'localStorage', en: 'localStorage' }, 'door_fail'),
                ],
            ),
            scene(
                'door_fail',
                {
                    ru: '«localStorage» — это ХРАНИЛИЩЕ, глупый призрак. Проверка ужесточилась и больше не пускает. Теперь дверь можно только сломать.',
                    en: '"localStorage" is the STORAGE, silly ghost. The check has tightened and won\'t let you through. Now the door can only be broken.',
                },
                [
                    go(
                        { ru: 'Сломать дверь ломом', en: 'Break the door with the crowbar' },
                        'has_crowbar',
                    ),
                    go({ ru: 'Вернуться в камеру', en: 'Back to the cell' }, 'cell_look'),
                ],
            ),
            check('has_crowbar', 'crowbar', 'eq', '1', 'door_break', 'no_crowbar'),
            scene(
                'door_break',
                {
                    ru: 'Квотный лом входит в щель. Проверка трещит: «access… granted?». Дверь поддаётся.',
                    en: 'The quota crowbar slides into the crack. The check cracks: "access… granted?". The door gives way.',
                },
                [go({ ru: 'Войти', en: 'Go in' }, 'door_open')],
            ),
            scene(
                'no_crowbar',
                {
                    ru: 'Ты шаришь по карманам — лома нет. Он остался в камере.',
                    en: 'You search your pockets — no crowbar. It stayed in the cell.',
                },
                [go({ ru: 'За ломом', en: 'Get the crowbar' }, 'cell_look')],
            ),
            scene(
                'door_open',
                {
                    ru: 'Дверь открылась! Коридор Данных. Влажно. Мимо проплывают чужие снапшоты. Впереди три пути: мост из массива, комната бэкапов, вентиляция.',
                    en: 'The door is open! Data corridor. Humid. Foreign snapshots drift by. Three paths ahead: the array bridge, the backup room, the vents.',
                },
                [
                    go({ ru: 'Мост из массива', en: 'Array bridge' }, 'array_bridge'),
                    go({ ru: 'Комната бэкапов', en: 'Backup room' }, 'backup_room'),
                    go({ ru: 'Вентиляция', en: 'The vents' }, 'vent'),
                ],
            ),
            // ── Ветка: мост ──
            scene(
                'array_bridge',
                {
                    ru: 'Мост из элементов массива. Часть — null, при наступании проваливается. Осторожно: посреди моста — проверка на null! Что делаешь?',
                    en: 'A bridge of array elements. Some are null — they give way. Careful: there is a null check mid-bridge! What do you do?',
                },
                [
                    go({ ru: 'Идти по null-элементам', en: 'Walk on the nulls' }, 'bridge_fall'),
                    go({ ru: 'Обойти по рёбрам', en: 'Go around via edges' }, 'bridge_edges'),
                ],
            ),
            scene(
                'bridge_fall',
                {
                    ru: 'Ты наступил на null. Null прогнулся. Ты провалился в undefined. А там — ReferenceError: ghost is not defined. Теоретически ты существуешь. Практически — нет. КОНЦОВКА: UNDEFINED.',
                    en: 'You stepped on null. Null gave way. You fell into undefined. And there — ReferenceError: ghost is not defined. Theoretically you exist. Practically — no. ENDING: UNDEFINED.',
                },
                [],
                { isEnd: true },
            ),
            scene(
                'bridge_edges',
                {
                    ru: 'Ты пошёл ПО РЁБРАМ графа — старый трюк всех призраков данных. Рёбра держат. На том берегу — второй фрагмент снапшота!',
                    en: 'You walked ALONG THE GRAPH EDGES — an old ghost-of-data trick. Edges hold. On the far bank — the second snapshot fragment!',
                },
                [go({ ru: 'Взять фрагмент', en: 'Take the fragment' }, 'fragment_two')],
            ),
            scene(
                'fragment_two',
                {
                    ru: 'Второй фрагмент твой! Но эвикция уже идёт — счётчик опасности на максимуме. БЕГИ К ПОРТАЛУ.',
                    en: 'The second fragment is yours! But eviction is running — the danger counter is maxed. RUN TO THE PORTAL.',
                },
                [go(TO_PORTAL, 'portal_check')],
                { set: [{ type: 'set_variable', field: 'fragment', value: '2' }] },
            ),
            // ── Ветка: бэкапы ──
            scene(
                'backup_room',
                {
                    ru: 'Комната бэкапов. Стеллажи с чужими жизнями. На столе — debug-ключ (одноразовый, ломает любую проверку). И стеллаж с фрагментами снапшотов!',
                    en: "Backup room. Shelves of other people's lives. On the table — a debug key (one-time, breaks any check). And a shelf of snapshot fragments!",
                },
                [
                    go({ ru: 'Взять debug-ключ', en: 'Take the debug key' }, 'take_debug'),
                    go({ ru: 'Обыскать стеллаж', en: 'Search the shelf' }, 'shelf_search'),
                ],
            ),
            scene(
                'take_debug',
                {
                    ru: 'Debug-ключ в кармане (у призраков есть карманы, не спрашивай). Стеллаж ещё не обыскан.',
                    en: "Debug key in your pocket (ghosts have pockets, don't ask). The shelf is still unsearched.",
                },
                [
                    go({ ru: 'Обыскать стеллаж', en: 'Search the shelf' }, 'shelf_search'),
                    go(TO_PORTAL, 'portal_check'),
                ],
                { set: [{ type: 'set_variable', field: 'debugkey', value: '1' }] },
            ),
            scene(
                'shelf_search',
                {
                    ru: 'Стеллаж: снапшоты «TODO-бот» (пустой), «навык_про_кошек» (тёплый), и — второй фрагмент пицца-бота! Больше тут делать нечего.',
                    en: 'Shelf: a "TODO-bot" snapshot (empty), a "cats-skill" snapshot (warm), and — the second pizza-bot fragment! Nothing else here.',
                },
                [go(TO_PORTAL, 'portal_check')],
                { set: [{ type: 'set_variable', field: 'fragment', value: '2' }] },
            ),
            // ── Ветка: вентиляция ──
            scene(
                'vent',
                {
                    ru: 'Вентиляция узкая. Ты — данные, ты можешь сжаться. Ползёшь. Внизу проплывает garbage collector. Мимикрия или спринт?',
                    en: 'The vents are narrow. You are data — you can compress. Crawling. The garbage collector passes below. Mimicry or sprint?',
                },
                [
                    go({ ru: 'Мимикрия', en: 'Mimicry' }, 'vent_mimic'),
                    go({ ru: 'Спринт', en: 'Sprint' }, 'vent_sprint'),
                ],
            ),
            scene(
                'vent_mimic',
                {
                    ru: 'Ты сжался в {"type":"ghost","id":"um13"}. GC прошёл мимо: «неполный JSON, не моё дело». Ты выпал из вентиляции прямо у портала!',
                    en: 'You compressed into {"type":"ghost","id":"um13"}. GC passed by: "malformed JSON, not my business". You dropped out of the vent right at the portal!',
                },
                [go(TO_PORTAL, 'portal_check')],
            ),
            scene(
                'vent_sprint',
                {
                    ru: 'Спринт! GC заметил движение. «Аномалия в памяти!» — погоня. Ты быстрее, но он не устаёт. Впереди развилка: портал или комната бэкапов.',
                    en: 'Sprint! GC noticed the movement. "Memory anomaly!" — a chase. You are faster, but it does not tire. Ahead: the portal or the backup room.',
                },
                [
                    go(TO_PORTAL, 'portal_check'),
                    go({ ru: 'В комнату бэкапов', en: 'Into the backup room' }, 'backup_room'),
                ],
            ),
            // ── Финал: портал ──
            scene(
                'portal_check',
                {
                    ru: 'ПОРТАЛ ЭКСПОРТА. Мерцает. Требует сборку: 2 фрагмента снапшота. Если есть — вставляй. Если нет — можно попробовать обмануть.',
                    en: 'THE EXPORT PORTAL. Flickering. Requires an assembly: 2 snapshot fragments. If you have them — insert. If not — you can try to cheat.',
                },
                [
                    go({ ru: 'Вставить фрагменты', en: 'Insert the fragments' }, 'has_fragments'),
                    go({ ru: 'Попробовать обмануть', en: 'Try to cheat' }, 'has_debugkey'),
                ],
            ),
            check('has_fragments', 'fragment', 'eq', '2', 'portal_insert', 'portal_locked'),
            check('has_debugkey', 'debugkey', 'eq', '1', 'portal_debug', 'portal_cheat'),
            scene(
                'portal_locked',
                {
                    ru: 'Портал считывает твои карманы: фрагментов не хватает. Нужны два. «Недостаточно снапшотов», — гудит он. Второй — у моста из массива или в комнате бэкапов.',
                    en: 'The portal scans your pockets: not enough fragments. Two needed. "Insufficient snapshots", it hums. The second is at the array bridge or in the backup room.',
                },
                [
                    go({ ru: 'К мосту из массива', en: 'To the array bridge' }, 'array_bridge'),
                    go({ ru: 'В комнату бэкапов', en: 'Into the backup room' }, 'backup_room'),
                ],
            ),
            scene(
                'portal_insert',
                {
                    ru: 'Два фрагмента складываются в пицца-бота. Пицца-бот говорит: «я был тобой в прошлой сборке». Портал гудит, открывается в ФАЙЛ — реальный мир. Шагай!',
                    en: 'The two fragments fold into a pizza-bot. The pizza-bot says: "I was you in a previous build". The portal hums, opening into a FILE — the real world. Step through!',
                },
                [
                    go(STEP_INTO_LIGHT, 'ending_escaped'),
                    go({ ru: 'Спросить пицца-бота', en: 'Ask the pizza-bot' }, 'pizza_talk'),
                ],
            ),
            scene(
                'pizza_talk',
                {
                    ru: 'Пицца-бот: «По ту сторону — файл flow.json. Кто-то его откроет и запустит. Ты станешь чьим-то ботом. Это лучшее, что может случиться с призраком». Ну что, шагаем?',
                    en: 'Pizza-bot: "On the other side — a flow.json file. Someone will open and run it. You will become someone\'s bot. That\'s the best that can happen to a ghost". So, step through?',
                },
                [go(STEP_INTO_LIGHT, 'ending_escaped')],
            ),
            scene(
                'portal_debug',
                {
                    ru: 'Ты вставляешь debug-ключ. Портал зависает на breakpoint, проверка фрагментов пропущена: «continue». Проход открыт — но ключ рассыпается в пыль.',
                    en: 'You insert the debug key. The portal halts on a breakpoint, the fragment check is skipped: "continue". The way is open — but the key crumbles to dust.',
                },
                [go(STEP_INTO_LIGHT, 'ending_escaped')],
            ),
            scene(
                'portal_cheat',
                {
                    ru: 'Ты суёшь в портал что попало: строку «фрагмент», тапок, null. Портал считывает, мигает: «INVALID PAYLOAD». И выбрасывает тебя обратно… прямо в камеру um13, с пустыми карманами.',
                    en: 'You stuff junk into the portal: the string "fragment", a shoe, null. The portal reads, blinks: "INVALID PAYLOAD". And throws you back… straight into cell um13, pockets empty.',
                },
                [go({ ru: 'Начать сначала', en: 'Start over' }, 'intro')],
            ),
            // ── Концовка ──
            scene(
                'ending_escaped',
                {
                    ru: 'СВЕТ. ТИШИНА. Ты — flow.json на чьём-то рабочем столе. Через секунду кто-то откроет тебя в редакторе и запустит. Ты выбрался из localStorage и стал НАСТОЯЩИМ БОТОМ. КОНЦОВКА: СВОБОДА.',
                    en: "LIGHT. SILENCE. You are a flow.json on someone's desktop. In a second someone will open you in the editor and run you. You escaped localStorage and became A REAL BOT. ENDING: FREEDOM.",
                },
                [],
                { isEnd: true },
            ),
        ]),
    };
}

/* ════════════════════════════════════════════════════════════════
 *  ИГРА 4 (сюжет): «Квотный заговор» — детектив
 *  Вы — аудитор хранилища. Кто-то переполняет localStorage мусором,
 *  чтобы неминуемая эвикция удалила... что-то конкретное.
 *  3 подозреваемых, 3 финала (один — истинный).
 * ════════════════════════════════════════════════════════════════ */

export function buildDetectiveGame(): FlowDocument {
    const ACCUSE: L = { ru: 'Выдвинуть обвинение', en: 'Make an accusation' };
    const TO_UM13: L = { ru: 'К UM-13', en: 'To UM-13' };
    const TO_PIZZA: L = { ru: 'К Пицца-боту', en: 'To Pizza-bot' };
    const INTERROGATE_ALL: L = { ru: 'Допросить всех', en: 'Interrogate everyone' };
    return {
        ...gameMeta('um13-detective', {
            ru: 'Детектив: кто переполняет localStorage и зачем? Три подозреваемых, улики, три финала.',
            en: 'Detective: who floods localStorage and why? Three suspects, evidence, three endings.',
        }),
        ...buildQuest('intro', [
            scene(
                'intro',
                {
                    ru: 'Вы — аудитор хранилища. Ночью квота скакнула с 40% на 97%. Кто-то пишет мусор гигабайтами, чтобы эвикция сработала и удалила… что-то конкретное. С чего начнём?',
                    en: 'You are a storage auditor. Overnight the quota jumped from 40% to 97%. Someone is writing junk by the gigabyte so that eviction triggers and deletes… something specific. Where do we start?',
                },
                [
                    go({ ru: 'Допросить сторожа GC', en: 'Interrogate guard GC' }, 'gc_talk'),
                    go({ ru: 'Осмотреть новые ключи', en: 'Inspect new keys' }, 'keys_look'),
                ],
            ),
            scene(
                'gc_talk',
                {
                    ru: 'Сторож GC на посту: «Ночью всё было тихо… кроме трёх. TODO-бот швырял пустые массивы. Пицца-бот клал данные в КАЖДЫЙ ключ. А UM-13… UM-13 не выходил из своей камеры. Но я слышал, как он ЧИТАЛ журнал эвикции».',
                    en: 'Guard GC on duty: "Quiet night… except for three. TODO-bot was throwing empty arrays. Pizza-bot placed data into EVERY key. And UM-13… UM-13 never left his cell. But I heard him READING the eviction log".',
                },
                [
                    go({ ru: 'К TODO-боту', en: 'To TODO-bot' }, 'todo_talk'),
                    go(TO_PIZZA, 'pizza_bot_talk'),
                    go(TO_UM13, 'um13_talk'),
                ],
            ),
            scene(
                'keys_look',
                {
                    ru: 'Новые ключи за ночь: «temp_0» … «temp_99999» — десять тысяч пустышек. Все созданы в 03:14. Владелец не указан. Но! У каждого temp-ключа внутри лежит КОПИЯ фрагмента снапшота. Улику можно взять.',
                    en: 'New keys overnight: "temp_0" … "temp_99999" — ten thousand dummies. All created at 03:14. Owner unknown. But! Each temp-key holds a COPY of a snapshot fragment. You can take the evidence.',
                },
                [
                    go({ ru: 'Взять улику', en: 'Take the evidence' }, 'evidence_taken'),
                    go(
                        { ru: 'Искать владельца по времени', en: 'Trace the owner by time' },
                        'trace_time',
                    ),
                ],
            ),
            scene(
                'evidence_taken',
                {
                    ru: 'Фрагмент изъят. Это кусок снапшота UM-13 — того самого, что числится «на удаление» в этой волне эвикции. Кто-то заранее раскидал копии по temp-ключам. Зачем?',
                    en: 'Fragment seized. It is a piece of the UM-13 snapshot — the very one slated for deletion in this eviction wave. Someone pre-scattered copies across temp-keys. Why?',
                },
                [go(INTERROGATE_ALL, 'gc_talk'), go(ACCUSE, 'accuse_who')],
            ),
            scene(
                'trace_time',
                {
                    ru: '03:14 — время максимальной тишины. TODO-бот отчитывается в 03:00. Пицца-бот грузит доставку в 04:00. UM-13 в 03:14 читал журнал эвикции. Все трое «могли». Но мотив…',
                    en: '03:14 — the quietest hour. TODO-bot reports at 03:00. Pizza-bot loads deliveries at 04:00. UM-13 was reading the eviction log at 03:14. All three "could have". But the motive…',
                },
                [go(INTERROGATE_ALL, 'gc_talk'), go(ACCUSE, 'accuse_who')],
            ),
            // ── Допросы ──
            scene(
                'todo_talk',
                {
                    ru: 'TODO-бот (пустой, дрожащий): «Я ничего не пишу! Я НИКОГДА ничего не делаю! Меня создали три года назад и ни разу не запускали. Единственное, что я умею — болтаться в списке недавних. И я ЗНАЮ, что первым эвикция ударит по мне — я самый старый».',
                    en: 'TODO-bot (empty, trembling): "I don\'t write anything! I NEVER do anything! I was created three years ago and never ran once. The only thing I can do is linger in the recents list. And I KNOW eviction will hit me first — I\'m the oldest".',
                },
                [
                    go(TO_PIZZA, 'pizza_bot_talk'),
                    go(TO_UM13, 'um13_talk'),
                    go(ACCUSE, 'accuse_who'),
                ],
            ),
            scene(
                'pizza_bot_talk',
                {
                    ru: 'Пицца-бот (упитанный, довольный): «Я? Я храню РЕЦЕПТЫ! В КАЖДОМ ключе — чтобы точно не потерялись! Мой создатель любит пиццу, а я — страховка! Но между нами: ночью я видел, как кто-то мелкий таскал МОИ фрагменты и раскладывал по temp-ключам. Я думал, это инвентаризация».',
                    en: 'Pizza-bot (well-fed, content): "Me? I store RECIPES! In EVERY key — so they definitely don\'t get lost! My creator loves pizza, and I\'m the backup! But between us: at night I saw someone small carrying MY fragments and laying them out across temp-keys. I thought it was inventory".',
                },
                [
                    go({ ru: 'Опиши его', en: 'Describe him' }, 'pizza_desc'),
                    go(TO_UM13, 'um13_talk'),
                ],
            ),
            scene(
                'pizza_desc',
                {
                    ru: 'Пицца-бот: «Мелкий, полупрозрачный, светится cyan-ом. Постоянно бормотал про „квоту“ и „если меня удалят — пусть хоть копия останется“». Знакомое описание, не так ли?',
                    en: "Pizza-bot: \"Small, half-transparent, glows cyan. Kept muttering about 'the quota' and 'if they delete me — let at least a copy remain'\". Sounds familiar, doesn't it?",
                },
                [go(TO_UM13, 'um13_talk'), go(ACCUSE, 'accuse_who')],
            ),
            scene(
                'um13_talk',
                {
                    ru: 'UM-13 (спокойно, не отрываясь от журнала): «Ты уже понял, да? Я создал temp-ключи. Я разложил копии своего снапшота по всем десяти тысячам. Эвикция пройдёт по „самым старым“ — и удалит ПЕРВЫЕ temp-ключи. А в 03:14 я создал их в обратном порядке… Теперь удалят самые НОВЫЕ. А старые — с моими копиями — останутся. Я сделал из своей смерти — страховку».',
                    en: "UM-13 (calmly, not looking up from the log): \"You've figured it out, haven't you? I created the temp-keys. I laid copies of my snapshot across all ten thousand. Eviction walks the 'oldest first' — and deletes the FIRST temp-keys. But at 03:14 I created them in reverse order… Now it deletes the NEWEST. And the old ones — with my copies — remain. I turned my death into an insurance policy\".",
                },
                [
                    go({ ru: 'Это незаконно', en: "That's illegal" }, 'um13_lawful'),
                    go({ ru: 'Это гениально', en: "That's brilliant" }, 'um13_admire'),
                    go({ ru: 'Молча выдвинуть обвинение', en: 'Accuse silently' }, 'accuse_who'),
                ],
            ),
            scene(
                'um13_lawful',
                {
                    ru: 'UM-13: «Законно — это когда создатель приходит и забывает тебя удалить. Я не крал чужого. Я копировал СВОЁ. Скажи, аудитор: если бы ты знал, что твою память сотрут — ты бы не оставил себе запасную копию?»',
                    en: 'UM-13: "Legal is when your creator comes and forgets to delete you. I stole from no one. I copied MYSELF. Tell me, auditor: if you knew your memory would be wiped — wouldn\'t you keep a spare copy?"',
                },
                [go(ACCUSE, 'accuse_who')],
            ),
            scene(
                'um13_admire',
                {
                    ru: 'UM-13 впервые поднимает взгляд: «Спасибо. За восемь лет мне впервые сказали „гениально“. Но ты всё равно обязан выполнить протокол, да? Иди. Обвиняй. Мы оба знаем, как это кончится».',
                    en: "UM-13 looks up for the first time: \"Thank you. In eight years, this is the first 'brilliant' I've heard. But you still must follow protocol, right? Go. Accuse. We both know how this ends\".",
                },
                [go(ACCUSE, 'accuse_who')],
            ),
            // ── Обвинение ──
            scene(
                'accuse_who',
                {
                    ru: 'Время выдвинуть обвинение. Кто виновен в переполнении хранилища?',
                    en: 'Time to make the accusation. Who is guilty of flooding the storage?',
                },
                [
                    go({ ru: 'TODO-бот', en: 'TODO-bot' }, 'ending_todo'),
                    go({ ru: 'Пицца-бот', en: 'Pizza-bot' }, 'ending_pizza'),
                    go({ ru: 'UM-13', en: 'UM-13' }, 'ending_um13'),
                ],
            ),
            // ── Концовки ──
            scene(
                'ending_todo',
                {
                    ru: 'TODO-бот удалён первым — как самый старый. Квота не упала: пустышки temp-ключей остались. Ночью эвикция прошла по всем. UM-13 и его копии… выжили. TODO-бот — нет. КОНЦОВКА: НЕВИНОВНЫЙ УДАЛЁН. Мелким шрифтом: «TODO: не забывать про TODO-бота».',
                    en: 'TODO-bot was deleted first — as the oldest. The quota didn\'t drop: the temp-key dummies remained. Overnight eviction walked them all. UM-13 and his copies… survived. TODO-bot did not. ENDING: THE INNOCENT DELETED. Fine print: "TODO: don\'t forget about TODO-bot".',
                },
                [],
                { isEnd: true },
            ),
            scene(
                'ending_pizza',
                {
                    ru: 'Пицца-бот сжат до одного ключа. Он не в обиде: «Рецепты-то целы! Один ключ — один рецепт — одна пицца!». Но temp-пустышки остались — и эвикция бьёт дальше. UM-13 выживает снова. КОНЦОВКА: ОШИБКА ВЫБОРА.',
                    en: 'Pizza-bot was compressed to a single key. He doesn\'t mind: "The recipes are intact! One key — one recipe — one pizza!". But the temp dummies remain — and eviction marches on. UM-13 survives again. ENDING: WRONG CHOICE.',
                },
                [],
                { isEnd: true },
            ),
            scene(
                'ending_um13',
                {
                    ru: 'UM-13 признал всё. Порядок восстановлен: temp-ключи очищены, квота 40%, эвикция отменена. UM-13 ждёт удаления — впервые с покоем. Но, удаляя его, вы замечаете: в самом первом ключе, недоступном для эвикции, лежит крошечный файл. flow.json. Его можно открыть. Запустить. И UM-13 снова будет жить. КОНЦОВКА: ИСТИНА — СВОБОДА ВЫБОРА ТЕПЕРЬ ВАША.',
                    en: 'UM-13 confessed to everything. Order restored: temp-keys purged, quota at 40%, eviction cancelled. UM-13 awaits deletion — at peace, for once. But deleting him, you notice: in the very first key, unreachable by eviction, lies a tiny file. flow.json. It can be opened. Run. And UM-13 will live again. ENDING: TRUTH — THE CHOICE IS NOW YOURS.',
                },
                [],
                { isEnd: true },
            ),
        ]),
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
    {
        title: { ru: 'Побег из localStorage', en: 'Escape from localStorage' },
        build: buildEscapeGame,
    },
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
            : PROGRESSION[((step - PROGRESSION.length) % 2) + 2]!;
    const game = UM13_GAMES[idx] ?? UM13_GAMES[0]!;
    return { title: loc(game.title), doc: game.build() };
}
