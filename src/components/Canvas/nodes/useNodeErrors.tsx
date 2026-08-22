import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useValidationStore from '../../../store/validationStore';
import { t } from '../../../i18n';

/**
 * Hook: возвращает массив ошибок для конкретного узла из централизованного validationStore.
 * Валидация выполняется ОДИН раз в ValidationSync, а не в каждом узле.
 * useShallow предотвращает ре-рендер если содержимое ошибок не изменилось.
 */
export function useNodeErrors(nodeId: string): string[] | undefined {
    return useValidationStore(useShallow((s) => s.nodeErrors[nodeId]));
}

/** Маленький бейдж-индикатор ошибок для отображения на ноде. */
export const NodeErrorsBadge = memo(function NodeErrorsBadge({
    errors,
}: {
    errors?: string[];
}) {
    if (!errors || errors.length === 0) return null;
    return (
        <span
            title={errors.join('\n')}
            className="absolute -right-2 -top-2 z-sticky flex size-5 min-w-5 items-center justify-center rounded-full border-2 border-white/40 bg-error px-1 text-[11px] font-bold text-white shadow-glow-pink"
            aria-label={t('node.hasErrors')}
        >
            {errors.length}
        </span>
    );
});
