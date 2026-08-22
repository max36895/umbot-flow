import useFlowStore from '../../store/flowStore';
import type { ActionNodeData, ActionBlock } from '../../types/flow';
import { t } from '../../i18n';
import { Field } from './shared/Field';
import { ResponseText } from './shared/ResponseText';
import { ActionBlockEditor } from './shared/ActionBlockEditor';
import { ButtonEditor } from './shared/ButtonEditor';
import CardEditor from './CardEditor';
import { useNodeFieldErrors, getFieldErrorList } from '../../hooks/useNodeFieldErrors';

interface Props {
    nodeId: string;
}

const INPUT_CLASS =
    'w-full border-0 border-b border-outline bg-transparent px-0 py-2 text-sm text-fg placeholder-fg/35 transition-colors focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none';

export function ActionProps({ nodeId }: Props) {
    const node = useFlowStore((s) => s.nodes.find((n) => n.id === nodeId));
    const updateNodeData = useFlowStore((s) => s.updateNodeData);
    const fieldErrors = useNodeFieldErrors(nodeId);
    if (!node) return null;

    const data = node.data as ActionNodeData;

    const updateActions = (actions: ActionBlock[]) => {
        updateNodeData(nodeId, { actions });
    };

    return (
        <div className="min-w-0 space-y-4">
            <Field label={t('props.name')} errors={getFieldErrorList(fieldErrors, 'name')}>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => updateNodeData(nodeId, { name: e.target.value })}
                    placeholder={t('props.namePlaceholder')}
                    className={INPUT_CLASS}
                />
            </Field>

            <hr className="border-outline-variant" />

            <Field label={t('props.actions')} errors={getFieldErrorList(fieldErrors, 'actions')}>
                <ActionBlockEditor
                    actions={data.actions ?? []}
                    onChange={updateActions}
                    actionErrors={getFieldErrorList(fieldErrors, 'actions')}
                />
            </Field>

            <hr className="border-outline-variant" />

            <ResponseText
                value={data.text ?? ''}
                onChange={(val) => updateNodeData(nodeId, { text: val })}
            />

            <Field label={t('props.buttons')} help={t('props.buttonsHelp')}>
                <ButtonEditor
                    buttons={data.buttons ?? []}
                    onChange={(buttons) => updateNodeData(nodeId, { buttons })}
                    excludeId={nodeId}
                    showType={false}
                />
            </Field>

            <hr className="border-outline-variant" />

            <CardEditor card={data.card} onChange={(card) => updateNodeData(nodeId, { card })} />
        </div>
    );
}
