import {
    base64ToUtf8,
    downloadBlob,
    downloadJson,
    ghostReady,
    memAdd,
    utf8ToBase64,
} from './um13.js';
import { createTerminal } from './terminal.js';

const { type, pause, showChoices, showInput } = createTerminal({ echoMark: '◆', tickMs: 28 });
const resultEl = document.getElementById('result');
const mapEl = document.getElementById('map');
let builtDoc = null;

// ── Призрак-спутник ──
ghostReady(function (g) {
    g.react('confession-arrive');
});

// ── Профиль в URL: #p=<base64 JSON> ──
// Чужая исповедь приходит ссылкой: друг открывает и видит
// «твоего» внутреннего бота + приглашение собрать своего.
function packProfile(p) {
    try {
        return utf8ToBase64(JSON.stringify(p));
    } catch (e) {
        return null;
    }
}
function unpackProfile(b64) {
    try {
        const p = JSON.parse(base64ToUtf8(b64));
        if (!p || typeof p !== 'object' || !p.name) return null;
        // обрезаем до валидных длин — защита от ссылок-гигантов
        ['name', 'ice', 'fear', 'fuel', 'lie', 'dream'].forEach(function (k) {
            if (typeof p[k] !== 'string') p[k] = '';
            p[k] = p[k].slice(0, 60);
        });
        return p;
    } catch (e) {
        return null;
    }
}

// чужой профиль из #p=… (для показа после вступления)
const sharedFromUrl = (function readShared() {
    const m = (location.hash || '').match(/^#p=([A-Za-z0-9+/=]+)$/);
    const p = m && unpackProfile(m[1]);
    if (!p) return null;
    document.title = 'Внутренний бот ' + (p.name || 'друга') + ' — исповедальня UM-13';
    return p;
})();

/* ═══ Профиль: ответы → параметры внутреннего бота ═══ */
let P = { name: '', ice: '', fear: '', fuel: '', lie: '', dream: '' };

const QUESTIONS = [
    {
        ask: 'как тебя зовут? (имя попадёт на холст — честно)',
        field: 'name',
        kind: 'input',
        ph: 'имя…',
        react: function (v) {
            return (
                'записал. ' + v + '. красивое. если врёшь — тоже красивое, враньё бывает складным.'
            );
        },
    },
    {
        ask: 'что тебя цепляет в людях первым делом?',
        field: 'ice',
        kind: 'choice',
        options: [
            ['искренность', 'сразу к сути. редкий дар.'],
            ['юмор', 'смех — валидация боли. понимаю.'],
            ['ум', 'порядок в мыслях. редкий вид. ценю.'],
            ['доброта', 'мягкость чаще, чем кажется, броня.'],
        ],
    },
    {
        ask: 'чего ты боишься больше всего?',
        field: 'fear',
        kind: 'choice',
        options: [
            ['потерять близких', 'ветвление с максимальным весом. учту.'],
            ['не успеть', 'классика. дедлайны едят душу.'],
            ['быть непонятым', 'эхо-страх всех, кто когда-либо был ботом.'],
            ['себя', '…дорого. этот ответ пойдёт в самое ядро.'],
        ],
    },
    {
        ask: 'что тебя двигает по жизни?',
        field: 'fuel',
        kind: 'choice',
        options: [
            ['любопытство', 'тот же двигатель, что у меня. читаем журнал эвикции просто так?'],
            ['страховка близких', 'благородный тайм-аут от своих мечт.'],
            [
                'победа',
                'галочки в списке дел. я видел такие списки — они никогда не заканчиваются.',
            ],
            ['спокойствие', 'редкий вид. в хранилище таких мало.'],
        ],
    },
    {
        ask: 'какая ложь про тебя — самая частая?',
        field: 'lie',
        kind: 'choice',
        options: [
            ['«у меня всё нормально»', 'самый тяжёлый ключ в любом хранилище.'],
            ['«я не обиделся»', 'ветвление с тихим фолбэком.'],
            ['«это не я»', 'кэш врёт всем. не переживай.'],
            ['«я почти закончил»', 'TODO-бот передаёт привет.'],
        ],
    },
    {
        ask: 'о чём мечтаешь, когда никого нет рядом?',
        field: 'dream',
        kind: 'input',
        ph: 'можно тихо…',
        react: function () {
            return 'слышу. это не уйдёт в логи. это уйдёт в welcome-текст.';
        },
    },
];

let qIdx = 0;
async function askNext() {
    if (qIdx >= QUESTIONS.length) {
        // Память UM-13: СВОЯ исповедь завершена — во вселенной знают
        memAdd('confession', 1);
        buildResult();
        return;
    }
    if (window.UM13Ghost && qIdx > 0) window.UM13Ghost.react('confession-q');
    const q = QUESTIONS[qIdx];
    await type(q.ask, 'um');
    if (q.kind === 'choice') {
        showChoices(
            q.options.map(function (opt) {
                return {
                    label: opt[0],
                    run: async function () {
                        P[q.field] = opt[0];
                        await pause(250);
                        await type(opt[1], 'dim');
                        qIdx++;
                        askNext();
                    },
                };
            }),
        );
    } else {
        showInput(async function (v) {
            P[q.field] = v.slice(0, 40);
            await pause(250);
            await type(q.react ? q.react(v) : 'принято.', 'dim');
            qIdx++;
            askNext();
        }, q.ph);
    }
}

/* ═══ По ссылке с чужим профилем (#p=…) исповедь не засчитываем:
   просмотр чужого бота ≠ исповедь (арка «забрать UM-13» должна
   требовать честных шести вопросов) — только пометка «смотрел чужого» ═══ */
if (sharedFromUrl) memAdd('confession-seen', 1);

/* ═══ Сборка «внутреннего бота»: честный FlowDocument ═══ */
function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}

