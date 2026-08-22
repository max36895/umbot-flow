import { Field } from './Field';
import { t } from '../../../i18n';

interface VariableConfigProps {
    /** Имя переменной */
    fieldName: string;
    onFieldNameChange: (val: string) => void;
    /** Пресеты для быстрого выбора */
    presets?: { labelKey: string; value: string }[];
    /** Ошибки валидации — показываются под полем и подсвечивают ободок. */
    errors?: string[] | Map<number, string[]>;
}

/** Статичный набор пресетов по умолчанию (не создаёт новый массив на каждом рендере). */
const DEFAULT_PRESETS: VariableConfigProps['presets'] = [
    { labelKey: 'preset.userName', value: 'userName' },
    { labelKey: 'preset.email', value: 'email' },
    { labelKey: 'preset.phone', value: 'phone' },
];

/**
 * Общий компонент для конфигурации переменной (имя + пресеты + опционально комментарий).
 * Используется в Command, Step и Action.
 *
 * Важно: default-параметр должен быть стабильной ссылкой (не создавать новый массив
 * на каждый рендер) — иначе поле перерендеривается на каждый родительский рендер,
 * а если родитель имеет hasError → CSS-класс ошибки мигает/прилипает на всех полях.
 */
export function VariableConfig({
    fieldName,
    onFieldNameChange,
    errors,
    presets = DEFAULT_PRESETS,
}: VariableConfigProps) {
    return (
        <div className="space-y-1.5">
            {/* Имя переменной */}
            <Field label={t('action.field')} help={t('tooltip.field')} errors={errors}>
                <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => onFieldNameChange(e.target.value)}
                    placeholder={t('action.field')}
                    className="w-full border-0 border-b border-outline bg-transparent px-0 py-2 text-sm text-fg placeholder-fg/35 transition-colors focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
                />
            </Field>

            {/* Пресеты — неоновые кнопки */}
            {presets && presets.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {presets.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => onFieldNameChange(preset.value)}
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                                fieldName === preset.value
                                    ? 'border-info/40 bg-info/15 text-info shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                                    : 'border-info/20 bg-transparent text-info/50 hover:border-info/35 hover:bg-info/[0.08] hover:text-info'
                            }`}
                        >
                            {preset.value}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
