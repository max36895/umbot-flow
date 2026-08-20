import { useState } from 'react';
import useFlowStore from '../../store/flowStore';
import type { ConditionNodeData, ConditionOperator } from '../../types/flow';
import { t } from '../../i18n';
import VariablePicker from '../ui/VariablePicker';
import { Field } from './shared/Field';
import { OPERATORS, CONDITION_PRESETS, NO_VALUE_OPERATORS } from '../../types/operators';
import { useNodeFieldErrors, getFieldErrorList } from '../../hooks/useNodeFieldErrors';

/** Операторы, которые проверяют последний ввод пользователя, а не переменную. */
const USER_INPUT_OPERATORS = new Set<string>(['isSayTrue', 'isSayFalse', 'isUrl']);

/** Человекочитаемая подпись оператора для превью. */
function operatorLabel(op: string): string {
    const entry = OPERATORS.find((o) => o.value === op);
    return entry ? t(entry.labelKey) : op;
}

interface Props {
    nodeId: string;
}

export function ConditionProps({ nodeId }: Props) {
    const nodes = useFlowStore((s) => s.nodes);
    const updateNodeData = useFlowStore((s) => s.updateNodeData);
    const node = nodes.find((n) => n.id === nodeId);
    const fieldErrors = useNodeFieldErrors(nodeId);
    if (!node) return null;

    const data = node.data as ConditionNodeData;

    const update = (patch: Partial<ConditionNodeData>) => {
        updateNodeData(nodeId, patch);
    };

    const applyPreset = (preset: (typeof CONDITION_PRESETS)[number]) => {
        update({
            variable: preset.variable,
            operator: preset.operator,
            value: preset.value,
        });
    };

    const [showAllPresets, setShowAllPresets] = useState(false);
    const MAX_VISIBLE_PRESETS = 3;

    return (
        <div className="min-w-0 space-y-4">
            <Field label={t('props.name')} errors={getFieldErrorList(fieldErrors, 'name')}>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder={t('props.namePlaceholder')}
                    className="w-full border-b border-[rgba(255,255,255,0.2)] bg-transparent px-3 py-2 text-sm text-white placeholder-white/35 focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
                />
            </Field>

            {/* Пресеты — неоновый стиль */}
            <Field label={t('props.presets')}>
                <div className="flex flex-wrap gap-1">
                    {CONDITION_PRESETS.slice(
                        0,
                        showAllPresets ? undefined : MAX_VISIBLE_PRESETS,
                    ).map((preset, i) => (
                        <button
                            key={i}
                            onClick={() => applyPreset(preset)}
                            className="rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.15)] px-2.5 py-0.5 text-[10px] text-info transition-colors hover:bg-[rgba(0,240,255,0.25)] hover:shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                        >
                            +{t(preset.labelKey)}
                        </button>
                    ))}
                    {!showAllPresets && CONDITION_PRESETS.length > MAX_VISIBLE_PRESETS && (
                        <button
                            onClick={() => setShowAllPresets(true)}
                            className="rounded-full border border-[rgba(255,255,255,0.15)] bg-transparent px-2.5 py-0.5 text-[10px] text-white/40 transition-colors hover:border-[rgba(255,255,255,0.25)] hover:text-white/60"
                        >
                            ...
                        </button>
                    )}
                </div>
            </Field>

            <Field
                label={t('props.variable')}
                help={t('tooltip.variable')}
                errors={getFieldErrorList(fieldErrors, 'variable')}
            >
                <VariablePicker
                    value={data.variable}
                    onChange={(val) => {
                        // Убираем {{ }} если пользователь вставил через VariablePicker
                        let cleanVal = val;
                        if (cleanVal.startsWith('{{') && cleanVal.endsWith('}}')) {
                            cleanVal = cleanVal.slice(2, -2);
                        }
                        update({ variable: cleanVal });
                    }}
                    placeholder={USER_INPUT_OPERATORS.has(data.operator) ? t('condition.userInput') : t('props.fieldPlaceholder')}
                    className="w-full border-b border-[rgba(255,255,255,0.2)] bg-transparent px-3 py-2 text-sm text-white placeholder-white/35 focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
                />
                {USER_INPUT_OPERATORS.has(data.operator) ? (
                    <p className="mt-1 text-[10px] text-white/40">
                        {t('tooltip.variableIsUserInput')}
                    </p>
                ) : (
                    <p className="mt-1 text-[10px] text-white/40">{t('props.variableHelp')}</p>
                )}
            </Field>

            <Field label={t('props.operator')} help={t('tooltip.operator')}>
                <select
                    value={data.operator}
                    onChange={(e) => update({ operator: e.target.value as ConditionOperator })}
                    className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-sm text-white/80 focus:border-info focus:outline-none"
                >
                    {OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>
                            {t(op.labelKey)}
                        </option>
                    ))}
                </select>
            </Field>

            {!NO_VALUE_OPERATORS.has(data.operator) && (
                <Field
                    label={t('props.comparisonValue')}
                    help={t('tooltip.comparisonValue')}
                    errors={getFieldErrorList(fieldErrors, 'value')}
                >
                    <VariablePicker
                        value={String(data.value ?? '')}
                        onChange={(val) => update({ value: val })}
                        className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-sm text-white/80 focus:border-info focus:outline-none"
                        placeholder={t('props.comparisonValue')}
                    />
                </Field>
            )}

            {/* Человекочитаемое превью условия */}
            <div className="mt-4 rounded bg-[rgba(188,19,254,0.1)] p-3 text-xs text-accent border border-[rgba(188,19,254,0.2)]">
                <p className="font-medium">{t('condition.preview')}:</p>
                <p className="mt-1 text-white/80">
                    {t('condition.ifLabel')}{' '}
                    <code className="text-accent">
                        {USER_INPUT_OPERATORS.has(data.operator)
                            ? t('condition.userInput')
                            : (data.variable || '?')}
                    </code>{' '}
                    <span className="text-white/60">{operatorLabel(data.operator)}</span>{' '}
                    {!NO_VALUE_OPERATORS.has(data.operator) && (
                        <code className="text-white/50">{String(data.value ?? '?')}</code>
                    )}
                </p>
            </div>
        </div>
    );
}
