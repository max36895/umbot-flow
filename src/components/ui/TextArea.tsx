import type { TextareaHTMLAttributes } from 'react';

const UNDERLINED_BASE =
    'w-full border-0 border-b border-white/20 bg-transparent py-2 text-white placeholder-white/35 transition-colors focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none resize-none';

const SIZE_CLASS = {
    md: 'px-0 text-sm',
    sm: 'px-2 text-xs',
    xs: 'px-2 text-[10px]',
} as const;

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Визуальный вариант */
    variant?: 'underlined';
    /** Размер */
    size?: 'md' | 'sm' | 'xs';
    /** Состояние ошибки */
    error?: boolean;
}

/**
 * Многострочное текстовое поле в стиле проекта.
 */
export function TextArea({
    variant = 'underlined',
    size = 'md',
    error = false,
    className = '',
    rows = 3,
    ...props
}: TextAreaProps) {
    const errorCls = error ? '!border-error' : '';
    void variant; // зарезервировано для будущих вариантов
    return (
        <textarea
            rows={rows}
            className={`${UNDERLINED_BASE} ${SIZE_CLASS[size]} ${errorCls} ${className}`}
            {...props}
        />
    );
}
