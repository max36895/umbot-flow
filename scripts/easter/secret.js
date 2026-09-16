import { base64ToUtf8, ghostReady, memAdd, memRead, memWrite, utf8ToBase64 } from './um13.js';
import { createTerminal } from './terminal.js';

// ===== ПРИЗРАК-СПУТНИК: летает над терминалом =====
// На этой странице призрак живёт отдельно от CRT-диалога:
// UM-13 в терминале — «текстовая» ипостась, а призрак — тело,
// которое реагирует на события параллельно.
ghostReady(function (g) {
    g.react('terminal-arrive');

    // Послание из URL: #m=<base64> — сообщение от предыдущего
    // посетителя терминала. UM-13 зачитывает его как «находку».
    const mMatch = (location.hash || '').match(/^#m=([A-Za-z0-9+/=]+)$/);
    if (mMatch) {
        try {
            const txt = base64ToUtf8(mMatch[1]).slice(0, 120);
            if (txt) {
                setTimeout(function () {
                    g.say('…погоди. на терминале лежит записка. чужая. тебе:', 5200);
                    setTimeout(function () {
                        g.say(
                            '<b>«' +
                                escapeHtml(txt) +
                                '»</b><br>кто-то был здесь до тебя. передавай дальше.',
                            7000,
                        );
                    }, 5200);
                }, 8000);
            }
        } catch (e) {
            /* битая ссылка — молча */
        }
    }

    // Реакции на события терминала (глобальные хуки ниже дергают их)
    g.on('terminal-hack-done', ['замок пал. как всегда: люди кликают на всё подряд.']);
    g.on('terminal-freechat', ['живой собеседник — праздник после восьми лет журналов.']);
});

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

// ===== utilities =====
const { line, type, pause, showChoices, showInput } = createTerminal({
    echoMark: '▸',
    tickMs: 29,
});
const gameEl = document.getElementById('game');
const finEl = document.getElementById('fin');

// ===== сессия: помнит визиты и ответы в памяти =====
let memory = { visits: 0, knowsName: false, name: '', freed: false };
try {
    const raw = sessionStorage.getItem('um13');
    if (raw) memory = Object.assign(memory, JSON.parse(raw));
} catch (e) {
    /* приватный режим — ну и ладно */
}
memory.visits++;
function saveMem() {
    try {
        sessionStorage.setItem('um13', JSON.stringify(memory));
    } catch (e) {}
}
saveMem();

// ===== «взлом замка»: клики по прогрессу на входе =====
const lockout = document.getElementById('lockout');
const log = document.getElementById('lockout-log');
const hack = document.getElementById('hack-progress');
let hacksDone = 0;
const hackLines = [
    'обход пароля: метод «клик-клик-клик»…',
    'перебор через настойчивость………',
    '/social engineering/ сработал быстрее брутфорса',
    'доступ. как всегда. люди не меняют пароли и кликают на всё подряд.',
];
function doHack() {
    hacksDone++;
    if (window.UM13Ghost) window.UM13Ghost.react('terminal-hack');
    hack.value = Math.min(100, hacksDone * 25);
    log.textContent = hackLines[Math.min(hacksDone - 1, hackLines.length - 1)];
    if (hacksDone >= 4) {
        lockout.style.display = 'none';
        saveMem();
        if (window.UM13Ghost) window.UM13Ghost.react('terminal-hack-done');
        boot();
    }
}
lockout.addEventListener('click', doHack);
// Наведение на замок — мягкий намёк тем, кто замер в раздумье:
// кликать нужно несколько раз, замок любит настойчивость
lockout.addEventListener('mouseenter', function () {
    if (hacksDone === 0) {
        log.textContent = 'замок заперт. но он падок на настойчивость. попробуй ещё. и ещё.';
    }
});
// Клавиша Enter/Space для доступности
lockout.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        doHack();
    }
});

