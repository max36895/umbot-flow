import { Field } from './Field';
import { t } from '../../../i18n';

interface VariableConfigProps {
    /** Имя переменной */
    fieldName: string;
    onFieldNameChange: (val: string) => void;
    /** Пресеты для быстрого выбора */
    presets?: { labelKey: string; value: string }[];
}

/**
 * Общий компонент для конфигурации переменной (имя + пресеты + опционально комментарий).
 * Используется в Command, Step и Action.
 */
export function VariableConfig({
    fieldName,
    onFieldNameChange,
    presets = [
        { labelKey: 'preset.userName', value: 'userName' },
        { labelKey: 'preset.email', value: 'email' },
        { labelKey: 'preset.phone', value: 'phone' },
    ],
}: VariableConfigProps) {
    return (
        <div className="space-y-1.5">
            {/* Имя переменной */}
            <Field label={t('action.field')} help={t('tooltip.field')}>
                <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => onFieldNameChange(e.target.value)}
                    placeholder={t('action.field')}
                    className="w-full border-0 border-b border-[rgba(255,255,255,0.2)] bg-transparent px-0 py-2 text-sm text-white placeholder-white/35 transition-colors focus:border-b-2 focus:border-[#00f0ff] focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
                />
            </Field>

            {/* Пресеты — неоновые кнопки */}
            {presets.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {presets.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => onFieldNameChange(preset.value)}
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] transition-colors ${
                                fieldName === preset.value
                                    ? 'border-[rgba(0,240,255,0.4)] bg-[rgba(0,240,255,0.15)] text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                                    : 'border-[rgba(0,240,255,0.2)] bg-transparent text-[#00f0ff]/50 hover:border-[rgba(0,240,255,0.35)] hover:bg-[rgba(0,240,255,0.08)] hover:text-[#00f0ff]'
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
