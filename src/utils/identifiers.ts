import { JS_IDENTIFIER_REGEX, NON_UNICODE_CHARS, LEADING_DIGIT_REGEX } from './regex';

/** Проверяет, является ли строка валидным JS-идентификатором (для имён переменных userData). */
export function isValidJSIdentifier(name: string): boolean {
    return JS_IDENTIFIER_REGEX.test(name);
}

/**
 * Санитизация имени блока в валидный JS-идентификатор — единый источник
 * истины для генератора и валидатора. Изменение этой функции меняет
 * сгенерированные имена шагов, поэтому валидатор коллизий должен
 * использовать ровно её.
 */
export function sanitizeIdentifier(name: string): string {
    if (!name) return 'unnamed';
    return String(name).replace(NON_UNICODE_CHARS, '_').replace(LEADING_DIGIT_REGEX, '_$1');
}
