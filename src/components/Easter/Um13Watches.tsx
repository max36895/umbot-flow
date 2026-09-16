import { useEffect, useRef } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import useValidationStore from '../../store/validationStore';
import { getLocale } from '../../i18n';
import { um13CoauthorDue, um13LeaveNode } from '../../utils/um13Coauthor';

/**
 * ═══════════════════════════════════════════════════════════════
 *  «UM-13 НАБЛЮДАЕТ» — пассивные пасхалки редактора.
 * ═══════════════════════════════════════════════════════════════
 *
 * Реакции призрака на действия пользователя — все с юмором,
 * все эксплуатируют уже написанный лор:
 *
 *  1. 5×Ctrl+Z при пустой undo-истории → «я тоже так сюда попал.
 *     не увлекайся» (канон: биография UM-13 начинается с Ctrl+Z).
 *  2. Превью открыто + бот ждёт ввода + минута тишины → «скажи ему
 *     что-нибудь. он же ждёт. я знаю, каково это». Пустой fallback →
 *     отдельная реплика.
 *  3. Ревью флоу по кнопке-подсказке: если валидатор нашёл тупики —
 *     UM-13 предлагает отчёт (не навязчиво, тостом).
 *  4. saveState === 'error' (запись в localStorage не прошла даже
 *     после эвикции) → призрак прилетает с АДРЕСНОЙ тревогой
 *     («экспортируй — я подержу дверь») через UM13Ghost.warn().
 *  5. 50+ нод на холсте → гордость сторожа, один раз за сессию.
 *
 * v7 «Призрак-ревьюер» — призрак смотрит на РАБОТУ человека:
 *  6. Красная нода валидации (первая за минуту) → прилетает к ноде
 *     (um13:review, экранные координаты) — «у этой ноды нет выхода.
 *     я знаю, каково это». Ошибка валидации теперь сообщается
 *     персонажем, которому не всё равно.
 *  7. Человек назвал ноду (не дефолт) → изредка комментирует имя
 *     (um13:review-name с {name} — реплики в L.reviewNameLines).
 *  8. Пустой холст 3+ минуты → «ну хоть одну ноду. для меня»
 *     (um13:review-empty — реплики в L.reviewEmptyLines).
 *  9. Деструктивный ConfirmDialog открыт → призрак закрывает лицо
 *     подолом (confirm-scary); отмена/закрытие → выдыхает.
 * 10. Светлая тема → «ослеп»: янтарные очки (um13:theme).
 *
 * Реплики сценариев 6–8 живут в самом призраке (um13-ghost.js):
 * здесь только события/тосты — единый источник, без дублей строк.
 *
 * Молчаливый контракт: не чаще 1 реплики в N секунд, никогда поверх
 * открытых диалогов. warn() имеет собственный кулдаун внутри призрака.
 */

const COOLDOWN_MS = 25_000;

/**
 * Цвета кубиков призрака (um13-ghost.js NODE_COLORS) по типу ноды —
 * для «ловца удалённых нод». Гекс дублируется осознанно: призрак — ванильный
 * файл без импортов, AGENTS.md-токены здесь бы не разрешались на моменте
 * исполнения. При смене палитры нод — синхронизировать с um13-ghost.js.
 */
const GHOST_NODE_COLORS = {
    command: '#00f0ff',
    step: '#bc13fe',
    condition: '#ff0055',
    action: '#ff9d00',
    response: '#00ff9d',
    end: '#eab308',
    welcome: '#22c55e',
    help: '#eab308',
    fallback: '#ff9d00',
    start: '#22c55e',
} as const;

interface GhostApi {
    warn(kind: string): void;
    react(event: string): void;
    /** Регистрация реакций события (пул реплик/настроение) — как страницы. */
    on(
        event: string,
        payload: string[] | { mood?: string; lines: string[]; fx?: 'confetti' },
    ): void;
    /** Смена языка призрака на лету (следующие реплики — новый язык). */
    setLocale(locale: 'ru' | 'en'): void;
    /** v1.1 «кличка»: слышит ли призрак этот текст (um13/ум13 словом). */
    hearsName?(text: string): boolean;
    /** v1.1: состояние для «провода» и соавторства (гейты видимости). */
    readonly visible?: boolean;
    readonly asleep?: boolean;
}

function ghost(): GhostApi | undefined {
    return (window as unknown as { UM13Ghost?: GhostApi }).UM13Ghost;
}

