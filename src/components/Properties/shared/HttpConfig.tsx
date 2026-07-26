import { Field } from './Field';
import { t } from '../../../i18n';

interface HttpConfigProps {
    method?: string;
    onMethodChange: (val: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE') => void;
    url: string;
    onUrlChange: (val: string) => void;
    body?: string;
    onBodyChange?: (val: string) => void;
    saveResponseTo?: string;
    onSaveResponseToChange: (val: string) => void;
}

/** HTTP-методы, которые допускают тело запроса. */
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

/**
 * Общий компонент для настройки HTTP-запроса.
 * Используется в ActionProps и ActionEditor.
 */
export function HttpConfig({
    method,
    onMethodChange,
    url,
    onUrlChange,
    body,
    onBodyChange,
    saveResponseTo,
    onSaveResponseToChange,
}: HttpConfigProps) {
    const showBody = BODY_METHODS.has(method ?? 'GET');

    return (
        <div className="space-y-2">
            <Field label={t('props.httpMethod')}>
                <select
                    value={method ?? 'GET'}
                    onChange={(e) =>
                        onMethodChange(
                            e.target.value as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
                        )
                    }
                    className="w-full border-0 border-b border-[rgba(255,255,255,0.2)] bg-transparent px-0 py-2 text-sm text-white/80 focus:border-b-2 focus:border-[#00f0ff] focus:outline-none"
                >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                </select>
            </Field>

            <Field label={t('props.httpUrl')}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    placeholder="https://api.example.com"
                    className="w-full border-0 border-b border-[rgba(255,255,255,0.2)] bg-transparent px-0 py-2 text-sm text-white placeholder-white/35 transition-colors focus:border-b-2 focus:border-[#00f0ff] focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
                />
            </Field>

            {showBody && onBodyChange && (
                <Field label={t('props.httpBody')}>
                    <textarea
                        value={body ?? ''}
                        onChange={(e) => onBodyChange(e.target.value)}
                        placeholder='{"key": "value"}'
                        rows={3}
                        className="w-full border-0 border-b border-[rgba(255,255,255,0.2)] bg-transparent px-0 py-2 text-sm font-mono text-white placeholder-white/35 transition-colors focus:border-b-2 focus:border-[#00f0ff] focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none resize-none"
                    />
                </Field>
            )}

            <Field label={t('props.httpSaveTo')}>
                <input
                    type="text"
                    value={saveResponseTo ?? ''}
                    onChange={(e) => onSaveResponseToChange(e.target.value)}
                    placeholder={t('action.saveResponseTo')}
                    className="w-full border-0 border-b border-[rgba(255,255,255,0.2)] bg-transparent px-0 py-2 text-sm text-white placeholder-white/35 transition-colors focus:border-b-2 focus:border-[#00f0ff] focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
                />
            </Field>
        </div>
    );
}
