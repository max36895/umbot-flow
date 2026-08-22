import { useEffect, useMemo } from 'react';
import { useGraphValidationErrors } from '../../hooks/useValidationDoc';
import useValidationStore from '../../store/validationStore';

/**
 * Компонент-синхронизатор: выполняет graph-валидацию ОДИН раз
 * и записывает результат в validationStore.
 * Рендерится один раз внутри FlowCanvas.
 */
export default function ValidationSync() {
    const errors = useGraphValidationErrors();
    const setNodeErrors = useValidationStore((s) => s.setNodeErrors);

    const errorsMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        for (const err of errors) {
            if (!err.nodeId) continue;
            const arr = map[err.nodeId] ?? [];
            arr.push(err.message);
            map[err.nodeId] = arr;
        }
        return map;
    }, [errors]);

    useEffect(() => {
        setNodeErrors(errorsMap);
    }, [errorsMap, setNodeErrors]);

    return null;
}
