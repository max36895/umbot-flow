import VariablePicker from '../../ui/VariablePicker';
import { t } from '../../../i18n';
import { Field } from './Field';

interface TTSFieldProps {
    value: string;
    onChange: (val: string) => void;
}

/** Общее поле для TTS (многострочное). */
export function TTSField({ value, onChange }: TTSFieldProps) {
    return (
        <Field label={t('props.tts')} help={t('props.ttsHelp')}>
            <VariablePicker
                value={value}
                onChange={(val: string) => onChange(val || '')}
                rows={2}
                placeholder={t('props.ttsPlaceholder')}
                className="w-full border-b border-outline bg-transparent px-3 py-2 text-sm text-fg placeholder-fg/35 focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
            />
        </Field>
    );
}