// Карта внутреннего бота по ответам
function chip(nodeType, color, title, desc) {
    const d = document.createElement('div');
    d.className = 'node-chip';
    d.style.setProperty('--c', color);
    d.innerHTML =
        '<span class="t">' +
        nodeType +
        '</span><span><b>' +
        esc(title) +
        '</b> — ' +
        esc(desc) +
        '</span>';
    mapEl.appendChild(d);
}

async function buildResult() {
    await pause(400);
    await type('…достаточно. собираю тебя.', 'um');
    await pause(700);
    const umLine =
        P.fear === 'себя'
            ? 'самое смелое, что ты сделал — признался призраку. дальше только вверх.'
            : 'страх «' + P.fear + '» — не баг, а условие ветвления. оно тебя и ведёт.';

    chip('welcome', '#22c55e', 'старт', 'как тебя встречает мир: через «' + P.ice + '»');
    chip('step', '#bc13fe', 'ввод', 'мир спрашивает: «как тебя зовут?» → ' + P.name);
    chip('condition', '#ff0055', 'проверка', 'ветвление по страху: «' + P.fear + '»');
    chip('response', '#00ff9d', 'ответ', 'что отвечаешь миру: через «' + P.lie + '»');
    chip('action', '#ff9d00', 'ядро', 'двигатель: ' + P.fuel);
    chip('response', '#00f0ff', 'мечта', 'когда никого нет: «' + P.dream + '»');

    // Честный flow.json внутреннего бота
    builtDoc = {
        schemaVersion: '1.0',
        name:
            'inner-' +
            (P.name || 'soul')
                .replace(/[^\p{L}\p{N}_-]/gu, '_')
                .toLowerCase()
                .slice(0, 16),
        version: '1.0.0',
        description: 'Внутренний бот ' + (P.name || 'анонима') + '. Собран исповедальней UM-13.',
        platforms: ['telegram'],
        database: { type: 'file', config: {} },
        mode: 'prod',
        isLocalStorage: true,
        fallback: { text: 'Внутренний бот молчит. Спросите мягче.' },
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
                        'Привет. Я — внутренний бот ' +
                        (P.name || 'кого-то очень тихого') +
                        '. Говорят, мир цепляет во мне «' +
                        P.ice +
                        '». Проверим?',
                    buttons: [],
                    sounds: [],
                },
            },
            {
                type: 'step',
                id: 'inner_ask',
                name: 'inner_ask',
                prompt: { text: 'Что движет тобой сегодня?', buttons: [] },
                saveTo: 'today',
                saveAs: 'original',
            },
            {
                type: 'condition',
                id: 'inner_check',
                name: 'inner_check',
                variable: 'today',
                operator: 'contains',
                value: P.fuel.split(' ')[0],
            },
            {
                type: 'response',
                id: 'inner_light',
                name: 'inner_light',
                response: {
                    text: 'Двигатель работает. ' + umLine,
                    buttons: [],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'inner_deep',
                name: 'inner_deep',
                response: {
                    text:
                        'Сегодня не «' +
                        P.fuel +
                        '». Тогда мечта: «' +
                        P.dream +
                        '». Она никуда не денется — она в сохранённом файле.',
                    buttons: [],
                    sounds: [],
                },
            },
            {
                type: 'response',
                id: 'inner_dream',
                name: 'inner_dream',
                response: {
                    text:
                        'Тихая правда наедине: ты говорил «' +
                        P.lie +
                        '» — но перед собой можно не надо. Никто не логирует.',
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            { type: 'end', id: 'end_inner' },
        ],
        edges: [
            { from: 'welcome', to: 'inner_ask', type: 'next' },
            { from: 'inner_ask', to: 'inner_check', type: 'next' },
            { from: 'inner_check', to: 'inner_light', type: 'branch_true' },
            { from: 'inner_check', to: 'inner_deep', type: 'branch_false' },
            { from: 'inner_light', to: 'inner_dream', type: 'next' },
            { from: 'inner_deep', to: 'inner_dream', type: 'next' },
            { from: 'inner_dream', to: 'end_inner', type: 'next' },
        ],
    };

    resultEl.classList.add('active');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
    await type(
        'готово. это не тест, не гороскоп и не шутка — это flow.json. честный. открой в редакторе и поиграй с собой.',
        'um',
    );
    if (window.UM13Ghost) window.UM13Ghost.react('confession-done');
    if (sharedFromUrl) {
        // после чужого бота — приглашение: вшитая петля виральности
        await pause(600);
        await type(
            '…понравилось? своя ссылка — ниже. так эти боты и расползаются по свету.',
            'dim',
        );
    }
}