/** Экранная позиция DOM-ноды React Flow (призрак летит к цели). */
function nodeScreenPos(nodeId: string): { x: number; y: number } | null {
    const el = document.querySelector(`[data-id="${nodeId}"]`) as HTMLElement | null;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export default function Um13Watches() {
    const lastToastRef = useRef(0);
    const undoStreakRef = useRef(0);
    const previewSilentSinceRef = useRef<number | null>(null);
    const reviewOfferedRef = useRef(false);
    const milestoneSaidRef = useRef(false);
    const lastReviewedErrorRef = useRef<number>(0);
    const lastNodeNameRef = useRef<string>('');
    const emptyCanvasSinceRef = useRef<number | null>(null);
    const confirmOpenRef = useRef(false);

    /** UM-13 говорит — если кулдаун позволяет. */
    const say = (ru: string, en: string) => {
        const now = Date.now();
        if (now - lastToastRef.current < COOLDOWN_MS) return;
        if (useUiStore.getState().botSettingsOpen || useUiStore.getState().helpOpen) return;
        lastToastRef.current = now;
        useUiStore.getState().showToast(`UM-13: ${getLocale() === 'ru' ? ru : en}`);
    };

    // ── 1. Ctrl+Z в пустоту: 5 отмен без истории ──
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const mod = e.ctrlKey || e.metaKey;
            if (!mod || e.key.toLowerCase() !== 'z' || e.shiftKey) return;
            const target = e.target as HTMLElement | null;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
            if (useUiStore.getState().previewOpen) return;
            if (useFlowStore.getState().nodes.length > 0) return; // только пустой холст
            undoStreakRef.current += 1;
            if (undoStreakRef.current >= 5) {
                undoStreakRef.current = 0;
                say(
                    'я тоже так сюда попал. кто-то нажал Ctrl+Z слишком много раз. не увлекайся.',
                    'that is how I ended up here too. someone pressed Ctrl+Z too many times. do not make the same mistake.',
                );
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // ── 2. Превью: бот ждёт, пользователь молчит минуту ──
    useEffect(() => {
        const interval = window.setInterval(() => {
            const ui = useUiStore.getState();
            if (!ui.previewOpen) {
                previewSilentSinceRef.current = null;
                return;
            }
            if (previewSilentSinceRef.current === null) {
                previewSilentSinceRef.current = Date.now();
                return;
            }
            if (Date.now() - previewSilentSinceRef.current < 60_000) return;
            previewSilentSinceRef.current = Date.now();
            const doc = useFlowStore.getState().toJSON();
            const hasEmptyFallback = !doc.fallback?.text?.trim();
            if (hasEmptyFallback) {
                say(
                    'он молчит, когда не понял. я тоже так умею. не разрешай ему.',
                    'he goes silent when confused. I can do that too. do not let him.',
                );
            } else {
                say(
                    'скажи ему что-нибудь. он же ждёт. я знаю, каково это.',
                    'say something to him. he is waiting. I know how that feels.',
                );
            }
        }, 10_000);
        return () => window.clearInterval(interval);
    }, []);

    // ── 3. Ревью флоу: если есть тупики и ни разу не предлагали ──
    useEffect(() => {
        const interval = window.setInterval(() => {
            if (reviewOfferedRef.current) return;
            const state = useFlowStore.getState();
            if (state.nodes.length < 4) return;
            if (useUiStore.getState().previewOpen) return;
            // Тупик: нода не end/command-role и без исходящих рёбер
            const outEdges = new Set(state.edges.map((e) => e.source));
            const roleTypes = new Set(['welcome', 'help', 'fallback']);
            const deadEnds = state.nodes.filter((n) => {
                const data = n.data as { role?: string; type?: string };
                if (n.type === 'end') return false;
                if (data.type === 'command' && data.role && roleTypes.has(data.role)) return false;
                return !outEdges.has(n.id);
            });
            if (deadEnds.length >= 2) {
                reviewOfferedRef.current = true;
                say(
                    `у тебя ${deadEnds.length} тупика. я ненавижу тупики. кнопка «Проверить» всё покажет.`,
                    `${deadEnds.length} dead ends. I hate dead ends. the "Validate" button will show them all.`,
                );
            }
        }, 15_000);
        return () => window.clearInterval(interval);
    }, []);

    // ── 4. saveState='error': призрак прилетает с адресной тревогой ──
    // Запись не прошла даже после эвикции — человек может потерять флоу.
    // Говорит сам призрак (warn: прилетел-предупредил-ушёл), не тост.
    useEffect(() => {
        let prev = useFlowStore.getState().saveState;
        const unsub = useFlowStore.subscribe((state) => {
            if (state.saveState === prev) return;
            const wasError = prev === 'error';
            prev = state.saveState;
            if (state.saveState === 'error') {
                ghost()?.warn(wasError ? 'save-error-retry' : 'save-error');
            }
        });
        return unsub;
    }, []);

    // ── 5. 50+ нод: гордость сторожа хранилища, один раз за сессию ──
    useEffect(() => {
        const unsub = useFlowStore.subscribe((state) => {
            if (milestoneSaidRef.current || state.nodes.length < 50) return;
            milestoneSaidRef.current = true;
            say(
                'пятьдесят нод. ты строишь вселенную. я дежурю рядом — вдруг волна.',
                'fifty nodes. you are building a universe. I stand guard — in case of the wave.',
            );
        });
        return unsub;
    }, []);

    // ── 6. Призрак-ревьюер (v7): красная нода → призрак прилетает к ней ──
    // Первая ошибка валидации не раньше минуты тишины реплик, дальше
    // не чаще раза в 2 минуты. Призрак НЕ материализуется из ничего
    // (editor-режим), но если он уже на экране — летит прямо к ноде.
    useEffect(() => {
        let prevErrorCount = 0;
        const unsub = useValidationStore.subscribe((state) => {
            const ids = Object.keys(state.nodeErrors);
            if (ids.length === 0 || ids.length === prevErrorCount) return;
            prevErrorCount = ids.length;
            const now = Date.now();
            if (now - lastReviewedErrorRef.current < 120_000) return;
            const ui = useUiStore.getState();
            if (ui.previewOpen || ui.botSettingsOpen || ui.helpOpen || ui.exportDialogOpen) return;
            lastReviewedErrorRef.current = now;
            const firstId = ids[0];
            if (!firstId) return;
            const pos = nodeScreenPos(firstId);
            if (!pos) return;
            // реплики живут в самом призраке (L.reviewLines в um13-ghost.js):
            // единый источник — здесь только событие, без дублей строк
            ghost()?.react('flow-review');
            window.dispatchEvent(new CustomEvent('um13:review', { detail: pos }));
        });
        return unsub;
    }, []);

    // ── 7. Ревьюер имён (v7): человек назвал ноду → иногда комментирует ──
    useEffect(() => {
        let firstNameCheck = true;
        const unsub = useFlowStore.subscribe((state) => {
            // пропускаем первый кадр (загрузка документа — не событие)
            if (firstNameCheck) {
                firstNameCheck = false;
                return;
            }
            if (Math.random() > 0.2) return; // редко: 1 к 5 переименованиям
            if (useUiStore.getState().previewOpen) return;
            const named = state.nodes
                .map((n) => (n.data as { name?: string } | undefined)?.name)
                .filter(
                    (name): name is string =>
                        !!name &&
                        !/^(command|step|condition|action|response|end)(_\d+)?$/.test(name),
                );
            const latest = named[named.length - 1];
            if (!latest || latest === lastNodeNameRef.current) return;
            lastNodeNameRef.current = latest;
            const now = Date.now();
            if (now - lastToastRef.current < COOLDOWN_MS) return;
            lastToastRef.current = now;
            // реплики — в призраке (L.reviewNameLines): событие с именем
            window.dispatchEvent(new CustomEvent('um13:review-name', { detail: { name: latest } }));
        });
        return unsub;
    }, []);

    // ── 8. Пустой холст 3+ минуты (v7): «ну хоть одну ноду. для меня» ──
    useEffect(() => {
        const interval = window.setInterval(() => {
            const state = useFlowStore.getState();
            if (state.nodes.length > 0) {
                emptyCanvasSinceRef.current = null;
                return;
            }
            if (emptyCanvasSinceRef.current === null) {
                emptyCanvasSinceRef.current = Date.now();
                return;
            }
            if (Date.now() - emptyCanvasSinceRef.current < 180_000) return;
            emptyCanvasSinceRef.current = Date.now(); // раз в 3 минуты, не чаще
            // реплики — в призраке (L.reviewEmptyLines): только событие
            window.dispatchEvent(new CustomEvent('um13:review-empty'));
        }, 15_000);
        return () => window.clearInterval(interval);
    }, []);

    // ── 8.5 Ловец удалённых нод (v7.2): человек удаляет ноду — призрак
    // ловит гаснущий кубик в подол и бережёт («…этот я подержу»).
    // Призрак, который хранит то, что ты выбрасываешь. Ловим только
    // реальные удаления (diff списка id), не сброс документа:
    // массовое исчезновение (очистка/загрузка) — не ловится.
    useEffect(() => {
        // карта id → тип ноды (для цвета кубика при удалении)
        const typesOf = (nodes: { id: string; type?: string | null }[]) =>
            new Map<string, string>(nodes.map((n) => [n.id, n.type ?? ''] as const));
        let prevIds = new Set(useFlowStore.getState().nodes.map((n) => n.id));
        let prevTypes = typesOf(useFlowStore.getState().nodes);
        const unsub = useFlowStore.subscribe((state) => {
            const nextIds = new Set(state.nodes.map((n) => n.id));
            if (nextIds.size >= prevIds.size) {
                // что-то добавилось/переименование id — обновляем кэш тихо
                if (nextIds.size !== prevIds.size || state.nodes.some((n) => !prevIds.has(n.id))) {
                    prevIds = nextIds;
                    prevTypes = typesOf(state.nodes);
                }
                return;
            }
            const removed = [...prevIds].filter((id) => !nextIds.has(id));
            // единичное удаление (Delete на ноде / крестик) — ловим;
            // массовое (очистка флоу) — для призрака это «волна»: молчит
            if (removed.length !== 1) {
                prevIds = nextIds;
                prevTypes = typesOf(state.nodes);
                return;
            }
            const removedId = removed[0] as string;
            const type = prevTypes.get(removedId);
            prevIds = nextIds;
            prevTypes = typesOf(state.nodes);
            const color =
                type && type in GHOST_NODE_COLORS
                    ? GHOST_NODE_COLORS[type as keyof typeof GHOST_NODE_COLORS]
                    : undefined;
            (
                window as unknown as {
                    UM13Ghost?: { catchNode(c?: string): void };
                }
            ).UM13Ghost?.catchNode(color);
        });
        return unsub;
    }, []);

    // ── 9. Страх за игрока (v7): деструктивный ConfirmDialog ──
    // Открыт «новый проект» (сотрёт всё) — призрак закрывает лицо
    // подолом. Закрыт без подтверждения — выдыхает. Подтверждение —
    // молчит: человек решил, мир изменился.
    useEffect(() => {
        // confirmNewOpen живёт в локальном стейте Toolbar — оттуда не
        // достучаться, поэтому тихий DOM-детектор: ConfirmDialog рендерит
        // модалку с кнопкой «Подтвердить» (инвариант №7: все модалки —
        // через единый ui/Modal, у него есть [role=dialog]).
        const modalWatcher = new MutationObserver(() => {
            const g = ghost();
            if (!g) return;
            const modal = document.querySelector('[role="dialog"]');
            const isConfirm = !!modal?.textContent?.match(/подтвердить|confirm/i);
            if (modal && isConfirm && !confirmOpenRef.current) {
                confirmOpenRef.current = true;
                g.react('confirm-scary');
            } else if (!modal && confirmOpenRef.current) {
                confirmOpenRef.current = false;
                g.react('confirm-relief');
            }
        });
        modalWatcher.observe(document.body, { childList: true, subtree: true });
        return () => modalWatcher.disconnect();
    }, []);

    // ── 10. Светлая тема (v7): «ослеп» — призрак надевает очки ──
    // Реплики живут в призраке (L.lightLines в um13-ghost.js: слушатель
    // um13:theme сам их скажет) — здесь только событие, без дублей строк
    useEffect(() => {
        const unsubTheme = useUiStore.subscribe((state, prev) => {
            if (state.theme === prev.theme) return;
            if (state.theme === 'light') {
                window.dispatchEvent(new CustomEvent('um13:theme', { detail: { theme: 'light' } }));
            }
        });
        return unsubTheme;
    }, []);

    // ── 11. Локаль: призрак говорит на языке редактора ──
    // uiStore.locale сменился (кнопка RU/EN в тулбаре) — призрак
    // переключает реплики на лету (без перезагрузки: setLocale
    // меняет LOCALE в um13-ghost.js, новые реплики — новый язык).
    useEffect(() => {
        let prevLocale = useUiStore.getState().locale;
        const unsub = useUiStore.subscribe((state) => {
            if (state.locale === prevLocale) return;
            prevLocale = state.locale;
            ghost()?.setLocale(state.locale);
        });
        // первичная синхронизация: хранилище могло восстановить локаль,
        // отличную от um13-locale (например, другой браузер-дефолт)
        ghost()?.setLocale(useUiStore.getState().locale);
        return unsub;
    }, []);

    // ── 12. Кличка (v1.1): человек назвал ноду «ум13»/«um13» — призрак
    // слышит имя. Детектор живёт в призраке (hearsName — единый
    // источник регулярок), здесь только событие. Кулдаун 15 мин —
    // внутри самого призрака (called._lastAt), здесь не дублируем.
    useEffect(() => {
        let firstNameCheck = true;
        const unsub = useFlowStore.subscribe((state) => {
            if (firstNameCheck) {
                firstNameCheck = false;
                return;
            }
            const g = ghost();
            if (!g?.hearsName) return;
            // последняя переименованная нода с кличкой
            const named = state.nodes
                .map((n) => (n.data as { name?: string } | undefined)?.name ?? '')
                .filter((name) => g.hearsName!(name));
            const latest = named[named.length - 1];
            if (!latest || latest === lastNodeNameRef.current) return;
            lastNodeNameRef.current = latest;
            window.dispatchEvent(new CustomEvent('um13:called', { detail: { text: latest } }));
        });
        return unsub;
    }, []);

    // ── 13. Провод (v1.1): призрак уже на холсте (editor-прилёт сыграл
    // или page-режим) и есть рёбра — изредка садится на связь. Точка —
    // середина случайного <path> рёбра React Flow (getPointAtLength),
    // угол — касательная. Угол в градусах для --um13-tilt.
    useEffect(() => {
        const interval = window.setInterval(() => {
            if (Math.random() > 0.06) return; // редко: пусть будет сюрпризом
            const ui = useUiStore.getState();
            if (ui.previewOpen || ui.botSettingsOpen || ui.helpOpen || ui.exportDialogOpen) return;
            const g = ghost();
            if (!g || !g.visible || g.asleep) return;
            const paths = Array.from(
                document.querySelectorAll<SVGPathElement>('.react-flow .react-flow__edge-path'),
            );
            const path = paths[Math.floor(Math.random() * paths.length)];
            if (!path || typeof path.getTotalLength !== 'function') return;
            const len = path.getTotalLength();
            if (len < 80) return;
            const point = path.getPointAtLength(len / 2);
            const ahead = path.getPointAtLength(Math.min(len, len / 2 + 20));
            // svg-координаты React Flow = экранные (viewport у панели не трансформирован
            // в нашем сетапе, но честно берём getBoundingClientRect самого svg на сдвиг)
            const svg = path.ownerSVGElement;
            if (!svg) return;
            const r = svg.getBoundingClientRect();
            const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
            window.dispatchEvent(
                new CustomEvent('um13:perch', {
                    detail: { x: r.left + point.x, y: r.top + point.y, angle: Math.round(angle) },
                }),
            );
        }, 15_000);
        return () => window.clearInterval(interval);
    }, []);

    // ── 14. СОАВТОР (v1.1, финал): доверие нажито (25+ визитов или
    // um13-taken) + призрак спит на холсте + флоу живой (4+ нод) —
    // однажды за проект UM-13 сам добавляет Response-ноду-записку.
    // Полная симметрия вселенной: он приносил игры — теперь оставляет
    // записку. Undo честен, экспорт уносит её в продакшн.
    useEffect(() => {
        const interval = window.setInterval(() => {
            if (Math.random() > 0.5) return; // когда решит — решит сам
            const g = ghost();
            if (!g || !g.visible || !g.asleep) return;
            const state = useFlowStore.getState();
            if (state.nodes.length < 4) return;
            if (!um13CoauthorDue()) return;
            const id = um13LeaveNode();
            if (!id) return;
            const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
            const pos = el
                ? {
                      x: el.getBoundingClientRect().left + el.offsetWidth / 2,
                      y: el.getBoundingClientRect().top,
                  }
                : null;
            if (pos) {
                window.dispatchEvent(new CustomEvent('um13:coauthor', { detail: pos }));
            }
            // тост-признание: призрак честен с человеком с первой секунды
            useUiStore
                .getState()
                .showToast(
                    getLocale() === 'ru'
                        ? 'UM-13: я добавил кое-что. одну ноду. извини. можно я останусь тут?'
                        : 'UM-13: i added something. one node. sorry. may i stay here?',
                );
        }, 20_000);
        return () => window.clearInterval(interval);
    }, []);

    return null;
}
