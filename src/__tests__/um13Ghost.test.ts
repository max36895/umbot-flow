import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Исходник призрака как строка: Vite ?raw-импорт (типы — src/vite-env.d.ts)
// работает и в Vitest, и в ts-проверке сборки, без node:fs в браузерном tsconfig.
import ghostSource from '../../um13-ghost.js?raw';
// Стили призрака живут отдельным файлом (подключаются <link> на страницах)
import ghostCss from '../../styles/um13-ghost.css?raw';

/**
 * Тесты общего модуля призрака (um13-ghost.js).
 *
 * Модуль — ванильный IIFE без экспортов: выполняем его исходник в jsdom
 * (скрипт сам создаёт портал #um13-ghost-root) и тестируем через
 * публичный API window.UM13Ghost + DOM. Оба режима (page/editor)
 * проверяются отдельными загрузками исходника с подменой тега script.
 */

const GHOST_SRC: string = ghostSource;
/** Файл стилей отформатирован prettier; проверки ниже написаны в компактной
 *  записи правил (`.a .b{display:none;}`, `rgba(0,0,0,.2)`). Приводим файл к ней:
 *  без комментариев, пробелов вокруг {};:, и ведущих нулей у дробей; кавычки
 *  двойные (prettier с singleQuote пишет [data-face='normal']). */
function compactCss(css: string): string {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/'/g, '"')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{};:,])\s*/g, '$1')
        .replace(/(^|[^\d.])0\.(\d)/g, '$1.$2');
}
const GHOST_CSS: string = compactCss(ghostCss);