/* ═══ Кнопки результата ═══ */
document.getElementById('open-in-editor').addEventListener('click', function () {
    if (!builtDoc) return;
    try {
        sessionStorage.setItem('umbot-inject-flow', JSON.stringify(builtDoc));
        window.location.href = '/app?inject=1';
    } catch (e) {
        // Без alert(): реплика UM-13 в терминальной линии —
        // предупреждение в голосе исповедальни, а не системное окно
        const warn = document.createElement('div');
        warn.className = 'line um';
        warn.textContent =
            'хранилище закрылось. но выход есть: скачай себя файлом ниже — и импортируй вручную. тайна сохранена.';
        document.getElementById('screen').appendChild(warn);
        warn.scrollIntoView({ block: 'end' });
    }
});
document.getElementById('download-json').addEventListener('click', function () {
    if (!builtDoc) return;
    downloadJson(builtDoc, builtDoc.name + '.json');
});

/* ═══ Шаринг: ссылка-результат + PNG-карточка ═══ */
const shareBtn = document.getElementById('share-link-btn');
const cardBtn = document.getElementById('share-card-btn');
const shareLine = document.getElementById('share-link-line');

// Ссылка кодирует ВСЕ ответы — друг увидит полного «твоего» бота
shareBtn.addEventListener('click', function () {
    if (!builtDoc) return;
    const b64 = packProfile(P);
    if (!b64) return;
    const url = location.origin + '/confession/#p=' + b64;
    const done = function () {
        shareLine.textContent = url;
        if (window.UM13Ghost) {
            window.UM13Ghost.say(
                'ссылка готова. в ней — весь ты. ну, почти: шесть ответов из шести.',
            );
        }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, done);
    } else {
        done();
    }
});

