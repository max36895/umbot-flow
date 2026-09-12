/**
 * ═══════════════════════════════════════════════════════════════
 *  ПАМЯТЬ UM-13 — общий localStorage между всеми пасхалками.
 * ═══════════════════════════════════════════════════════════════
 *
 * Все страницы сайта живут в одном origin, значит localStorage общий.
 * Это позволяет вселенной «запоминать», где был игрок:
 *  • well-visited     — дошёл до дна колодца 404
 *  • well-rescued     — спасал ключи в колодце (счётчик)
 *  • terminal-visited — был в терминале UM-13
 *  • terminal-chat    — болтал с UM-13 свободно
 *  • confession       — прошёл исповедальню
 *  • queue-waited     — терпел очередь в приёмной
 *  • skynet-won       — собрал СКУНЕТ
 *  • um13-taken       — забрал UM-13 с собой (финальный флаг)
 *
 * API идентичен inline-версии для статических страниц (um13Memory в
 * secret.html / confession.html / queue.html / 404): те же ключи,
 * те же значения — иначе смысл теряется.
 */

const KEY = 'um13-memory';

interface Um13Memory {
    'well-visited'?: number; // timestamp первого дна
    'well-rescued'?: number; // всего спасено ключей (сумма)
    'terminal-visited'?: number;
    'terminal-chat'?: number;
    'confession'?: number;
    'queue-waited'?: number;
    'skynet-won'?: number;
    'pizza-courier'?: number; // визиты пицца-бота из приёмной
    'konami-games'?: number; // прогрессия игр редактора (угадайка → КНБ → побег → заговор)
    'um13-taken'?: number; // забрал UM-13 с собой (финальный флаг)
    'humanName'?: string; // имя человека (знакомство в терминале) — читает призрак
    'first-met'?: number; // timestamp первой встречи с призраком — годовщины
    [k: string]: number | string | undefined;
}

/** Числовые флаги — для um13Mark/um13Add/um13Get (строчные поля — accessors ниже). */
export type Um13NumberFlag =
    | 'well-visited'
    | 'well-rescued'
    | 'terminal-visited'
    | 'terminal-chat'
    | 'confession'
    | 'confession-seen'
    | 'queue-waited'
    | 'skynet-won'
    | 'pizza-courier'
    | 'konami-games'
    | 'um13-taken'
    | 'first-met'
    | 'visits'
    | 'coauthor-visit'; // соавторство уже было в ЭТОМ визите (не проекте)

function read(): Um13Memory {
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Um13Memory;
    } catch {
        return {};
    }
}

function write(m: Um13Memory): void {
    try {
        localStorage.setItem(KEY, JSON.stringify(m));
    } catch {
        /* приватный режим — память спит */
    }
}

/** Отметить событие (stamp = timestamp последнего раза). */
export function um13Mark(flag: Um13NumberFlag): void {
    const m = read();
    m[flag] = Date.now();
    write(m);
}

/** Инкрементный счётчик (для спасённых ключей и подобных). */
export function um13Add(flag: Um13NumberFlag, n = 1): void {
    const m = read();
    m[flag] = (Number(m[flag]) || 0) + n;
    write(m);
}

/** Прочитать значение флага (0 = не было). */
export function um13Get(flag: Um13NumberFlag): number {
    const v = read()[flag];
    return typeof v === 'number' ? v : 0;
}

/** Три главные локации пройдены? (для арки «резервная копия») */
export function um13TrailComplete(): boolean {
    const m = read();
    return !!(m['terminal-visited'] && m['well-visited'] && m['confession']);
}

/**
 * Имя человека (знакомство в терминале) — строковое поле общей памяти.
 * Призрак-спутник читает его с каждой страницы для персональных реплик;
 * терминал пишет. Обрезка и валидация — здесь, чтобы страницы не расходились.
 */
export function um13HumanName(): string {
    const n = read()['humanName'];
    return typeof n === 'string' ? n.trim().slice(0, 24) : '';
}

export function um13SetHumanName(name: string): void {
    const m = read();
    m['humanName'] = name.trim().slice(0, 24);
    write(m);
}

/** Первая встреча с призраком — годовщины считаются от неё. */
export function um13FirstMet(): number {
    const v = read()['first-met'];
    return typeof v === 'number' ? v : 0;
}

/** Дашборд памяти — для реплик «я помню». */
export function um13All(): Um13Memory {
    return read();
}
