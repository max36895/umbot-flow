import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface HrProps {
    /** Дополнительный класс */
    className?: string;
}

/** Горизонтальный разделитель в едином стиле проекта. Заменяет 11 копий `<hr/>`. */
export function Hr({ className = '' }: HrProps) {
    return <hr className={`border-outline-variant ${className}`} />;
}

interface PresetPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Выбран ли пресет (neon-стиль) */
    selected?: boolean;
    /** Гостевой стиль (прозрачный) */
    ghost?: boolean;
    children: ReactNode;
}

/**
 * Кнопка-таб пресета. Заменяет 6+ дублей в ActionBlockEditor, ConditionProps, ConditionEditor, VariablePicker.
 */
export function PresetPill({
    selected = false,
    ghost = false,
    className = '',
    children,
    ...props
}: PresetPillProps) {
    const cls = ghost
        ? 'rounded-full border border-outline bg-transparent px-2.5 py-0.5 text-[11px] text-fg/55 transition-colors hover:border-fg/30 hover:text-fg/60'
        : selected
          ? 'rounded-full border border-info/30 bg-info/15 px-2.5 py-0.5 text-[11px] text-info transition-colors hover:bg-info/25 hover:shadow-glow-cyan'
          : 'rounded-full border border-transparent bg-fg/5 px-2.5 py-0.5 text-[11px] text-fg/55 transition-colors hover:bg-fg/10 hover:text-fg/60';
    return (
        <button className={`${cls} ${className}`} {...props}>
            {children}
        </button>
    );
}

interface DashedAddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Текст кнопки */
    label: string;
}

/** Dashed-кнопка "+ Добавить". Заменяет 3 копии в ButtonEditor/CardEditor. */
export function DashedAddButton({ label, className = '', ...props }: DashedAddButtonProps) {
    return (
        <button
            className={`w-full rounded-xl border-2 border-dashed border-outline py-2 text-xs text-fg/55 transition-colors hover:border-info/30 hover:bg-info/5 hover:text-info ${className}`}
            {...props}
        >
            {label}
        </button>
    );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Текст-подсказка */
    title: string;
    /** Размер паддинга */
    size?: 'sm' | 'md';
    /** Состояние активности (подсветка) */
    active?: boolean;
    children: ReactNode;
}

/** Кнопка-иконка ghost-стиль в панелях. Заменяет 6 дублей в PropertiesPanel. */
export function IconButton({
    title,
    size = 'md',
    active = false,
    className = '',
    children,
    ...props
}: IconButtonProps) {
    return (
        <button
            title={title}
            className={`rounded-lg ${size === 'md' ? 'p-2' : 'p-1.5'} transition-colors ${
                active
                    ? 'bg-info/15 text-info'
                    : 'text-fg/55 hover:bg-fg/10 hover:text-fg/70'
            } ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
