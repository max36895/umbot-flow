import type { InputHTMLAttributes } from 'react';
import { Input } from './Input';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Дополнительные CSS-классы */
    wrapperClassName?: string;
}

/**
 * @deprecated Используйте Input из './Input' — единый компонент с вариантами.
 * Сохранён для обратной совместимости.
 */
export function TextInput(props: TextInputProps) {
    return <Input {...props} />;
}