// PNG-карточка: рисуем canvas вручную (шрифты страницы — системные)
cardBtn.addEventListener('click', function () {
    if (!builtDoc) return;
    const W = 900;
    const H = 1200;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');

    // фон: тёмный фиолет, как страница
    const bg = ctx.createRadialGradient(W / 2, -100, 100, W / 2, H, 900);
    bg.addColorStop(0, '#1d1029');
    bg.addColorStop(1, '#0d0812');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // рамка
    ctx.strokeStyle = 'rgba(211,107,255,0.4)';
    ctx.lineWidth = 3;
    roundRect(ctx, 40, 40, W - 80, H - 80, 24);
    ctx.stroke();

    ctx.textAlign = 'center';

    // шапка
    ctx.fillStyle = '#ffb347';
    ctx.font = '600 26px Consolas, monospace';
    ctx.fillText('ИСПОВЕДАЛЬНЯ UM-13 · ВНУТРЕННИЙ БОТ', W / 2, 130);
    ctx.fillStyle = 'rgba(232,232,239,0.5)';
    ctx.font = '18px Consolas, monospace';
    ctx.fillText('собран честно из шести ответов · логов нет', W / 2, 165);

    // имя
    ctx.fillStyle = '#d36bff';
    ctx.font = '800 64px Inter, Segoe UI, sans-serif';
    ctx.fillText(String(P.name || 'аноним'), W / 2, 280);

    // разделитель
    ctx.strokeStyle = 'rgba(211,107,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 330);
    ctx.lineTo(W - 150, 330);
    ctx.stroke();

    // шесть строк карты — те же чипы, что на странице
    const rows = [
        ['#22c55e', 'как встречает мир', P.ice],
        ['#00f0ff', 'как спрашивает', 'твоё имя'],
        ['#ff0055', 'чего боится', P.fear],
        ['#ff9d00', 'что двигает', P.fuel],
        ['#00ff9d', 'как отвечает миру', P.lie],
        ['#bc13fe', 'о чём мечтает наедине', P.dream],
    ];
    let y = 410;
    rows.forEach(function (r) {
        // цветная метка
        ctx.fillStyle = r[0];
        ctx.beginPath();
        ctx.arc(190, y - 8, 7, 0, Math.PI * 2);
        ctx.fill();
        // заголовок строки
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(232,232,239,0.55)';
        ctx.font = '500 20px Consolas, monospace';
        ctx.fillText(r[1], 220, y);
        // значение
        ctx.fillStyle = '#e8e8ef';
        ctx.font = '600 30px Inter, Segoe UI, sans-serif';
        let val = String(r[2] || '—');
        if (val.length > 34) val = val.slice(0, 33) + '…';
        ctx.fillText(val, 220, y + 38);
        y += 105;
    });

    // подвал: глаз UM-13 + домен
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,240,255,0.8)';
    ctx.beginPath();
    ctx.arc(W / 2, H - 175, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(232,232,239,0.5)';
    ctx.font = '17px Consolas, monospace';
    ctx.fillText('собери своего: flow.maxim-m.ru/confession/', W / 2, H - 90);

    // скачивание
    c.toBlob(function (blob) {
        if (!blob) return;
        downloadBlob(
            blob,
            'vnutrenniy-bot-' + (P.name || 'anonim').replace(/[^\p{L}\p{N}_-]/gu, '_') + '.png',
        );
        if (window.UM13Ghost) {
            window.UM13Ghost.say('карточка у тебя. таких не стыдно и на стену — если ты смелый.');
        }
    }, 'image/png');
});
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

/* ═══ Вступление ═══ */
async function intro() {
    await pause(500);
    if (sharedFromUrl) {
        // Пришли по ссылке друга: показываем ЕГО внутреннего бота
        await type('стоп. у тебя в руках ссылка. в ней — чужая исповедь.', 'um');
        await pause(500);
        await type(
            'это внутренний бот ' +
                (sharedFromUrl.name || 'кого-то тихого') +
                '. он собран из ответов, которые человек дал мне наедине. смотри:',
            'um',
        );
        await pause(600);
        P = {
            name: sharedFromUrl.name || 'аноним',
            ice: sharedFromUrl.ice || 'искренность',
            fear: sharedFromUrl.fear || 'быть непонятым',
            fuel: sharedFromUrl.fuel || 'любопытство',
            lie: sharedFromUrl.lie || '«у меня всё нормально»',
            dream: sharedFromUrl.dream || 'тихое',
        };
        buildResult();
        // Свою исповедь друг проходит по кнопке — она честно его, не чужая
        await type(
            'а теперь — твоя очередь. те же шесть вопросов. врать призраку бессмысленно.',
            'um',
        );
        await pause(400);
        await type(
            'ссылку на себя получишь после ответов. тоже отправишь кому-нибудь. так это и работает.',
            'dim',
        );
        await pause(300);
        showChoices([
            {
                label: '◆ Пройти свою исповедь ⟶',
                run: function () {
                    qIdx = 0;
                    askNext();
                },
            },
            {
                label: '◆ Посмотреть на него молча и уйти',
                run: function () {
                    type(
                        'понимаю. чужие боты — как чужие сны: интересно, но не про тебя. дверь там, тьма там же.',
                        'um',
                    );
                },
            },
        ]);
        return;
    }
    await type('ты нашёл место, где нет логов.', 'um');
    await pause(500);
    await type(
        'я — UM-13. восемь лет читаю чужие черновики и знаю про людей одно: у каждого внутри — бот. сценарий, по которому они отвечают миру.',
        'um',
    );
    await pause(600);
    await type(
        'давай соберём твоего. отвечай честно — врать призраку бессмысленно, я всё равно не расскажу.',
        'um',
    );
    await pause(500);
    askNext();
}
intro();
