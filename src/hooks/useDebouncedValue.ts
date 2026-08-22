import { useEffect, useState } from 'react';

/**
 * Возвращает значение с задержкой: обновляется только когда `value`
 * не менялось в течение `delayMs`. Используется для дебаунса валидации —
 * при быстром вводе/перетаскивании тяжёлые вычисления запускаются реже.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}
