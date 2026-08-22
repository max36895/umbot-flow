import VariablePicker from '../../ui/VariablePicker';
import { t } from '../../../i18n';
import { Field } from './Field';

interface ResponseTextProps {
    value: string;
    onChange: (val: string) => void;
    label?: string;
    placeholder?: string;
}

/** Общее поле для текста ответа (с поддержкой переменных). */
export function ResponseText({
    value,
    onChange,
    label = 'props.responseText',
    placeholder = 'props.responseTextHelp',
}: ResponseTextProps) {
    return (
        <Field label={t(label)} help={t('tooltip.responseText')}>
            <VariablePicker
                value={value}
                onChange={onChange}
                rows={3}
                placeholder={t(placeholder)}
                className="w-full border-b border-outline bg-transparent px-3 py-2 text-sm text-fg placeholder-fg/35 transition-colors focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
            />
        </Field>
    );
}
