import useFlowStore from '../../store/flowStore';
import type { StepNodeData } from '../../types/flow';
import { t } from '../../i18n';
import NodeSelector from '../ui/NodeSelector';
import { ActionEditor } from './ActionEditor';
import { ConditionEditor } from './ConditionEditor';
import CardEditor from './CardEditor';
import { Field } from './shared/Field';
import { ResponseText } from './shared/ResponseText';
import { TTSField } from './shared/TTSField';
import { VariableConfig } from './shared/VariableConfig';
import { AdvancedSettings } from './shared/AdvancedSettings';
import { ButtonEditor } from './shared/ButtonEditor';

interface Props {
    nodeId: string;
}

export function StepProps({ nodeId }: Props) {
    const nodes = useFlowStore((s) => s.nodes);
    const updateNodeData = useFlowStore((s) => s.updateNodeData);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    const data = node.data as StepNodeData;

    const update = (patch: Partial<StepNodeData>) => updateNodeData(nodeId, patch);
    const updatePrompt = (patch: Partial<StepNodeData['prompt']>) =>
        updateNodeData(nodeId, { prompt: { ...data.prompt, ...patch } });

    return (
        <div className="min-w-0 space-y-4">
            <Field label={t('props.name')}>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder={t('props.namePlaceholder')}
                    className="w-full border-b border-[rgba(255,255,255,0.2)] bg-transparent px-3 py-2 text-sm text-white placeholder-white/35 focus:border-b-2 focus:border-[#00f0ff] focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none"
                />
            </Field>

            <ResponseText
                value={data.prompt.text}
                onChange={(val) => updatePrompt({ text: val })}
                label="props.promptText"
                placeholder="props.promptHelp"
            />

            <TTSField
                value={data.prompt.tts ?? ''}
                onChange={(val) => updatePrompt({ tts: val || undefined })}
            />

            <hr className="border-[rgba(255,255,255,0.08)]" />

            <Field label={t('props.buttons')} help={t('props.buttonsHelp')}>
                <ButtonEditor
                    buttons={data.prompt.buttons}
                    onChange={(buttons) => updatePrompt({ buttons })}
                    excludeId={nodeId}
                />
            </Field>

            <hr className="border-[rgba(255,255,255,0.08)]" />

            <CardEditor card={data.prompt.card} onChange={(card) => updatePrompt({ card })} />

            <hr className="border-[rgba(255,255,255,0.08)]" />

            <VariableConfig
                fieldName={data.saveTo}
                onFieldNameChange={(val) => update({ saveTo: val })}
                presets={[
                    { labelKey: 'preset.userName', value: 'userName' },
                    { labelKey: 'preset.email', value: 'email' },
                    { labelKey: 'preset.phone', value: 'phone' },
                    { labelKey: 'preset.date', value: 'date' },
                ]}
            />

            <hr className="border-[rgba(255,255,255,0.08)]" />

            <Field label={t('props.nextStep')} help={t('props.nextStepHelp')}>
                <NodeSelector
                    value={data.next ?? ''}
                    onChange={(val) => update({ next: val || undefined })}
                    excludeId={nodeId}
                    className="w-full"
                />
            </Field>

            <AdvancedSettings
                actions={
                    <Field label={t('props.actions')}>
                        <ActionEditor
                            actions={data.actions ?? []}
                            onChange={(actions) => update({ actions })}
                        />
                    </Field>
                }
                conditions={
                    <Field label={t('props.conditions')}>
                        <ConditionEditor
                            conditions={data.conditions ?? []}
                            onChange={(conditions) => update({ conditions })}
                        />
                    </Field>
                }
                emotion={data.prompt.emotion}
                onEmotionChange={(val) => updatePrompt({ emotion: val })}
                shuffleButtons={data.prompt.shuffleButtons}
                onShuffleChange={(val) => updatePrompt({ shuffleButtons: val })}
                actionsCount={data.actions?.length ?? 0}
                conditionsCount={data.conditions?.length ?? 0}
            />
        </div>
    );
}
