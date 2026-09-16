import { ghostReady, memAdd } from './um13.js';

// Падение всегда начинается с поверхности: после F5 браузер
// по умолчанию восстанавливает позицию скролла (scrollRestoration
// = 'auto') — колодец «стартовал бы с середины», космонавт
// появился бы сразу, весь спуск потерялся. Начинаем с нуля.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Путь, который запрашивали. location.pathname отдаёт его в percent-encoding
// (/%D0%BF%D0%B8…) — декодируем, иначе кириллица нечитаема, а реплики
// призрака про «пиццу» и «кота» не узнают слово.
const requestedPath = (function () {
    const raw = location.pathname + location.search;
    try {
        return decodeURIComponent(raw);
    } catch (e) {
        return raw; // битая %-последовательность — показываем как есть
    }
})();

// Показываем пользователю путь (только для отображения, не для исполнения)
document.getElementById('path').textContent = requestedPath;

// Глубина падения: сколько пикселей пролистано ниже первого экрана
function currentDepth() {
    return Math.max(0, Math.round(window.scrollY - window.innerHeight * 0.8));
}

// ═══ Летуны: космонавт и питомец-нода дрейфуют по экрану ═══
const ship = document.getElementById('cosmo-ship');
const cosmoSaysEl = document.getElementById('cosmo-say');

// ═══ Космонавт: JS только включает/выключает видимость по глубине.
// Траектория — чистый CSS (cosmo-voyage), позиций в JS нет.
function driftFlyers() {
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    ship.classList.toggle('in', window.scrollY / maxScroll > 0.55);
}

// Глубиномер
const gauge = document.getElementById('gauge');
const gval = document.getElementById('depth-val');
const teaser = document.getElementById('teaser');
const badge = document.getElementById('rescue-badge');
const rescued = [];

function updateGauge(d) {
    if (d > 40) {
        gauge.classList.add('show');
        gval.textContent = d;
    } else {
        gauge.classList.remove('show');
    }
}

// Страховка: часть сред не диспатчит scroll — тикаем сами
window.setInterval(function () {
    const d = currentDepth();
    updateGauge(d);
    driftFlyers();
    tickDepthEvents(d);
}, 1500);

// Обработка дешёвая, поэтому без rAF-троттлинга: в фоне rAF
// замерзает и валил всю глубиномерию
window.addEventListener(
    'scroll',
    function () {
        const d = currentDepth();
        updateGauge(d);
        badge.classList.toggle('show', rescued.length > 0);
        teaser.style.opacity = window.scrollY > 200 ? '0' : '1';
        tickDepthEvents(d);
        driftFlyers();
    },
    { passive: true },
);

// Волна эвикции: помеченные ⚡ ключи можно СПАСТИ кликом —
// до того, как блок уйдёт из вьюпорта (волна «догоняет» скролл).
const doomy = Array.from(document.querySelectorAll('.key.doomy'));
const val = document.getElementById('rescue-val');

doomy.forEach(function (k) {
    k.addEventListener('click', function () {
        if (k.classList.contains('saved')) return;
        k.classList.remove('doomy');
        k.classList.add('saved');
        const name = k.querySelector('.k-name').textContent;
        const size = k.querySelector('.k-size').textContent.replace(/\s*⚡/, '');
        memAdd('well-rescued', 1);
        k.querySelector('.k-size').textContent = 'спасён тобой ✓';
        rescued.push({ name: name, size: size });
        val.textContent = rescued.length;
        if (window.UM13Ghost) window.UM13Ghost.react('404-saved');
        // Немного тёплого отклика: вспышка на бейдже
        badge.classList.add('pulse');
        setTimeout(function () {
            badge.classList.remove('pulse');
        }, 450);
        updateVerdict();
    });
});

