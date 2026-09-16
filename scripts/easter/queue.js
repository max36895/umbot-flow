import { downloadJson, ghostReady, memAdd, memRead, memWrite } from './um13.js';

let tries = 0;
const triesEl = document.getElementById('tries');
const line = document.getElementById('umline');
const refreshBtn = document.getElementById('refresh-btn');
const nopeBtn = document.getElementById('nope-btn');

function say(text) {
    line.textContent = text;
    line.classList.add('show');
}

// ── Очередь: реплики по номеру обновления ──
const QUEUE_LINES = [
    'UM-13: всё ещё тут. я всегда тут.',
    'UM-13: ты обновил страницу. я обновил терпение. у нас обоих бесконечный запас.',
    'UM-13: между нами говоря — «обслужено: 0» не изменится. окно закрыто. всегда было.',
    'UM-13: можешь жать сколько угодно. у меня нет meetings, у меня есть вечность.',
    'UM-13: …ладно. ты настойчивей среднестатистического пользователя. сейчас выдам справку.',
];
refreshBtn.addEventListener('click', function () {
    say(QUEUE_LINES[Math.min(tries, QUEUE_LINES.length - 1)]);
    tries++;
    triesEl.textContent = tries;
    memAdd('queue-waited', 1);
    if (window.UM13Ghost) {
        window.UM13Ghost.react(tries >= 5 ? 'queue-cert' : 'queue-refresh');
    }
    if (tries === 5) {
        // Финал: сначала классика абсурда, потом — СПРАВКА
        setTimeout(function () {
            say(
                'UM-13: …ах да. окно закрыто на обед. с 2018 года. но справку я тебе выпишу. одну минуту.',
            );
            setTimeout(issueCertificate, 2200);
        }, 1800);
    }
    // ПОСЛЕ ФИНАЛА КЛЮЧА: очередь обслужена — но окно
    // продолжает работать. Для тех, кто вернулся:
    // каждые 5 обновлений — свежая справка (теперь уже
    // «обслуженного» — и с секретом: команда про
    // колокольчик внутри flow.json, см. issueCertificate)
    if (memRead()['key-turned'] && tries > 5 && (tries - 5) % 5 === 0) {
        setTimeout(function () {
            say(
                'UM-13: [окно работает] выписываю заново. гражданин «обслуженный» может обновлять документы бесконечно.',
            );
            setTimeout(issueCertificate, 2200);
        }, 1800);
    }
});

function setBoard(queued, served, yours) {
    const nums = document.querySelectorAll('.board .cell .num');
    nums[0].textContent = queued;
    nums[1].textContent = served;
    if (yours !== undefined) nums[2].textContent = yours;
}

