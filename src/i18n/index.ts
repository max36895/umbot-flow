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

// Слушатели смены locale — используем react-компонентам
type LocaleListener = () => void;
const listeners = new Set<LocaleListener>();

export function subscribeLocale(listener: LocaleListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Translate a key to the current locale.
 */
export function t(key: string): string {
    return messages[currentLocale]?.[key] ?? messages.en[key] ?? key;
}

/**
 * Translate with parameter interpolation: tf('key', { name: 'x' }) заменяет {name} в тексте.
 */
export function tf(key: string, params: Record<string, string | number>): string {
    let result = t(key);
    for (const [k, v] of Object.entries(params)) {
        result = result.split(`{${k}}`).join(String(v));
    }
    return result;
}

export function setLocale(locale: Locale): void {
    if (currentLocale === locale) return;
    currentLocale = locale;
    try {
        localStorage.setItem(STORAGE_KEY, locale);
    } catch {
        // Storage unavailable
    }
    listeners.forEach((l) => l());
}

export function getLocale(): Locale {
    return currentLocale;
}