// Пропущенные: когда блок с ⚡ уходит из вьюпорта ВВЕРХ (пролистал мимо) —
// волна «съедает» ключ. Важно: при загрузке страницы блоки ниже вьюпорта
// тоже неинтерсектятся — их нельзя удалять, они ещё не «пропущены».
// Поэтому сначала дожидаемся первого появления, и только потом
// реагируем на уход.
const seen = new WeakSet();
const prevBelow = new WeakMap(); // ключ → был ли ниже вьюпорта в прошлый свип
// Волна ловит ПРОЛЁТ: тонкий ключ при быстром скролле проскакивает
// вьюпорт между событиями (35px против шага колеса ~450px), поэтому
// считаем не «виден сейчас», а «оказался выше, хотя был ниже» —
// это честный пропуск мимо ключа при спуске.
function sweepGone() {
    const vh = window.innerHeight;
    doomy.forEach(function (k) {
        if (!k.classList.contains('doomy') || k.classList.contains('saved')) return;
        const r = k.getBoundingClientRect();
        const wasBelow = prevBelow.get(k);
        const isAbove = r.bottom < 0;
        const isBelow = r.top > vh;
        if (isBelow) prevBelow.set(k, true);
        if (r.top < vh) seen.add(k);
        if (isAbove && (wasBelow === true || seen.has(k))) {
            // прошёл мимо ключа — волна забирает его
            k.classList.remove('doomy');
            k.classList.add('gone');
            k.querySelector('.k-size').textContent = 'удалён волной ✕';
            if (window.UM13Ghost) window.UM13Ghost.react('404-missed');
            updateVerdict();
        }
    });
}

window.addEventListener('scroll', sweepGone, { passive: true });
window.addEventListener('resize', sweepGone, { passive: true });

// Вердикт UM-13 и отчёт — считаются вживую
const TOTAL = doomy.length;
const verdict = document.getElementById('um-verdict');
const report = document.getElementById('report');
const list = document.getElementById('report-list');
let wellFlagSet = false;
// Флаг «дошёл до дна» — арка «забрать UM-13» в терминале зависит от него,
// поэтому проверяем не только в updateVerdict (спасения/пропуски), но и
// на каждом скролле: дно без единого клика тоже должно считаться дном.
function checkWellBottom() {
    if (wellFlagSet) return;
    if (verdict.getBoundingClientRect().top < window.innerHeight) {
        wellFlagSet = true;
        memAdd('well-visited', 1);
        if (window.UM13Ghost) window.UM13Ghost.react('404-bottom');
    }
}

window.addEventListener('scroll', checkWellBottom, { passive: true });
window.addEventListener('resize', checkWellBottom, { passive: true });

function updateVerdict() {
    checkWellBottom();
    const saved = rescued.length;
    const gone = document.querySelectorAll('.key.gone').length;
    // Зачёт — только по увиденным: до каких скролл не дошёл,
    // тот не считается ни спасённым, ни упущенным
    const seenCount = doomy.filter(function (k) {
        return seen.has(k) || k.classList.contains('saved') || k.classList.contains('gone');
    }).length;
    let rank;
    if (seenCount > 0 && saved === seenCount)
        rank =
            'ХРАНИТЕЛЬ. Ни один ключ не умер. Таких, как ты, в хранилище видели дважды, и один из них — я.';
    else if (seenCount > 0 && saved >= seenCount * 0.6)
        rank = 'спасатель с лицензией. Ты дошёл до дна и вынес больше, чем нёс.';
    else if (saved > 0) rank = 'свидетель. Кое-что ты успел. Хранилище помнит и это.';
    else if (gone > 0) rank = 'наблюдатель. Волна сделала всё сама. Иногда это тоже позиция.';
    else rank = 'спустился молча. Даже волна тебя не заметила.';
    verdict.textContent =
        'Спасено: ' +
        saved +
        ' из ' +
        seenCount +
        ' увиденных (' +
        TOTAL +
        ' всего). Упущено: ' +
        gone +
        '. ' +
        rank;
    if (saved > 0) {
        list.innerHTML = '';
        rescued.forEach(function (r) {
            const li = document.createElement('li');
            li.textContent = r.name + ' — ' + r.size + ' — живёт';
            list.appendChild(li);
        });
        report.hidden = false;
    }
}

updateVerdict();

