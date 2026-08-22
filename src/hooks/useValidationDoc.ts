import { useMemo } from 'react';
import useFlowStore from '../store/flowStore';
import { validate, validateGraph, type ValidationError } from '../utils/validator';
import type { FlowDocument, FlowNodeData, FlowEdge } from '../types/flow';
import { useLocale } from '../i18n/hook';
import { useDebouncedValue } from './useDebouncedValue';

/** Задержка дебаунса валидации — при быстром вводе/перетаскивании тяжёлые проверки запускаются реже. */
const VALIDATION_DEBOUNCE_MS = 200;

/**
 * Единый источник валидационной проекции.
 * Заменяет три независимых построения doc в useNodeFieldErrors, useNodeErrors, StatusBar.
 * Возвращает мемоизированные результаты, пересчёт только при реальном изменении nodes/edges/metadata.
 */
export function useValidationDoc(): FlowDocument {
    const nodes = useFlowStore((s) => s.nodes);
    const edges = useFlowStore((s) => s.edges);
    const metadata = useFlowStore((s) => s.metadata);

    return useMemo(
        () => ({
            ...metadata,
            nodes: nodes.map((n) => n.data as FlowNodeData),
            edges: edges
                .filter((e) => e.data)
                .map(
                    (e): FlowEdge => ({
                        from: e.source,
                        to: e.target,
                        type: ((e.data as { edgeType?: string })?.edgeType ??
                            'next') as FlowEdge['type'],
                        label: (e.data as { label?: string })?.label,
                    }),
                ),
        }),
        [nodes, edges, metadata],
    );
}

/** Полная валидация (schema + graph) — для StatusBar и useNodeFieldErrors. */
export function useValidationErrors(): ValidationError[] {
    const doc = useValidationDoc();
    // Дебаунс: при быстром вводе/перетаскивании не гоняем AJV на каждый символ
    const debouncedDoc = useDebouncedValue(doc, VALIDATION_DEBOUNCE_MS);
    // Сообщения валидатора локализованы — пересчитываем при смене языка
    const locale = useLocale();
    return useMemo(() => validate(debouncedDoc), [debouncedDoc, locale]);
}

/** Только graph-валидация (без schema) — для useNodeErrors (бейджи на нодах). */
export function useGraphValidationErrors(): ValidationError[] {
    const doc = useValidationDoc();
    const debouncedDoc = useDebouncedValue(doc, VALIDATION_DEBOUNCE_MS);
    const locale = useLocale();
    return useMemo(() => validateGraph(debouncedDoc), [debouncedDoc, locale]);
}