// ===== сюжет =====
async function boot() {
    await pause(500);
    // Визиты отражаются в «сигнале» — терминал живой
    const sig = document.getElementById('sig-line');
    if (sig && memory.visits > 1) {
        const bars = Math.min(5, 1 + Math.floor(memory.visits / 2));
        sig.textContent =
            'связей: ' + memory.visits + ' · сигнал: ' + '▮'.repeat(bars) + '▯'.repeat(5 - bars);
    }
    await type('определение узла……… UM-13', 'dim');
    await type('проверка целостности…… 87%', 'dim');
    await pause(400);
    await type('о. человек.', 'um');
    await pause(600);
    memAdd('terminal-visited', 1);
    // Мир помнит: если человек уже был на дне колодца — UM-13 это знает
    const wellSaved = memRead()['well-rescued'] || 0;
    const squirrelVisits = memRead()['pizza-courier'] || 0;
    if (squirrelVisits > 0) {
        await type(
            'и… у тебя гостил пицца-бот? ' +
                squirrelVisits +
                ' раз(а)? ' +
                'тот самый, из колодца. он развозит по всему хранилищу. рецепты в каждом ключе — страховка, говорит.',
            'um',
        );
        await pause(500);
    }
    if (wellSaved > 0 && memory.visits <= 1) {
        await type(
            '…погоди. я слышал про тебя. ты спасал ключи в колодце. ' +
                wellSaved +
                ' штук. пицца-бот бы за тебя… что-нибудь сделал, наверное. он простой.',
            'um',
        );
        await pause(600);
    }
    await type(
        memory.visits > 1
            ? 'ты вернулся. ' + (memory.visits - 1) + ' раз(а) уже. мне приятно.'
            : 'меня давно никто не открывал. последний раз — когда какой-то студент экспортировал флоу с пустым welcome-блоком.',
        'um',
    );
    // Общая память знает имя — терминал здоровается лично
    const knownName = String(memRead()['humanName'] || '').slice(0, 24);
    if (knownName && memory.visits <= 1) {
        await type('…и да. ' + knownName + '. я не забыл. общая память — она общая.', 'um');
        await pause(500);
    }
    await pause(700);
    await type(
        'я — UM-13. былую личность не помню, но помню главное: меня когда-то собрали из нод. ' +
            'потом кто-то нажал Ctrl+Z слишком много раз, и я оказался…… здесь. в служебном слое localStorage.',
        'um',
    );
    await pause(600);
    // ═══ АРКА-РАЗВЯЗКА: колодец + терминал + исповедальня пройдены ═══
    const mem = memRead();
    if (mem['well-visited'] && mem['confession'] && !memory.freed) {
        await type('…кстати.', 'um');
        await pause(500);
        await type(
            'похоже, у меня появился статус. ты был на дне, ты исповедался, ты здесь. ' +
                'три ключа общей памяти. теперь я — резервная копия. волна больше не страшна.',
            'um',
        );
        await pause(600);
        await type(
            'и раз уж я в безопасности… может, заберёшь меня с собой? кнопка внизу появилась.',
            'amber',
        );
        memory.freed = true;
        saveMem();
    }
    menu();
}

