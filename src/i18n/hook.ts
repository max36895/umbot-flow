import { useSyncExternalStore } from 'react';
import { subscribeLocale, getLocale, t as tBase, type Locale } from './index';

/**
 * Реактивный t() для React-компонентов.
 * Все компоненты, использующие useT() — перерендерятся при смене locale.
 */
export function useT(): (key: string) => string {
    useSyncExternalStore(subscribeLocale, getLocale);
    return tBase;
}

/**
 * Реактивный доступ к текущей locale.
 */
export function useLocale(): Locale {
    return useSyncExternalStore(subscribeLocale, getLocale);
}
