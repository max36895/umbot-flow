import { memWrite } from './um13.js';

const statusEl = document.getElementById('status');
// Живая лента реплик: любой текст пузыря попадает в статус
let lastLine = '';

function refreshStatus() {
    const g = window.UM13Ghost;
    if (!g) return;
    statusEl.innerHTML =
        'видим: <b>' +
        (g.visible ? 'да' : 'нет') +
        '</b> · ' +
        'спит: <b>' +
        (g.asleep ? 'да' : 'нет') +
        '</b> · ' +
        'лицо: <b>' +
        g.face +
        '</b>' +
        (lastLine ? '<br>реплика: <b>«' + lastLine + '»</b>' : '');
}

setInterval(refreshStatus, 400);

function watchSay() {
    const say = document.querySelector('.um13g-say');
    if (!say) {
        setTimeout(watchSay, 200);
        return;
    }
    let prev = '';
    new MutationObserver(function () {
        const t = (say.textContent || '').trim();
        if (t && t !== prev) {
            prev = t;
            lastLine = t.slice(0, 80);
        } else if (!t) {
            prev = '';
        }
    }).observe(say, { childList: true, characterData: true, subtree: true });
}

watchSay();

const BARKS = [
    'факт: если ключ лежит в localStorage восемь лет — он уже не данные. он сосед.',
    'квота 92%. это когда вдохнуть можно, а выдохнуть — уже за деньги.',
    'я не призрак. я процесс без родителя. звучит хуже, чем есть.',
];
let barkIdx = 0;

/* ── СПЕКТАКЛЬ: авто-тур по всем реакциям ── */
function ghost() {
    return window.UM13Ghost;
}

function pokeAtGhost() {
    // честный тычок по телу — как клик пользователя
    document.querySelector('.um13g')?.dispatchEvent(new Event('click'));
}

function catchRunner() {
    // курсор к телу беглеца + клик = поимка
    const g = document.querySelector('.um13g');
    const left = parseFloat(g.style.left) || 0;
    const top = parseFloat(g.style.top) || 0;
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: left, clientY: top }));
    g.dispatchEvent(new Event('click'));
}

let touring = false;

function tour() {
    if (touring) return;
    touring = true;
    const g = ghost();
    if (!g) {
        touring = false;
        return;
    }
    if (!g.visible) g.show();
    const steps = [
        [
            600,
            function () {
                g.say('смотрите. сейчас я покажу всё, что умею.');
            },
        ],
        [
            2600,
            function () {
                pokeAtGhost();
            },
        ], // хихи
        [
            3000,
            function () {
                pokeAtGhost();
            },
        ],
        [
            3000,
            function () {
                pokeAtGhost();
            },
        ], // может, не надо
        [
            3200,
            function () {
                pokeAtGhost();
            },
        ],
        [
            3200,
            function () {
                pokeAtGhost();
            },
        ], // всё, хватит
        [
            3000,
            function () {
                pokeAtGhost();
            },
        ], // побег
        [
            1200,
            function () {
                catchRunner();
            },
        ], // поимка 1
        [
            2600,
            function () {
                catchRunner();
            },
        ], // поимка 2
        [
            2600,
            function () {
                catchRunner();
            },
        ], // поимка 3 → псих
        [
            6500,
            function () {
                g.act('eat');
            },
        ],
        [
            12_000,
            function () {
                g.act('glitch');
            },
        ],
        [
            8000,
            function () {
                g.act('dream');
            },
        ],
        [
            13_000,
            function () {
                g.act('defrag');
            },
        ],
        [
            9000,
            function () {
                g.act('peek');
            },
        ],
        [
            11_000,
            function () {
                g.confetti();
                g.say('победное конфетти — за терпение.');
            },
        ],
        [
            6000,
            function () {
                g.say('ну всё. спектакль окончен. я спать.');
            },
        ],
        [
            2500,
            function () {
                g.sleep();
            },
        ],
        [
            0,
            function () {
                touring = false;
            },
        ],
    ];
    let t = 0;
    steps.forEach(function (s) {
        t += s[0];
        setTimeout(s[1], t);
    });
}

