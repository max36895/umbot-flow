import HelpButton from '../../ui/HelpButton';
import { NodeIcon } from '../../ui/NodeIcons';

interface FieldProps {
    label: string;
    children: React.ReactNode;
    help?: string;
    /** Тексты ошибок этого конкретного поля — отображаются под содержимым, а также подсвечивают ободок. */
    errors?: string[] | Map<number, string[]>;
    errorVisibility?: boolean;
}

/**
 * Общая обёртка для полей свойств.
 *
 * Подсветка ошибок работает ТОЛЬКО через класс контейнера — в DOM ничего не клонируется.
 * CSS смотрит на data-field-content и добавляет рамку ИМЕННО дочерним элементам этого блока.
 */
export function Field({ label, children, help, errors, errorVisibility = true }: FieldProps) {
    const correctError = errors instanceof Map ? errors.get(0) : errors;
    const hasError = errorVisibility && !!correctError && correctError.length > 0;

    return (
        <div className={`mb-5 ${hasError ? 'input-error-container' : ''}`}>
            <div className="mb-1.5 flex items-center gap-1">
                <label
                    className={`text-xs font-medium ${hasError ? 'text-error' : 'text-white/75'}`}
                >
                    {label}
                </label>
                {hasError && (
                    <span
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white"
                        title={correctError!.join('\n')}
                    >
                        !
                    </span>
                )}
                {help && <HelpButton content={help} />}
            </div>
            {/* Добавляем класс-цель только для содержимого (не лейбла) */}
            <div className="field-content">{children}</div>
            <div
                className={`mt-1.5 space-y-0.5 text-[10px] leading-snug text-error/90 transition-opacity ${
                    hasError ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden mt-0'
                }`}
                aria-hidden={!hasError}
            >
                {correctError?.map((err, i) => (
                    <p key={i} className="flex items-start gap-1">
                        <NodeIcon name="warning" size={10} className="mt-0.5 flex-shrink-0" />
                        <span>{err}</span>
                    </p>
                ))}
            </div>
        </div>
    );
}