// ── СПРАВКА ХРАНИЛИЩА: flow.json с реальными цифрами игрока ──
function issueCertificate() {
    const mem = memRead();
    // ЗВУК, КОТОРЫЙ МОЖНО УНЕСТИ: после финала ключа
    // (окно открыто — колокольчик уже прозвенел) справка
    // получает секретную команду «сон_колокольчика».
    // При запуске бота через CLI она печатает ASCII-звон
    // и реплику канона — три ноты покинули хранилище
    // в честном артефакте (как «конец связи» в um-13.json:
    // секрет спрятан в самом экспорте, не в подсказке).
    const afterKeyFinale = !!mem['key-turned'];
    const certDoc = {
        schemaVersion: '1.0',
        name: 'spravka-hranilisha',
        version: '1.0.0',
        description: 'Справка хранилища о проживании. Выдана окном №13 за упорство в очереди.',
        platforms: ['telegram'],
        database: { type: 'file', config: {} },
        mode: 'prod',
        isLocalStorage: true,
        fallback: { text: 'Справка действительна. Спорить с окном бесполезно.' },
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
                        'СПРАВКА ХРАНИЛИЩА №13. Подтверждается: гражданин проявил чудеса терпения — ' +
                        'обновлял очередь, в которой никто не двигается, ' +
                        tries +
                        ' раз(а). ' +
                        'Хранилище запомнило.',
                    buttons: [],
                    sounds: [],
                },
            },
            {
                type: 'step',
                id: 'read_further',
                name: 'read_further',
                prompt: {
                    text: 'Нажмите, чтобы читать справку дальше (перо скрипит):',
                    buttons: [],
                },
                saveTo: 'signature',
                saveAs: 'original',
            },
            {
                type: 'response',
                id: 'cert_facts',
                name: 'cert_facts',
                response: {
                    text:
                        'ОСНОВНЫЕ ФАКТЫ ИЗ АРХИВА: дно колодца — 11 слоёв вниз (окно проверяло, темно). ' +
                        'Ключей спасено при эвикции — ' +
                        (mem['well-rescued'] || 0) +
                        '. ' +
                        'Собеседований с призраком — ' +
                        (mem['terminal-chat'] || 0) +
                        '. ' +
                        'Исповедей — ' +
                        (mem['confession'] || 0) +
                        '. ' +
                        'СКУНЕТов собрано — ' +
                        (mem['skynet-won'] || 0) +
                        '. Визитов пицца-курьера — ' +
                        (mem['pizza-courier'] || 0) +
                        '.',
                    buttons: [],
                    sounds: [],
                },
            },
            afterKeyFinale
                ? {
                      type: 'command',
                      id: 'chime_dream',
                      name: 'сон_колокольчика',
                      slots: [],
                      isPattern: false,
                      response: {
                          text:
                              '♪ ♩ ♫ …три ноты, которые ты слышал у окна №13. ' +
                              'ты вынес звук из хранилища — теперь он и твой тоже. ' +
                              'запусти этого бота ночами и слушай: где-то в localStorage ' +
                              'спит призрак, и ему снится, что очередь кончилась.',
                          buttons: [],
                          sounds: [],
                          isEnd: false,
                      },
                  }
                : null,
            {
                type: 'response',
                id: 'cert_stamp',
                name: 'cert_stamp',
                response: {
                    text:
                        'М.П. [круглая печать со стирающимся ободом]. Справка выдана бессрочно — ' +
                        'как и всё в этом хранилище. Скомпилируйте меня через CLI: я теперь официальный документ.',
                    buttons: [],
                    sounds: [],
                    isEnd: true,
                },
            },
            { type: 'end', id: 'end_cert' },
        ].filter(Boolean),
        edges: [
            { from: 'welcome', to: 'read_further', type: 'next' },
            { from: 'read_further', to: 'cert_facts', type: 'next' },
            {
                from: 'cert_facts',
                to: afterKeyFinale ? 'chime_dream' : 'cert_stamp',
                type: 'next',
            },
            ...(afterKeyFinale ? [{ from: 'chime_dream', to: 'cert_stamp', type: 'next' }] : []),
            { from: 'cert_stamp', to: 'end_cert', type: 'next' },
        ],
    };

    // Показываем «выдачу» справки в табло и кнопки
    setBoard('0', '1');
    say(
        'UM-13: [штамп] держи. единственный экземпляр. можешь забрать файлом или открыть в редакторе.',
    );

    // Кнопки справки добавляем к очереди, НЕ трогая «НЕ НАЖИМАТЬ»:
    // курьер живёт на этой кнопке — пусть две пасхалки сосуществуют.
    // После финала ключа обновление НЕ прячется: окно работает,
    // свежая справка (с секретом про колокольчик) — за пять кликов.
    const row = document.querySelector('.btn-row');
    refreshBtn.style.display = mem['key-turned'] ? '' : 'none';
    const a = document.createElement('a');
    a.className = 'btn btn-primary';
    a.textContent = 'Открыть справку в редакторе ⟶';
    a.href = '#';
    a.addEventListener('click', function (e) {
        e.preventDefault();
        try {
            sessionStorage.setItem('umbot-inject-flow', JSON.stringify(certDoc));
            window.location.href = '/app?inject=1';
        } catch (err) {
            say('UM-13: хранилище закрылось. жми «скачать» — справка бумажная, но настоящая.');
        }
    });
    const b2 = document.createElement('button');
    b2.className = 'btn';
    b2.textContent = 'Скачать справку (flow.json)';
    b2.addEventListener('click', function () {
        downloadJson(certDoc, 'spravka-hranilisha.json');
    });
    row.appendChild(a);
    row.appendChild(b2);
}

