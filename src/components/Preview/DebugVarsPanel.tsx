import { t } from '../../i18n';

interface DebugVarsPanelProps {
    variables: Record<string, string>;
    /** Человекочитаемое имя шага, ожидающего ввод (не ID). */
    waitingForStepName: string | null;
}

/** Отладочная панель переменных — нижняя часть ChatPreview. */
export function DebugVarsPanel({ variables, waitingForStepName }: DebugVarsPanelProps) {
    return (
        <div className="border-t border-outline-variant bg-surface-panel-docked/90 p-2 text-[11px]">
            <div className="mb-1 font-bold text-fg/55">{t('preview.debugVars')}</div>
            {Object.keys(variables).length === 0 ? (
                <div className="text-fg/50">{t('userData.empty')}</div>
            ) : (
                <div className="max-h-24 overflow-y-auto">
                    {Object.entries(variables).map(([key, val]) => (
                        <div key={key} className="flex gap-2">
                            <span className="font-mono text-info">{key}:</span>
                            <span className="truncate text-fg/60">{val}</span>
                        </div>
                    ))}
                </div>
            )}
            {waitingForStepName && (
                <div className="mt-1 text-warning">
                    {t('preview.waiting')}: {waitingForStepName}
                </div>
            )}
        </div>
    );
}
