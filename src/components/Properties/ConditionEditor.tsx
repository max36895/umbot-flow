import { useState } from 'react';
import type { FlowCondition, ConditionResponse } from '../../types/flow';
import { t } from '../../i18n';
import { OPERATORS, CONDITION_PRESETS, NO_VALUE_OPERATORS } from '../../types/operators';
import { NodeIcon } from '../ui/NodeIcons';

interface Props {
    conditions: FlowCondition[];
    onChange: (conditions: FlowCondition[]) => void;
}

/** Inline condition editor for Command/Step nodes. */
export function ConditionEditor({ conditions, onChange }: Props) {
    const addCondition = () => {
        onChange([
            ...conditions,
            {
                variable: '',
                operator: 'eq',
                value: '',
                responseTrue: { text: '' },
                responseFalse: { text: '' },
            },
        ]);
    };

    const addFromPreset = (preset: (typeof CONDITION_PRESETS)[number]) => {
        onChange([
            ...conditions,
            {
                variable: preset.variable,
                operator: preset.operator,
                value: preset.value,
                responseTrue: { text: preset.responseTrueText },
                responseFalse: { text: preset.responseFalseText },
            },
        ]);
    };

    const updateCondition = (index: number, patch: Partial<FlowCondition>) => {
        onChange(conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)));
    };

    const updateResponse = (
        index: number,
        branch: 'responseTrue' | 'responseFalse',
        patch: Partial<ConditionResponse>,
    ) => {
        onChange(
            conditions.map((c, i) => {
                if (i !== index) return c;
                const current = c[branch] || { text: '' };
                return { ...c, [branch]: { ...current, ...patch } };
            }),
        );
    };

    const removeCondition = (index: number) => {
        onChange(conditions.filter((_, i) => i !== index));
    };

    const [showAllPresets, setShowAllPresets] = useState(false);
    const MAX_VISIBLE_PRESETS = 3;

    return (
        <div className="space-y-2">
            {/* Кнопки пресетов — неоновый стиль */}
            <div className="flex flex-wrap gap-1">
                {CONDITION_PRESETS.slice(0, showAllPresets ? undefined : MAX_VISIBLE_PRESETS).map(
                    (preset, i) => (
                        <button
                            key={i}
                            onClick={() => addFromPreset(preset)}
                            className="rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.15)] px-2.5 py-0.5 text-[10px] text-info transition-colors hover:bg-[rgba(0,240,255,0.25)] hover:shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                        >
                            +{t(preset.labelKey)}
                        </button>
                    ),
                )}
                {!showAllPresets && CONDITION_PRESETS.length > MAX_VISIBLE_PRESETS && (
                    <button
                        onClick={() => setShowAllPresets(true)}
                        className="rounded-full border border-[rgba(255,255,255,0.15)] bg-transparent px-2.5 py-0.5 text-[10px] text-white/40 transition-colors hover:border-[rgba(255,255,255,0.25)] hover:text-white/60"
                    >
                        ...
                    </button>
                )}
            </div>

            {/* Кнопка добавления пустого условия */}
            <button
                onClick={addCondition}
                className="rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.15)] px-2.5 py-0.5 text-[10px] text-info transition-colors hover:bg-[rgba(0,240,255,0.25)] hover:shadow-[0_0_8px_rgba(0,240,255,0.3)]"
            >
                +{t('props.addCondition')}
            </button>

            {conditions.map((cond, i) => (
                <div
                    key={i}
                    className="rounded border border-[rgba(188,19,254,0.2)] bg-[rgba(188,19,254,0.08)] p-2"
                >
                    <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs font-bold text-accent">
                            <NodeIcon name="condition" size={12} />
                            {t('props.condition')}
                        </span>
                        <button
                            onClick={() => removeCondition(i)}
                            className="text-xs text-error/50 hover:text-error"
                        >
                            <NodeIcon name="close" size={10} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <input
                            type="text"
                            value={cond.variable}
                            onChange={(e) => {
                                // Убираем {{ }} если пользователь вставил через VariablePicker
                                let val = e.target.value;
                                if (val.startsWith('{{') && val.endsWith('}}')) {
                                    val = val.slice(2, -2);
                                }
                                updateCondition(i, { variable: val });
                            }}
                            placeholder={t('props.variable')}
                            className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-white placeholder-white/35 focus:border-info focus:outline-none"
                        />

                        <select
                            value={cond.operator}
                            onChange={(e) =>
                                updateCondition(i, {
                                    operator: e.target.value as FlowCondition['operator'],
                                })
                            }
                            className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-white/80 focus:border-info focus:outline-none"
                        >
                            {OPERATORS.map((op) => (
                                <option key={op.value} value={op.value}>
                                    {t(op.labelKey)}
                                </option>
                            ))}
                        </select>

                        {!NO_VALUE_OPERATORS.has(cond.operator) && (
                            <input
                                type="text"
                                value={String(cond.value ?? '')}
                                onChange={(e) => updateCondition(i, { value: e.target.value })}
                                placeholder={t('props.comparisonValue')}
                                className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-white placeholder-white/35 focus:border-info focus:outline-none"
                            />
                        )}

                        <div className="grid grid-cols-2 gap-1">
                            <div>
                                <label className="text-[10px] text-success">
                                    {t('condition.true')}:
                                </label>
                                <input
                                    type="text"
                                    value={cond.responseTrue?.text ?? ''}
                                    onChange={(e) =>
                                        updateResponse(i, 'responseTrue', { text: e.target.value })
                                    }
                                    placeholder={t('condition.trueText')}
                                    className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-white placeholder-white/35 focus:border-info focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-error">
                                    {t('condition.false')}:
                                </label>
                                <input
                                    type="text"
                                    value={cond.responseFalse?.text ?? ''}
                                    onChange={(e) =>
                                        updateResponse(i, 'responseFalse', { text: e.target.value })
                                    }
                                    placeholder={t('condition.falseText')}
                                    className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-white placeholder-white/35 focus:border-info focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
