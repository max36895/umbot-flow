import { useMemo } from 'react';
import { useValidationErrors } from './useValidationDoc';

export type FieldErrorsMap = Map<string, string[] | Map<number, string[]>>;

/** Геттер для получения ошибок — принимает field и возвращает массив строк (без Map). */
export function getFieldErrorList(
    map: FieldErrorsMap,
    field: string,
): string[] | Map<number, string[]> | undefined {
    const val = map.get(field);
    if (Array.isArray(val)) return val;
    return undefined;
}

/** Геттер для error map конкретно для действий (actions) — возвращает Map<index, messages>. */
export function getActionErrorsMap(map: FieldErrorsMap): Map<number, string[]> | undefined {
    const val = map.get('actions:map');
    if (val instanceof Map) return val;
    return undefined;
}

/**
 * Hook: возвращает Map<fieldName, messages[]> для указанного узла.
 * Позволяет каждому полю панели свойств отобразить свои ошибки.
 * Для поля 'actions' дополнительно возвращается специальный ключ 'actions:map'
 * с Map<actionIndex, messages[]> — для подсветки конкретного блока действия.
 *
 * Используйте getFieldErrorList() для получения строковых ошибок,
 * getActionErrorsMap() — для получения Map действий.
 */
export function useNodeFieldErrors(nodeId: string | null): FieldErrorsMap {
    const errors = useValidationErrors();

    return useMemo(() => {
        const map = new Map<string, string[] | Map<number, string[]>>();
        if (!nodeId) return map;

        for (const err of errors) {
            if (err.nodeId !== nodeId) continue;
            const fieldName = err.field ?? '_general';

            // Для actions — дополнительно группируем по actionIndex
            if (fieldName === 'actions' && err.actionIndex !== undefined) {
                const existing = map.get('actions:map') as Map<number, string[]> | undefined;
                const actionMap = existing ?? new Map<number, string[]>();
                const arr = actionMap.get(err.actionIndex) ?? [];
                arr.push(err.message);
                actionMap.set(err.actionIndex, arr);
                map.set('actions:map', actionMap);
                // Также добавляем в общий список для обратной совместимости
                const general = (map.get('actions') as string[]) ?? [];
                general.push(err.message);
                map.set('actions', general);
                continue;
            }

            const arr = (map.get(fieldName) as string[]) ?? [];
            arr.push(err.message);
            map.set(fieldName, arr);
        }
        return map;
    }, [nodeId, errors]);
}
