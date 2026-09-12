import type { FlowNodeData } from '../types/flow';
import { getLocale } from '../i18n';

/**
 * ═══════════════════════════════════════════════════════════════
 *  «UM-13 КРЕСТИТ НОДЫ» — пасхалка №7.
 * ═══════════════════════════════════════════════════════════════
 *
 * Когда пользователь добавляет команду с пустым именем, UM-13
 * иногда (1 раз из 3) сам «крестит» ноду — шёпотом в тосте:
 * «UM-13 назвал её {name}». Ноды получают характерные имена
 * из вселенной редактора. Работает с любым типом нод.
 *
 * Правила:
 *  • не трогает role-ноды (welcome/help/fallback)
 *  • имена — валидные идентификаторы (кириллица разрешена)
 *  • оригинальное имя не переписывается: только пустые
 */

/** Пул имён от UM-13 (RU/EN). Сортировка по типам нод. */
const NAMES_BY_TYPE: Record<string, { ru: string[]; en: string[] }> = {
    command: {
        ru: ['старт_разговора', 'ловец_слов', 'первый_контакт', 'мостик', 'гид', 'ловец_триггеров', 'главная_дверь'],
        en: ['start_talk', 'word_catcher', 'first_contact', 'bridge', 'guide', 'trigger_catcher', 'main_door'],
    },
    step: {
        ru: ['спроси_как_дела', 'выясни_имя', 'узнай_пожелания', 'допрос', 'мягкий_вопрос', 'уточнишка'],
        en: ['ask_how_are_you', 'learn_the_name', 'collect_wishes', 'interrogation', 'soft_question', 'clarifier'],
    },
    condition: {
        ru: ['развилка', 'кто_здесь', 'проверка_на_человечность', 'рубикон', 'толкатель_судеб', 'если_звёзды_сошлись'],
        en: ['fork', 'who_is_here', 'humanity_check', 'rubicon', 'fate_pusher', 'if_stars_align'],
    },
    response: {
        ru: ['тёплый_ответ', 'финальный_аккорд', 'прощание', 'победная_реплика', 'мудрое_резюме', 'выход_с_честью'],
        en: ['warm_reply', 'final_chord', 'farewell', 'winning_line', 'wise_summary', 'exit_with_grace'],
    },
    action: {
        ru: ['мелкая_магия', 'тёмный_рынок_переменных', 'вызов_в_пустоту', 'костяная_рука_api', 'пятый_элемент'],
        en: ['small_magic', 'variable_black_market', 'call_into_void', 'bone_hand_of_api', 'fifth_element'],
    },
    end: {
        ru: ['конец_света', 'точка_невозврата', 'финал_без_титров', 'последний_сбой', 'дверь_наружу'],
        en: ['end_of_world', 'point_of_no_return', 'credits_less_finale', 'last_crash', 'door_out'],
    },
};

/**
 * Придумывает имя для ноды; null — если тип неизвестен.
 * Уникальность: если имя уже занято другими нодами — берём следующее
 * свободное из пула (детерминированно, без повторов в одном флоу).
 */
export function um13NameFor(
    type: FlowNodeData['type'],
    takenNames?: Set<string>,
): string | null {
    const pool = NAMES_BY_TYPE[type];
    if (!pool) return null;
    const list = getLocale() === 'ru' ? pool.ru : pool.en;
    // Смещаем стартовый индекс случайно, чтобы пул не выдавал
    // одно и то же имя каждый раз (низкоэнтропийные среды)
    const start = Math.floor(Math.random() * list.length);
    for (let i = 0; i < list.length; i++) {
        const name = list[(start + i) % list.length];
        if (name && !takenNames?.has(name)) return name;
    }
    // весь пул занят — берём любой с суффиксом
    const base = list[start] ?? 'um13';
    return takenNames?.has(base) ? `${base}_${Date.now() % 1000}` : base;
}

/** Форматирует тост крещения. */
export function um13BaptismLine(name: string): string {
    return getLocale() === 'ru'
        ? `UM-13: шёпотом назвал её «${name}»`
        : `UM-13: quietly named it "${name}"`;
}
