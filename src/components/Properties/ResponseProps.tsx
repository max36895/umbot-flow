import useFlowStore from '../../store/flowStore';
import type { ResponseNodeData } from '../../types/flow';
import { t } from '../../i18n';
import CardEditor from './CardEditor';
import { Field } from './shared/Field';
import { ResponseText } from './shared/ResponseText';
import { TTSField } from './shared/TTSField';
import { AdvancedSettings } from './shared/AdvancedSettings';
import { ButtonEditor } from './shared/ButtonEditor';

interface Props {
    nodeId: string;
}

export function ResponseProps({ nodeId }: Props) {
    const nodes = useFlowStore((s) => s.nodes);
    const updateNodeData = useFlowStore((s) => s.updateNodeData);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    const data = node.data as ResponseNodeData;

    const update = (patch: Partial<ResponseNodeData>) => updateNodeData(nodeId, patch);
    const updateResponse = (patch: Partial<ResponseNodeData['response']>) =>
        updateNodeData(nodeId, { response: { ...data.response, ...patch } });

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
                value={data.response.text}
                onChange={(val) => updateResponse({ text: val })}
            />

            <TTSField
                value={data.response.tts ?? ''}
                onChange={(val) => updateResponse({ tts: val || undefined })}
            />

            <hr className="border-[rgba(255,255,255,0.08)]" />

            <Field label={t('props.buttons')} help={t('props.buttonsHelp')}>
                <ButtonEditor
                    buttons={data.response.buttons}
                    onChange={(buttons) => updateResponse({ buttons })}
                    excludeId={nodeId}
                />
            </Field>

            <hr className="border-[rgba(255,255,255,0.08)]" />

            <CardEditor card={data.response.card} onChange={(card) => updateResponse({ card })} />

            <AdvancedSettings
                emotion={data.response.emotion}
                onEmotionChange={(val) => updateResponse({ emotion: val })}
                isEnd={data.response.isEnd}
                onEndChange={(val) => updateResponse({ isEnd: val })}
                shuffleButtons={data.response.shuffleButtons}
                onShuffleChange={(val) => updateResponse({ shuffleButtons: val })}
            />
        </div>
    );
}