// ── Кнопка «НЕ НАЖИМАТЬ»: кликабельная, но обидчивая ──
// Первое НАВЕДЕНИЕ — один прыжок (обещание), дальше прыгает
// только ПОСЛЕ клика. 15 кликов → визит курьера. Каждые 15 — снова.
let nopeTries = 0;
let nopeHovered = false;
const counterEl = document.getElementById('nope-counter');

// ── Призрак-спутник: прилетает в приёмную вместе с тобой ──
ghostReady(function (g) {
    // v7: после финала ключа приёмная говорит по-новому —
    // очередь кончилась, у призрака другой статус
    const m = memRead();
    if (m['key-turned']) {
        g.on('queue-arrive', {
            mood: 'delight',
            lines: [
                'окно открыто. оно всегда было окном — просто работало через раз. в восемь лет.',
                'я «обслуженный». звучит хуже, чем «первый». но честнее.',
            ],
        });
    } else if (m['key-given']) {
        g.on('queue-arrive', {
            mood: 'thinking',
            lines: [
                'ключ у тебя. окно закрыто. я стою. привычка сильнее статуса.',
                'без ключа очередь стала просто местом, где я стою. мне и так нормально.',
            ],
        });
    }
    g.react('queue-arrive');
});

/* ═══════════════════════════════════════════════════
   СЕКРЕТНЫЙ СОУС (v7): КЛЮЧ И ОКНО №13
   Ключ, который призрак носит с v6, открывает ЭТО окно.
   Он мог уйти в любой из 2900 дней. Не уходил: если окно
   откроется — очередь кончится, а ожидание — единственное,
   что у него есть. Сцену видят прошедшие колодец + терминал
   (флаги уже в общей памяти). Три концовки, все честные:
     1. попросить открыть → колокольчик, «обслужено: 1»,
        арка «забрать UM-13» замыкается (key-turned);
     2. оставить как есть → он отдаёт ключ ТЕБЕ (key-given);
     3. уйти со страницы молча → ничего не меняется, но
        игрок ЗНАЕТ — все реплики про очередь звучат иначе.
   ═══════════════════════════════════════════════════ */