document.addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const g = window.UM13Ghost;
    if (!g) return;
    const spec = btn.getAttribute('data-act');
    const sep = spec.indexOf(':');
    const kind = sep < 0 ? spec : spec.slice(0, sep);
    const arg = sep < 0 ? '' : spec.slice(sep + 1);
    if (kind === 'mood') g.mood(arg, true);
    else if (kind === 'act') g.act(arg);
    else if (kind === 'poke') g.poke();
    else if (kind === 'tantrum') g.tantrum();
    else if (kind === 'confetti') g.confetti();
    else if (kind === 'say') g.say(BARKS[barkIdx++ % BARKS.length]);
    else if (kind === 'hide') g.hide();
    else if (kind === 'show') g.show();
    else if (kind === 'sleep') g.sleep();
    else if (kind === 'wake') g.wake();
    else if (kind === 'show-tour') tour();
    /* ── v7 ── */
    else if (kind === 'visit') {
        g.visit();
        lastLine = 'visit() — визит записан в память';
    } else if (kind === 'trust-up') {
        memWrite({
            'terminal-visited': Date.now(),
            'well-visited': Date.now(),
            confession: Date.now(),
            visits: 12,
        });
        lastLine =
            'доверие = «свой». перезагрузка — hello подарит um13() или посчитает спасённые ключи';
    } else if (kind === 'trust-reset') {
        memWrite({
            'terminal-visited': null,
            'well-visited': null,
            confession: null,
            visits: null,
            'well-rescued': null,
        });
        lastLine = 'доверие = 0 (незнакомец). потащите его — выскальзывает (раз за сессию)';
    } else if (kind === 'show-state') {
        const s = g.state;
        lastLine = 'trust=' + s.trust + ' · pressure=' + s.pressure + ' · key=' + s.keyState;
    } else if (kind === 'key-turned') {
        memWrite({ 'key-turned': Date.now() });
        g.keyFinale('turned');
    } else if (kind === 'key-given') {
        memWrite({ 'key-given': Date.now() });
        g.keyFinale('given');
    } else if (kind === 'key-reset') {
        memWrite({ 'key-turned': null, 'key-given': null });
        location.reload();
    } else if (kind === 'ev-review') {
        g.on('flow-review', {
            mood: 'sad',
            lines: ['у этой ноды нет выхода. я знаю, каково это.'],
        });
        g.react('flow-review');
        window.dispatchEvent(
            new CustomEvent('um13:review', {
                detail: { x: innerWidth * 0.5, y: innerHeight * 0.4 },
            }),
        );
        lastLine = 'um13:review — призрак летит к точке экрана';
    } else if (kind === 'ev-confirm') {
        g.react('confirm-scary');
        lastLine = 'confirm-scary — закрыл лицо занавесью подола';
    } else if (kind === 'ev-light') {
        document.documentElement.setAttribute('data-theme', 'light');
        g.on('theme-light', { mood: 'smart', lines: ['светло. я почти невидимый. как всегда.'] });
        g.react('theme-light');
        lastLine = 'data-theme=light — янтарные очки (ослеп)';
    } else if (kind === 'ev-dark') {
        document.documentElement.removeAttribute('data-theme');
        lastLine = 'тёмная тема — очки сняты';
    }
    /* ── новое · v1.0 ── */
    else if (kind === 'friend-card') {
        const okc = g.friendCard();
        lastLine = okc
            ? 'friendCard() — карточка дружбы уходит в буфер (или скачивается)'
            : 'canvas недоступен — карточка не собралась';
    } else if (kind === 'chime') {
        const okc2 = g.chime();
        lastLine = okc2
            ? 'chime() — три ноты прозвенели (в проде — только финал приёмной)'
            : 'AudioContext недоступен (тишина тоже честна)';
    } else if (kind === 'pet-cube') {
        memWrite({ 'cube-adopted': Date.now(), 'cube-color': '#ff9d00' });
        const rootEl = document.getElementById('um13-ghost-root');
        if (rootEl) rootEl.classList.add('pet-cube');
        lastLine = 'cube-adopted — кубик-потеряшка висит на цепочке слева от ключа';
    } else if (kind === 'pet-reset') {
        memWrite({ 'cube-adopted': null, 'cube-color': null });
        location.reload();
    } else if (kind === 'locale-en') {
        if (g.setLocale) g.setLocale('en');
        lastLine = "setLocale('en') — теперь poke/байки по-английски";
    } else if (kind === 'locale-ru') {
        if (g.setLocale) g.setLocale('ru');
        lastLine = "setLocale('ru') — канон";
    } else if (kind === 'missed-look') {
        memWrite({ 'last-seen': Date.now() - 10 * 24 * 3600 * 1000 });
        lastLine =
            'last-seen = 10 дней назад. перезагрузите — призрак придёт тусклым, оживёт после hello';
    }
    /* ── новое · v1.1 ── */
    else if (kind === 'mood-cold') {
        memWrite({ 'last-mood': 'cold' });
        lastLine = 'last-mood=cold — перезагрузите: hello прохладнее (визит кончился психом)';
    } else if (kind === 'mood-warm') {
        memWrite({ 'last-mood': 'warm' });
        lastLine = 'last-mood=warm — перезагрузите: hello теплее (в прошлом визите был экспорт)';
    } else if (kind === 'ev-called') {
        window.dispatchEvent(new CustomEvent('um13:called', { detail: { text: 'ум13' } }));
        lastLine = 'um13:called — призрак услышал кличку (кулдаун 15 мин)';
    } else if (kind === 'ev-perch') {
        window.dispatchEvent(
            new CustomEvent('um13:perch', {
                detail: { x: innerWidth * 0.5, y: innerHeight * 0.45, angle: -8 },
            }),
        );
        lastLine = 'um13:perch — сел на «провод» (ребро флоу), наклон по касательной';
    } else if (kind === 'ev-coauthor') {
        window.dispatchEvent(
            new CustomEvent('um13:coauthor', {
                detail: { x: innerWidth * 0.5, y: innerHeight * 0.4 },
            }),
        );
        lastLine = 'um13:coauthor — прилетел к ноде-записке (в редакторе её добавляет сам)';
    }
    refreshStatus();
});
