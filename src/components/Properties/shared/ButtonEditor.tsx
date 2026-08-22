import type { FlowButton } from '../../../types/flow';
import { t } from '../../../i18n';
import NodeSelector from '../../ui/NodeSelector';
import VariablePicker from '../../ui/VariablePicker';
import { NodeIcon } from '../../ui/NodeIcons';

interface ButtonEditorProps {
    buttons: FlowButton[];
    onChange: (buttons: FlowButton[]) => void;
    excludeId?: string;
    /** Показывать тип кнопки (action/link). По умолчанию true. */
    showType?: boolean;
}

/** Общий редактор кнопок с поддержкой переменных в title. */
export function ButtonEditor({ buttons, onChange, excludeId, showType = true }: ButtonEditorProps) {
    const updateButton = (index: number, patch: Partial<FlowButton>) => {
        onChange(buttons.map((b, j) => (j === index ? { ...b, ...patch } : b)));
    };

    const removeButton = (index: number) => {
        onChange(buttons.filter((_, j) => j !== index));
    };

    return (
        <div className="space-y-2">
            {buttons.map((btn, i) => (
                <div
                    key={i}
                    className="mb-2 min-w-0 rounded-xl border border-outline-variant bg-fg/[0.03] p-2.5 space-y-1.5"
                >
                    <div className="flex items-center gap-1.5">
                        <VariablePicker
                            value={btn.title}
                            onChange={(val) => updateButton(i, { title: val })}
                            placeholder={t('props.buttonTitle')}
                            className="min-w-0 flex-1 border-0 border-b border-outline bg-transparent px-0 py-1.5 text-sm text-fg placeholder-fg/35 focus:border-b-2 focus:border-info focus:outline-none"
                        />
                        <button
                            onClick={() => removeButton(i)}
                            className="flex-shrink-0 rounded-lg bg-error/15 px-2 text-xs text-error hover:bg-error/25"
                        >
                            <NodeIcon name="close" size={10} />
                        </button>
                    </div>
                    {showType && (
                        <select
                            value={btn.type}
                            onChange={(e) =>
                                updateButton(i, { type: e.target.value as FlowButton['type'] })
                            }
                            className="w-full rounded border border-outline bg-fg/5 px-2 py-1 text-xs text-fg/80 focus:border-info focus:outline-none"
                        >
                            <option value="action">{t('props.buttonAction')}</option>
                            <option value="link">{t('props.buttonLink')}</option>
                        </select>
                    )}
                    {btn.type === 'action' ? (
                        <NodeSelector
                            value={btn.targetNodeId ?? ''}
                            onChange={(val) => updateButton(i, { targetNodeId: val })}
                            excludeId={excludeId}
                            className="w-full"
                        />
                    ) : (
                        <input
                            type="text"
                            value={btn.url ?? ''}
                            onChange={(e) => updateButton(i, { url: e.target.value })}
                            placeholder={t('props.url')}
                            className="w-full min-w-0 border-0 border-b border-outline bg-transparent px-0 py-1.5 text-xs text-fg placeholder-fg/35 focus:border-b-2 focus:border-info focus:outline-none"
                        />
                    )}
                </div>
            ))}
            <button
                onClick={() => onChange([...buttons, { title: '', type: 'action' as const }])}
                className="w-full rounded-xl border-2 border-dashed border-outline py-2 text-xs text-fg/55 transition-colors hover:border-info/30 hover:bg-info/5 hover:text-info"
            >
                + {t('props.addButton')}
            </button>
        </div>
    );
}
