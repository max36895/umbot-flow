import type { ActionBlock } from '../../../types/flow';
import { t } from '../../../i18n';
import VariablePicker from '../../ui/VariablePicker';
import { VariableConfig } from './VariableConfig';
import { HttpConfig } from './HttpConfig';
import { NodeIcon, type NodeIconName } from '../../ui/NodeIcons';
import { useState } from 'react';

/** Пресет типов действий для кнопок добавления. */
const ACTION_PRESETS: { type: ActionBlock['type']; labelKey: string; icon: NodeIconName }[] = [
    { type: 'set_variable', labelKey: 'action.set_variable', icon: 'set_variable' },
    { type: 'random_number', labelKey: 'action.random_number', icon: 'random_number' },
    { type: 'http_request', labelKey: 'action.http_request', icon: 'http_request' },
];

/** Значения по умолчанию для каждого типа действия. */
const ACTION_DEFAULTS: Record<ActionBlock['type'], ActionBlock> = {
    set_variable: { type: 'set_variable', field: '', value: '' },
    random_number: { type: 'random_number', field: '', min: 1, max: 10 },
    http_request: { type: 'http_request', url: '', method: 'GET', saveResponseTo: '' },
};

/** Стиль инпута для полей действия. */
const ACTION_INPUT_CLASS =
    'w-full border-b border-[rgba(255,255,255,0.2)] bg-transparent px-3 py-2 text-xs font-mono text-white placeholder-white/35 focus:border-b-2 focus:border-info focus:outline-none';

/** Стиль неоновых кнопок пресетов. Используется также в ActionProps. */
export const PRESET_BUTTON_CLASS =
    'rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.15)] px-2.5 py-0.5 text-[10px] text-info transition-colors hover:bg-[rgba(0,240,255,0.25)] hover:shadow-[0_0_8px_rgba(0,240,255,0.3)]';

/** Стиль кнопки удаления. */
const DELETE_BUTTON_CLASS = 'text-xs text-error/50 hover:text-error';

/** Стиль контейнера блока действия. */
const BLOCK_CONTAINER_CLASS = 'min-w-0 rounded-lg border border-[rgba(255,255,255,0.1)] p-3';

/** Пропсы редактора блоков действий. */
interface ActionBlockEditorProps {
    /** Текущие блоки действий */
    actions: ActionBlock[];
    /** Колбэк обновления всех блоков */
    onChange: (actions: ActionBlock[]) => void;
    /** Дополнительные пресеты переменных для VariableConfig */
    variablePresets?: { labelKey: string; value: string }[];
    /** Ошибки валидации по индексу блока: Map<actionIndex, messages[]> */
    actionErrors?: string[] | Map<number, string[]>;
}

