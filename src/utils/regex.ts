/**
 * Global regex constants for the Flow.
 * Created once, reused across all files for better performance.
 */

// === Template variable patterns ===

/** Matches {{variable}} template syntax */
export const TEMPLATE_VAR_REGEX = /\{\{(\w+)\}\}/g;

// === ChatPreview patterns ===

// Согласие/отказ — ровно те же паттерны, что Text.isSayTrue/isSayFalse в umbot:
// превью обязано отвечать как сгенерированный бот. Ключевое слово — отдельное слово
// («да», но не «когда»/«абракадабра»); «ок», «ага», «хорошо» согласием в umbot не считаются.
const WORD_START = '(?<![a-zа-яё0-9_])';
const WORD_END = '(?![a-zа-яё0-9_])';

/** Согласие пользователя (Text.isSayTrue umbot) */
export const IS_SAY_TRUE_REGEX = new RegExp(
    `${WORD_START}(?:да|конечно)${WORD_END}|${WORD_START}(?:соглас|подтвер)`,
    'iu',
);

/** Отказ пользователя (Text.isSayFalse umbot) */
export const IS_SAY_FALSE_REGEX = new RegExp(`${WORD_START}(?:нет|неа|не)${WORD_END}`, 'iu');

/**
 * Ссылка — как Text.isUrl umbot: строка начинается с http(s):// и разбирается как URL.
 * Регистр важен (как в umbot): ввод пользователя umbot проверяет уже в нижнем регистре,
 * поэтому вызывающий код приводит ввод к нижнему регистру сам, а значение переменной — нет.
 */
export function isUrl(text: string): boolean {
    if (!text.startsWith('https://') && !text.startsWith('http://')) return false;
    try {
        new URL(text);
        return true;
    } catch {
        return false;
    }
}

// === Validator patterns ===

/** Validates JS identifier (letter/$/_ + letters/digits/$/_, cannot start with digit) */
export const JS_IDENTIFIER_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

// === Template generator patterns ===

/** Characters that need escaping in regex */
export const REGEX_ESCAPE_CHARS = /[.*+?^${}()|[\]\\]/g;

/** Matches non-Unicode letters/numbers (for sanitizeIdentifier) */
export const NON_UNICODE_CHARS = /[^\p{L}\p{N}_$]/gu;

/** Matches leading digit (for sanitizeIdentifier prefix) */
export const LEADING_DIGIT_REGEX = /^(\p{N})/u;

// === Package name patterns ===

/** Matches non-alphanumeric characters except hyphens */
export const NON_ALPHANUMERIC_HYPHEN = /[^a-z0-9-]/gi;

/** Matches multiple consecutive hyphens */
export const MULTIPLE_HYPHENS = /-+/g;

/** Matches leading/trailing hyphens */
export const LEADING_TRAILING_HYPHENS = /^-+|-+$/g;
