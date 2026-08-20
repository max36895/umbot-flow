import { JS_IDENTIFIER_REGEX } from './regex';

/** Проверяет, является ли строка валидным JS-идентификатором (для имён переменных userData). */
export function isValidJSIdentifier(name: string): boolean {
    return JS_IDENTIFIER_REGEX.test(name);
}
