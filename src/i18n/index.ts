import ru from './ru';
import en from './en';

export type Locale = 'ru' | 'en';

const messages: Record<Locale, Record<string, string>> = { ru, en };

const STORAGE_KEY = 'umbot-flow-editor-locale';

let currentLocale: Locale = (() => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'ru' || stored === 'en') return stored;
    } catch {
        // Storage unavailable
    }
    return navigator.language.startsWith('ru') ? 'ru' : 'en';
})();

/**
 * Translate a key to the current locale.
 * @param key - Translation key (e.g. 'sidebar.command.label')
 * @returns Translated string, or the key itself as fallback
 */
export function t(key: string): string {
    return messages[currentLocale]?.[key] ?? messages.en[key] ?? key;
}

/**
 * Set the active locale and persist to localStorage.
 * @param locale - 'ru' or 'en'
 */
export function setLocale(locale: Locale): void {
    currentLocale = locale;
    try {
        localStorage.setItem(STORAGE_KEY, locale);
    } catch {
        // Storage unavailable
    }
}

/**
 * Get the current active locale.
 * @returns Current locale code
 */
export function getLocale(): Locale {
    return currentLocale;
}
