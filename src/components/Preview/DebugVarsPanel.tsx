import { t } from '../../i18n';

interface DebugVarsPanelProps {
    variables: Record<string, string>;
    waitingForStep: string | null;
}

/** Отладочная панель переменных — нижняя часть ChatPreview. */
export function DebugVarsPanel({ variables, waitingForStep }: DebugVarsPanelProps) {
    return (
        <div className="border-t border-outline-variant bg-surface-panel-docked/90 p-2 text-[10px]">
            <div className="mb-1 font-bold text-white/40">{t('preview.debugVars')}</div>
            {Object.keys(variables).length === 0 ? (
                <div className="text-white/30">{t('userData.empty')}</div>
            ) : (
                <div className="max-h-24 overflow-y-auto">
                    {Object.entries(variables).map(([key, val]) => (
                        <div key={key} className="flex gap-2">
                            <span className="font-mono text-info">{key}:</span>
                            <span className="truncate text-white/60">{val}</span>
                        </div>
                    ))}
                </div>
            )}
            {waitingForStep && (
                <div className="mt-1 text-warning">
                    {t('preview.waiting')}: {waitingForStep}
                </div>
            )}
        </div>
    );
}