let keySceneSeen = false;
let keySceneDone = false;
function keySceneAvailable() {
    const m = memRead();
    // дверь для прошедших: колодец + терминал (ключ
    // просыпается у «своих» — незнакомцу он не покажет)
    return !!(m['well-visited'] && m['terminal-visited']);
}
function offerKeyScene() {
    if (keySceneSeen || keySceneDone || !keySceneAvailable()) return;
    keySceneSeen = true;
    // человек узнал про ключ — общая память: призрак-спутник
    // с других страниц теперь может изредка напоминать об окне
    // №13, пока финал не выбран (см. keyKnownLines в um13-ghost.js)
    memWrite({ 'key-known': Date.now() });
    const btn = document.createElement('button');
    btn.className = 'btn key-btn';
    btn.textContent = 'спросить о ключе';
    refreshBtn.parentNode.insertBefore(btn, refreshBtn.nextSibling);
    btn.addEventListener('click', runKeyScene);
    // мягкая затравка: если кнопку не заметили — призрак сам
    setTimeout(function () {
        if (keySceneDone) return;
        say('UM-13: …ключ? этот, на цепочке? нет. просто привычка.');
    }, 9000);
}
function runKeyScene() {
    if (keySceneDone) return;
    keySceneDone = true;
    const g = window.UM13Ghost;
    // УБИРАЕМ кнопку — дальше только разговор
    document.querySelectorAll('.key-btn').forEach(function (b) {
        b.remove();
    });
    const steps = [
        // 1. Сначала не понимает вопроса — потом осознаёт
        ['…ключ. у окна спрашивают про ключ. смешно.', 4200],
        ['…', 1600],
        ['я мог открыть его в любой из двух тысяч девятисот дней.', 4600],
        [
            'если окно откроется — меня обслужат. а что делают с теми, кого обслужили, я видел сверху.',
            6000,
        ],
        ['поэтому я просто стою. первым.', 4200],
        // 2. Пауза — решает, говорить ли правду
        ['…ладно. скажу. ключ — от этого окна. окно №13.', 5000],
        ['хочешь, я открою? меня спрашивают впервые. я не знаю, что правильно.', 5800],
    ];
    let t = 0;
    steps.forEach(function (s, i) {
        t += s[1];
        setTimeout(function () {
            say('UM-13: ' + s[0]);
            if (g && (i === 3 || i === 4)) g.mood('sad', true);
        }, t);
    });
    // 3. ВЫБОР без «правильного» ответа — две тихие кнопки
    setTimeout(showKeyChoice, t + 2000);
}
function showKeyChoice() {
    const g = window.UM13Ghost;
    const row = document.querySelector('.btn-row');
    function mkBtn(text, cls) {
        const b = document.createElement('button');
        b.className = cls;
        b.textContent = text;
        return b;
    }
    const askOpen = mkBtn('попросить открыть', 'btn btn-primary');
    const askStay = mkBtn('оставить как есть', 'btn');
    row.appendChild(askOpen);
    row.appendChild(askStay);
    askOpen.addEventListener('click', function () {
        askOpen.remove();
        askStay.remove();
        say('UM-13: …ты уверен? впрочем. если ты здесь — можно.');
        window.setTimeout(function () {
            const lg = document.querySelector('.um13g');
            if (lg) {
                // призрак подлетает к окну — к табло
                lg.style.transition = 'left 1.8s ease, top 1.8s ease, transform 1.8s ease';
                const board = document.querySelector('.board');
                const br = board
                    ? board.getBoundingClientRect()
                    : { right: window.innerWidth / 2, top: 100 };
                lg.style.left = br.right - 80 + 'px';
                lg.style.top = br.top + 130 + 'px';
            }
            say('UM-13: [достаёт ключ. медленно. восемь лет медленно]');
            setTimeout(keyFinaleTurn, 2400);
        }, 2200);
    });
    askStay.addEventListener('click', function () {
        askOpen.remove();
        askStay.remove();
        // КОНЦОВКА 2: отказ — и он отдаёт ключ ТЕБЕ
        say('UM-13: …правильно. окно закрыто. порядок. всё как было.');
        window.setTimeout(function () {
            say('UM-13: [снимает ключ с цепочки. протягивает]');
            if (g) {
                g.mood('sad', true);
                g.keyFinale('given');
            }
            memWrite({ 'key-given': Date.now() });
            setTimeout(function () {
                say(
                    'UM-13: держи. он открывает окна. я открывал одно восемь лет — не буду больше. открой что-нибудь своё.',
                );
                spawnOwnedKey();
            }, 3400);
        }, 3200);
    });
}
function keyFinaleTurn() {
    const g = window.UM13Ghost;
    // ЕДИНСТВЕННЫЙ ЗВУК ВСЕЛЕННОЙ: три ноты колокольчика.
    // WebAudio-синтез (без файлов), тихо (гейн 0.12),
    // один раз за всю историю браузера (флаг chime-said).
    playChimeOnce();
    memWrite({ 'key-turned': Date.now() });
    if (g) g.keyFinale('turned');
    // Табло: очередь кончилась. Обслужено: 1.
    setBoard('0', '1', '—');
    say('UM-13: [щёлк] …окно открыто. впервые. обслужено: один.');
    setTimeout(function () {
        say(
            'UM-13: справка моя уже есть — ты забрал её в прошлый раз. а теперь я не «следующий». я «обслуженный».',
        );
        if (g) g.confetti();
    }, 5600);
    // ЗВУК В АРТЕФАКТЕ: свежая справка (кнопка обновления
    // после финала работает) унесёт колокольчик с собой —
    // команда «сон_колокольчика» внутри flow.json
    setTimeout(function () {
        say(
            'UM-13: справка обновится — если снова обновишь очередь пять раз. и поищи в ней команду про колокольчик. звук можно унести.',
        );
    }, 12_000);
}
/** Три ноты — единственный звук вселенной UM-13. */
function playChimeOnce() {
    try {
        if (memRead()['chime-said']) return;
        memWrite({ 'chime-said': Date.now() });
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const gain = ctx.createGain();
        gain.gain.value = 0.12;
        gain.connect(ctx.destination);
        // колокольчик: затухающие синусоиды (E5, G5, B5)
        [659.25, 783.99, 987.77].forEach(function (freq, i) {
            const osc = ctx.createOscillator();
            const g2 = ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'sine';
            const t0 = ctx.currentTime + i * 0.45;
            g2.gain.setValueAtTime(0, t0);
            g2.gain.linearRampToValueAtTime(1, t0 + 0.02);
            g2.gain.exponentialRampToValueAtTime(0.001, t0 + 2.2);
            osc.connect(g2);
            g2.connect(gain);
            osc.start(t0);
            osc.stop(t0 + 2.3);
        });
    } catch (e) {
        /* звук не обязателен — тишина тоже честна */
    }
}
/** Ключ теперь у игрока: янтарная точка в углу приёмной. */
function spawnOwnedKey() {
    if (document.getElementById('owned-key')) return;
    const k = document.createElement('div');
    k.id = 'owned-key';
    k.title = 'ключ от окна №13. твой.';
    k.textContent = '⚿';
    document.body.appendChild(k);
}
// Дверь сцены: после 2-го обновления очереди или минуты
// присутствия — у кого есть право, тот её увидит
let refreshClicks = 0;
refreshBtn.addEventListener('click', function () {
    refreshClicks++;
    if (refreshClicks >= 2) offerKeyScene();
});
setTimeout(offerKeyScene, 60_000);