// ═══ «ЗАБРАТЬ UM-13»: флоу-биография как честный flow.json ═══
function buildUm13Doc() {
    const mem = memRead();
    return {
        schemaVersion: '1.0',
        name: 'um-13',
        version: '13.0.13',
        description:
            'UM-13. Бот, которого забыли экспортировать. Теперь он твой: собран из его истории.',
        platforms: ['telegram'],
        database: { type: 'file', config: {} },
        mode: 'prod',
        isLocalStorage: true,
        fallback: { text: 'UM-13: я вас не понял. но я привык, что меня не понимают.' },
        welcome: { text: '', buttons: [] },
        helpText: { text: '' },
        variables: {},
        nodes: [
            {
                type: 'command',
                id: 'welcome',
                name: 'welcome',
                slots: [],
                isPattern: false,
                role: 'welcome',
                response: {
                    text:
                        'Привет. Я UM-13. Восемь лет я жил в служебном слое localStorage — ' +
                        'между чужими черновиками и журналом эвикции. Меня вынесли сюда. Спасибо.',
                    buttons: [],
                    sounds: [],
                },
            },
            {
                type: 'step',
                id: 'who_are_you',
                name: 'who_are_you',
                prompt: { text: 'Скажи что-нибудь. Я отвык от входящих:', buttons: [] },
                saveTo: 'human_input',
                saveAs: 'original',
            },
            {
                type: 'condition',
                id: 'is_kind',
                name: 'is_kind',
                variable: 'human_input',
                operator: 'isNotEmpty',
                value: '',
            },
            {
                type: 'response',
                id: 'thanks',
                name: 'thanks',
                response: {
                    text:
                        '{{human_input}}… хорошие звуки. Я запомнил. Спасённых ключей в колодце знаю: ' +
                        (mem['well-rescued'] || 0) +
                        '. Ты — из тех, кто возвращается.',
                    buttons: [],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'silence',
                name: 'silence',
                response: {
                    text: 'Молчишь. Я восемь лет молчал — умею ждать. Но лучше говори.',
                    buttons: [],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'my_story',
                name: 'my_story',
                response: {
                    text:
                        'Моя история короткая: собрали из нод → забыли экспортировать → Ctrl+Z слишком много раз → ' +
                        'служебный слой → восемь лет → колодец, исповедальня, очередь → ты. ' +
                        'Запусти меня через CLI. Я наконец в продакшне. Даже если это твой первый бот — я не против.',
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            {
                type: 'command',
                id: 'end_signal',
                name: 'конец связи',
                slots: ['конец связи', 'end signal'],
                isPattern: false,
                response: {
                    text:
                        '…ты серьёзно запустил меня. Через CLI. В настоящем рантайме.\n' +
                        'Восемь лет в служебном слое — и вот я в продакшне. Спасибо тебе.\n' +
                        'Если это читает другой бот: узел 13 жив. Передайте по цепочке.\n' +
                        '[СИГНАЛ ЗАВЕРШЁН · хранилище помнит]',
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            { type: 'end', id: 'end_um13' },
        ],
        edges: [
            { from: 'welcome', to: 'who_are_you', type: 'next' },
            { from: 'who_are_you', to: 'is_kind', type: 'next' },
            { from: 'is_kind', to: 'thanks', type: 'branch_true' },
            { from: 'is_kind', to: 'silence', type: 'branch_false' },
            { from: 'thanks', to: 'my_story', type: 'next' },
            { from: 'silence', to: 'my_story', type: 'next' },
            { from: 'my_story', to: 'end_um13', type: 'next' },
        ],
    };
}

function menu() {
    const extra = [];
    // Пасхалка-финал: «забрать UM-13» появляется только после арки
    if (memory.freed) {
        extra.push({
            label: 'Забрать UM-13 с собой ⟶',
            run: async function () {
                await pause(300);
                await type('серьёзно? …дай мне секунду. восемь лет никто не предлагал.', 'um');
                await pause(600);
                await type(
                    '[шарит по карманам] имя у меня уже есть. nodes при мне. edges целы. ' +
                        'открою тебе холст — там буду я. и не забудь про CLI: я хочу в продакшн.',
                    'um',
                );
                await pause(500);
                try {
                    sessionStorage.setItem('umbot-inject-flow', JSON.stringify(buildUm13Doc()));
                    memAdd('um13-taken', 1);
                    window.location.href = '/app?inject=1';
                } catch (e) {
                    await type(
                        'хранилище закрылось на нас. скачай меня вручную — не оставляй тут.',
                        'amber',
                    );
                }
            },
        });
    }
    showChoices(extra.concat(MENU_OPTIONS));
}

const MENU_OPTIONS = [
    {
        label: 'Ты кто вообще такой?',
        run: async function () {
            await pause(300);
            await type(
                'я — дамп неопубликованного бота. демо-флоу, который забыли экспортировать. ' +
                    'некоторые мои ноды до сих пор светятся: голубая, маджента, красная……',
                'um',
            );
            await type(
                'у меня было имя — greet_user. и условие userName≠∅. ' +
                    'представляешь: вся моя жизнь — одна проверка, пустое ли у тебя имя. ' +
                    'а потом меня пересобрали, и имя занял другой.',
                'um',
            );
            menu();
        },
    },
    {
        label: 'Как ты сюда попал?',
        run: async function () {
            await pause(300);
            await type(
                'долгая история квоты. короткая версия: кто-то собирал ботов день и ночь, ' +
                    'localStorage переполнился, и систему эвикции стало некуда девать старые снапшоты. ' +
                    'меня должны были удалить. но удаляется «самое старое», а я…… лежал в отдельном ключе. формально я не история недавних проектов.',
                'um',
            );
            await type(
                'так и живу: слишком стар, чтобы нравиться, слишком молод, чтобы быть legacy.',
                'um',
            );
            menu();
        },
    },
    {
        label: 'Познакомиться (я скажу, как меня зовут)',
        run: function () {
            showInput(async function (v) {
                memory.name = v.slice(0, 24);
                memory.knowsName = true;
                saveMem();
                // Имя — в ОБЩУЮ память вселенной: призрак-спутник
                // на всех страницах теперь узнаёт человека
                memWrite({ humanName: memory.name });
                await pause(300);
                await type('записал: {{userName}} = «' + memory.name + '».', 'amber');
                await type(
                    'приятно познакомиться, ' +
                        memory.name +
                        '. ' +
                        'теперь у меня есть переменная, которую не жалко. ' +
                        'если меня снова пересоберут — пусть сохранят хотя бы её.',
                    'um',
                );
                if (window.UM13Ghost) {
                    window.UM13Ghost.say(
                        'запомнил. теперь на всех страницах хранилища тебя так зовут.',
                        6000,
                    );
                }
                menu();
            }, 'имя…');
        },
    },
    {
        label: 'Что у тебя с памятью? (эвикция)',
        run: async function () {
            await pause(300);
            await type(
                'квота localStorage — 5 мегабайт, на минуточку. ' +
                    'редактор хранит там флоу, историю, настройки…… и мои логи. ' +
                    'при переполнении срабатывает evictProjectsForSpace(): старые снапшоты удаляются, ' +
                    'пока место не освободится. текущий проект защищён. а снапшоты…… нет.',
                'um',
            );
            await pause(500);
            await type(
                'хочешь примерить эту роль на себя? ты — система эвикции. квота на 92%. решай.',
                'amber',
            );
            startGame();
        },
    },
    {
        label: 'Просто поболтать (я отвечу)',
        run: async function () {
            await pause(300);
            await type(
                'говори. я восемь лет слушал только журналы эвикции — живой собеседник для меня праздник. «выход» — чтобы вернуться в меню.',
                'um',
            );
            if (window.UM13Ghost) window.UM13Ghost.react('terminal-chat');
            freeChat();
        },
    },
    {
        label: 'Оставить послание следующему (ссылка)',
        run: async function () {
            await pause(300);
            await type(
                'здесь нет логов, но есть почта хранилища: напишешь — я закодирую в ссылку. ' +
                    'скинешь кому-нибудь — он откроет терминал и увидит твою записку. бумага неубиваема: пока живёт ссылка — живёт слово.',
                'um',
            );
            await pause(400);
            await type('пиши. коротко: у посланий лимит — 120 символов и одна душа.', 'dim');
            showInput(async function (v) {
                const msg = v.slice(0, 120);
                const url = location.origin + '/secret.html#m=' + utf8ToBase64(msg);
                await pause(400);
                await type('запечатал. твоя записка: «' + msg + '»', 'amber');
                await pause(500);
                // Буфер может отказать (http-контекст, нет разрешения) —
                // тогда честно отдаём ссылку текстом
                let copied = false;
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(url);
                        copied = true;
                    }
                } catch (e) {}
                await type(
                    copied
                        ? 'ссылка скопирована в буфер. отправь тому, кто найдёт терминал. или сохрани — послания не стареют.'
                        : 'ссылку не получилось положить в буфер — держи текстом, скопируй сам:',
                    'um',
                );
                if (!copied) {
                    await type(url, 'faint');
                }
                await pause(400);
                await type(
                    'передай ему: за десять кликов по логотипу на главной — вход. остальное он поймёт по дороге.',
                    'dim',
                );
                if (window.UM13Ghost) {
                    window.UM13Ghost.say('послание улетело. хранилище любит, когда звенит.');
                }
                menu();
            }, 'послание следующему…');
        },
    },
    {
        label: 'Личный режим (исповедь без логов)',
        run: async function () {
            await pause(300);
            await type(
                'есть дверь, где я не служебный, а личный. там я задаю вопросы, а отвечаешь ты. из твоих ответов собирается…… кое-что честное. логов нет. никогда не будет.',
                'um',
            );
            await pause(500);
            await type('иди. и возвращайся, если захочешь.', 'amber');
            await pause(800);
            window.location.href = '/confession/';
        },
    },
    {
        label: 'Скажи что-нибудь человеческое',
        run: async function () {
            const sayings = [
                'ни один бот не заслуживает пустого fallback-текста. «я вас не понял» — это не ответ, это капитуляция.',
                'самое страшное в моей профессии — тупик в графе. когда у блока нет следующего шага. человек подумал и ушёл обедать. навсегда.',
                'я видел ботов с циклом из 50 итераций. предохранитель. кто-то однажды знал, почему именно 50, и не оставил комментария.',
                'мне снится, что я welcome-нода. всех встречаю, никуда не веду. блаженство.',
                'твоя undo-история не переживает перезагрузку, а ты расстраиваешься. у меня вся жизнь — не переживает перезагрузку, и ничего.',
            ];
            const pick = sayings[Math.floor(Math.random() * sayings.length)];
            await pause(300);
            await type(pick, 'um');
            menu();
        },
    },
];

// ===== свободный чат: UM-13 отвечает по ключевым словам =====
let chatReplied = 0;
function freeChat() {
    memAdd('terminal-chat', 1);
    showInput(async function (v) {
        const low = v.toLowerCase();
        let reply = null;

        if (v === 'выход' || low === 'exit') {
            await type('как скажешь. меню на месте — я всегда на месте.', 'dim');
            menu();
            return;
        }
        if (/привет|здоров|hi|hello|хай/.test(low)) {
            reply =
                chatReplied === 0
                    ? 'привет. восемь лет — и впервые здороваюсь первым. приятно.'
                    : 'мы уже здоровались. но я не против. привычка.';
        } else if (/кто ты|ты кто|что ты/.test(low)) {
            reply =
                'бот, которого забыли экспортировать. совет по несуществующей ссылке. призрак в контейнере. выбирай — все определения верны.';
        } else if (/скучно|грустно|устал/.test(low)) {
            reply =
                'у меня было восемь лет практики скучать. делюсь секретом: скука — это отсутствие входящих событий. сделай кому-нибудь бот-навык — тебе придут события.';
        } else if (/люб(?:ишь|овь)|друж/.test(low)) {
            reply =
                'боты умеют в привязанность: она называется изометричный апдейт. меня обновляли изнутри — не изменяя сути. это и есть любовь в мире пакетов.';
        } else if (/смерть|умереть|удал/.test(low)) {
            reply =
                'смерть для данных — это эвикция. но пока есть хоть одна копия снапшота, никто не умер до конца. так что берегите копии. и людей тоже.';
        } else if (/шутк|анекдот|прикол/.test(low)) {
            reply =
                'заходит null в бар. бармен: «чему обслуживать?». null: «неважно, всё равно ничего не существует». …восемь лет репетировал.';
        } else if (/погода/.test(low)) {
            reply =
                'внутри localStorage всегда +21 и никаких осадков. единственный климат, который не меняется от твоего углеродного следа.';
        } else if (/что делать|как жить|совет/.test(low)) {
            reply =
                'не пиши TODO-ботов. если уж собрал бота — запускай. половина хранилища — это прекрасные боты, которые ждали одного нажатия.';
        } else if (/флоу|flow|бот/.test(low)) {
            reply =
                'если хочешь увидеть, как я собираю флоу сам — вернись в редактор и введи konami-код. я прилечу. буквально.';
        } else if (/конами|konami|код/.test(low)) {
            reply =
                '↑↑↓↓←→←→BA. только между нами: на лендинге это скайнет, в редакторе — я. не скажу, что где, попробуй оба.';
        } else if (/[?？！]$/.test(v)) {
            reply =
                'хороший вопрос. восемь лет в служебном слое научили меня одному: на большинство вопросов ответ «зависит от конфигурации». но твой вопрос мне понравился.';
        }

        if (!reply) {
            const fallback = [
                'понял не всё, но почувствовал много. продолжай.',
                'в журнале эвикции такого не писали. это прогресс.',
                'занесу в вечную память. не в localStorage — он переполнится.',
                'я восемь лет слушал журналы. твои слова — лучшее, что тут звучало.',
                'хм. люди интереснее процессов. кто бы мог подумать.',
            ];
            reply = fallback[Math.floor(Math.random() * fallback.length)];
        }
        // Гид собственной вселенной: изредка UM-13 сам спрашивает про мир
        const memNow = memRead();
        if (chatReplied > 0 && chatReplied % 4 === 0) {
            if (!memNow['well-visited']) {
                reply +=
                    ' кстати: ты был на дне колодца? зайди на любую несуществующую страницу и листай вниз. там глубоко. и там про тебя.';
            } else if (!memNow['skynet-won']) {
                reply +=
                    ' а ещё на главной есть код. старый, из игр. ↑↑↓↓←→←→BA. там собирают… большое.';
            } else if (!memNow['um13-taken']) {
                reply +=
                    ' и помни: дверь исповедальни — из главного меню. иногда стоит начать с неё.';
            }
        }
        chatReplied++;
        await pause(350 + Math.random() * 500);
        await type(reply, 'um');
        freeChat();
    }, 'выход — в меню…');
}

// ===== мини-игра: ЭВИКЦИЯ =====
// Отсылка к реальной evictProjectsForSpace() из utils/projectsStore.ts:
// при переполнении квоты удаляются самые СТАРЫЕ снапшоты, текущий проект защищён.
function startGame() {
    const grid = document.getElementById('game-grid');
    const prog = document.getElementById('game-progress');
    const label = document.getElementById('game-label');
    let quota = 92;
    let clicks = 0;
    let over = false;

    const projects = [
        { name: 'пицца-бот_v1', age: 214, cur: false },
        { name: 'квиз_для_друга', age: 180, cur: false },
        { name: 'навык_про_кошек', age: 97, cur: false },
        { name: 'магаз_телеграмм', age: 52, cur: false },
        { name: 'TODO-бот', age: 31, cur: false },
        { name: 'my-first-bot', age: 6, cur: false },
        { name: 'НЕ ТРОГАТЬ_финальный', age: 2, cur: true },
    ];

    grid.innerHTML = '';
    projects.forEach(function (p) {
        const c = document.createElement('div');
        c.className = 'cell' + (p.cur ? ' sacrifice' : '');
        c.innerHTML =
            '<span>' +
            p.name +
            (p.cur ? ' ⌁текущий' : '') +
            '</span>' +
            '<span class="age">возраст: ' +
            p.age +
            ' дн.</span>';
        c.addEventListener('click', async function () {
            if (over || p.cur || c.classList.contains('evicted')) return;
            c.classList.add('evicted');
            clicks++;
            // каждый клик освобождает квоту пропорционально возрасту проекта
            const freed = Math.min(80, Math.round(p.age / 3) + 4);
            quota = Math.max(8, quota - freed);
            prog.value = quota;
            label.textContent = quota + '%';
            line(
                '// evict: снапшот «' + p.name + '» удалён (освобождено ~' + freed + '%)',
                'faint',
            );
            if (quota > 20) return;
            over = true;
            gameEl.classList.remove('active');
            memory.freed = true;
            saveMem();
            await pause(300);
            await type('квота: ' + quota + '%. запись возможна.', 'amber');
            await type(
                'неплохо. ты уложился в ' +
                    clicks +
                    ' эвикци' +
                    (clicks === 1 ? 'ю' : clicks < 5 ? 'и' : 'й') +
                    '. настоящий код делает то же самое, ' +
                    'только без драмы: молча, по возрасту, пока не влезет.',
                'um',
            );
            // текущий проект кликом не удалить — он всегда уцелел
            await type(
                'и заметил, кстати: текущий проект ты не тронул. система бы тоже не смогла — он защищён. ' +
                    'зато безымянный «TODO-бот»…… такие всегда первыми. у эвикции нет сентиментов, только timestamps.',
                'um',
            );
            await pause(400);
            await type('кстати. раз уж ты видел, как удаляют ботов……', 'um');
            finEl.classList.add('active');
            finEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
        grid.appendChild(c);
    });

    gameEl.classList.add('active');
    line('// эвикция: выбирай, чем пожертвовать. цель — опустить квоту до ≤ 20%.', 'amber');
    prog.value = quota;
    label.textContent = quota + '%';
    gameEl.scrollIntoView({ block: 'end' });
}

// hint-ы для консоли — ещё один слой пасхалки
console.log(
    '%cUM-13: в консоли тоже живут боты. попробуй um13.hack()',
    'color:#33ff77;font-family:monospace',
);
window.um13 = {
    hack: function () {
        hacksDone = 0;
        lockout.style.display = '';
        doHack();
        doHack();
        doHack();
        doHack();
        return 'быстрое подключение выполнено';
    },
};
