import { useMemo, useEffect } from 'react';
import { t } from '../../../i18n';
import { Field } from './Field';
import useUiStore from '../../../store/uiStore';
import { NodeIcon } from '../../ui/NodeIcons';

interface AdvancedSettingsProps {
    /** ID ноды — для сохранения состояния раскрытия */
    nodeId: string;
    /** Regex-режим (только для Command) */
    isPattern?: boolean;
    onPatternChange?: (val: boolean) => void;
    /** Инлайн действия */
    actions?: React.ReactNode;
    /** Инлайн условия */
    conditions?: React.ReactNode;
    /** Эмоция */
    emotion?: string;
    onEmotionChange?: (val: string | undefined) => void;
    /** Завершение диалога */
    isEnd?: boolean;
    onEndChange?: (val: boolean) => void;
    /** Случайный порядок кнопок */
    shuffleButtons?: boolean;
    onShuffleChange?: (val: boolean) => void;
    /** Количество инлайн-действий (для индикатора) */
    actionsCount?: number;
    /** Количество инлайн-условий (для индикатора) */
    conditionsCount?: number;
}

/**
 * Общий компонент для расширенных настроек.
 * Порядок всегда одинаковый: regex → действия → условия → эмоция → завершение → перемешивание.
 * Состояние раскрытия сохраняется в uiStore.advancedExpanded per nodeId.
 */
export function AdvancedSettings({
    nodeId,
    isPattern,
    onPatternChange,
    actions,
    conditions,
    emotion,
    onEmotionChange,
    isEnd,
    onEndChange,
    shuffleButtons,
    onShuffleChange,
    actionsCount = 0,
    conditionsCount = 0,
}: AdvancedSettingsProps) {
    // Читаем persisted состояние из uiStore
    const persistedExpanded = useUiStore((s) => s.advancedExpanded[nodeId]);
    const setAdvancedExpanded = useUiStore((s) => s.setAdvancedExpanded);

    // Счётчики активных расширенных опций
    const activeCount = useMemo(() => {
        let count = 0;
        if (isPattern) count++;
        if (emotion) count++;
        if (isEnd) count++;
        if (shuffleButtons) count++;
        return count + actionsCount + conditionsCount;
    }, [isPattern, emotion, isEnd, shuffleButtons, actionsCount, conditionsCount]);

    const hasAdvancedValues = activeCount > 0;

    // Если never set и есть активные значения — авто-раскрываем при первом визите
    useEffect(() => {
        if (persistedExpanded === undefined && hasAdvancedValues) {
            setAdvancedExpanded(nodeId, true);
        }
    }, [persistedExpanded, hasAdvancedValues, nodeId, setAdvancedExpanded]);

    const showAdvanced = persistedExpanded ?? hasAdvancedValues;
    const toggle = () => setAdvancedExpanded(nodeId, !showAdvanced);

    return (
        <>
            <button
                type="button"
                onClick={toggle}
                className="flex w-full items-center gap-2 rounded-xl border border-glass-border px-4 py-3 text-xs text-fg/55 transition-all hover:border-info/30 hover:bg-info/5 hover:text-info"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="8" cy="8" r="2.5" />
                    <path d="M8 2v2.5M8 11.5V14M2 8h2.5M11.5 8H14M3.5 3.5l1.8 1.8M10.7 10.7l1.8 1.8M3.5 12.5l1.8-1.8M10.7 5.3l1.8-1.8" />
                </svg>
                <span>{showAdvanced ? t('props.advancedHide') : t('props.advancedSettings')}</span>
                {hasAdvancedValues && !showAdvanced && (
                    <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/15 px-1.5 py-0.5 text-[11px] font-bold text-info">
                        {activeCount}
                    </span>
                )}
                <span
                    className="ml-auto text-[11px] text-fg/50 transition-transform duration-200"
                    style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    ▼
                </span>
            </button>

            {showAdvanced && (
                <div className="space-y-4 rounded-xl border border-accent/15 bg-gradient-to-br from-accent/[0.08] to-accent/5 p-4">
                    {/* 1. Regex-режим (только для Command) */}
                    {onPatternChange !== undefined && (
                        <Field label={t('props.patternMode')} help={t('props.patternHelp')}>
                            <label className="flex items-center gap-3 text-sm text-fg/70">
                                <input
                                    type="checkbox"
                                    checked={isPattern ?? false}
                                    onChange={(e) => onPatternChange(e.target.checked)}
                                    className="h-4 w-4 rounded accent-info"
                                />
                                {t('props.patternHelp')}
                            </label>
                            {isPattern && (
                                <p className="mt-1 flex items-start gap-1 text-[11px] text-warning">
                                    <NodeIcon
                                        name="warning"
                                        size={11}
                                        className="mt-0.5 flex-shrink-0"
                                    />
                                    <span>{t('props.patternWarning')}</span>
                                </p>
                            )}
                        </Field>
                    )}

                    {/* 2. Инлайн действия */}
                    {actions}

                    {/* 3. Инлайн условия */}
                    {conditions}

                    {/* 4. Эмоция */}
                    {onEmotionChange !== undefined && (
                        <Field label={t('props.emotion')}>
                            <select
                                value={emotion ?? ''}
                                onChange={(e) => onEmotionChange(e.target.value || undefined)}
                                className="w-full rounded-lg border border-outline bg-fg/5 px-3 py-2 text-sm text-fg/80 focus:border-info focus:outline-none"
                            >
                                <option value="">—</option>
                                <option value="good">{t('props.emotion.good')}</option>
                                <option value="neutral">{t('props.emotion.neutral')}</option>
                                <option value="bad">{t('props.emotion.bad')}</option>
                            </select>
                        </Field>
                    )}

                    {/* 5. Завершение диалога */}
                    {onEndChange !== undefined && (
                        <Field label={t('props.endDialog')} help={t('props.endDialogHelp')}>
                            <label className="flex items-center gap-3 text-sm text-fg/70">
                                <input
                                    type="checkbox"
                                    checked={isEnd ?? false}
                                    onChange={(e) => onEndChange(e.target.checked)}
                                    className="h-4 w-4 rounded accent-info"
                                />
                                {t('props.endDialogHelp')}
                            </label>
                        </Field>
                    )}

                    {/* 6. Случайный порядок кнопок */}
                    {onShuffleChange !== undefined && (
                        <Field
                            label={t('props.shuffleButtons')}
                            help={t('props.shuffleButtonsHelp')}
                        >
                            <label className="flex items-center gap-3 text-sm text-fg/70">
                                <input
                                    type="checkbox"
                                    checked={shuffleButtons ?? false}
                                    onChange={(e) => onShuffleChange(e.target.checked)}
                                    className="h-4 w-4 rounded accent-info"
                                />
                                {t('props.shuffleButtonsHelp')}
                            </label>
                        </Field>
                    )}
                </div>
            )}
        </>
    );
}
