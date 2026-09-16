import { memWrite } from './um13.js';

// Кнопки песочницы описаны data-атрибутами (без inline onclick):
//   data-call="имя" [data-arg] — действие из ACTIONS ниже;
//   data-ghost="метод" [data-arg] — прямой вызов публичного API призрака;
//   data-log="id лога" data-msg — только подсказка в лог секции.
const ACTIONS = {
    face: function (m) {
        window.UM13Ghost.mood(m, true);
        log('log-visual', 'лицо: ' + m + ' (sticky — само не погаснет, кликните normal)');
    },
    simGap: function (hours) {
        // сбрасываем и кулдаун gap-реплики — имитация честная
        memWrite({ 'last-seen': Date.now() - Number(hours) * 3600 * 1000, 'gap-said': null });
        log('log-gap', 'last-seen сдвинут на ' + hours + 'ч назад. перезагружаю…');
        reloadSoon();
    },
    clearMem: function () {
        localStorage.removeItem('um13-memory');
        log('log-gap', 'память очищена. перезагружаю — призрак встретит вас как в первый раз…');
        reloadSoon();
    },
    doExport: function () {
        window.UM13Ghost.react('flow-export');
        log('log-export', "react('flow-export') отправлен — смотрите на призрака");
    },
    callUm13: function () {
        if (typeof window.um13 === 'function') {
            log('log-console', 'um13() → ' + window.um13());
        } else {
            log('log-console', 'um13() недоступен — призрак не загрузился?');
        }
    },
    pokeIt: function () {
        window.UM13Ghost.poke();
        log('log-life', 'poke — смотрите дугу реакций');
    },
    act: function (kind) {
        window.UM13Ghost.act(kind);
        log('log-life', 'акт: ' + kind + ' (подпись через 1.4с)');
    },
    catchNode: function () {
        window.UM13Ghost.catchNode('#bc13fe');
        log('log-life', 'нода удалена (маджента) — призрак ловит кубик в подол: «…этот я подержу»');
    },
    sleepTest: function () {
        window.UM13Ghost.sleep();
        log(
            'log-life',
            'он спит. теперь МЕДЛЕННО ведите курсор рядом — дрейфует к теплу и бормочет; РЫВОК — проснётся испуганно',
        );
    },
    /* ── симуляция состояний вселенной ── */
    setTrust: function () {
        memWrite({
            'terminal-visited': Date.now(),
            'well-visited': Date.now(),
            confession: Date.now(),
            visits: 12,
        });
        log(
            'log-gaze',
            'доверие: «свой» (локации + визиты записаны). обновитесь — hello подарит um13() или посчитает ключи',
        );
    },
    resetTrust: function () {
        memWrite({
            'terminal-visited': null,
            'well-visited': null,
            confession: null,
            visits: 0,
            'well-rescued': null,
        });
        log('log-gaze', 'доверие: 0 (незнакомец). перезагрузите и потащите его — выскальзывает');
    },
    testSleep: function () {
        const g = window.UM13Ghost;
        if (!g.visible) g.show();
        g.sleep();
        log(
            'log-gaze',
            'уснул: сны через 25–50с (с вашими флагами), фавикон-сон, при уходе со вкладки — титул «(тут кто-то спит)»',
        );
    },
    showState: function () {
        const s = window.UM13Ghost.state;
        log('log-gaze', 'trust=' + s.trust + ' · pressure=' + s.pressure + ' · key=' + s.keyState);
    },
    fakeReview: function () {
        const cx = Math.round(window.innerWidth * 0.5);
        const cy = Math.round(window.innerHeight * 0.4);
        window.UM13Ghost.on('flow-review', {
            mood: 'sad',
            lines: ['у этой ноды нет выхода. я знаю, каково это.'],
        });
        window.UM13Ghost.react('flow-review');
        window.dispatchEvent(new CustomEvent('um13:review', { detail: { x: cx, y: cy } }));
        log('log-editor', 'um13:review (' + cx + ',' + cy + ') — призрак летит к точке');
    },
    fakeLight: function () {
        document.documentElement.setAttribute('data-theme', 'light');
        window.UM13Ghost.on('theme-light', {
            mood: 'smart',
            lines: ['светло. я почти невидимый. как всегда.'],
        });
        window.UM13Ghost.react('theme-light');
        log('log-editor', 'data-theme=light — янтарные очки на призраке (группа um13g-shades)');
    },
    fakeDark: function () {
        document.documentElement.removeAttribute('data-theme');
        log('log-editor', 'тёмная тема — очки сняты');
    },
    fakeQuota: function () {
        // имитация: 6МБ данных → ratio >1 → уровень 2
        try {
            localStorage.setItem('um13-pressure-sim', 'x'.repeat(6 * 1024 * 1024));
        } catch (e) {
            /* квота и так полна — уже уровень 2 */
        }
        log(
            'log-editor',
            'квота наполнена — через 30с поллинг покажет уровень 2: юбка чаще, мерцание, «тесно тут»',
        );
    },
    setKey: function (flag) {
        if (flag === 'key-turned') memWrite({ 'key-turned': Date.now() });
        else if (flag === 'key-given') memWrite({ 'key-given': Date.now() });
        else memWrite({ 'key-turned': null, 'key-given': null });
        // призыв applyKeyFlags — через перезагрузку призрак применит сам;
        // быстрый путь — дёрнуть keyFinale (он же дёргает applyKeyFlags)
        if (flag) window.UM13Ghost.keyFinale(flag === 'key-turned' ? 'turned' : 'given');
        else window.location.reload();
        log(
            'log-key',
            flag
                ? 'флаг ' + flag + ' записан — ключ исчез с цепочки'
                : 'флаги сброшены, перезагрузка…',
        );
    },
    /* ── новое v1.0: симуляции свежих механик ── */
    adoptPet: function () {
        memWrite({ 'cube-adopted': Date.now(), 'cube-color': '#ff9d00' });
        const rootEl = document.getElementById('um13-ghost-root');
        if (rootEl) rootEl.classList.add('pet-cube');
        log('log-new', 'cube-adopted — кубик-потеряшка теперь на цепочке (слева от ключа)');
    },
    clearPet: function () {
        memWrite({ 'cube-adopted': null, 'cube-color': null });
        location.reload();
    },
    missedLook: function () {
        memWrite({ 'last-seen': Date.now() - 10 * 24 * 3600 * 1000 });
        log('log-new', 'last-seen = 10 дней назад. перезагружаю — призрак придёт тусклым…');
        reloadSoon();
    },
};

function reloadSoon() {
    setTimeout(function () {
        location.reload();
    }, 900);
}

function log(id, msg) {
    const el = document.getElementById(id);
    el.innerHTML = '<em>' + new Date().toLocaleTimeString() + '</em> ' + msg;
}

document.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const { call, ghost, arg, log: logId, msg } = btn.dataset;
    if (call) ACTIONS[call](arg);
    else if (ghost) {
        if (arg === undefined) window.UM13Ghost[ghost]();
        else window.UM13Ghost[ghost](arg);
    } else if (logId) log(logId, msg);
});
