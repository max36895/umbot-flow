import type { CSSProperties } from 'react';

/** Цветовые константы нод. */
export const NODE_COLORS = {
    command: { hex: '#00f0ff', rgb: '0,240,255' },
    welcome: { hex: '#22c55e', rgb: '34,197,94' },
    help: { hex: '#eab308', rgb: '234,179,8' },
    step: { hex: '#bc13fe', rgb: '188,19,254' },
    action: { hex: '#ff9d00', rgb: '255,157,0' },
    condition: { hex: '#ff0055', rgb: '255,0,85' },
    response: { hex: '#00ff9d', rgb: '0,255,157' },
    end: { hex: '#ef4444', rgb: '239,68,68' },
} as const;

export type NodeTypeKey = keyof typeof NODE_COLORS;

/** Возвращает CSS-классы для ноды по состоянию. */
export function getNodeClasses(
    _nodeType: NodeTypeKey,
    isSelected: boolean,
    isDimmed: boolean,
    isActivePreview: boolean,
): string {
    const dimmed = isDimmed ? ' node-dimmed' : '';

    if (isActivePreview) {
        return `node-hover rounded-xl px-4 py-3 transition-all duration-300 node-active-pulse border-l-4 border-t border-r border-b${dimmed}`;
    }
    if (isSelected) {
        return `node-hover rounded-xl px-4 py-3 transition-all duration-300 node-spotlight-active border-l-4 border-t border-r border-b${dimmed}`;
    }
    return `node-hover rounded-xl px-4 py-3 transition-all duration-200${dimmed} border bg-[rgba(30,30,35,0.8)] backdrop-blur-xl border-l-4`;
}

/** Возвращает inline стили border/background для конкретного состояния ноды. */
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
        borderColor: isSelected || isActivePreview ? `${hex}` : `rgba(${rgb},${borderOpacity})`,
        borderLeftColor: hex,
        backgroundColor: bgOpacity > 0 ? `rgba(${rgb},${bgOpacity})` : 'rgba(30,30,35,0.8)',
    } as CSSProperties;
}
