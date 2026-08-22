/** Все типы нод, для которых определён цвет. */
export const NODE_TYPES = [
    'command',
    'welcome',
    'help',
    'step',
    'action',
    'condition',
    'response',
    'end',
    'start',
    'fallback',
] as const;

export type NodeTypeKey = (typeof NODE_TYPES)[number];

/**
 * Цветовые константы нод. Единый источник правды.
 *
 * Цвета заданы CSS-переменными (--node-*), которые определены в index.css
 * отдельно для тёмной и светлой темы. В тёмной теме это неон, в светлой —
 * более тёмные читаемые варианты. Компоненты НЕ должны хардкодить hex.
 */
export const NODE_COLORS: Record<NodeTypeKey, { cssVar: string }> = Object.fromEntries(
    NODE_TYPES.map((type) => [type, { cssVar: `var(--node-${type})` }]),
) as Record<NodeTypeKey, { cssVar: string }>;

/** Цвет ноды с прозрачностью через color-mix (адаптируется к теме). */
export function nodeColorAlpha(type: NodeTypeKey, percent: number): string {
    return `color-mix(in srgb, ${NODE_COLORS[type].cssVar} ${percent}%, transparent)`;
}
