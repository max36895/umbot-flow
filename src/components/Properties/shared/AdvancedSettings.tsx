import { useState, useMemo } from 'react';
import { t } from '../../../i18n';
import { Field } from './Field';

interface AdvancedSettingsProps {
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
 */
export function AdvancedSettings({
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
    // Определяем, есть ли настроенные расширенные настройки
    const hasAdvancedValues = useMemo(
        () =>
            !!isPattern ||
            !!emotion ||
            !!isEnd ||
            !!shuffleButtons ||
            actionsCount > 0 ||
            conditionsCount > 0,
        [isPattern, emotion, isEnd, shuffleButtons, actionsCount, conditionsCount],
    );

    const [showAdvanced, setShowAdvanced] = useState(hasAdvancedValues);

    return (
        <>
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] px-4 py-3 text-xs text-white/40 transition-all hover:border-[rgba(0,240,255,0.3)] hover:bg-[rgba(0,240,255,0.05)] hover:text-[#00f0ff]"
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
                    <span className="ml-1 h-2 w-2 rounded-full bg-[#00f0ff]" />
                )}
                <span
                    className="ml-auto text-[10px] text-white/30 transition-transform duration-200"
                    style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    ▼
                </span>
            </button>

            {showAdvanced && (
                <div className="space-y-4 rounded-xl border border-[rgba(99,102,241,0.15)] bg-gradient-to-br from-[rgba(99,102,241,0.08)] to-[rgba(188,19,254,0.05)] p-4">
                    {/* 1. Regex-режим (только для Command) */}
                    {onPatternChange !== undefined && (
                        <Field label={t('props.patternMode')} help={t('props.patternHelp')}>
                            <label className="flex items-center gap-3 text-sm text-white/70">
                                <input
                                    type="checkbox"
                                    checked={isPattern ?? false}
                                    onChange={(e) => onPatternChange(e.target.checked)}
                                    className="h-4 w-4 rounded accent-[#00f0ff]"
                                />
                                {t('props.patternHelp')}
                            </label>
                            {isPattern && (
                                <p className="mt-1 text-[10px] text-[#ff9d00]">
                                    ⚠️ {t('props.patternWarning')}
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
                                className="w-full rounded-lg border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-white/80 focus:border-[#00f0ff] focus:outline-none"
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
                            <label className="flex items-center gap-3 text-sm text-white/70">
                                <input
                                    type="checkbox"
                                    checked={isEnd ?? false}
                                    onChange={(e) => onEndChange(e.target.checked)}
                                    className="h-4 w-4 rounded accent-[#00f0ff]"
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
                            <label className="flex items-center gap-3 text-sm text-white/70">
                                <input
                                    type="checkbox"
                                    checked={shuffleButtons ?? false}
                                    onChange={(e) => onShuffleChange(e.target.checked)}
                                    className="h-4 w-4 rounded accent-[#00f0ff]"
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