/** Рендерит один блок действия (set_variable/random_number/http_request) с VariableConfig, инпутами и кнопкой удаления. */
function ActionBlock({
    action,
    onUpdate,
    onRemove,
    variablePresets,
    error,
}: {
    action: ActionBlock;
    onUpdate: (patch: Partial<ActionBlock>) => void;
    onRemove: () => void;
    variablePresets?: { labelKey: string; value: string }[];
    error?: string;
}) {
    const preset = ACTION_PRESETS.find((p) => p.type === action.type);
    const [showComment, setShowComment] = useState(false);

    // Визуальный индикатор ошибки — красная рамка на всём блоке
    const containerClass = error
        ? `${BLOCK_CONTAINER_CLASS} !border-error shadow-[0_0_12px_rgba(255,0,85,0.3)]`
        : BLOCK_CONTAINER_CLASS;

    return (
        <div className={containerClass}>
            <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-white/60">
                    <NodeIcon name={preset?.icon ?? 'action'} size={12} />
                    {t(`action.${action.type}`)}
                </span>
                <button onClick={onRemove} className={DELETE_BUTTON_CLASS}>
                    <NodeIcon name="close" size={10} />
                </button>
            </div>

            {action.type === 'set_variable' && (
                <div className="space-y-2">
                    <VariableConfig
                        fieldName={action.field ?? ''}
                        onFieldNameChange={(val) => onUpdate({ field: val })}
                        presets={variablePresets}
                        errors={error && action.field === '' ? [error] : undefined}
                    />
                    <VariablePicker
                        value={action.value ?? ''}
                        onChange={(val) => onUpdate({ value: val })}
                        placeholder={t('action.value')}
                        className={ACTION_INPUT_CLASS}
                        mode="value"
                    />
                    <p className="text-[10px] text-white/40">{t('action.valueHelp')}</p>
                </div>
            )}

            {action.type === 'random_number' && (
                <div className="space-y-2">
                    <VariableConfig
                        fieldName={action.field ?? ''}
                        onFieldNameChange={(val) => onUpdate({ field: val })}
                        presets={[
                            { labelKey: 'preset.num1', value: 'num1' },
                            { labelKey: 'preset.num2', value: 'num2' },
                            { labelKey: 'preset.rand', value: 'rand' },
                        ]}
                        errors={error && action.field === '' ? [error] : undefined}
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={action.min ?? 1}
                            onChange={(e) => onUpdate({ min: parseInt(e.target.value) || 0 })}
                            placeholder={t('action.min')}
                            className={ACTION_INPUT_CLASS}
                        />
                        <input
                            type="number"
                            value={action.max ?? 10}
                            onChange={(e) => onUpdate({ max: parseInt(e.target.value) || 10 })}
                            placeholder={t('action.max')}
                            className={ACTION_INPUT_CLASS}
                        />
                    </div>
                </div>
            )}

            {action.type === 'http_request' && (
                <HttpConfig
                    method={action.method}
                    onMethodChange={(val) => onUpdate({ method: val })}
                    url={action.url ?? ''}
                    onUrlChange={(val) => onUpdate({ url: val })}
                    body={action.body}
                    onBodyChange={(val) => onUpdate({ body: val })}
                    saveResponseTo={action.saveResponseTo}
                    onSaveResponseToChange={(val) => onUpdate({ saveResponseTo: val })}
                />
            )}

            {/* Комментарий — в самом низу, если не скрыт */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={() => setShowComment(!showComment)}
                    className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/45"
                >
                    <NodeIcon
                        name={showComment ? 'chevronDown' : 'chevronRight'}
                        size={8}
                        strokeWidth={2}
                    />
                    <span>{t('props.varComment')}</span>
                </button>
                {showComment && (
                    <input
                        type="text"
                        value={action.fieldComment ?? ''}
                        onChange={(e) => {
                            onUpdate({ fieldComment: e.target.value });
                        }}
                        placeholder={t('props.varCommentHelp')}
                        className="mt-1.5 w-full border-b border-[rgba(255,255,255,0.12)] bg-transparent px-0 py-1.5 text-[11px] text-white/50 placeholder-white/20 transition-colors focus:border-info focus:outline-none"
                    />
                )}
            </div>
        </div>
    );
}

/**
 * Общий редактор блоков действий.
 * Используется и в ActionProps (standalone), и в ActionEditor (inline).
 * Гарантирует одинаковый внешний вид и поведение.
 */
export function ActionBlockEditor({
    actions,
    onChange,
    variablePresets,
    actionErrors,
}: ActionBlockEditorProps) {
    const addAction = (type: ActionBlock['type']) => {
        onChange([...actions, { ...ACTION_DEFAULTS[type] }]);
    };

    const updateBlock = (index: number, patch: Partial<ActionBlock>) => {
        onChange(actions.map((a, i) => (i === index ? { ...a, ...patch } : a)));
    };

    const removeBlock = (index: number) => {
        onChange(actions.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
                {ACTION_PRESETS.map((preset) => (
                    <button
                        key={preset.type}
                        onClick={() => addAction(preset.type)}
                        className={`${PRESET_BUTTON_CLASS} inline-flex items-center gap-1`}
                    >
                        <NodeIcon name={preset.icon} size={11} />
                        {t(preset.labelKey)}
                    </button>
                ))}
            </div>

            {actions.map((action, i) => (
                <ActionBlock
                    key={i}
                    action={action}
                    onUpdate={(patch) => updateBlock(i, patch)}
                    onRemove={() => removeBlock(i)}
                    variablePresets={variablePresets}
                    error={
                        (actionErrors as Map<number, string[]>)?.get(i)?.[0] ??
                        (actionErrors as string[])?.[0]
                    }
                />
            ))}
        </div>
    );
}