// ═══ Анекдоты по глубине: каждые ~1.5 экрана — новая реплика ═══
const JOKES = [
    'localStorage — единственное место, где твои данные чувствуют себя дома. потому что там и живут.',
    'анекдот уровня enterprise: «у нас микросервисная архитектура». — а монолит где? — он тоже микросервис. большой.',
    'встречаются два бота в баре. один говорит: «извини, я тебя не распознал». второй: «нормально, я тоже fallback».',
    '— почему у бота депрессия? — у него всё в порядке с состоянием. он stateless.',
    'программист ставит на ночь два стакана: с водой — если захочет пить, и пустой — если не захочет.',
    '«я вас не понял» — единственная честная фраза в чат-ботах. и в людях тоже.',
    'глубина, на которой заканчивается кэш, называется «совесть разработчика».',
    'синий экран — это просто бот, у которого кончились рёбра.',
    'тут могла бы быть ваша реклама. но тут даже данных нет.',
    'учёные выяснили: 100% людей, дочитавших до этой глубины, скроллили впустую. но красиво.',
    'ниже этой строки данных нет. есть только существо по имени ты с мышкой.',
    'если ты нашёл это сообщение — поздравляю, ты официально глубже, чем поисковый робот.',
];
const jokeEl = document.getElementById('joke');
let lastJokeIdx = -1;
let jokeTimer = 0;

function showJoke(text, ms) {
    jokeEl.textContent = text;
    jokeEl.classList.add('show');
    clearTimeout(jokeTimer);
    jokeTimer = setTimeout(function () {
        jokeEl.classList.remove('show');
    }, ms);
}

// ═══ Космонавт репликует, когда проплываешь мимо ═══
const COSMO_SAYS = [
    '…привет. ты тоже потерялся?',
    'я тут с релиза 0.4.2. красивый вид, правда?',
    'мне сказали «додержать до продакшна». я держу.',
    'в пустоте нет 404. есть только тишина и я.',
    'если увидишь моего разработчика — скажи, что трос не безграничный.',
    'ты падаешь уже минуту. в невесомости это называется полёт.',
    'данные кончились где-то на слое 6. дальше я просто скучаю.',
    'не переживай. все, кто доходят сюда, возвращаются наверх лучше.',
];
let cosmoSaid = 0;

function tickDepthEvents(d) {
    // Анекдот каждые ~1.4 экрана, живёт 5.5 сек
    const idx = Math.floor(d / (window.innerHeight * 1.4)) % JOKES.length;
    if (idx !== lastJokeIdx && d > 80) {
        lastJokeIdx = idx;
        showJoke(JOKES[idx], 5500);
    }
    // Космонавт: корабль fixed и всегда «в кадре», поэтому видимость
    // не проверить — реплика сменяется по глубине: каждые ~2 экрана
    // после его появления (~55% страницы). Реплики конечны —
    // дальше он просто плывёт молча, как и положено космонавту.
    const cosmoStep = Math.floor(d / (window.innerHeight * 2));
    if (cosmoStep !== cosmoSaid && cosmoSaid < COSMO_SAYS.length) {
        cosmoSaid = cosmoStep;
        cosmoSaysEl.textContent = COSMO_SAYS[Math.min(cosmoSaid, COSMO_SAYS.length - 1)];
    }
}

// ═══ Блокировка «телепортов»: падение должно быть честным ═══
// End/Home/PageDown/Ctrl+End и поиск (') — нельзя. F5 пусть живёт.
window.addEventListener('keydown', function (e) {
    const k = e.key;
    const blocked =
        k === 'End' ||
        k === 'Home' ||
        k === 'PageDown' ||
        k === 'PageUp' ||
        k === 'F3' ||
        (k === '/' && !e.ctrlKey && !e.metaKey);
    if (blocked) {
        e.preventDefault();
        if (window.UM13Ghost) {
            window.UM13Ghost.react('404-home-blocked');
        }
        showJoke('UM-13: без телепортов. падай как все — честно, слой за слоем.', 3200);
    }
});
// Колёсико: обычный скролл разрешаем, но прыжки по якорям-кнопкам — нет
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
        e.preventDefault();
    });
});

