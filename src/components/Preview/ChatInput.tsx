import { t, tf } from '../../i18n';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    /** Имя переменной шага, которого ждём (для placeholder) */
    waitingForVarName?: string;
}

/** Поле ввода + кнопка отправки в ChatPreview. */
export function ChatInput({ value, onChange, onSend, waitingForVarName }: ChatInputProps) {
    return (
        <div className="flex items-center gap-2 border-t border-outline-variant p-2">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSend()}
                placeholder={
                    waitingForVarName !== undefined
                        ? tf('preview.waitingPlaceholder', { var: waitingForVarName })
                        : t('preview.placeholder')
                }
                className="min-w-0 flex-1 rounded-lg border border-glass-border bg-white/5 px-3 py-1.5 text-sm text-white/90 placeholder-white/30 focus:border-info focus:outline-none"
            />
            <button
                onClick={onSend}
                className="flex-shrink-0 rounded-lg bg-gradient-to-r from-accent to-info px-3 py-1.5 text-sm text-white shadow-glow-cyan hover:shadow-glow-cyan-lg"
            >
                {t('preview.send')}
            </button>
        </div>
    );
}
