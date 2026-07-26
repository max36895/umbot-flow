import type { InputHTMLAttributes } from 'react';

const BASE_CLASS =
    'w-full border-0 border-b border-[rgba(255,255,255,0.2)] bg-transparent px-0 py-2 text-sm text-white placeholder-white/35 transition-colors focus:border-b-2 focus:border-[#00f0ff] focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Дополнительные CSS-классы */
    wrapperClassName?: string;
}

/** Однострочное текстовое поле в стиле проекта (underlined). */
export function TextInput({ className, disabled, ...props }: TextInputProps) {
    return (
        <input
            type="text"
            className={`${BASE_CLASS} ${disabled ? 'cursor-not-allowed text-white/50' : ''} ${className ?? ''}`}
            disabled={disabled}
            {...props}
        />
    );
}