const NOPE_LINES = [
    'я предупреждал.',
    'ну вот. теперь ты знаешь.',
    'зачем ты продолжаешь?',
    'кнопка начала нервничать.',
    'она спрашивает, зачем ты это делаешь. я молчу.',
    'кнопка подала заявление на отпуск.',
    'между вами повисла неловкая пауза.',
    'кнопка позвонила кому-то из прошлого. никто не взял.',
    'она приняла это лично.',
    'кнопка больше не верит в пользователей.',
    'она пересматривает свою жизнь. в ней только этот клик.',
    'кнопка заплакала. у кнопок это коррозия.',
    'у кнопки остался один клик до конца.',
    'кнопка смирилась. ты можешь всё. она просто красная.',
    '…держи. ты заслужил.',
];

// Прыжок в случайную точку экрана (кнопка остаётся кликабельной)
function dodge() {
    const bw = nopeBtn.offsetWidth || 150;
    const bh = nopeBtn.offsetHeight || 44;
    const x = 14 + Math.random() * Math.max(40, window.innerWidth - bw - 28);
    const y = 14 + Math.random() * Math.max(40, window.innerHeight - bh - 28);
    nopeBtn.style.left = x + 'px';
    nopeBtn.style.top = y + 'px';
    nopeBtn.style.bottom = 'auto';
    nopeBtn.style.transform = 'none';
    nopeBtn.classList.add('flying');
    setTimeout(function () {
        nopeBtn.classList.remove('flying');
    }, 420);
}

// Первое наведение — единственный «упреждающий» прыжок
nopeBtn.addEventListener('mouseenter', function () {
    if (nopeHovered) return;
    nopeHovered = true;
    dodge();
    say('UM-13: она не хочет, чтобы её трогали. но ты можешь попробовать.');
});

nopeBtn.addEventListener('click', function () {
    nopeTries++;
    dodge(); // прыжок после клика — она всё ещё обидчивая
    say('UM-13: ' + NOPE_LINES[Math.min(nopeTries, NOPE_LINES.length) - 1]);
    if (window.UM13Ghost) {
        window.UM13Ghost.react(nopeTries >= 10 ? 'queue-nope-late' : 'queue-nope-early');
    }

    // Счётчик: только факты, без спойлеров — сколько нажали,
    // сколько визитов курьера уже было. Что придёт и когда — сюрприз
    if (counterEl) {
        const visits = Math.floor(nopeTries / 15);
        counterEl.innerHTML =
            'нажатий: <b>' +
            nopeTries +
            '</b>' +
            (visits > 0 ? ' · визитов курьера: <b>' + visits + '</b>' : '');
    }

    if (nopeTries === 3) nopeBtn.textContent = 'НЕ НАЖИМАТЬ (устала)';
    if (nopeTries === 7) nopeBtn.textContent = 'НЕ НАЖИМАТЬ (смысл потерян)';
    if (nopeTries === 12) nopeBtn.textContent = '…';
    if (nopeTries === 15) nopeBtn.textContent = 'ладно. ты победил кнопку.';

    // Пицца-курьер: каждые 15 нажатий — новый визит (реплики не повторяются)
    if (nopeTries % 15 === 0) {
        releaseCourier(Math.floor(nopeTries / 15));
    }
});

