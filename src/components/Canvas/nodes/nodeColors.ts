import type { CSSProperties } from 'react';

/** Цветовые константы нод. Единый источник правды. */
export const NODE_COLORS = {
    command: { hex: '#00f0ff', rgb: '0,240,255' },
    welcome: { hex: '#22c55e', rgb: '34,197,94' },
    help: { hex: '#eab308', rgb: '234,179,8' },
    step: { hex: '#bc13fe', rgb: '188,19,254' },
    action: { hex: '#ff9d00', rgb: '255,157,0' },
    condition: { hex: '#ff0055', rgb: '255,0,85' },
    response: { hex: '#00ff9d', rgb: '0,255,157' },
    end: { hex: '#ef4444', rgb: '239,68,68' },
    start: { hex: '#22c55e', rgb: '34,197,94' },
    fallback: { hex: '#ff9d00', rgb: '255,157,0' },
} as const;

export type NodeTypeKey = keyof typeof NODE_COLORS;

/** Inline style для CSS-переменных цвета ноды. */
export function nodeColorVars(nodeType: NodeTypeKey): CSSProperties {
    const { hex, rgb } = NODE_COLORS[nodeType];
    return {
        '--node-color': `${hex}99`,
        '--node-ring': `${hex}4d`,
        '--node-hex': hex,
        '--node-rgb': rgb,
    } as CSSProperties;
}
