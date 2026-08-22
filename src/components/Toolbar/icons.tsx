/**
 * SVG-иконки тулбара — единый стиль 16x16, stroke-based.
 * Вынесены из Toolbar.tsx для читаемости.
 */
import type { ReactNode } from 'react';

interface IconProps {
    children: ReactNode;
    stroke?: string;
    strokeWidth?: number;
}

function Icon({ children, stroke = 'currentColor', strokeWidth = 1.5 }: IconProps) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {children}
        </svg>
    );
}

export function IconUndo() {
    return (
        <Icon>
            <path d="M3 7h6a3 3 0 0 1 0 6H9" />
            <path d="M6 4L3 7l3 3" />
        </Icon>
    );
}

export function IconRedo() {
    return (
        <Icon>
            <path d="M13 7H7a3 3 0 0 0 0 6h1" />
            <path d="M10 4l3 3-3 3" />
        </Icon>
    );
}

export function IconNew() {
    return (
        <Icon>
            <rect x="3" y="2" width="10" height="12" rx="1" />
            <path d="M8 5v6M5 8h6" />
        </Icon>
    );
}

export function IconImport() {
    return (
        <Icon>
            <path d="M8 2v8M5 7l3 3 3-3" />
            <path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
        </Icon>
    );
}

export function IconExport() {
    return (
        <Icon>
            <path d="M8 10V2M5 5l3-3 3 3" />
            <path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
        </Icon>
    );
}

export function IconImage() {
    return (
        <Icon>
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <circle cx="5.5" cy="5.5" r="1" />
            <path d="M14 10l-3-3-7 7" />
        </Icon>
    );
}

export function IconChat({ stroke = 'rgba(0,0,0,0.7)' }: { stroke?: string } = {}) {
    return (
        <Icon stroke={stroke} strokeWidth={2}>
            <path d="M2 2h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3 3V3a1 1 0 0 1 1-1z" />
        </Icon>
    );
}

export function IconCheck({ stroke = 'rgba(0,0,0,0.7)' }: { stroke?: string } = {}) {
    return (
        <Icon stroke={stroke} strokeWidth={2}>
            <path d="M3 8l3 3 7-7" />
        </Icon>
    );
}

export function IconHelp() {
    return (
        <Icon>
            <circle cx="8" cy="8" r="6" />
            <path d="M6 6a2 2 0 1 1 2 2v1" />
            <circle cx="8" cy="12" r="0.5" fill="currentColor" />
        </Icon>
    );
}

export function IconMinimap() {
    return (
        <Icon>
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <rect x="4" y="4" width="3" height="3" rx="0.5" />
            <rect x="9" y="8" width="3" height="3" rx="0.5" />
        </Icon>
    );
}

export function IconSettings() {
    return (
        <Icon strokeWidth={1.2}>
            <path d="M6.58 2.27a1.25 1.25 0 0 1 1.84 0l.42.6a1.25 1.25 0 0 0 .9.42h.72a1.25 1.25 0 0 1 1.25 1.25v.72a1.25 1.25 0 0 0 .42.9l.6.42a1.25 1.25 0 0 1 0 1.84l-.6.42a1.25 1.25 0 0 0-.42.9v.72a1.25 1.25 0 0 1-1.25 1.25h-.72a1.25 1.25 0 0 0-.9.42l-.42.6a1.25 1.25 0 0 1-1.84 0l-.42-.6a1.25 1.25 0 0 0-.9-.42H4.5a1.25 1.25 0 0 1-1.25-1.25v-.72a1.25 1.25 0 0 0-.42-.9l-.6-.42a1.25 1.25 0 0 1 0-1.84l.6-.42a1.25 1.25 0 0 0 .42-.9v-.72A1.25 1.25 0 0 1 4.5 3.29h.72a1.25 1.25 0 0 0 .9-.42l.42-.6Z" />
            <circle cx="7.5" cy="7.5" r="2" />
        </Icon>
    );
}

export function IconMenu() {
    return (
        <Icon>
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
        </Icon>
    );
}

export function IconSun() {
    return (
        <Icon>
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
        </Icon>
    );
}

export function IconMoon() {
    return (
        <Icon>
            <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z" />
        </Icon>
    );
}