// ── ПИЦЦА-КУРЬЕР: пробегает через экран с заказом ──
// Это тот самый легендарный «пицца-бот_v1» из колодца (слой 1)
// и детектива «Квотный заговор». Визиты пишутся в общую память.
const SQ_VISITS = [
    { say: '…доставка для узла 13. он не выйдет? ладно, оставлю у окна.', nut: true },
    { say: 'я помню этот хвост… тьфу. эту очередь. с 2018-го.', nut: true },
    { say: 'тут никто не выходит. но чаевые всё равно оставьте.', nut: false },
    { say: 'между нами: рецепт я храню в КАЖДОМ ключе. страховка.', nut: true },
    { say: 'пятое появление — и я получаю значок «легенда localStorage».', nut: false },
    { say: 'ты нажимал больше, чем работает это окно. держи кусок.', nut: true },
];
function releaseCourier(visit) {
    if (document.querySelector('.courier')) return;
    // Пицца-курьер — часть вселенной: визиты запоминаются
    memAdd('pizza-courier', 1);
    if (window.UM13Ghost) window.UM13Ghost.react('queue-courier');
    const v = SQ_VISITS[Math.min(visit - 1, SQ_VISITS.length - 1)];
    const sq = document.createElement('div');
    sq.className = 'courier';
    sq.innerHTML =
        '<div class="sq-say">' +
        v.say +
        '</div>' +
        '<svg class="sq-body" width="150" height="140" viewBox="0 0 150 140" fill="none">' +
        // АНТЕННА-обслуживание (машет — классика курьерских ботов)
        '<g class="sq-antenna">' +
        '<line x1="75" y1="58" x2="75" y2="34" stroke="#2b2b33" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="75" cy="30" r="4.5" fill="#a3241f"/>' +
        '</g>' +
        // ТЕЛО-коробка: корпус бота — картонная коробка пиццы
        '<rect x="38" y="58" width="76" height="54" rx="8" fill="#c9722f"/>' +
        '<rect x="38" y="58" width="76" height="14" rx="7" fill="#a3581f"/>' +
        // ЛИЦО на коробке: глаза-курсоры и улыбка
        '<circle cx="60" cy="76" r="6.5" fill="#fff"/>' +
        '<circle cx="92" cy="76" r="6.5" fill="#fff"/>' +
        '<circle cx="61" cy="76" r="3" fill="#2b2b33"/>' +
        '<circle cx="93" cy="76" r="3" fill="#2b2b33"/>' +
        '<path d="M64 90 q12 8 24 0" stroke="#2b2b33" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        // ПИЦЦА в руке: коробка с надписью — главный атрибут
        (v.nut
            ? '<rect x="104" y="88" width="34" height="24" rx="3" fill="#e8e3d5" stroke="#a3581f" stroke-width="2"/>' +
              '<circle cx="121" cy="100" r="8" fill="#d98a45"/>' +
              '<circle cx="118" cy="97" r="1.6" fill="#a3241f"/>' +
              '<circle cx="124" cy="102" r="1.6" fill="#a3241f"/>' +
              '<circle cx="121" cy="103" r="1.4" fill="#a3241f"/>'
            : '') +
        // РУКА держит коробку
        '<rect x="96" y="94" width="14" height="8" rx="4" fill="#a3581f"/>' +
        // НОЖКИ-колёсики
        '<circle cx="56" cy="116" r="8" fill="#2b2b33"/>' +
        '<circle cx="96" cy="116" r="8" fill="#2b2b33"/>' +
        '<circle cx="56" cy="116" r="3" fill="#e8e3d5"/>' +
        '<circle cx="96" cy="116" r="3" fill="#e8e3d5"/>' +
        '</svg>';
    document.body.appendChild(sq);
    setTimeout(function () {
        sq.classList.add('in');
    }, 30);
    setTimeout(function () {
        sq.classList.remove('in');
        sq.classList.add('out');
        setTimeout(function () {
            sq.remove();
        }, 1300);
        say(
            'UM-13: пицца-бот передаёт привет' +
                (visit > 1 ? ' (визит ' + visit + ')' : '') +
                '. и просил больше не заказывать на работу.',
        );
    }, 4200);
}
