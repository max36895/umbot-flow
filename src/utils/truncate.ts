/**
 * Обрезает строку до максимальной длины, добавляя "..." при превышении.
 * Используется для превью текста на нодах.
 */
export function truncatePreview(text: string | undefined, fallback: string, maxLen = 50): string {
    if (!text) return fallback;
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
}
