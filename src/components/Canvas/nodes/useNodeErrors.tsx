import { useMemo } from 'react';
import { useGraphValidationErrors } from '../../../hooks/useValidationDoc';
import { t } from '../../../i18n';

/**
 * Hook: возвращает Map<nodeId, errors[]> для всех нод с ошибками.
 * Использует общий useGraphValidationErrors — не дублирует построение doc.
 */
export function useNodeErrorsMap(): Map<string, string[]> {
    const errors = useGraphValidationErrors();

    return useMemo(() => {
        const map = new Map<string, string[]>();
        for (const err of errors) {
            if (!err.nodeId) continue;
            const arr = map.get(err.nodeId) ?? [];
            arr.push(err.message);
            map.set(err.nodeId, arr);
        }
        return map;
    }, [errors]);
}

/** Маленький бейдж-индикатор ошибок для отображения на ноде. */
export function NodeErrorsBadge({ errors }: { errors?: string[] }) {
    if (!errors || errors.length === 0) return null;
    return (
        <span
            title={errors.join('\n')}
            className="absolute -right-2 -top-2 z-sticky flex size-5 min-w-5 items-center justify-center rounded-full border-2 border-white/40 bg-error px-1 text-[10px] font-bold text-white shadow-glow-pink"
            aria-label={t('node.hasErrors')}
        >
            {errors.length}
        </span>
    );
}
