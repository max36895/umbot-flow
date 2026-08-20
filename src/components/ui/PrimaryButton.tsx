import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Размер кнопки */
    size?: 'sm' | 'md';
    children: ReactNode;
}

const SIZE_CLASS = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
} as const;

/**
 * Градиентная primary-кнопка (фиолет → циан).
 * Заменяет 9 дублирующихся копий в HelpModal, BotSettingsModal, ExportDialog, AlertDialog, HelpButton.
 */
export function PrimaryButton({
    size = 'md',
    className = '',
    children,
    ...props
}: PrimaryButtonProps) {
    return (
        <button
            className={`rounded-lg bg-gradient-to-r from-accent to-info ${SIZE_CLASS[size]} text-white shadow-glow-cyan transition-all hover:shadow-glow-cyan-lg ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
