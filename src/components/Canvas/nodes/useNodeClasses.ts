import type { CSSProperties } from 'react';
import { NODE_COLORS, NODE_TYPES, nodeColorAlpha, type NodeTypeKey } from './nodeColors';

/** Цветовые константы нод. */
export { NODE_COLORS, NODE_TYPES, nodeColorAlpha };
export type { NodeTypeKey };

/**
 * Предвычисленные стили Handle (без glow) — по одному объекту на тип ноды.
 * Используются вместо инлайн-объектов, чтобы не создавать новый объект каждый рендер.
 */
export const HANDLE_STYLES: Record<NodeTypeKey, CSSProperties> = Object.fromEntries(
    NODE_TYPES.map((key) => [key, { backgroundColor: NODE_COLORS[key].cssVar }]),
) as Record<NodeTypeKey, CSSProperties>;

/** Предвычисленные стили Handle с glow (boxShadow) — для Step/Action/Condition/Response/терминалов. */
export const HANDLE_STYLES_GLOW: Record<NodeTypeKey, CSSProperties> = Object.fromEntries(
    NODE_TYPES.map((key) => [
        key,
        {
            backgroundColor: NODE_COLORS[key].cssVar,
            boxShadow: `0 0 8px ${nodeColorAlpha(key, 50)}`,
        },
    ]),
) as Record<NodeTypeKey, CSSProperties>;

/** Предвычисленные стили бейджа типа ноды (полупрозрачный фон). */
export const BADGE_STYLES: Record<NodeTypeKey, CSSProperties> = Object.fromEntries(
    NODE_TYPES.map((key) => [key, { backgroundColor: nodeColorAlpha(key, 25) }]),
) as Record<NodeTypeKey, CSSProperties>;

/**
 * Возвращает CSS-классы для ноды по состоянию.
 * Цвет задаётся отдельно через `getNodeStyles()` — здесь только поведенческие классы.
 */
export function getNodeClasses(
    _nodeType: NodeTypeKey,
    isSelected: boolean,
    isDimmed: boolean,
    isActivePreview: boolean,
    hasErrors = false,
): string {
    const dimmed = isDimmed ? ' node-dimmed' : '';
    const errorClass = hasErrors ? ' node-error' : '';

    if (isActivePreview) {
        return `node-hover rounded-xl px-4 py-3 node-active-pulse border-l-4 border-t border-r border-b${dimmed}${errorClass}`;
    }
    if (isSelected) {
        return `node-hover rounded-xl px-4 py-3 node-spotlight-active border-l-4 border-t border-r border-b${dimmed}${errorClass}`;
    }
    return `node-hover rounded-xl px-4 py-3${dimmed} border bg-surface backdrop-blur-xl border-l-4${errorClass}`;
}

/**
 * Возвращает inline стили для CSS-переменных цвета ноды.
 * Применять ТОЛЬКО на корневой div ноды: переменные каскадируются вниз к handles/badges.
 */
export function getNodeStyles(
    nodeType: NodeTypeKey,
    isSelected: boolean,
    isActivePreview: boolean,
): CSSProperties {
    const { cssVar } = NODE_COLORS[nodeType];
    const bgOpacity = isActivePreview ? 12 : isSelected ? 8 : 0;
    const borderOpacity = isSelected || isActivePreview ? 30 : 20;

    return {
        '--node-color': `color-mix(in srgb, ${cssVar} 60%, transparent)`,
        '--node-ring': `color-mix(in srgb, ${cssVar} 30%, transparent)`,
        borderColor:
            isSelected || isActivePreview ? cssVar : nodeColorAlpha(nodeType, borderOpacity),
        borderLeftColor: cssVar,
        backgroundColor: bgOpacity > 0 ? nodeColorAlpha(nodeType, bgOpacity) : undefined,
    } as CSSProperties;
}
