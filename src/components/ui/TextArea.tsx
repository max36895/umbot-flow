import type { TextareaHTMLAttributes } from 'react';

const BASE_CLASS =
    'w-full border-0 border-b border-[rgba(255,255,255,0.2)] bg-transparent px-0 py-2 text-sm text-white placeholder-white/35 transition-colors focus:border-b-2 focus:border-[#00f0ff] focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none resize-none';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Количество строк по умолчанию */
    rows?: number;
}

/** Многострочное текстовое поле в стиле проекта (underlined, без ресайза). */
export function TextArea({ className, rows = 3, ...props }: TextAreaProps) {
    return <textarea rows={rows} className={`${BASE_CLASS} ${className ?? ''}`} {...props} />;
}
