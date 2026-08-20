import type { CSSProperties } from 'react';
import { NODE_COLORS, type NodeTypeKey } from './nodeColors';

/** Цветовые константы нод. */
export { NODE_COLORS };
export type { NodeTypeKey };

/**
 * Возвращает CSS-классы для ноды по состоянию.
 * Цвет задаётся отдельно через `nodeColorVars()` — здесь только поведенческие классы.
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
        return `node-hover rounded-xl px-4 py-3 transition-all duration-300 node-active-pulse border-l-4 border-t border-r border-b${dimmed}${errorClass}`;
    }
    if (isSelected) {
        return `node-hover rounded-xl px-4 py-3 transition-all duration-300 node-spotlight-active border-l-4 border-t border-r border-b${dimmed}${errorClass}`;
    }
    return `node-hover rounded-xl px-4 py-3 transition-all duration-200${dimmed} border bg-surface backdrop-blur-xl border-l-4${errorClass}`;
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
    const { hex, rgb } = NODE_COLORS[nodeType];
    const bgOpacity = isActivePreview ? 0.12 : isSelected ? 0.08 : 0;
    const borderOpacity = isSelected || isActivePreview ? 0.3 : 0.2;

    return {
        '--node-color': `${hex}99`,
        '--node-ring': `${hex}4d`,
        '--node-hex': hex,
        '--node-rgb': rgb,
        borderColor: isSelected || isActivePreview ? `${hex}` : `rgba(${rgb},${borderOpacity})`,
        borderLeftColor: hex,
        backgroundColor: bgOpacity > 0 ? `rgba(${rgb},${bgOpacity})` : undefined,
    } as CSSProperties;
}
