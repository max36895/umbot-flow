import useFlowStore from '../../store/flowStore';
import type { CommandNodeData } from '../../types/flow';
import { t } from '../../i18n';
import TagInput from '../ui/TagInput';
import CardEditor from './CardEditor';
import { ActionEditor } from './ActionEditor';
import { ConditionEditor } from './ConditionEditor';
import { Field } from './shared/Field';
import { ResponseText } from './shared/ResponseText';
import { TTSField } from './shared/TTSField';
import { AdvancedSettings } from './shared/AdvancedSettings';
import { VariableConfig } from './shared/VariableConfig';
import { ButtonEditor } from './shared/ButtonEditor';
import {
    useNodeFieldErrors,
    getFieldErrorList,
    getActionErrorsMap,
} from '../../hooks/useNodeFieldErrors';

interface Props {
    nodeId: string;
}

export function CommandProps({ nodeId }: Props) {
    const nodes = useFlowStore((s) => s.nodes);
    const updateNodeData = useFlowStore((s) => s.updateNodeData);
    const setMetadata = useFlowStore((s) => s.setMetadata);
    const node = nodes.find((n) => n.id === nodeId);
    const fieldErrors = useNodeFieldErrors(nodeId);
    if (!node) return null;

    const data = node.data as CommandNodeData;
    const isBuiltin = data.role === 'welcome' || data.role === 'help' || data.role === 'fallback';

    const update = (patch: Partial<CommandNodeData>) => {
        updateNodeData(nodeId, patch);
        // Синхронизация текста welcome/help с настройками бота
        if (isBuiltin && patch.response) {
            const newResponse = { ...data.response, ...patch.response };
            if (data.role === 'welcome') {
                setMetadata({ welcome: { text: newResponse.text, buttons: newResponse.buttons } });
            } else if (data.role === 'help') {
                setMetadata({ helpText: { text: newResponse.text } });
            } else if (data.role === 'fallback') {
                setMetadata({ fallback: { text: newResponse.text } });
            }
        }
    };
    const updateResponse = (patch: Partial<CommandNodeData['response']>) => {
        const response = { ...data.response, ...patch };
        updateNodeData(nodeId, { response });
        // Синхронизация текста welcome/help с настройками бота
        if (isBuiltin && patch.text !== undefined) {
            if (data.role === 'welcome') {
                setMetadata({ welcome: { text: response.text, buttons: response.buttons } });
            } else if (data.role === 'help') {
                setMetadata({ helpText: { text: response.text } });
            } else if (data.role === 'fallback') {
                setMetadata({ fallback: { text: response.text } });
            }
        }
    };

    return (
        <div className="min-w-0 space-y-4">
            {/* === ОСНОВНЫЕ НАСТРОЙКИ === */}
            {!isBuiltin && (
                <Field label={t('props.name')} errors={getFieldErrorList(fieldErrors, 'name')}>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => update({ name: e.target.value })}
                        placeholder={t('props.namePlaceholder')}
                        className="w-full border-0 border-b border-[rgba(255,255,255,0.2)] bg-transparent px-0 py-2 text-sm text-white placeholder-white/35 transition-colors focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
                    />
                </Field>
            )}

            {isBuiltin && (
                <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2">
                    <p className="text-xs text-white/50">
                        {t(`sidebar.${data.role}.label`)} — {data.name}
                    </p>
                </div>
            )}

            {!isBuiltin && (
                <Field
                    label={t('props.slots')}
                    help={t('slots.tooltip')}
                    errors={getFieldErrorList(fieldErrors, 'slots')}
                >
                    <TagInput
                        value={data.slots}
                        onChange={(slots) => update({ slots })}
                        placeholder={t('props.slots.placeholder')}
                    />
                </Field>
            )}

            {!isBuiltin && (
                <VariableConfig
                    fieldName={data.saveTo ?? ''}
                    onFieldNameChange={(val) => update({ saveTo: val || undefined })}
                    errors={getFieldErrorList(fieldErrors, 'saveTo')}
                />
            )}

            <ResponseText
                value={data.response.text}
                onChange={(val) => updateResponse({ text: val })}
            />

            <TTSField
                value={data.response.tts ?? ''}
                onChange={(val) => updateResponse({ tts: val || undefined })}
            />

            <hr className="border-[rgba(255,255,255,0.08)]" />

            {/* Кнопки */}
            <Field label={t('props.buttons')} help={t('props.buttonsHelp')}>
                <ButtonEditor
                    buttons={data.response.buttons}
                    onChange={(buttons) => updateResponse({ buttons })}
                    excludeId={nodeId}
                />
            </Field>

            <hr className="border-[rgba(255,255,255,0.08)]" />

            <CardEditor card={data.response.card} onChange={(card) => updateResponse({ card })} />

            {/* === РАСШИРЕННЫЕ НАСТРОЙКИ === */}
            <AdvancedSettings
                nodeId={nodeId}
                isPattern={data.isPattern}
                onPatternChange={(val) => update({ isPattern: val })}
                actions={
                    <Field
                        label={t('props.actions')}
                        errorVisibility={false}
                        errors={getFieldErrorList(fieldErrors, 'actions')}
                    >
                        <ActionEditor
                            actions={data.actions ?? []}
                            onChange={(actions) => update({ actions })}
                            actionErrors={getActionErrorsMap(fieldErrors)}
                        />
                    </Field>
                }
                conditions={
                    <Field
                        label={t('props.conditions')}
                        errors={getFieldErrorList(fieldErrors, 'conditions')}
                    >
                        <ConditionEditor
                            conditions={data.conditions ?? []}
                            onChange={(conditions) => update({ conditions })}
                        />
                    </Field>
                }
                emotion={data.response.emotion}
                onEmotionChange={(val) => updateResponse({ emotion: val })}
                isEnd={data.response.isEnd}
                onEndChange={(val) => updateResponse({ isEnd: val })}
                shuffleButtons={data.response.shuffleButtons}
                onShuffleChange={(val) => updateResponse({ shuffleButtons: val })}
                actionsCount={data.actions?.length ?? 0}
                conditionsCount={data.conditions?.length ?? 0}
            />
        </div>
    );
}