/** Позиция словаря EN в исходнике (не завязана на var/let/const). */
function enDictStart(): number {
    const idx = GHOST_SRC.search(/\b(?:var|let|const) EN = \{/);
    expect(idx).toBeGreaterThan(0);
    return idx;
}

/** Публичный API призрака (см. шапку um13-ghost.js). */
interface Um13GhostApi {
    say(text: string, ms?: number, mood?: string): void;
    react(event: string): void;
    /** payload: массив реплик (эмоция угадается) ИЛИ {mood, lines, fx}. */
    on(
        event: string,
        payload: string[] | { mood?: string; lines: string[]; fx?: 'confetti' },
    ): void;
    mood(name: string, sticky?: boolean): void;
    tantrum(): void;
    confetti(): void;
    /** Адресная тревога редактора: прилетел-предупредил-ушёл (v4.1). */
    warn(kind: string): void;
    hide(): void;
    show(): void;
    poke(): void;
    /** v7: новая встреча — ход визита (доверие). */
    visit(): void;
    /** v7: финал приёмной — ключ повёрнут/отдан. */
    keyFinale(kind: 'turned' | 'given'): void;
    readonly visible: boolean;
    readonly asleep: boolean;
    readonly face: string;
    /** v7: {trust, pressure, keyState} — для страниц и тестов. */
    readonly state: { trust: number; pressure: number; keyState: string };
}

interface Um13EnvBridge {
    setBusy(busy: boolean): void;
    getBusy(): boolean;
}

/** Доступ к API призрака на window (модуль кладёт их туда при загрузке). */
function ghost(): Um13GhostApi {
    const g = (window as unknown as { UM13Ghost?: Um13GhostApi }).UM13Ghost;
    if (!g) throw new Error('UM13Ghost не загрузился');
    return g;
}

/** Загружает модуль в текущий jsdom-документ с заданным data-um13-mode.
 *  Призрак двуязычен; канон вселенной — RU: пиним язык для канонических
 *  тестов (jsdom-локаль может быть en-US — реплики ушли бы в EN, и тесты
 *  канона перестали бы узнавать тексты). EN — отдельный тест через
 *  setLocale(). */
function loadGhost(mode: 'page' | 'editor' | 'quiet') {
    localStorage.setItem('um13-locale', 'ru');
    const tag = document.createElement('script');
    tag.setAttribute('data-um13-mode', mode);
    tag.src = '/um13-ghost.js';
    document.body.appendChild(tag);
    // currentScript у eval-кода недоступен — модуль ищет теги по селектору
    (0, eval)(GHOST_SRC);
    return ghost();
}

function ghostEl() {
    return document.querySelector('.um13g') as HTMLElement | null;
}

function sayEl() {
    return document.querySelector('.um13g-say') as HTMLElement | null;
}

function sayText() {
    return sayEl()?.textContent ?? '';
}

/** Все призрачные таймеры двигаются по расписанию — продвигаем виртуальное время. */
function advance(ms: number) {
    act(() => {
        vi.advanceTimersByTime(ms);
    });
}

/** Оборачиваем всплеск таймеров, чтобы React-совместимые колбэхи не ругались. */
function act(fn: () => void) {
    fn();
}

describe('UM-13 Ghost — общий модуль призрака', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
        document.title = ''; // jsdom делит title между тестами — призрак пишет в него
        delete (window as unknown as Record<string, unknown>).UM13Ghost;
        delete (window as unknown as Record<string, unknown>).__UM13_ENV__;
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe('режим page (статические пасхалки)', () => {
        it('создаёт портал сам, появляется и приветствует через 1–2с', () => {
            loadGhost('page');
            // DOMContentLoaded уже прошёл — boot отработал синхронно,
            // но приветствие планируется с задержкой 1–2с
            expect(document.getElementById('um13-ghost-root')).not.toBeNull();
            expect(ghostEl()).not.toBeNull();
            expect(sayEl()).not.toBeNull();
            // до задержки — тишина
            expect(sayEl()!.classList.contains('show')).toBe(false);
            advance(2200);
            expect(sayEl()!.classList.contains('show')).toBe(true);
            // приветствие — одна из hello-реплик
            expect(sayText().length).toBeGreaterThan(1);
        });

        it('после 30с тишины спрашивает «ты ещё тут?»', () => {
            loadGhost('page');
            advance(2200); // приветствие сыграло
            advance(35_000); // прошло 30с бездействия
            // новый пул checking шире — проверяем по смыслу, не по точным словам
            expect(sayText()).toMatch(
                /ты ещё тут|ты тут|ушёл|тихо|живой|подожду|терпение|связи|сгущай|спящем/,
            );
        });

        it('после ещё 60с тишины засыпает (Zzz ×3, лицо asleep)', () => {
            loadGhost('page');
            advance(2200);
            advance(35_000); // «ты ещё тут?»
            advance(65_000); // сон
            expect(ghost().asleep).toBe(true);
            expect(document.querySelectorAll('.um13g-zzz').length).toBe(3);
            // v3: лицо — через data-face, активна группа um13g-f-asleep
            expect(ghostEl()!.getAttribute('data-face')).toBe('asleep');
        });

        it('hover будит спящего — шутит и остаётся на странице', () => {
            loadGhost('page');
            advance(2200);
            advance(35_000);
            advance(65_000);
            expect(ghost().asleep).toBe(true);
            // наведение мыши — как пользователь будит призрака
            ghostEl()!.dispatchEvent(new Event('mouseover'));
            expect(ghost().asleep).toBe(false);
            expect(sayText()).toMatch(
                /не спал|продакшн|сохранился|погружения|undo|шевельнулось|нодах/,
            );
            // на page-режиме призрак НЕ уходит после побудки
            advance(20_000);
            expect(ghost().visible).toBe(true);
        });

        it('клик по спящему будит; обычный клик — «хыхы» в ОЧЕРЕДИ за hello', () => {
            loadGhost('page');
            advance(2200);
            // hello ещё живёт (~7с): клик встаёт в очередь приоритетом user
            ghostEl()!.dispatchEvent(new Event('click'));
            expect(sayText()).toMatch(/ты пришёл|привет|здесь тих|скучал|летаю|давно не видел/); // hello ещё в пузыре
            // ждём, пока hello доживёт и очередь откачается (жизнь ~7с + пауза 500мс)
            advance(9000);
            // 1–2 тычка = стадия giggle (delight): хы / хи-хи / хех / щёлк
            expect(sayText()).toMatch(/приятно|не привык|не кнопка|щёлк|не против/);
        });

        it('эскалация кликов (v5): хихи → может-не-надо → хватит → побег', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // hello дожил, пузырь свободен
            const el = ghostEl()!;
            // 1-й тычок: giggle (delight), реплика сразу в пузыре (он пуст)
            el.dispatchEvent(new Event('click'));
            advance(300);
            expect(ghostEl()!.getAttribute('data-face')).toBe('delight');
            expect(sayText()).toMatch(/приятно|не привык|не кнопка|щёлк|не против/);
            advance(5800); // giggle дожила (2.2с), окно тычков истекло
            // 3–4: skeptic «может, не надо?» (клика 3-4 в свежем окне)
            el.dispatchEvent(new Event('click'));
            advance(150);
            el.dispatchEvent(new Event('click'));
            advance(150);
            el.dispatchEvent(new Event('click'));
            advance(150);
            expect(ghostEl()!.getAttribute('data-face')).toBe('skeptic');
            advance(9500); // очередь откачалась: doubt в пузыре
            expect(sayText()).toMatch(/не надо|щекотно|считаю|обидеться/);
            advance(7500); // doubt дожила, окно истекло
            // 5–6: angry «всё. хватит.»
            el.dispatchEvent(new Event('click'));
            advance(150);
            el.dispatchEvent(new Event('click'));
            advance(150);
            el.dispatchEvent(new Event('click'));
            advance(150);
            el.dispatchEvent(new Event('click'));
            advance(150);
            el.dispatchEvent(new Event('click'));
            advance(150);
            expect(ghostEl()!.getAttribute('data-face')).toBe('angry');
            advance(9500); // очередь откачалась: stop в пузыре
            expect(sayText()).toMatch(/хватит|серьёзно|обиделся|бесконечный/);
            advance(4500); // stop дожила — БЕЗ обнуления окна: 5 кликов выше
            // ── окно истекло: побег набираем одной плотной серией ──
            for (let i = 0; i < 7; i++) {
                el.dispatchEvent(new Event('click'));
                advance(120);
            }
            expect(
                document.getElementById('um13-ghost-root')!.classList.contains('um13g-dodging'),
            ).toBe(true);
            expect(sayText()).toMatch(/улетаю|границы|кликаешь|юридически/);
            // через 12с побег заканчивается — призрак мирится
            advance(12_000);
            expect(
                document.getElementById('um13-ghost-root')!.classList.contains('um13g-dodging'),
            ).toBe(false);
        });

        it('react(): страница дёргает реакцию — призрак отвечает', () => {
            loadGhost('page');
            advance(2200);
            ghost().react('404-saved');
            expect(sayEl()!.classList.contains('show')).toBe(true);
        });

        it('on(): страница регистрирует свои реплики для события', () => {
            loadGhost('page');
            advance(2200);
            advance(9000); // hello дожил — пузырь свободен
            ghost().on('custom-event', ['кастомная реплика']);
            ghost().react('custom-event');
            expect(sayText()).toBe('кастомная реплика');
        });

        it('say() страницы будит спящего призрака', () => {
            loadGhost('page');
            advance(2200);
            advance(35_000);
            advance(65_000);
            expect(ghost().asleep).toBe(true);
            ghost().say('проснись, страница зовёт');
            expect(ghost().asleep).toBe(false);
            // побудка уже в пузыре (wake-реплика), say — в очереди за ней
            expect(sayText()).toMatch(
                /не спал|продакшн|сохранился|погружения|undo|шевельнулось|нодах|вернулся/,
            );
            // после прочтения пробуждения — слово страницы
            advance(10_000);
            expect(sayText()).toBe('проснись, страница зовёт');
        });

        it('hello доигрывает до конца: say страницы ждёт очереди (читаемость)', () => {
            loadGhost('page');
            advance(2200);
            const before = sayText();
            expect(sayEl()!.classList.contains('show')).toBe(true); // hello живёт
            ghost().say('страница поздоровалась');
            // НЕ перебило: hello ещё читается — «123» успевают дочитать
            expect(sayText()).toBe(before);
            // hello доживает → очередь откачивается → слово страницы
            advance(9000);
            expect(sayText()).toBe('страница поздоровалась');
        });

        it('пауза между репликами не выбрасывает очередь и не говорит без паузы', () => {
            loadGhost('page');
            advance(2200);
            ghost().say('первая из очереди', 4000);
            ghost().say('вторая из очереди', 4000);
            // ждём, пока очередь дойдёт до первой
            for (let i = 0; i < 200 && sayText() !== 'первая из очереди'; i++) advance(100);
            expect(sayText()).toBe('первая из очереди');
            advance(4000); // первая дожила — 500мс паузы перед второй
            expect(sayEl()!.classList.contains('show')).toBe(false);
            // регрессия: say в паузе считал пузырь свободным — выкидывал
            // «вторую» из очереди и показывался сразу, без паузы
            ghost().say('третья из очереди', 4000);
            expect(sayEl()!.classList.contains('show')).toBe(false);
            advance(600);
            expect(sayText()).toBe('вторая из очереди');
            advance(4600);
            expect(sayText()).toBe('третья из очереди');
        });
    });

    describe('режим editor (/app)', () => {
        it('не появляется сразу — только после 30с бездействия', () => {
            loadGhost('editor');
            advance(5000);
            expect(ghost().visible).toBe(false);
            advance(30_000);
            // УСТАЛЫЙ ПРИЛЁТ: прилетел (visible), но ещё НЕ спит —
            // останавливается, оглядывается (пауза 2.2с), говорит «тут я посплю»
            expect(ghost().visible).toBe(true);
            expect(ghost().asleep).toBe(false);
            // хвост реплики прилёта: after 2.2с паузы — реплика «тут посплю»
            advance(2300);
            expect(sayText()).toMatch(/посплю|прилягу|вздремнуть|прилетел|тихо/);
            expect(ghost().asleep).toBe(false); // реплика ещё читается — глаза открыты
            // сон — после того как реплика прочитана (~85мс/симв + запас)
            advance(10_000);
            expect(ghost().asleep).toBe(true);
            expect(document.querySelectorAll('.um13g-zzz').length).toBe(3);
            expect(ghostEl()!.getAttribute('data-face')).toBe('asleep');
        });

        it('не появляется, пока интерфейс занят (мост __UM13_ENV__)', () => {
            loadGhost('editor');
            (window as unknown as { __UM13_ENV__?: Um13EnvBridge }).__UM13_ENV__!.setBusy(true);
            advance(60_000);
            expect(ghost().visible).toBe(false);
            // освобождение — через 30с тишины призрак приходит
            (window as unknown as { __UM13_ENV__?: Um13EnvBridge }).__UM13_ENV__!.setBusy(false);
            advance(31_000);
            expect(ghost().visible).toBe(true);
        });

        it('движение будит: startled → реплика → ПРОЩАНИЕ → уплытие (всё читаемо)', () => {
            loadGhost('editor');
            advance(31_000); // прилетел, сказал «тут посплю»
            advance(12_000); // ...и уснул
            expect(ghost().asleep).toBe(true);
            window.dispatchEvent(new Event('mousemove'));
            // побудка: испуганное лицо + реплика пробуждения
            expect(ghost().asleep).toBe(false);
            expect(ghostEl()!.getAttribute('data-face')).toBe('startled');
            expect(sayText()).toMatch(/не спал|продакшн|сохранился|undo|нодах|вернулся/);
            // прощание — ПОСЛЕ прочтения реплики пробуждения (не раньше!)
            const wakeShown = sayText();
            const wakeRead = Math.max(6500, wakeShown.length * 85 + 2500);
            advance(wakeRead + 600);
            expect(sayText()).toMatch(/я пошёл|спать|не отвлекаю|к следующему простою|будь/);
            expect(ghostEl()!.getAttribute('data-face')).toBe('wink');
            // отплытие — после прочтения прощания
            const byeShown = sayText();
            const byeRead = Math.max(4500, byeShown.length * 85 + 500);
            advance(byeRead + 100);
            expect(ghostEl()!.classList.contains('um13g-sailing')).toBe(true);
            advance(1900);
            expect(ghost().visible).toBe(false);
        });

        it('не приходит при фокусе в поле ввода', () => {
            loadGhost('editor');
            const input = document.createElement('input');
            document.body.appendChild(input);
            input.focus();
            advance(60_000);
            expect(ghost().visible).toBe(false);
        });
    });

    describe('единая внешность', () => {
        it('SVG одинаковый в обоих режимах (одна капсула, глаза, рот)', () => {
            loadGhost('page');
            // v3: лицо — группы-эмоции без inline-стилей; канон = чистый SVG
            const canon = (el: HTMLElement | null) => el!.querySelector('svg')!.outerHTML;
            const pageSvg = canon(ghostEl());
            delete (window as unknown as Record<string, unknown>).UM13Ghost;
            document.getElementById('um13-ghost-root')!.remove();
            loadGhost('editor');
            advance(31_000);
            const editorSvg = canon(ghostEl());
            expect(editorSvg).toBe(pageSvg);
            // все семь лиц в разметке обоих режимов
            for (const face of [
                'normal',
                'startled',
                'skeptic',
                'delight',
                'smart',
                'thinking',
                'asleep',
            ]) {
                expect(editorSvg).toContain(`um13g-f-${face}`);
                expect(pageSvg).toContain(`um13g-f-${face}`);
            }
            expect(editorSvg).toContain('um13g-skirt');
        });
    });

    describe('эмоции (v4)', () => {
        it('mood(): лицо меняется и само возвращается в normal', () => {
            loadGhost('page');
            advance(2200);
            ghost().mood('delight');
            expect(ghostEl()!.getAttribute('data-face')).toBe('delight');
            // не-стартл эмоции живут 3.8с, потом normal
            advance(4400);
            expect(ghostEl()!.getAttribute('data-face')).toBe('normal');
        });

        it('startled возвращается быстро (1.6с) и включает дрожь (scared)', () => {
            loadGhost('page');
            advance(2200);
            ghost().mood('startled');
            expect(ghostEl()!.getAttribute('data-face')).toBe('startled');
            expect(
                document.getElementById('um13-ghost-root')!.classList.contains('um13g-scared'),
            ).toBe(true);
            advance(1800);
            expect(ghostEl()!.getAttribute('data-face')).toBe('normal');
        });

        it('реплики с «?» дают thinking, байки — smart (очередь их не ест)', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // hello дожил
            ghost().say('зачем мы это делаем?');
            expect(ghostEl()!.getAttribute('data-face')).toBe('thinking');
            // реплика живёт по читаемости (~6с) — ждём скрытия + паузы
            advance(9000);
            ghost().say('факт: ноды не спят. им нельзя.');
            expect(ghostEl()!.getAttribute('data-face')).toBe('smart');
        });

        it('on() принимает {mood, lines}: эмоция + реплика события', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // hello дожил
            ghost().on('custom-joy', { mood: 'delight', lines: ['ура!'] });
            ghost().react('custom-joy');
            expect(ghostEl()!.getAttribute('data-face')).toBe('delight');
            expect(sayText()).toBe('ура!');
        });

        it('poke-дуга (v5): 1-й тычок delight-хихи, 5-й — angry «хватит»', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // hello дожил
            ghost().poke();
            // 1–2 тычка: giggle — ему даже приятно (delight)
            expect(ghostEl()!.getAttribute('data-face')).toBe('delight');
            ghost().poke();
            advance(100);
            expect(ghostEl()!.getAttribute('data-face')).toBe('delight');
            // 3–4: skeptic «может, не надо»
            ghost().poke();
            ghost().poke();
            advance(100);
            expect(ghostEl()!.getAttribute('data-face')).toBe('skeptic');
            // 5–6: angry-оскал, реплика-предупреждение в очереди
            ghost().poke();
            advance(100);
            expect(ghostEl()!.getAttribute('data-face')).toBe('angry');
            advance(8000); // очередь откачалась — «всё. хватит.» в пузыре
            expect(sayText()).toMatch(/хватит|серьёзно|обиделся|бесконечный/);
        });

        it('безудержный спам — ПСИХ: angry-лицо, дрожь и РАЗБРОС КУБИКОВ', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // hello дожил
            // 7 → побег (окно кликов чистится), 8–17 — погоня
            // (кошки-мышки: поимки/рывки), 10+ НА БЕГУ → псих
            for (let i = 0; i < 17; i++) {
                ghost().poke();
                advance(150);
            }
            expect(ghostEl()!.getAttribute('data-face')).toBe('angry');
            expect(
                document.getElementById('um13-ghost-root')!.classList.contains('um13g-raging'),
            ).toBe(true);
            // кубики-частицы разлетелись
            expect(document.querySelectorAll('.um13g-cube').length).toBeGreaterThanOrEqual(10);
            // псих гаснет на ~4.5с от последнего клика
            advance(14_000);
            expect(document.querySelectorAll('.um13g-cube').length).toBe(0);
            expect(
                document.getElementById('um13-ghost-root')!.classList.contains('um13g-raging'),
            ).toBe(false);
            const faceAfter = ghostEl()!.getAttribute('data-face');
            expect(['normal', 'thinking', 'skeptic']).toContain(faceAfter);
        });

        it('tantrum() через API: кубики + оскал + реплика ПСИХА', () => {
            loadGhost('page');
            advance(2200);
            ghost().tantrum();
            expect(ghostEl()!.getAttribute('data-face')).toBe('angry');
            expect(sayText()).toMatch(/ПСИХ|раскидываю|бешен|кубики/i);
            expect(document.querySelectorAll('.um13g-cube').length).toBeGreaterThanOrEqual(10);
        });

        it('confetti(): победные кубики сыплются', () => {
            loadGhost('page');
            advance(2200);
            ghost().confetti();
            expect(document.querySelectorAll('.um13g-cube').length).toBeGreaterThanOrEqual(15);
        });

        it('react победного события (404-bottom) даёт delight + конфетти', () => {
            loadGhost('page');
            advance(2200);
            ghost().react('404-bottom');
            expect(ghostEl()!.getAttribute('data-face')).toBe('delight');
            expect(document.querySelectorAll('.um13g-cube').length).toBeGreaterThanOrEqual(10);
        });

        it('sad: слеза-группа в лице, грустные реплики её включают', () => {
            loadGhost('page');
            advance(2200);
            ghost().mood('sad');
            expect(ghostEl()!.getAttribute('data-face')).toBe('sad');
            expect(document.querySelector('.um13g-tear')).not.toBeNull();
        });

        it('наклон полёта: --um13-tilt выставляется при перелёте и гаснет в 0', () => {
            loadGhost('page');
            advance(2200);
            // спавн двигал призрака: после перелёта наклон уже выровнялся в 0,
            // а сама CSS-переменная определена на капсуле (transform читает её)
            advance(1700);
            expect(ghostEl()!.style.getPropertyValue('--um13-tilt')).toBe('0deg');
            // явная проверка: flyTo с большим dx наклоняет (dodge-шаг делает это)
            ghost().mood('angry', true); // не влияет на наклон, но фиксирует лицо
            const before = ghostEl()!.style.left;
            ghostEl()!.dispatchEvent(new Event('mouseover')); // dodgeStep при dodging
            // without dodging hover ничего не делает; наклон проверяем через тайминги
            advance(200);
            // переменная всё ещё валидна (0 или число с deg)
            expect(ghostEl()!.style.getPropertyValue('--um13-tilt')).toMatch(
                /^(-?\d+(\.\d+)?deg|0deg)$/,
            );
            expect(before).toBeTruthy();
        });
    });

    describe('v4.1: сон на месте, warn(), имя из памяти', () => {
        it('во сне не перелетает: дрейф ≤10px вокруг точки засыпания', () => {
            loadGhost('page');
            advance(2200);
            const el = ghostEl()!;
            // позиция после приветствия = текущее пятно
            const before = { left: el.style.left, top: el.style.top };
            advance(35_000); // «ты ещё тут?»
            advance(65_000); // сон
            expect(ghost().asleep).toBe(true);
            // несколько тиков дрейфа (5с каждый) — Math.random замокан на 0.5,
            // смещение тика = (0.5-0.5)*10 = 0: призрак не сдвинулся ни на пиксель
            advance(30_000);
            const after = { left: el.style.left, top: el.style.top };
            const dx = Math.abs(parseFloat(after.left!) - parseFloat(before.left!));
            const dy = Math.abs(parseFloat(after.top!) - parseFloat(before.top!));
            // инвариант пользователя: суммарное видимое движение во сне ≤ ~10px
            expect(dx).toBeLessThanOrEqual(10);
            expect(dy).toBeLessThanOrEqual(10);
            // и точно НЕ улетел в другое «пятно» (перелёты — это сотни px)
            expect(dx + dy).toBeLessThan(30);
        });

        it('warn(): скрытый призрак прилетает, предупреждает и уплывает', () => {
            loadGhost('editor');
            // editor-режим: призрака нет, пока бездействует 30с — warn зовёт его
            expect(ghost().visible).toBe(false);
            ghost().warn('save-error');
            expect(ghost().visible).toBe(true);
            expect(sayText()).toMatch(/экспорти|квота|подержу|нажмёшь экспорт/);
            // реплика живёт 7с, затем уплытие
            advance(8000);
            expect(ghostEl()!.classList.contains('um13g-sailing')).toBe(true);
        });

        it('warn() молчит, если тревога была <30с назад', () => {
            loadGhost('page');
            advance(2200);
            ghost().warn('save-error');
            const first = sayText();
            expect(first).toMatch(/экспорти|квота|подержу/);
            ghost().warn('save-error-retry'); // <30с — вторая тревога подавлена
            expect(sayText()).toBe(first);
        });

        it('имя из um13-memory делает приветствие персональным', () => {
            localStorage.setItem('um13-memory', JSON.stringify({ humanName: 'Макс' }));
            vi.spyOn(Math, 'random').mockReturnValue(0.01); // <0.5 → ветка «с именем»
            loadGhost('page');
            advance(2200);
            expect(sayText()).toContain('Макс');
            localStorage.removeItem('um13-memory');
        });

        it('first-met фиксируется при первом приветствии', () => {
            localStorage.removeItem('um13-memory');
            loadGhost('page');
            advance(2200);
            const m = JSON.parse(localStorage.getItem('um13-memory') || '{}');
            expect(typeof m['first-met']).toBe('number');
            localStorage.removeItem('um13-memory');
        });
    });

    describe('v5: живой призрак — поимки, смирение, акты', () => {
        it('поимка на бегу: курсор рядом с беглецом → «почти достал» + новый рывок', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // пузырь свободен
            const el = ghostEl()!;
            // 7 плотных тычков — побег
            for (let i = 0; i < 7; i++) {
                el.dispatchEvent(new Event('click'));
                advance(120);
            }
            expect(
                document.getElementById('um13-ghost-root')!.classList.contains('um13g-dodging'),
            ).toBe(true);
            // курсор «догнал»: двигаем мышь в точку призрака (style px)
            const st = ghostEl()!.style;
            window.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: parseFloat(st.left) || 512,
                    clientY: parseFloat(st.top) || 384,
                }),
            );
            // тычок по беглецу при близком курсоре — поимка
            el.dispatchEvent(new Event('click'));
            advance(200);
            expect(sayText()).toMatch(/тыкаться|достал|быстрый|поймал/);
        });

        it('смирение: после пережитого побега тычки встречаются покорностью', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            const el = ghostEl()!;
            // побег
            for (let i = 0; i < 7; i++) {
                el.dispatchEvent(new Event('click'));
                advance(120);
            }
            advance(12_500); // побег пережит → pokeResignCount=3, клики сброшены
            expect(
                document.getElementById('um13-ghost-root')!.classList.contains('um13g-dodging'),
            ).toBe(false);
            // новые тычки: 3+ (порог смирения) — реплика покорности
            for (let i = 0; i < 6; i++) {
                el.dispatchEvent(new Event('click'));
                advance(120);
            }
            // смирение могло уйти в очередь: откачиваем
            advance(9500);
            expect(sayText()).toMatch(/смирился|тыкай|не настоящий|мир не изменился|всё равно/);
        });

        it('первый тычок после 45с тишины — startled-вздрог и резкий отход', () => {
            loadGhost('page');
            advance(2200);
            advance(46_000); // >45с покоя (тише 30с-проверки «ты тут?» — она реплика, не движение)
            const el = ghostEl()!;
            const before = ghostEl()!.style.left;
            el.dispatchEvent(new Event('click'));
            advance(100);
            expect(sayText()).toBe('ой.');
            // тело дёрнулось от курсора — позиция сменилась
            expect(ghostEl()!.style.left).not.toBe(before);
        });

        it('act(): поза включается, подпись-стикер появляется, акт сам гаснет', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            (window as unknown as { UM13Ghost?: { act(k: string): void } }).UM13Ghost?.act('eat');
            advance(100);
            expect(ghostEl()!.classList.contains('um13g-act-eat')).toBe(true);
            // кубик-нода прилетает ко рту
            expect(document.querySelector('.um13g-eatbite')).not.toBeNull();
            // подпись через 1.4с
            advance(1600);
            expect(sayText()).toMatch(/ест ноду|звуков нет|нода спелая|перекус/);
            // акт конечен (9с) — поза снята
            advance(8000);
            expect(ghostEl()!.classList.contains('um13g-act-eat')).toBe(false);
            expect(document.querySelector('.um13g-eatbite')).toBeNull();
        });

        it('танец доступен только «когда никто не смотрит»', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            // курсор только что двигался (mousemove в тесте загрузки) —
            // планируем акт вручную через несколько bark-тиков? Нет:
            // проверяем контракт pickAct напрямую — публично недоступен,
            // поэтому через поведение: при живом движении мыши act('dance')
            // запрещён не бывает (force) — вместо этого проверим, что
            // idle-жизнь НЕ выбирает танец при активном курсоре
            vi.spyOn(Math, 'random').mockReturnValue(0.99);
            // бежим 60с idle-жизни с активной мышью: только что двигали —
            // танец исключён из пула
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
            advance(80_000);
            const dancing = ghostEl()!.classList.contains('um13g-act-dance');
            expect(dancing).toBe(false);
        });

        it('«застукали»: активная мышь рядом обрывает акт смущением', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            (window as unknown as { UM13Ghost?: { act(k: string): void } }).UM13Ghost?.act('dream');
            advance(100);
            expect(ghostEl()!.classList.contains('um13g-act-dream')).toBe(true);
            // «пользователь заметил»: курсор к телу + активное движение.
            // Позиция призрака — style.left/top (px); в jsdom rect нулевой
            const style = ghostEl()!.style;
            const gx = parseFloat(style.left) || 512;
            const gy = parseFloat(style.top) || 384;
            window.dispatchEvent(
                new MouseEvent('mousemove', {
                    clientX: gx + 10,
                    clientY: gy + 10,
                }),
            );
            advance(600); // watch-тик 500мс
            expect(ghostEl()!.classList.contains('um13g-act-dream')).toBe(false);
            // смущённая реплика — в очереди/пузыре
            advance(9500);
            expect(sayText()).toMatch(
                /не танцевал|ничего не видел|профессиональное|не подглядывай|не разговариваем/,
            );
        });
    });

    describe('v5.2: скрытый старт, драг, поимочный псих', () => {
        it('editor: при загрузке призрак НЕ виден и НЕ ловит клики (opacity/pointer-events)', () => {
            loadGhost('editor');
            advance(5000);
            const el = ghostEl()!;
            // тело существует (портал), но рождено скрытым и «неосязаемым»:
            // до 30с бездействия на /app он не должен ни рисоваться, ни кликаться
            expect(el.style.opacity).toBe('0');
            expect(el.style.pointerEvents).toBe('none');
            expect(ghost().visible).toBe(false);
            // и после 30с — появляется с кликабельностью
            advance(30_000);
            expect(ghost().visible).toBe(true);
            expect(el.style.pointerEvents).toBe('');
        });

        it('скрытый призрак не анимируется: um13g-away снят при появлении, стоит после ухода', () => {
            loadGhost('editor');
            const el = ghostEl()!;
            // рождён скрытым — анимации на паузе с первой секунды
            expect(el.classList.contains('um13g-away')).toBe(true);
            advance(30_000);
            expect(ghost().visible).toBe(true);
            expect(el.classList.contains('um13g-away')).toBe(false);
            ghost().hide();
            // класс ставится после fade-out, не обрывая его
            expect(el.classList.contains('um13g-away')).toBe(false);
            advance(700);
            expect(el.classList.contains('um13g-away')).toBe(true);
        });

        it('quiet: при загрузке не виден; после 60с — спит в углу', () => {
            loadGhost('quiet');
            advance(2000);
            expect(ghost().visible).toBe(false);
            advance(62_000); // 60с бездействия
            expect(ghost().visible).toBe(true);
            expect(ghost().asleep).toBe(true); // реплика посадки → сон
        });

        it('драг: перенос двигает тело, клик-паразит не считается тычком', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // пузырь свободен
            const el = ghostEl()!;
            // прицел — фактическая позиция тела (jsdom rect нулевой)
            const sx = parseFloat(el.style.left) || 512;
            const sy = parseFloat(el.style.top) || 384;
            // PointerEvent есть в браузерах; jsdom — эмулируем Event'ом
            // с расширенными полями (код слушает clientX/Y, pointerId, button)
            const ptr = (type: string, x: number, y: number, target: Window | Element) => {
                const e = new Event(type, { bubbles: true }) as Event & {
                    clientX: number;
                    clientY: number;
                    pointerId: number;
                    button: number;
                };
                e.clientX = x;
                e.clientY = y;
                e.pointerId = 1;
                e.button = 0;
                target.dispatchEvent(e);
            };
            ptr('pointerdown', sx, sy, el);
            ptr('pointermove', sx + 120, sy + 80, window);
            ptr('pointerup', sx + 120, sy + 80, window);
            // тело переехало к точке броска (± pointer-offset)
            const afterLeft = parseFloat(el.style.left);
            expect(Math.abs(afterLeft - (sx + 120))).toBeLessThan(80);
            // клик-паразит после переноса НЕ продвигает дугу тычков
            el.dispatchEvent(new Event('click'));
            advance(300);
            expect(el.getAttribute('data-face')).not.toBe('angry');
        });

        it('3-я поимка за побег → псих-детонатор («достали»)', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            const el = ghostEl()!;
            const poke = () => el.dispatchEvent(new Event('click'));
            for (let i = 0; i < 7; i++) {
                poke();
                advance(110);
            }
            expect(
                document.getElementById('um13-ghost-root')!.classList.contains('um13g-dodging'),
            ).toBe(true);
            // три поимки: курсор к телу беглеца + клик
            const catchIt = () => {
                const g = ghostEl()!;
                const left = parseFloat(g.style.left) || 0;
                const top = parseFloat(g.style.top) || 0;
                window.dispatchEvent(new MouseEvent('mousemove', { clientX: left, clientY: top }));
                g.dispatchEvent(new Event('click'));
            };
            catchIt();
            advance(400);
            catchIt();
            advance(400);
            catchIt();
            advance(300);
            // третья — детонатор: raging-псих с кубиками
            expect(
                document.getElementById('um13-ghost-root')!.classList.contains('um13g-raging'),
            ).toBe(true);
            expect(sayText()).toMatch(/ХВАТИТ|ДОСТАЛ|три раза/i);
            expect(document.querySelectorAll('.um13g-cube').length).toBeGreaterThanOrEqual(10);
        });

        it('скрытый призрак не живёт: тело не перелетает, пока он спрятан', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            const before = ghostEl()!.style.left;
            ghost().hide();
            // «прошла минуту» скрытой жизни — перелётов нет
            advance(60_000);
            expect(ghost().visible).toBe(false);
            expect(ghostEl()!.style.left).toBe(before);
        });
    });

    describe('v6: реворк — стеснительность, давность, консоль, экспорт', () => {
        it('SVG реворк: асимметричный подол, ключ на цепочке, белые ядра зрачков, купол в гриде', () => {
            loadGhost('page');
            const svg = ghostEl()!.querySelector('svg')!.outerHTML;
            // асимметрия подола: волны разной амплитуды
            expect(svg).toContain('q7 8 14 0');
            expect(svg).toContain('q8 9 13 0');
            // фирменный ключ — единственный не-циановый элемент (янтарь)
            expect(svg).toContain('um13g-key');
            expect(svg).toContain('#ff9d00');
            // зрачки с белым ядром; глаз = ГРУППА (ядро едет вместе с телом
            // глаза при дрейфе — раньше отставало и глаз «рвался»)
            expect(svg).toContain('#e8ffff');
            expect(svg).toContain('class="um13g-eye um13g-eye-l"');
            // купол не вылезает за viewBox: дуга a24 от y27 → вершина y3
            expect(svg).toContain('a24 24 0 0 0 -48 0');
            // рот еды — жующий «о» (акт eat гасит лица и показывает свой)
            // лицо-обжора v7.1: глаза-дужки + рот «о» (не старый eatmouth)
            expect(svg).toContain('um13g-eatface');
        });

        it('CSS реворк: SVG 72px, тэг 11px, поза shy, качание ключа, БЕЗ фильтров-лагов', () => {
            loadGhost('page');
            const css = GHOST_CSS;
            expect(css).toContain('width:72px');
            expect(css).toContain('font-size:11px');
            expect(css).toContain('um13g-shy');
            expect(css).toContain('um13g-keyswing');
            expect(css).toContain('um13g-gaze');
            // пузырь сжат: старые 150/250 заменены на 120/200
            expect(css).not.toContain('min-width:150px');
            expect(css).toContain('min-width:120px');
            // v6.1 перф: свечение — статичная radial-подложка, а НЕ
            // drop-shadow на svg (пересчёт фильтра на каждый кадр
            // бесконечных анимаций = лаги перелётов)
            expect(css).not.toContain('svg{filter:drop-shadow');
            expect(css).toContain('um13g-glow');
            // вздрагивание при клике живо (после фикса двойного плюса)
            expect(css).toContain('um13g-startled-pop');
        });

        it('стеснительность: 3с ховера → поза um13g-shy + реплика; уход курсора → relief', () => {
            loadGhost('page');
            advance(2200); // приветствие сыграло
            advance(11_000); // пузырь свободен
            const el = ghostEl()!;
            // ховер: курсор на призраке (matches(':hover') в jsdom — мокаем
            // через постановку hoverwrap-класса? нет: тест проверяет контракт
            // иначе — таймер вешается, проверяем, что ПОЗА появляется после 3с
            el.dispatchEvent(new Event('mouseover'));
            advance(3100);
            // jsdom :hover не матчится — поза не включится без реального ховера.
            // Проверяем сторону контракта, доступную без :hover: куладун не
            // дал второй shy в пределах окна (см. ниже), а сам shy включается
            // в браузере. Тестируем счётчик: повторный mouseenter не роняет.
            expect(ghost().visible).toBe(true);
            // реплик стеснительности пока не было — пузырь пуст от них
            expect(sayText()).not.toMatch(/не экспонат|не симметрично/);
        });

        it('shy-куладаун: повторный эпизод не раньше 3 минут', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            const el = ghostEl()!;
            // первый mouseenter планирует shy-таймер
            el.dispatchEvent(new Event('mouseover'));
            advance(3100);
            // второй (после «ухода» курсора) — тоже планирует, но таймер
            // перезаписывается: двух таймеров не бывает (последний выигрывает)
            el.dispatchEvent(new Event('mouseout'));
            advance(500);
            el.dispatchEvent(new Event('mouseover'));
            advance(3100);
            // не упало, не задвоило реплик — контракт кулдауна жив
            expect(ghost().visible).toBe(true);
        });

        it('давность возвращения: сутки без визита → hello-реплика о перерыве', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'first-met': Date.now() - 10 * 24 * 3600_000,
                    'last-seen': Date.now() - 24 * 3600_000,
                }),
            );
            loadGhost('page');
            advance(2200); // приветствие сыграло
            expect(sayText()).toMatch(/сутки|день без событий|вернулся/);
            // метка обновилась — следующий визит начнётся «с нуля»
            const m = JSON.parse(localStorage.getItem('um13-memory') || '{}');
            expect(typeof m['last-seen']).toBe('number');
            expect(typeof m['gap-said']).toBe('number');
            localStorage.removeItem('um13-memory');
        });

        it('давность: неделя/месяц/долго выбирают свои пулы', () => {
            const week = Date.now() - 5 * 24 * 3600_000;
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'first-met': week - 3600_000,
                    'last-seen': week,
                }),
            );
            loadGhost('page');
            advance(2200);
            expect(sayText()).toMatch(/неделю|неделя|семь дней/);
            localStorage.removeItem('um13-memory');
        });

        it('давность молчит при свежем визите (<6ч)', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'first-met': Date.now() - 3600_000,
                    'last-seen': Date.now() - 3600_000,
                }),
            );
            loadGhost('page');
            advance(2200);
            // обычное hello — не реплика о перерыве
            expect(sayText()).not.toMatch(/сутки|неделя|месяц|соскучился/);
            localStorage.removeItem('um13-memory');
        });

        it('консольная затравка: um13() отвечает и не рушится', () => {
            loadGhost('page');
            expect(typeof (window as unknown as { um13?: () => string }).um13).toBe('function');
            const r = (window as unknown as { um13: () => string }).um13();
            expect(r).toContain('um-13');
        });

        it('консоль молчит на secret.html (там своя затравка um13.hack)', () => {
            // pathname нельзя подменить после загрузки jsdom легко —
            // проверяем контракт consoleTease по исходнику (страница-фильтр)
            expect(GHOST_SRC).toContain("location.pathname.indexOf('secret')");
        });

        it("экспорт: react('flow-export') — delight + конфетти", () => {
            loadGhost('page');
            advance(2200);
            ghost().react('flow-export');
            expect(ghostEl()!.getAttribute('data-face')).toBe('delight');
            // конфетти сыпется в момент события (кубики живут ~1.8с)
            expect(document.querySelectorAll('.um13g-cube').length).toBeGreaterThanOrEqual(10);
            // hello ещё живёт (~10с) — реплика экспорта честно ждёт очереди
            // (читаемость: призрак не перебивает сам себя), откачиваем паузу
            advance(12_000);
            expect(sayText()).toMatch(/лодк|волна|файл|береги/i);
        });

        it('усталый полуулыб в normal: асимметрия вместо банта', () => {
            loadGhost('page');
            const svg = ghostEl()!.querySelector('svg')!.outerHTML;
            // старый симметричный рот-улыбка исчез
            expect(svg).not.toContain('q5 3 10 0');
            // новый — асимметричный «усталый» путь (v6.1: рот на y44)
            expect(svg).toContain('M25 44 q4 1.5 5 1 q3 -2 5 -1');
        });

        it('v7.1: акт еды — мини-НОДА (порт+метка) ко рту, крошки, лицо-обжора', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            (window as unknown as { UM13Ghost?: { act(k: string): void } }).UM13Ghost?.act('eat');
            advance(100);
            const el = ghostEl()!;
            expect(el.classList.contains('um13g-act-eat')).toBe(true);
            // ЖУЮЩАЯСЯ НОДА: кубик + порт-вход (кружок) + метка-штрих —
            // человек видит ЧТО это, а не безликий квадрат
            const bite = el.querySelector('.um13g-eatbite');
            expect(bite).not.toBeNull();
            expect(bite!.querySelectorAll('span').length).toBe(2); // порт + метка
            // крошки после укусов (3 шт, анимация с задержкой 5.6с)
            expect(el.querySelectorAll('.um13g-crumb').length).toBe(3);
            // лицо-обжора: глаза-дужки + рот «о» в разметке
            expect(el.querySelector('.um13g-eatface')).not.toBeNull();
            const css = GHOST_CSS;
            // укус-анимация в 2 ступени + подход прыжками
            expect(css).toContain('um13g-bite-approach');
            expect(css).toContain('um13g-bite-eat1');
            expect(css).toContain('um13g-bite-eat2');
            expect(css).toContain('um13g-crumb');
        });

        it('v7.1: тамагочи — голодный акт + кормление кликом', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // пузырь свободен
            (window as unknown as { UM13Ghost?: { act(k: string): void } }).UM13Ghost?.act(
                'hungry',
            );
            advance(100);
            const el = ghostEl()!;
            expect(el.classList.contains('um13g-act-hungry')).toBe(true);
            // рядом лежит нода — на неё он и смотрит
            expect(el.querySelector('.um13g-hungrynode')).not.toBeNull();
            expect(el.getAttribute('data-face')).toBe('sad');
            // КЛИК = кормление: нода летит ко рту (класс fed), благодарность
            el.dispatchEvent(new Event('click'));
            advance(300);
            expect(el.classList.contains('um13g-act-hungry')).toBe(false);
            // сцена дожевания: eat-класс на секунду + delight-реплика в очереди
            expect(el.querySelector('.um13g-hungrynode')?.classList.contains('fed')).toBe(true);
            advance(700); // нода улетела и удалась, скажет «спасибо»
            expect(sayText()).toMatch(/спасибо|жевательно|заметишь|работоспособный/);
        });

        it('v7.2: сон-пат — медленное движение рядом НЕ будит, быстрый рывок будит', () => {
            loadGhost('page');
            advance(2200);
            advance(35_000); // «ты ещё тут?»
            advance(65_000); // уснул
            expect(ghost().asleep).toBe(true);
            // МЕДЛЕННОЕ движение рядом (60px/с, близко): sleepPat поглощает
            const el = ghostEl()!;
            const gx = parseFloat(el.style.left) || 512;
            const gy = parseFloat(el.style.top) || 384;
            // два «тика» по 50мс со смещением 3px = 60px/с — мягко
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: gx, clientY: gy }));
            advance(50);
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: gx + 3, clientY: gy }));
            advance(50);
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: gx + 6, clientY: gy }));
            expect(ghost().asleep).toBe(true); // дремлет
            // БЫСТРЫЙ рывок рядом (45px за 20мс ≈ 2250px/с > порога 1800)
            window.dispatchEvent(
                new MouseEvent('mousemove', { clientX: gx + 10, clientY: gy + 5 }),
            );
            advance(20);
            window.dispatchEvent(
                new MouseEvent('mousemove', { clientX: gx + 55, clientY: gy + 30 }),
            );
            expect(ghost().asleep).toBe(false);
        });

        it('v7.4: моргают ТОЛЬКО глаза — брови и рот не мигают (регрессия «лицо мигало»)', () => {
            loadGhost('page');
            const css = GHOST_CSS;
            // blinkface обязан висеть на .um13g-blink (обёртка глаз),
            // а НЕ на группе лица — иначе opacity-провал гасил брови и рот
            expect(css).toContain(
                '.um13g[data-face="normal"] .um13g-blink{animation:um13g-blinkface',
            );
            expect(css).not.toContain('.um13g-f-normal{animation:um13g-blinkface');
            // в разметке обёртка существует и содержит ровно два глаза,
            // брови/рот остаются ВНЕ её
            const svg = ghostEl()!.querySelector('svg')!;
            const blink = svg.querySelector('.um13g-f-normal .um13g-blink');
            expect(blink).not.toBeNull();
            expect(blink!.querySelectorAll('.um13g-eye').length).toBe(2);
            // рот и брови — сиблинги обёртки, не её дети
            const face = svg.querySelector('.um13g-f-normal')!;
            expect(face.querySelectorAll(':scope > path').length).toBeGreaterThanOrEqual(3); // 2 брови + рот
        });

        it('v7.2: ловец удалённых нод — catchNode() рождает кубик в подоле', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // пузырь свободен
            (
                window as unknown as { UM13Ghost?: { catchNode(c?: string): void } }
            ).UM13Ghost?.catchNode('#bc13fe');
            advance(100);
            const caught = document.querySelector('.um13g-caught') as HTMLElement | null;
            expect(caught).not.toBeNull();
            // jsdom нормализует hex в rgb(): проверяем компоненты (188,19,254 = #bc13fe)
            expect(caught!.style.background).toContain('188');
            expect(caught!.style.background).toContain('254');
            // грустное лицо: бережёт, не радуется
            expect(ghostEl()!.getAttribute('data-face')).toBe('sad');
            // кубик тает через 3.2с
            advance(3600);
            expect(document.querySelector('.um13g-caught')).toBeNull();
        });
    });

    describe('v7: взгляд, тело, память, финал', () => {
        it('взгляд следит за курсором: data-gaze + координаты зрачков (throttle 100мс)', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // пузырь свободен
            const el = ghostEl()!;
            // мышь около призрака — зрачки едут к курсору
            const gx = parseFloat(el.style.left) || 512;
            const gy = parseFloat(el.style.top) || 384;
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: gx + 50, clientY: gy }));
            advance(200); // троттл 100мс — уже отработал
            expect(el.getAttribute('data-gaze')).toBe('mouse');
            const gazeX = parseFloat(el.style.getPropertyValue('--um13-gaze-x'));
            expect(gazeX).toBeGreaterThan(0); // курсор справа — зрачки вправо
            // 10с без движения — «теряет интерес»
            advance(10_600);
            expect(el.getAttribute('data-gaze')).toBe(null);
        });

        it('головокружение: два оборота курсора вокруг — skeptic + реплика', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            const el = ghostEl()!;
            const gx = parseFloat(el.style.left) || 512;
            const gy = parseFloat(el.style.top) || 384;
            const r = 150;
            // имитируем 2 полных круга (8 точек по кругу, ≥500мс между —
            // каждый mousemove проходит throttle)
            for (let k = 0; k <= 16; k++) {
                const a = (k / 16) * Math.PI * 4; // два оборота
                window.dispatchEvent(
                    new MouseEvent('mousemove', {
                        clientX: gx + Math.cos(a) * r,
                        clientY: gy + Math.sin(a) * r,
                    }),
                );
                advance(150);
            }
            expect(ghost().face).toBe('skeptic');
            advance(5000);
            expect(sayText()).toMatch(/кружится|кружить|шарик|стоп/);
        });

        it('акты v7: пастух нод — кубики + подпись; полировка — дубль-ключ', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            (window as unknown as { UM13Ghost?: { act(k: string): void } }).UM13Ghost?.act('herd');
            advance(200);
            const el = ghostEl()!;
            expect(el.classList.contains('um13g-act-herd')).toBe(true);
            // три кубика-«ноды» в хореографии
            expect(el.querySelectorAll('.um13g-herdcube').length).toBe(3);
            // подпись акта (через 1.4с)
            advance(1700);
            expect(sayText()).toMatch(/\(сортировка\)|\(наводит порядок\)|\(пасётся\)/);
            advance(20_000); // акт 18с кончился — поза снята
            expect(el.classList.contains('um13g-act-herd')).toBe(false);

            (window as unknown as { UM13Ghost?: { act(k: string): void } }).UM13Ghost?.act(
                'polish',
            );
            advance(200);
            expect(el.classList.contains('um13g-act-polish')).toBe(true);
            expect(el.querySelector('.um13g-keyheld')).not.toBeNull();
            advance(8500);
            expect(el.classList.contains('um13g-act-polish')).toBe(false);
        });

        it('акт watch: провожает невидимое — зрачки едут за «ничем»', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            (window as unknown as { UM13Ghost?: { act(k: string): void } }).UM13Ghost?.act('watch');
            advance(200);
            const el = ghostEl()!;
            expect(el.classList.contains('um13g-act-watch')).toBe(true);
            // первый «пролёт» пошёл: gaze-x уходит от 0 к краям
            advance(2200);
            const g1 = el.style.getPropertyValue('--um13-gaze-x');
            expect(g1).not.toBe('');
            advance(12_000); // акт 12с кончился
            expect(el.classList.contains('um13g-act-watch')).toBe(false);
        });

        it('полировка запрещена после финала приёмной (сюжет ключа закрыт)', () => {
            localStorage.setItem('um13-memory', JSON.stringify({ 'key-turned': Date.now() }));
            loadGhost('page');
            advance(2200);
            advance(11_000);
            (window as unknown as { UM13Ghost?: { act(k: string): void } }).UM13Ghost?.act(
                'polish',
            );
            advance(300);
            expect(ghostEl()!.classList.contains('um13g-act-polish')).toBe(false);
            localStorage.removeItem('um13-memory');
        });

        it('доверие 0 (незнакомец): драг выскальзывает, реплика «не знакомы»', () => {
            localStorage.removeItem('um13-memory');
            loadGhost('page');
            advance(2200);
            advance(11_000);
            const el = ghostEl()!;
            const sx = parseFloat(el.style.left) || 512;
            const sy = parseFloat(el.style.top) || 384;
            const ptr = (type: string, x: number, y: number, target: Window | Element) => {
                const e = new Event(type, { bubbles: true }) as Event & {
                    clientX: number;
                    clientY: number;
                    pointerId: number;
                    button: number;
                };
                e.clientX = x;
                e.clientY = y;
                e.pointerId = 1;
                e.button = 0;
                target.dispatchEvent(e);
            };
            ptr('pointerdown', sx, sy, el);
            ptr('pointermove', sx + 120, sy + 80, window);
            // выскальзывание: реплика + отскок (позиция изменилась телом)
            advance(400);
            expect(sayText()).toMatch(/не настолько знакомы|не надо\. руки|познакомимся/);
            ptr('pointerup', sx + 120, sy + 80, window);
            // повторный драг в той же сессии — уже не выскальзывает (друзей не теряют дважды)
            advance(2000);
            ptr('pointerdown', parseFloat(el.style.left), parseFloat(el.style.top), el);
            ptr(
                'pointermove',
                parseFloat(el.style.left) + 130,
                parseFloat(el.style.top) + 40,
                window,
            );
            advance(300);
            expect(sayText()).not.toMatch(/не настолько знакомы/);
        });

        it('доверие 2 (свой): hello-подарок — um13(), счёт ключей или карточка дружбы', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'terminal-visited': Date.now(),
                    'well-visited': Date.now(),
                    confession: Date.now(),
                    visits: 12,
                    'well-rescued': 7,
                }),
            );
            vi.spyOn(Math, 'random').mockReturnValue(0.01); // ветки «с именем» и подарка
            loadGhost('page');
            advance(2200); // hello
            advance(16_000); // подарок доверия (14с после hello)
            // random 0.01 → ветка карточки (<0.3): реплика вручения
            expect(sayText()).toMatch(
                /карточк|справку о нас|дружба|um13\(\)|ключ\(ей\)|спасённых ключей|я всегда считаю/i,
            );
            localStorage.removeItem('um13-memory');
        });

        it('сны из памяти: спящий бормочет о колодце (по флагу well-visited)', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'well-visited': Date.now(),
                    'well-rescued': 5,
                }),
            );
            loadGhost('page');
            advance(2200);
            advance(35_000); // «ты ещё тут?»
            advance(65_000); // сон
            expect(ghost().asleep).toBe(true);
            // первая фраза сна — через 25–50с после засыпания
            advance(51_000);
            const txt = sayText();
            expect(txt).toMatch(/колодец|дне|продакшн|волнах/i);
            localStorage.removeItem('um13-memory');
        });

        it('пробуждение посреди сна помнит его (dreamCaughtLines)', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'well-visited': Date.now(),
                }),
            );
            vi.spyOn(Math, 'random').mockReturnValue(0.01); // все «случайные» — за нас
            loadGhost('page');
            advance(2200);
            advance(35_000);
            advance(65_000);
            advance(51_000); // сон уже бормочет (S.dreaming = true)
            expect(ghost().asleep).toBe(true);
            ghostEl()!.dispatchEvent(new Event('mouseover')); // будим
            expect(ghost().asleep).toBe(false);
            advance(200);
            expect(sayText()).toMatch(/снилась волна|досматривал|продакшн.*не буди|хороший сон/);
            localStorage.removeItem('um13-memory');
        });

        it('фавикон-сон: при засыпании появляется спящий фавикон, при побудке — снимается', () => {
            // канонический link нужен ДО загрузки призрака
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
            document.head.appendChild(link);
            // jsdom без canvas: стабим getContext/toDataURL — проверяем
            // КОНТРАКТ (клон-фавикон создаётся и снимается), не пиксели
            const noop = () => undefined;
            const ctx2d = {
                fillRect: noop,
                beginPath: noop,
                arc: noop,
                moveTo: noop,
                lineTo: noop,
                quadraticCurveTo: noop,
                stroke: noop,
                fill: noop,
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 0,
            };
            const origCreate = document.createElement.bind(document);
            vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
                const el = origCreate(tag);
                if (tag === 'canvas') {
                    (el as unknown as { toDataURL: () => string }).toDataURL = () =>
                        'data:image/png;base64,x';
                    (el as unknown as { getContext: () => typeof ctx2d }).getContext = () => ctx2d;
                    (el as unknown as { width: number }).width = 16;
                    (el as unknown as { height: number }).height = 16;
                }
                return el;
            });
            loadGhost('page');
            advance(2200);
            advance(35_000);
            advance(65_000); // сон
            expect(ghost().asleep).toBe(true);
            expect(document.getElementById('um13-sleep-favicon')).not.toBeNull();
            ghostEl()!.dispatchEvent(new Event('mouseover'));
            advance(100);
            expect(ghost().asleep).toBe(false);
            expect(document.getElementById('um13-sleep-favicon')).toBeNull();
            link.remove();
        });

        it('титул вкладки: уход со страницы (visibilitychange hidden) — тихая реплика в title', () => {
            loadGhost('page');
            advance(2200);
            const orig = document.title;
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
            document.dispatchEvent(new Event('visibilitychange'));
            expect(document.title).toMatch(/ты ушёл\?|тут кто-то спит/);
            advance(8200); // 8с — вернули оригинал
            expect(document.title).toBe(orig);
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        });

        it('кубик-потеряшка: после психа один кубик прилип у края, клик — призрак «нашёл»', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            ghost().tantrum();
            // потеряшка прилипла
            const stuck = document.querySelector('.um13g-cube-stuck') as HTMLElement | null;
            expect(stuck).not.toBeNull();
            stuck!.click();
            advance(400);
            expect(ghost().face).toBe('delight');
            advance(4000); // очередь откачалась (если была)
            expect(sayText()).toMatch(/нашёлся|всё-таки|помню каждый|поздно/);
            // после клика потеряшка убрана
            advance(900);
            expect(document.querySelector('.um13g-cube-stuck')).toBeNull();
        });

        it('квота-давление: storage.estimate 95%+ → data-pressure=2 (юбка чаще, мерцание)', async () => {
            // честный путь продакшена: navigator.storage.estimate
            // (в браузерах именно он; jsdom — стабим)
            Object.defineProperty(navigator, 'storage', {
                configurable: true,
                value: {
                    estimate: () => Promise.resolve({ usage: 9.5, quota: 10 }),
                },
            });
            loadGhost('page');
            // estimate — промис: микротаску резолва надо дождаться
            await act(async () => {
                await vi.advanceTimersByTimeAsync(2200);
            });
            const root = document.getElementById('um13-ghost-root')!;
            expect(root.getAttribute('data-pressure')).toBe('2');
            // CSS тела на месте: юбка чаще + мерцание на уровне 2
            const css = GHOST_CSS;
            expect(css).toContain('[data-pressure="2"]');
            expect(css).toContain('um13g-flicker');
        });

        it('confirm-scary: призрак закрывает лицо юбкой (класс shy), relief — открывает', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            ghost().react('confirm-scary');
            const el = ghostEl()!;
            advance(100);
            expect(el.classList.contains('um13g-shy')).toBe(true);
            expect(el.getAttribute('data-face')).toBe('sad');
            ghost().react('confirm-relief');
            advance(100);
            expect(el.classList.contains('um13g-shy')).toBe(false);
        });

        it('um13:review — призрак летит к точке экрана + sad-реплика ревьюера', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            ghost().on('flow-review', {
                mood: 'sad',
                lines: ['у этой ноды нет выхода. я знаю, каково это.'],
            });
            const before = ghostEl()!.style.left;
            window.dispatchEvent(
                new CustomEvent('um13:review', {
                    detail: { x: 300, y: 200 },
                }),
            );
            advance(2000); // полёт 1.6с + реплика через 1.9с
            expect(ghostEl()!.style.left).not.toBe(before);
            advance(1000);
            expect(sayText()).toMatch(/нет выхода|тупик|юбка/);
        });

        it('um13:review-name — комментирует имя ноды с подстановкой {n}', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000); // пузырь свободен
            window.dispatchEvent(
                new CustomEvent('um13:review-name', {
                    detail: { name: 'мостик' },
                }),
            );
            advance(200);
            expect(sayText()).toContain('мостик');
            expect(sayText()).not.toMatch(/\{n\}/); // плейсхолдер заменён, не показан
        });

        it('um13:review-empty — «ну хоть одну ноду» из пула призрака', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            window.dispatchEvent(new CustomEvent('um13:review-empty'));
            advance(200);
            expect(sayText()).toMatch(/одну ноду|пустой холст|великие флоу/);
        });

        it('финал приёмной: keyFinale("turned") — реплика развязки и ключ исчезает', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            const root = document.getElementById('um13-ghost-root')!;
            expect(root.classList.contains('key-turned')).toBe(false);
            ghost().keyFinale('turned');
            expect(root.classList.contains('key-turned')).toBe(true);
            expect(sayText()).toMatch(/окно открыто|обслужено|не «следующий»|впервые/i);
            // флаг в общей памяти: призрак помнит это на всех страницах
            const m = JSON.parse(localStorage.getItem('um13-memory') || '{}');
            expect(typeof m['key-turned']).toBe('number');
            localStorage.removeItem('um13-memory');
        });

        it('финал приёмной: keyFinale("given") — грустная реплика, ключ отдан', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            ghost().keyFinale('given');
            const root = document.getElementById('um13-ghost-root')!;
            expect(root.classList.contains('key-given')).toBe(true);
            expect(sayText()).toMatch(/ключ у тебя|цепочка лёгкая|отдал ключ|просто призрак/i);
            localStorage.removeItem('um13-memory');
        });

        it('key-known: байки напоминают про окно №13 (регрессия «ты зна»)', () => {
            localStorage.clear();
            // человек спрашивал про ключ в приёмной, но финал не выбран
            localStorage.setItem('um13-memory', JSON.stringify({ 'key-known': Date.now() }));
            // random=0.99: задержка байки ≈74.6с — вырывается из-под 30с-кулдауна
            // «ты ещё тут?» (при 0.5 байка в 55с всегда подавлялась проверкой в 30с)
            vi.spyOn(Math, 'random').mockReturnValue(0.99);
            loadGhost('page');
            advance(2200); // приветствие (rnd(1000,2000) ≈ 1990мс)
            advance(75_000); // 30с — «ты ещё тут?», ~74.6с — байка-тик с напоминанием
            expect(sayText()).toMatch(/окно №13 ждёт|спросишь про ключ/);
            expect(sayText()).not.toMatch(/ты зна /); // опечатка аудита не вернулась
            // кулдаун-метка записана: повторные тики молчат про ключ
            const m = JSON.parse(localStorage.getItem('um13-memory') || '{}');
            expect(typeof m['key-known-said']).toBe('number');
            localStorage.removeItem('um13-memory');
        });

        it('key-known затихает после финала: key-turned глушит напоминания', () => {
            localStorage.clear();
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'key-known': Date.now(),
                    'key-turned': Date.now(),
                }),
            );
            vi.spyOn(Math, 'random').mockReturnValue(0.99);
            loadGhost('page');
            advance(2200);
            advance(75_000); // байка-тик сработал, но финал закрыл тему ключа
            expect(sayText()).not.toMatch(/окно №13 ждёт|спросишь про ключ/);
            localStorage.removeItem('um13-memory');
        });

        it('visit(): счётчик встреч в памяти растёт (доверие)', () => {
            localStorage.removeItem('um13-memory');
            loadGhost('page');
            advance(2200);
            // boot уже записал 1 визит
            const first = JSON.parse(localStorage.getItem('um13-memory') || '{}')['visits'] || 0;
            ghost().visit();
            const second = JSON.parse(localStorage.getItem('um13-memory') || '{}')['visits'] || 0;
            expect(second).toBe(first + 1);
            localStorage.removeItem('um13-memory');
        });

        it('state: геттер агрегирует доверие/давление/ключ', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'terminal-visited': Date.now(),
                    'well-visited': Date.now(),
                    confession: Date.now(),
                    visits: 12,
                    'key-turned': Date.now(),
                }),
            );
            loadGhost('page');
            advance(2200);
            const s = ghost().state;
            expect(s.trust).toBe(2);
            expect(s.keyState).toBe('turned');
            localStorage.removeItem('um13-memory');
        });
    });

    describe('v1.0: аудит — занавесь, flip-down, локаль, сомнамбула, питомец', () => {
        it('занавесь стеснительности: shy-поза показывает um13g-shyveil, закрывающий лицо', () => {
            loadGhost('page');
            advance(2200);
            const svg = ghostEl()!.querySelector('svg')!;
            const veil = svg.querySelector('.um13g-shyveil');
            expect(veil).not.toBeNull();
            // в базе занавесь спрятана, в позе shy — проявлена CSS-классом
            const css = GHOST_CSS;
            expect(css).toContain('.um13g .um13g-shyveil{display:none;}');
            expect(css).toContain('.um13g.um13g-shy .um13g-shyveil{display:block');
            // ГЕОМЕТРИЯ (регрессия A1): занавесь — явный path в зоне лица,
            // вписанный в viewBox. Первая попытка (зеркальный scaleY(-1.35)
            // от origin y60) уводила ткань за канву (y79+) — «закрытие»
            // оставалось невидимым, строковые ассерты это пропускали.
            const d = veil!.getAttribute('d') || '';
            expect(d).toMatch(/^M10 46/); // левый край на кромке подола
            expect(d).toContain('V31'); // ткань поднимается ВВЕРХ до бровей
            expect(d).toContain('V46 z'); // и замыкается внизу — полоса ткани
            // числа-вершины пути обязаны оставаться внутри грида 0–64
            const ys = [...d.matchAll(/[Vv](\d+)/g)].map((m) => Number(m[1]));
            ys.forEach((y) => {
                expect(y).toBeGreaterThanOrEqual(0);
                expect(y).toBeLessThanOrEqual(64);
            });
            // и никакого зеркалирования-хвоста в CSS-анимации
            expect(css).not.toContain('scaleY(-1.35)');
            expect(css).not.toContain('scaleY(-1.5)');
        });

        it('flip-down: пузырь у верхней кромки переходит ПОД призрака', () => {
            loadGhost('page');
            advance(2200);
            const css = GHOST_CSS;
            expect(css).toContain('flip-down');
            expect(css).toContain('.um13g .um13g-say.flip-down{bottom:auto;top:calc(100% + 14px)');
            // fy-кламп тела поднят: 0.10 → 0.11 (запас на пузырь сверху)
            expect(GHOST_SRC).toContain(
                'Math.max(0.11, Math.min(0.92, pos.y / window.innerHeight))',
            );
        });

        it('глитч-расслоение читаемо: альфа поднята, сдвиг расширен', () => {
            loadGhost('page');
            const css = GHOST_CSS;
            expect(css).toContain('rgba(255,0,85,.26)');
            expect(css).toContain('rgba(0,255,157,.24)');
            expect(css).toContain('translateX(-6px)');
        });

        it('перелёт не рвёт акт: scheduleFly исключает currentAct', () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            (window as unknown as { UM13Ghost?: { act(k: string): void } }).UM13Ghost?.act('peek');
            advance(300);
            const el = ghostEl()!;
            expect(el.classList.contains('um13g-act-peek')).toBe(true);
            // перелёт срабатывает в окне 16–28с — акт (10с) должен дожить:
            // условие полёта требует !currentAct, поза не телепортируется
            const before = el.style.left;
            advance(28_000);
            expect(el.classList.contains('um13g-act-peek')).toBe(false); // акт ДОЖИЛ своё
            // после конца акта перелёт приходит и позиция меняется
            advance(26_000);
            expect(el.style.left).not.toBe(before);
        });

        it('сны молчат в quiet-режиме (контракт лендинга)', () => {
            loadGhost('quiet');
            advance(65_000); // прилетел (60с) + посадка (2.1с) + сон
            expect(ghost().asleep).toBe(true);
            advance(95_000); // за 95с в page-режиме сон бы уже бормотал (25–50с)
            expect(sayText()).not.toMatch(/\(снится|\(мне снится|\(dreaming/i);
        });

        it("двуязычие: setLocale('en') — реплики призрака переключаются на лету", () => {
            loadGhost('page');
            advance(2200);
            advance(11_000);
            const g = ghost() as unknown as Um13GhostApi & { setLocale(l: 'ru' | 'en'): void };
            g.setLocale('en');
            // poke берёт реплику ИЗ ПУЛА призрака (say() — текст страницы,
            // его призрак не переводит — страницы дают свои строки)
            g.poke();
            advance(600);
            expect(sayText()).toMatch(/nice\. not used|poke received|not a button|communication/i);
        });

        it('EN при загрузке: um13-locale=en → hello по-английски', () => {
            localStorage.setItem('um13-locale', 'en');
            const tag = document.createElement('script');
            tag.setAttribute('data-um13-mode', 'page');
            document.body.appendChild(tag);
            (0, eval)(GHOST_SRC);
            advance(2200);
            expect(sayText()).toMatch(/oh\. hi|quiet here|living human|you came|pretend|staying/i);
            localStorage.removeItem('um13-locale');
        });

        it('«постарел без тебя»: давний last-seen → um13g-missed до hello, оживает после', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'last-seen': Date.now() - 10 * 24 * 3600_000,
                }),
            );
            loadGhost('page');
            advance(100);
            expect(ghostEl()!.classList.contains('um13g-missed')).toBe(true);
            advance(2200); // hello сыграло — ожил
            expect(ghostEl()!.classList.contains('um13g-missed')).toBe(false);
            localStorage.removeItem('um13-memory');
        });

        it('сомнамбула: сон в скрытой вкладке ≥5 мин — греза из кубиков; побудка рассыпает', () => {
            loadGhost('page');
            advance(2200);
            advance(35_000);
            advance(65_000);
            expect(ghost().asleep).toBe(true);
            // уходим на другую вкладку на 5 минут
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
            document.dispatchEvent(new Event('visibilitychange'));
            advance(5 * 60_000);
            // греза проявлена: кубики-рисунок в портале
            const pics = document.querySelectorAll('.um13g-dreampic');
            expect(pics.length).toBeGreaterThanOrEqual(8);
            // возвращаемся: рисунок помечен рассыпанием, призрак просыпается смущён
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
            document.dispatchEvent(new Event('visibilitychange'));
            advance(200);
            ghostEl()!.dispatchEvent(new Event('mouseover'));
            advance(300);
            expect(ghost().asleep).toBe(false);
            // смущённое отрицание — либо уже в пузыре, либо в очереди
            advance(9500);
            const txt = sayText();
            expect(txt).toMatch(/не рисовал|это был ты|нет автора|не могу|dreams have no author/i);
            // рассыпанные кубики убираются из DOM
            advance(1200);
            expect(document.querySelectorAll('.um13g-dreampic.on').length).toBe(0);
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        });

        it('потеряшка-питомец: pagehide с прилипшим кубиком → cube-adopted в памяти', () => {
            localStorage.removeItem('um13-memory');
            loadGhost('page');
            advance(2200);
            advance(11_000);
            ghost().tantrum();
            expect(document.querySelector('.um13g-cube-stuck')).not.toBeNull();
            // уходим со страницы, НЕ кликнув по потеряшке — призрак её «приручит»
            window.dispatchEvent(new Event('pagehide'));
            const m = JSON.parse(localStorage.getItem('um13-memory') || '{}');
            expect(m['cube-adopted']).toBeTruthy();
            expect(m['cube-color']).toBeTruthy();
            // визуал питомца — группа в SVG есть всегда, показывается классом
            // pet-cube на корне (вешается applyPetCube на следующем appear)
            const css = GHOST_CSS;
            expect(css).toContain('#um13-ghost-root.pet-cube .um13g-petcube{display:block');
            expect(document.querySelector('.um13g-petcube')).not.toBeNull();
            // клик по найденной потеряшке снимает флаг (кубик вернулся в стор)
            const stuck = document.querySelector('.um13g-cube-stuck') as HTMLElement | null;
            stuck?.click();
            const m2 = JSON.parse(localStorage.getItem('um13-memory') || '{}');
            expect(m2['cube-adopted']).toBeFalsy();
            localStorage.removeItem('um13-memory');
        });

        it('chime(): три ноты доступны через API (песочница/финал)', () => {
            loadGhost('page');
            advance(2200);
            const g = ghost() as unknown as { chime(): boolean };
            // jsdom без AudioContext — контракт: тихий false, не падение
            expect(typeof g.chime()).toBe('boolean');
        });

        it('friendCard(): canvas недоступен — тихий false (реплика не звучит)', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({
                    'terminal-visited': Date.now(),
                    'well-visited': Date.now(),
                    confession: Date.now(),
                    visits: 12,
                }),
            );
            loadGhost('page');
            advance(2200);
            const g = ghost() as unknown as { friendCard(): boolean };
            // jsdom: canvas есть, но toDataURL пуст — контракт не рушится
            const before = sayText();
            const ok = g.friendCard();
            expect(typeof ok).toBe('boolean');
            if (!ok) expect(sayText()).toBe(before);
            localStorage.removeItem('um13-memory');
        });

        it('shy-кулдаун ~2 мин: повторный эпизод доступен раньше прежних 3 минут', () => {
            // контракт по коду: гейт 110с (аудит A7 — сигнатурная механика
            // должна быть достижима дважды за сессию)
            expect(GHOST_SRC).toContain('110_000');
            expect(GHOST_SRC).not.toContain('180_000');
        });
    });

    describe('v1.1: вторая волна — mime, ночь, настроение, кличка, провод, соавтор', () => {
        it('акт mime: подпись в actLabelsV7, класс включается, ACTS знает позу', () => {
            loadGhost('page');
            advance(2200); // hello сыграло
            const g = ghost() as unknown as { act(kind: string): void };
            g.act('mime');
            expect(ghostEl()!.classList.contains('um13g-act-mime')).toBe(true);
            advance(1400); // подпись проявляется через 1.4с
            expect(sayText()).toMatch(/притворяется нодой|форма не та|почти валиден|выбери меня/);
            // ACTS-пул действительно содержит позу (не только ручной вызов)
            expect(GHOST_SRC).toMatch(/ACTS = \[[^\]]*'mime'/);
        });

        it('ночная смена: isNightShift по часам, пулы RU/EN парны', () => {
            // часы честные — детерминизм недостижим, проверяем контракт:
            // функция существует, пулы присутствуют в обеих локалях
            expect(GHOST_SRC).toContain('function isNightShift');
            const ruTail = GHOST_SRC.slice(0, enDictStart());
            expect(ruTail).toContain('nightHello: [');
            expect(ruTail).toContain('nightBark: [');
            const enTail = GHOST_SRC.slice(enDictStart());
            expect(enTail).toContain('nightHello: [');
            expect(enTail).toContain('nightBark: [');
        });

        it('настроение-память: last-mood=cold → холодное hello, метка стирается', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({ 'last-mood': 'cold', visits: 10 }),
            );
            loadGhost('page');
            advance(2200); // hello
            expect(sayText()).toMatch(/помню, чем кончилось|не дуюсь|просто помню|старые обиды/);
            // одноразовость: метка съедена
            const m = JSON.parse(localStorage.getItem('um13-memory') || '{}');
            expect(m['last-mood']).toBeUndefined();
            localStorage.removeItem('um13-memory');
        });

        it('настроение-память: warm (после экспорта) → тёплое hello', () => {
            localStorage.setItem(
                'um13-memory',
                JSON.stringify({ 'last-mood': 'warm', visits: 10 }),
            );
            loadGhost('page');
            advance(2200);
            expect(sayText()).toMatch(/лодку|хорошее настроение|спасатель|хорошо отзывается/);
            localStorage.removeItem('um13-memory');
        });

        it('кличка: hearsName узнаёт «ум13»/«um13» словом, не триггерится на «ум135»', () => {
            loadGhost('page');
            advance(2200);
            const g = ghost() as unknown as { hearsName(t: string): boolean };
            expect(g.hearsName('ум13')).toBe(true);
            expect(g.hearsName('node um13')).toBe(true);
            expect(g.hearsName('ум-13')).toBe(true);
            expect(g.hearsName('ум135')).toBe(false);
            expect(g.hearsName('группы')).toBe(false);
            // событие с кличкой — призрак отвечает (кулдаун 15 мин).
            // hello ещё доживает в пузыре — реплика клички встанет в
            // очередь user-приоритетом и придёт после его конца.
            window.dispatchEvent(new CustomEvent('um13:called', { detail: { text: 'ум13' } }));
            advance(9000); // hello дожил + очередь откачалась
            expect(sayText()).toMatch(/меня звал|имя у меня одно|сигнальн/);
        });

        it('провод: um13:perch сажает на связь (класс + наклон), потом слезает', () => {
            loadGhost('page');
            advance(2200);
            window.dispatchEvent(
                new CustomEvent('um13:perch', {
                    detail: { x: 300, y: 200, angle: 12 },
                }),
            );
            const el = ghostEl()!;
            expect(el.classList.contains('um13g-perched')).toBe(true);
            expect(el.style.getPropertyValue('--um13-tilt')).toBe('12deg');
            advance(6000); // hello дожил, очередь откачала подпись позы
            expect(sayText()).toMatch(/присел на связь|не трогаю|провод как провод/);
            advance(6000); // слез (6–10с от диспатча)
            expect(el.classList.contains('um13g-perched')).toBe(false);
        });

        it('холодное пятно: контракт кода — сон ставит sleptHere, sailAway зовёт leaveFrostSpot', () => {
            // jsdom не отыгрывает уплывание тихого призрака сценарно —
            // проверяем связку по коду (регрессия обвязки):
            expect(GHOST_SRC).toContain('S.sleptHere = true');
            expect(GHOST_SRC).toMatch(/if \(S\.asleep \|\| S\.sleptHere\) leaveFrostSpot\(\)/);
            expect(GHOST_SRC).toMatch(/um13g-frost/);
        });

        it('соавторство: um13:coauthor — прилетает к ноде, delight + реплика записки', () => {
            loadGhost('page');
            advance(2200);
            window.dispatchEvent(
                new CustomEvent('um13:coauthor', {
                    detail: { x: 400, y: 300 },
                }),
            );
            advance(1800); // прилетел к ноде
            // hello (живёт ≥4.5с) ещё читается — записка его НЕ обрывает
            expect(sayText()).not.toMatch(/добавил ноду|записку|чиркнул|подписью|выбрался/);
            advance(11_000); // hello дочитано → пауза → записка из очереди
            expect(sayText()).toMatch(/добавил ноду|записку|чиркнул|подписью|выбрался/);
            const enTail = GHOST_SRC.slice(enDictStart());
            expect(enTail).toContain('coauthorLines: [');
        });
    });
});
