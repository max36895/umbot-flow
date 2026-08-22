import type { InputHTMLAttributes } from 'react';

const UNDERLINED_BASE =
    'w-full border-0 border-b border-fg/20 bg-transparent py-2 text-fg placeholder-fg/35 transition-colors focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none';

const BOXED_BASE =
    'w-full rounded border border-outline bg-fg/5 text-fg placeholder-fg/35 transition-colors focus:border-info focus:outline-none';

const SIZE_CLASS = {
    md: 'px-0 text-sm',
    sm: 'px-2 py-1 text-xs',
    xs: 'px-2 py-0.5 text-[11px]',
} as const;

const SIZE_BOXED_CLASS = {
    md: 'px-2.5 py-1.5 text-sm',
    sm: 'px-2 py-1 text-xs',
    xs: 'px-2 py-0.5 text-[11px]',
} as const;

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Визуальный вариант: подчёркнутый (по умолчанию в панелях свойств) или с рамкой */
    variant?: 'underlined' | 'boxed';
    /** Размер — влияет на padding и font-size */
    size?: 'md' | 'sm' | 'xs';
    /** Состояние ошибки — красная рамка */
    error?: boolean;
}

/**
 * Единое текстовое поле в стиле проекта.
 * Заменяет BASE_CLASS/INPUT_CLASS/ACTION_INPUT_CLASS/defaultInputClass — 15+ дублей.
 */
export function Input({
    variant = 'underlined',
    size = 'md',
    error = false,
    className = '',
    disabled,
    ...props
}: InputProps) {
    const base = variant === 'underlined' ? UNDERLINED_BASE : BOXED_BASE;
    const sizeCls = variant === 'underlined' ? SIZE_CLASS[size] : SIZE_BOXED_CLASS[size];
    const errorCls = error ? '!border-error shadow-glow-pink-lg' : '';
    return (
        <input
            type="text"
            className={`${base} ${sizeCls} ${errorCls} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
            disabled={disabled}
            {...props}
        />
    );
}