// ═══ ПРИЗРАК-СПУТНИК: path-aware реплики ═══
// UM-13 читает, по какому пути ты упал, и реагирует персонально.
ghostReady(function (g) {
    const raw = requestedPath;

    // Path-aware реплики: волшебные слова + общий fallback
    const PATH_LINES = [
        [
            /пицца|pizza/i,
            'ты искал «{p}»? она была здесь. волна забрала. но курьер ещё бегает в приёмной.',
        ],
        [
            /кот|cat|кошк/i,
            'навык про кошек? он почти готов. восемь лет как «почти». лежит в слое 2.',
        ],
        [
            /бот|bot/i,
            '«{p}»… бот с таким адресом не собрали. но ты можешь собрать: редактор наверху.',
        ],
        [
            /админ|admin|панель/i,
            'панель админа? хранилище не имеет администрации. только эвикция. и я.',
        ],
        [
            /secret|терминал/i,
            'терминал — не здесь. он за десятью кликами по логотипу. но ты близко к стилю.',
        ],
        [
            /love|любов/i,
            'любовь в localStorage не хранят. только снапшоты. но я понимаю sentiмент.',
        ],
        [
            /деньги|money|зарплат/i,
            'деньги? у ключей нет кошельков. у них есть размер. у тебя — глубина.',
        ],
        [/index|главн/i, 'главная — этажом выше. но раз уж упал: внизу есть на что посмотреть.'],
        [
            /404/i,
            'ты пришёл на 404 искать 404? это уже мета. уважаю. падай ниже — там про это есть.',
        ],
        [/хлеб|bread/i, 'хлеб? в слое legacy есть крошки от чьего-то обеда 2019 года. не мой.'],
        [/смысл|meaning/i, 'смысл. есть внизу. слой 6: «дальше — только ты». это и был смысл.'],
        [
            /помощь|help|халява/i,
            'справка выдаётся в приёмной. окно №13. но оно закрыто на обед. с 2018 года.',
        ],
    ];
    const found = PATH_LINES.find(function (pl) {
        return pl[0].test(raw);
    });
    // say() рендерит HTML, а путь — ввод посетителя: экранируем.
    // Замена функцией — чтобы «$&» и прочие $-шаблоны в пути не сработали
    const line = (
        found
            ? found[1]
            : 'неужели я так долго спал, что ты попал на 404. и по пути «{p}» звёзд с неба не обещаю — только глубину.'
    ).replace('{p}', function () {
        return escapeHtml(raw);
    });
    // Приветствие = path-реплика (говорит сразу, призрак своё
    // «о. привет» подавит: страница поздоровалась первой).
    // Именно сразу: hello призрака стартует через 1–2с после появления,
    // и прежняя задержка 1.2с проигрывала ему гонку примерно в каждом
    // пятом визите — path-реплика ждала за чужим hello до 11с.
    // Отдельный react('404-arrive') убран — был бы дублем.
    g.say(line, 6500);

    // Призрак следит за глубиной: слои — реплики провожатого
    let depthSaid = 0;
    window.addEventListener(
        'scroll',
        function () {
            const page = Math.round(currentDepth() / window.innerHeight);
            if (page === depthSaid) return;
            if (page > depthSaid && page >= 1 && page <= 8) {
                if (page <= 2) g.react('404-depth-early');
                else if (page <= 5) g.react('404-depth-mid');
                else g.react('404-depth-deep');
                depthSaid = page;
            }
        },
        { passive: true },
    );
});

// ═══ «Уронить друга»: копирует случайный 404-URL в буфер ═══
const dropBtn = document.getElementById('drop-friend-btn');
const dropCopied = document.getElementById('drop-copied');
if (dropBtn) {
    // Пути-отсылки к лору: друг получит СВОЙ колодец и, возможно,
    // новую реплику призрака про «своё» слово
    const DROPS = [
        '/пицца-бот_не_вышел',
        '/навык_про_кошек_v9_FINAL',
        '/TODO-бот/запусти_меня',
        '/внутренний-бот/исповедальня',
        '/С Licence/офис-окна-13',
        '/буфер_обмена/утрачен',
        '/план_по_спасению_ключей',
        '/квотный-лом/легендарный',
        '/смысл_жизни/не_найден',
        '/админка/которой_нет',
        '/vibe-deploy/ну_вроде_задеплоилось',
        '/финал_без_титров',
        '/куда_все_ушли',
        '/прерванный_ребро_404',
        '/скрытый_уровень_13',
    ];
    dropBtn.addEventListener('click', function () {
        const url = location.origin + DROPS[Math.floor(Math.random() * DROPS.length)];
        const done = function () {
            dropCopied.hidden = false;
            setTimeout(function () {
                dropCopied.hidden = true;
            }, 4200);
            if (window.UM13Ghost) {
                window.UM13Ghost.say(
                    'отправил. пусть падает медленно — там красиво на четвёртом слое.',
                );
            }
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done, done);
        } else {
            try {
                const ta = document.createElement('textarea');
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            } catch (e) {
                /* буфер недоступен — покажем ссылку текстом */
            }
            done();
        }
    });
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
