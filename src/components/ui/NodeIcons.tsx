/**
 * SVG-иконки типов нод — единый стиль stroke-based, как в Toolbar/icons.tsx.
 * Заменяют эмодзи для консистентного вида на всех платформах.
 */
import type { ReactNode } from 'react';

export type NodeIconName =
    | 'welcome'
    | 'help'
    | 'fallback'
    | 'command'
    | 'response'
    | 'step'
    | 'action'
    | 'condition'
    | 'end'
    | 'start'
    | 'set_variable'
    | 'random_number'
    | 'http_request'
    | 'gear'
    | 'refresh'
    | 'copy'
    | 'play'
    | 'trash'
    | 'chevronLeft'
    | 'chevronRight'
    | 'chevronDown'
    | 'panelDocked'
    | 'panelFloating'
    | 'close'
    | 'warning'
    | 'menu'
    | 'link'
    | 'pin'
    | 'check'
    | 'cross';

interface NodeIconProps {
    name: NodeIconName;
    /** Размер в px (ширина и высота). По умолчанию 14. */
    size?: number;
    strokeWidth?: number;
    className?: string;
}

function Base({
    children,
    size = 14,
    strokeWidth = 1.5,
    className,
}: {
    children: ReactNode;
    size: number;
    strokeWidth: number;
    className?: string;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const PATHS: Record<NodeIconName, ReactNode> = {
    // Ракета — welcome
    welcome: (
        <>
            <path d="M8 1.5c2 1.5 3 4 3 6.5 0 1.5-.5 3-1.5 4.5h-3C5.5 11 5 9.5 5 8c0-2.5 1-5 3-6.5z" />
            <circle cx="8" cy="6.5" r="1.2" />
            <path d="M5 10.5L3.5 12M11 10.5L12.5 12M6.5 12.5L6 14.5M9.5 12.5l.5 2" />
        </>
    ),
    // Вопрос в круге — help
    help: (
        <>
            <circle cx="8" cy="8" r="6" />
            <path d="M6.2 6a1.8 1.8 0 1 1 2.6 1.6c-.6.3-.8.7-.8 1.4" />
            <circle cx="8" cy="11.5" r="0.4" fill="currentColor" />
        </>
    ),
    // Перечёркнутый круг — fallback (не распознано)
    fallback: (
        <>
            <circle cx="8" cy="8" r="6" />
            <path d="M4 4l8 8" />
        </>
    ),
    // Речевой пузырь — command
    command: (
        <>
            <path d="M2.5 3h11a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H6l-3.5 3V4a1 1 0 0 1 1-1z" />
        </>
    ),
    // Рупор — response
    response: (
        <>
            <path d="M2 6v4h2l6 3V3L4 6H2z" />
            <path d="M12.5 5.5a3 3 0 0 1 0 5" />
        </>
    ),
    // Карандаш — step
    step: (
        <>
            <path d="M11.5 2.5l2 2L5 13l-2.7.7L3 11l8.5-8.5z" />
            <path d="M9.5 4.5l2 2" />
        </>
    ),
    // Молния — action
    action: (
        <>
            <path d="M9 1.5L3.5 9H7l-1 5.5L11.5 7H8l1-5.5z" />
        </>
    ),
    // Развилка — condition
    condition: (
        <>
            <path d="M8 2v3M8 5L4 9v5M8 5l4 4v5" />
            <circle cx="4" cy="14" r="0.5" fill="currentColor" />
            <circle cx="12" cy="14" r="0.5" fill="currentColor" />
        </>
    ),
    // Квадрат — end
    end: (
        <>
            <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" />
        </>
    ),
    // Треугольник — start
    start: (
        <>
            <path d="M5 3l8 5-8 5V3z" />
        </>
    ),
    // Дискета — set_variable
    set_variable: (
        <>
            <path d="M3 2h8l3 3v9H3V2z" />
            <path d="M5 2v4h5V2M5 14v-5h6v5" />
        </>
    ),
    // Кубик — random_number
    random_number: (
        <>
            <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
            <circle cx="5.5" cy="5.5" r="0.6" fill="currentColor" />
            <circle cx="10.5" cy="5.5" r="0.6" fill="currentColor" />
            <circle cx="8" cy="8" r="0.6" fill="currentColor" />
            <circle cx="5.5" cy="10.5" r="0.6" fill="currentColor" />
            <circle cx="10.5" cy="10.5" r="0.6" fill="currentColor" />
        </>
    ),
    // Глобус — http_request
    http_request: (
        <>
            <circle cx="8" cy="8" r="6" />
            <path d="M2 8h12M8 2c-2 2-2 10 0 12M8 2c2 2 2 10 0 12" />
        </>
    ),
    // Шестерёнка — gear
    gear: (
        <>
            <circle cx="8" cy="8" r="2" />
            <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" />
        </>
    ),
    // Обновление — refresh
    refresh: (
        <>
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
            <path d="M13.5 2.5v3h-3" />
        </>
    ),
    // Копия — copy
    copy: (
        <>
            <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
            <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
        </>
    ),
    // Плей — play
    play: (
        <>
            <path d="M5 3l8 5-8 5V3z" />
        </>
    ),
    // Корзина — trash
    trash: (
        <>
            <path d="M2.5 4h11M5.5 4V2.5h5V4M4 4l.7 9.5h6.6L12 4M6.5 7v4M9.5 7v4" />
        </>
    ),
    // Шеврон влево — chevronLeft
    chevronLeft: (
        <>
            <path d="M10 4l-4 4 4 4" />
        </>
    ),
    // Шеврон вправо — chevronRight
    chevronRight: (
        <>
            <path d="M6 4l4 4-4 4" />
        </>
    ),
    // Шеврон вниз — chevronDown
    chevronDown: (
        <>
            <path d="M4 6l4 4 4-4" />
        </>
    ),
    // Панель закреплена справа — panelDocked
    panelDocked: (
        <>
            <rect x="2" y="3" width="12" height="10" rx="1" />
            <path d="M10 3v10" />
        </>
    ),
    // Плавающая панель — panelFloating
    panelFloating: (
        <>
            <rect x="2" y="3" width="8" height="10" rx="1" />
            <path d="M10 6l4-2v8l-4-2" />
        </>
    ),
    // Крестик — close
    close: (
        <>
            <path d="M4 4l8 8M12 4l-8 8" />
        </>
    ),
    // Треугольник с восклицательным знаком — warning
    warning: (
        <>
            <path d="M8 2L14.5 13.5H1.5L8 2z" />
            <path d="M8 6.5v3" />
            <circle cx="8" cy="11.5" r="0.4" fill="currentColor" />
        </>
    ),
    // Три полоски — menu
    menu: (
        <>
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
        </>
    ),
    // Звено цепи — link
    link: (
        <>
            <path d="M6.5 9.5l3-3" />
            <path d="M7.5 4.5l1.5-1.5a2.5 2.5 0 0 1 3.5 3.5L11 8" />
            <path d="M8.5 11.5L7 13a2.5 2.5 0 0 1-3.5-3.5L5 8" />
        </>
    ),
    // Канцелярская кнопка — pin
    pin: (
        <>
            <path d="M9.5 2.5l4 4-2 .5-2 2 .5 2-4-4 2-.5 2-2-.5-2z" />
            <path d="M6 10l-3.5 3.5" />
        </>
    ),
    // Галочка — check
    check: (
        <>
            <path d="M3 8.5l3.5 3.5L13 4.5" />
        </>
    ),
    // Крестик (тонкий) — cross
    cross: (
        <>
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
        </>
    ),
};

export function NodeIcon({ name, size = 14, strokeWidth = 1.5, className }: NodeIconProps) {
    return (
        <Base size={size} strokeWidth={strokeWidth} className={className}>
            {PATHS[name]}
        </Base>
    );
}
