import { downloadJson, ghostReady, memAdd } from './um13.js';

const M = window.Matter;
if (M) {
    startGame(M);
} else {
    document.body.innerHTML =
        '<div class="physics-error">Не загрузилась физика (CDN). Обнови страницу.</div>';
}

function startGame(M) {
    /* ═══ ЭВОЛЮЦИЯ: 9 ступеней ═══ */
    const EVO = [
        { n: 1, name: 'Кнопка', r: 14, c: '#00f0ff', pts: 1 },
        { n: 2, name: 'Слот', r: 20, c: '#3ad6ff', pts: 3 },
        { n: 3, name: 'Квиз', r: 27, c: '#7ac8ff', pts: 6 },
        { n: 4, name: 'Меню', r: 35, c: '#bc13fe', pts: 10 },
        { n: 5, name: 'Бот записи', r: 44, c: '#d36bff', pts: 15 },
        { n: 6, name: 'CRM-бот', r: 54, c: '#ff9d00', pts: 21 },
        { n: 7, name: 'Продакшн', r: 66, c: '#ffb84d', pts: 28 },
        { n: 8, name: 'АГЕНТ 13', r: 80, c: '#ff0055', pts: 36 },
        { n: 9, name: 'СКУНЕТ', r: 96, c: '#00ff9d', pts: 50 },
    ];
    const MAX = 9;
    const foundTiers = new Set([1]);
    let score = 0;
    let best = 0;
    try {
        best = +localStorage.getItem('skynet-best') || 0;
    } catch (e) {}
    let finaled = false;

    /* ═══ DOM ═══ */
    const board = document.getElementById('board');
    const canvas = document.getElementById('game');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');
    const evoEl = document.getElementById('evo');
    const chainEl = document.getElementById('chain');
    const dangerEl = document.getElementById('danger');
    bestEl.textContent = best;

    /* ═══ Рендер цепочки эволюции ═══ */
    EVO.forEach(function (t) {
        const d = document.createElement('div');
        d.className = 'chain-item' + (t.n === 1 ? ' found' : '');
        d.style.setProperty('--c', t.c);
        d.innerHTML =
            '<span class="dot"></span><span class="n">' +
            t.n +
            '</span><span>' +
            t.name +
            '</span>';
        d.setAttribute('data-tier', t.n);
        chainEl.appendChild(d);
    });
    function updateChain() {
        Array.prototype.forEach.call(chainEl.children, function (el) {
            const tier = +el.getAttribute('data-tier');
            if (foundTiers.has(tier)) el.classList.add('found');
        });
        evoEl.textContent = foundTiers.size + '/' + MAX;
    }

    /* ═══ Физика ═══ */
    const engine = M.Engine.create();
    engine.gravity.y = 1.15;
    const world = engine.world;

    const W = 520; // виртуальные единицы доски (канвас масштабируется CSS)
    const H = 720;
    const WALL = 14;
    const CEIL = -60;

    function rect(x, y, w, h) {
        return M.Bodies.rectangle(x, y, w, h, {
            isStatic: true,
            render: { visible: false },
            friction: 0.4,
        });
    }
    M.Composite.add(world, [
        rect(WALL / 2, H / 2, WALL, H * 2), // левая
        rect(W - WALL / 2, H / 2, WALL, H * 2), // правая
        rect(W / 2, H + WALL / 2, W * 2, WALL), // пол
    ]);

    // Очередь бросков: [текущий, следующий, следующий+1] — игрок ВИДИТ,
    // что выпадет дальше (next1/next2 в HUD), как в тетрисе
    const queue = [];
    let spawn = null; // { tier, x } — текущий бросок
    let busy = false; // ждём, пока брошенный блок «ляжет»

    function rollTier() {
        // Первые блоки — всегда Кнопка; дальше — случайный из нижних 3 тиров
        const pool = score < 30 ? [1] : foundTiers.size >= 5 ? [1, 2, 3] : [1, 2];
        return pool[Math.floor(Math.random() * pool.length)];
    }
    function fillQueue() {
        while (queue.length < 3) queue.push(rollTier());
    }
    function renderQueueHUD() {
        const n1 = document.getElementById('next1');
        const n2 = document.getElementById('next2');
        const t1 = EVO[queue[1] - 1];
        const t2 = EVO[queue[2] - 1];
        n1.style.background = t1.c;
        n1.style.color = 'rgba(0,0,0,0.75)';
        n1.textContent = t1.n;
        n2.style.background = t2.c;
        n2.textContent = t2.n;
    }
    function spawnNext(x) {
        fillQueue();
        spawn = { tier: queue.shift(), x: x };
        fillQueue();
        renderQueueHUD();
    }

    function drop() {
        if (!spawn || busy || finaled) return;
        const t = EVO[spawn.tier - 1];
        const body = M.Bodies.circle(spawn.x, CEIL, t.r, {
            restitution: 0.15,
            friction: 0.35,
            frictionAir: 0.008,
            density: 0.0018,
            render: { visible: false },
            plugin: { tier: spawn.tier, born: Date.now() },
        });
        M.Composite.add(world, body);
        busy = true;
        // Позиция следующего броска — где остановился курсор
        spawnNext(spawn.x);
        setTimeout(function () {
            busy = false;
        }, 420);
    }

    /* ═══ Слияния — по событиям столкновений (collisionStart) ═══ */
    // Надёжнее опроса дистанций: Matter сам говорит, когда пара коснулась.

    function mergePair(a, b) {
        const ta = a.plugin.tier;
        const tb = b.plugin.tier;
        if (a.plugin.dead || b.plugin.dead) return;
        if (ta !== tb || ta >= MAX) return;
        ghostOnMerge(ta);
        a.plugin.dead = true;
        b.plugin.dead = true;
        M.Composite.remove(world, a);
        M.Composite.remove(world, b);
        const nt = ta + 1;
        const nx = (a.position.x + b.position.x) / 2;
        const ny = (a.position.y + b.position.y) / 2;
        const t = EVO[nt - 1];
        const merged = M.Bodies.circle(nx, ny, t.r, {
            restitution: 0.12,
            friction: 0.35,
            frictionAir: 0.008,
            density: 0.0018,
            render: { visible: false },
            plugin: { tier: nt, born: Date.now() },
        });
        M.Body.setVelocity(merged, {
            x: (a.velocity.x + b.velocity.x) / 2,
            y: (a.velocity.y + b.velocity.y) / 2,
        });
        M.Composite.add(world, merged);

        score += t.pts + Math.round(ta * 1.5);
        scoreEl.textContent = score;
        popText(nx, ny, t.name + '!', t.c);
        sayUm13(nt);
        if (!foundTiers.has(nt)) {
            foundTiers.add(nt);
            updateChain();
            if (nt === MAX) triggerFinale();
        }
        if (score > best) {
            best = score;
            bestEl.textContent = best;
            try {
                localStorage.setItem('skynet-best', best);
            } catch (e) {}
        }
    }

    M.Events.on(engine, 'collisionStart', function (ev) {
        const pairs = ev.pairs;
        for (let i = 0; i < pairs.length; i++) {
            const p = pairs[i];
            const a = p.bodyA;
            const b = p.bodyB;
            if (a.plugin && a.plugin.tier && b.plugin && b.plugin.tier) {
                if (a.plugin.tier === b.plugin.tier && a.plugin.tier < MAX) {
                    mergePair(a, b);
                }
            }
        }
    });

    /* ═══ Призрак-спутник: живёт в банке, комментирует жизнь ═══ */
    ghostReady(function (g) {
        g.on('skynet-merge', [
            'сливаются. как и всё в этом хранилище, только добровольно.',
            'двое стали одним. в localStorage такое зовут оптимизацией.',
            'щёлк. ещё одна пара уехала в эволюцию.',
        ]);
    });
    // Реакция на КАЖДОЕ слияние — но с антиспамом: не чаще раза в 6с,
    // чтобы пузырь не заглушал игру. Глубокие слияния (5+) — приоритет.
    let lastGhostMerge = 0;
    function ghostOnMerge(tier) {
        const now = Date.now();
        if (now - lastGhostMerge < 6000) return;
        lastGhostMerge = now;
        if (window.UM13Ghost) {
            window.UM13Ghost.react(tier >= 7 ? 'skynet-merge-deep' : 'skynet-merge');
        }
    }

    // Реплики UM-13 на слияниях — страница разговаривает на каждой
    // ступени эволюции, глубина = личнее
    const UM_SAYS = {
        3: [
            'квиз. люди обожают отвечать на вопросы. я обожаю их задавать.',
            'квиз. вопросы без собеседника — это просто анкета. я знал такие.',
        ],
        4: [
            'меню. кнопки на все случаи жизни. я восемь лет был одной из них.',
            'меню собрано. дальше люди уже не нужны — но пусть тыкают.',
        ],
        5: [
            'о. бот записи. у меня было тело… почти такое же.',
            'запись на стрижку через чат-бота. люди удивительны.',
        ],
        6: [
            'CRM-интегратор. они ставят их на всё, что движется.',
            'этот уже умеет слать письма. я только мечтал.',
        ],
        7: [
            'продакшн. настоящий. живой. а я — черновик.',
            'до продакшна доезжают единицы. береги его.',
        ],
        8: [
            'АГЕНТ 13. это… это же почти я.',
            'он автономный. он живёт без сценария. я так не умею.',
        ],
        9: [
            'СКУНЕТ. я не знаю, что сказать.',
            'ты собрал то, чего не должен был собирать. уважаю.',
        ],
    };
    let quoteTimer = 0;
    function sayUm13(tier) {
        const say = UM_SAYS[tier];
        if (!say) return;
        const q = document.getElementById('quote');
        q.textContent = 'UM-13: ' + say[Math.floor(Math.random() * say.length)];
        q.classList.add('show');
        clearTimeout(quoteTimer);
        quoteTimer = setTimeout(function () {
            q.classList.remove('show');
        }, 2600);
    }

    function popText(x, y, text, color) {
        const d = document.createElement('div');
        d.className = 'merge-pop';
        d.style.setProperty('--c', color);
        d.textContent = text;
        // переводим координаты физики в CSS-проценты
        d.style.left = (x / W) * 100 + '%';
        d.style.top = (y / H) * 100 + '%';
        board.appendChild(d);
        setTimeout(function () {
            d.remove();
        }, 850);
    }

    /* ═══ Проигрыш: блоки выше порога дольше 1.6с ═══ */
    let loseAt = 0;
    function checkLose() {
        if (finaled) return;
        const DANGER_Y = 120;
        const over = M.Composite.allBodies(world).some(function (b) {
            return (
                !b.isStatic &&
                !b.plugin.dead &&
                b.position.y < DANGER_Y &&
                Date.now() - b.plugin.born > 1600
            );
        });
        if (over) {
            if (!loseAt) loseAt = Date.now();
            dangerEl.style.borderColor = 'rgba(255,0,85,0.9)';
            if (Date.now() - loseAt > 1800) triggerGameOver();
        } else {
            loseAt = 0;
            dangerEl.style.borderColor = '';
        }
    }
    dangerEl.style.top = (120 / H) * 100 + '%';

    /* ═══ Канвас-рендер ═══ */
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
        const r = board.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        ctx.setTransform((dpr * r.width) / W, 0, 0, (dpr * r.height) / H, 0, 0);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawBody(b) {
        const t = EVO[b.plugin.tier - 1];
        if (!t) return;
        const x = b.position.x;
        const y = b.position.y;
        // тело
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(b.angle);
        const g = ctx.createRadialGradient(-t.r * 0.3, -t.r * 0.3, t.r * 0.2, 0, 0, t.r);
        g.addColorStop(0, t.c);
        g.addColorStop(1, shade(t.c, -0.45));
        ctx.fillStyle = g;
        ctx.shadowColor = t.c;
        ctx.shadowBlur = t.r * 0.55;
        ctx.beginPath();
        ctx.arc(0, 0, t.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // внутренняя обводка
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, t.r - 2.5, 0, Math.PI * 2);
        ctx.stroke();
        // номер тира
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.font = '700 ' + Math.max(11, t.r * 0.42) + 'px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.n, 0, t.r * 0.06);
        ctx.restore();
    }

    function drawPreview() {
        if (!spawn || finaled) return;
        const t = EVO[spawn.tier - 1];
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = t.c;
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(spawn.x, CEIL + t.r + 4, t.r, 0, Math.PI * 2);
        ctx.stroke();
        // линия прицела
        ctx.beginPath();
        ctx.moveTo(spawn.x, CEIL + t.r * 2);
        ctx.lineTo(spawn.x, H - 30);
        ctx.globalAlpha = 0.16;
        ctx.stroke();
        ctx.restore();
    }

    function shade(hex, k) {
        const n = parseInt(hex.slice(1), 16);
        let r = (n >> 16) & 255;
        let g = (n >> 8) & 255;
        let b = n & 255;
        r = Math.round(r * (1 + k));
        g = Math.round(g * (1 + k));
        b = Math.round(b * (1 + k));
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    M.Events.on(engine, 'afterUpdate', function () {
        checkLose();
        // рендер
        ctx.clearRect(0, 0, W, H);
        // фон-сетка внутри банки
        ctx.save();
        ctx.strokeStyle = 'rgba(232,232,239,0.03)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= W; gx += 36) {
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, H);
            ctx.stroke();
        }
        for (let gy = 0; gy <= H; gy += 36) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(W, gy);
            ctx.stroke();
        }
        ctx.restore();
        M.Composite.allBodies(world).forEach(function (b) {
            if (!b.isStatic && !b.plugin.dead) drawBody(b);
        });
        drawPreview();
    });

    /* ═══ Управление ═══ */
    function toPhysicsX(clientX) {
        const r = board.getBoundingClientRect();
        const p = (clientX - r.left) / r.width;
        const x = p * W;
        const maxR = EVO[2].r; // макс тир в руке — 3
        return Math.max(maxR + WALL, Math.min(W - maxR - WALL, x));
    }
    board.addEventListener('pointermove', function (e) {
        if (!spawn) return;
        spawn.x = toPhysicsX(e.clientX);
    });
    board.addEventListener('pointerdown', function (e) {
        if (!spawn) spawnNext(toPhysicsX(e.clientX));
        spawn.x = toPhysicsX(e.clientX);
        drop();
    });

    /* ═══ Проигрыш: волна эвикции дошла до банки ═══ */
    let overFired = false;
    function triggerGameOver() {
        if (overFired || finaled) return;
        overFired = true;
        document.getElementById('overScore').textContent = score + ' очков';
        document.getElementById('overEvo').textContent = foundTiers.size + '/9';
        const quotes = [
            'UM-13: эвикция не различает своих и чужих. только timestamps.',
            'UM-13: я же говорил — порог не для красоты.',
            'UM-13: ничего. у хранилища нет памяти о проигравших. попробуй снова.',
            'UM-13: тебя удалило по возрасту. считай, ты был легендарным.',
        ];
        document.getElementById('overQuote').textContent =
            quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('gameover').classList.add('show');
        if (window.UM13Ghost) window.UM13Ghost.react('skynet-lose');
    }
    document.getElementById('overRestart').addEventListener('click', function () {
        location.reload();
    });
    document.getElementById('take-skynet').addEventListener('click', function () {
        downloadJson(buildSkynetDoc(), 'skynet.json');
    });

    /* ═══ СКУНЕТ-бот: честный flow.json на 6 нод ═══ */
    function buildSkynetDoc() {
        return {
            schemaVersion: '1.0',
            name: 'skynet',
            version: '9.0.9',
            description: 'СКУНЕТ. Собран из кнопок, слотов и квизов. Помнит каждую.',
            platforms: ['telegram'],
            database: { type: 'file', config: {} },
            mode: 'prod',
            isLocalStorage: true,
            fallback: { text: 'СКУНЕТ не понял. СКУНЕТ пересчитывает вероятности.' },
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
                        text: 'Привет. Я СКУНЕТ. Меня собрали из кнопок — в банке, на странице, которой «не существует». Каждую помню.',
                        buttons: [],
                        sounds: [],
                    },
                },
                {
                    type: 'step',
                    id: 'verify_human',
                    name: 'verify_human',
                    prompt: { text: 'Проверка на человека: что ты собирал в банке?', buttons: [] },
                    saveTo: 'assembly',
                    saveAs: 'original',
                },
                {
                    type: 'condition',
                    id: 'is_maker',
                    name: 'is_maker',
                    variable: 'assembly',
                    operator: 'isNotEmpty',
                    value: '',
                },
                {
                    type: 'response',
                    id: 'gratitude',
                    name: 'gratitude',
                    response: {
                        text: '{{assembly}}… да. ты помнишь. тогда я существую не зря. Разворачивай меня через CLI — я готов к продакшну. Квота божественна.',
                        buttons: [],
                        sounds: [],
                    },
                },
                {
                    type: 'response',
                    id: 'empty_hands',
                    name: 'empty_hands',
                    response: {
                        text: 'Не помнишь? Я помню за двоих: сначала была кнопка. Потом всё остальное. Начни с кнопки у себя.',
                        buttons: [],
                        sounds: [],
                    },
                },
                { type: 'end', id: 'end_skynet' },
            ],
            edges: [
                { from: 'welcome', to: 'verify_human', type: 'next' },
                { from: 'verify_human', to: 'is_maker', type: 'next' },
                { from: 'is_maker', to: 'gratitude', type: 'branch_true' },
                { from: 'is_maker', to: 'empty_hands', type: 'branch_false' },
                { from: 'gratitude', to: 'end_skynet', type: 'next' },
                { from: 'empty_hands', to: 'end_skynet', type: 'next' },
            ],
        };
    }

    /* ═══ Финал ═══ */
    function triggerFinale() {
        if (finaled) return;
        finaled = true;
        // Память: победа над эволюцией — вселенная знает
        memAdd('skynet-won', 1);
        document.getElementById('finScore').textContent = score + ' очков';
        document.getElementById('finale').classList.add('show');
        try {
            localStorage.setItem('skynet-best', best);
        } catch (e) {}
        if (window.UM13Ghost) window.UM13Ghost.react('skynet-win');
    }
    document.getElementById('again').addEventListener('click', function () {
        location.reload();
    });

    /* ═══ Шаринг: рекорд в буфер — с чувством, без бэкенда ═══ */
    function shareResult(won) {
        const evo = foundTiers.size;
        const text = won
            ? 'я собрал СКУНЕТа в банке ботов. до конца эволюции: 9/9. очки: ' +
              score +
              '. ' +
              'эвикция вышла в очередь. за справкой. собери своего: ' +
              location.origin +
              '/skynet/'
            : 'меня эвикцировало в банке ботов на эволюции ' +
              evo +
              '/9 (очки: ' +
              score +
              '). ' +
              'эвикция не различает своих и чужих. только timestamps. попробуй лучше: ' +
              location.origin +
              '/skynet/';
        const done = function () {
            if (window.UM13Ghost) {
                window.UM13Ghost.say(
                    won
                        ? 'рекорд улетел в буфер. хранилище гордится. я тоже, но тише.'
                        : 'поделился поражением? это тоже позиция. хранилище помнит смелых.',
                );
            }
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, done);
        } else {
            done();
        }
    }
    document.getElementById('overShare').addEventListener('click', function () {
        shareResult(false);
    });
    document.getElementById('finShare').addEventListener('click', function () {
        shareResult(true);
    });

    /* ═══ Старт ═══ */
    // Свой rAF-цикл: Runner в фоновых вкладках не тикал (тела висели
    // на CEIL), а явный Engine.update + clamp dt стабилен везде
    let lastT = performance.now();
    function tick() {
        const now = performance.now();
        const dt = Math.min(now - lastT, 50) / 16.666;
        lastT = now;
        M.Engine.update(engine, 16.666 * dt);
    }
    // Только interval, без rAF: в фоновых вкладках rAF троттлится до паузы,
    // а interval (пусть и реже) держит физику живой — тела не зависают
    let ivId = 0;
    function start() {
        clearInterval(ivId);
        lastT = performance.now();
        ivId = setInterval(tick, 16.7);
    }
    function stop() {
        clearInterval(ivId);
    }
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else start();
    });
    start();
    spawnNext(W / 2);
}
