import type { FlowCard, FlowCardImage, FlowButton } from '../../types/flow';
import { t } from '../../i18n';
import HelpButton from '../ui/HelpButton';
import NodeSelector from '../ui/NodeSelector';
import VariablePicker from '../ui/VariablePicker';

interface CardEditorProps {
    card: FlowCard | undefined;
    onChange: (card: FlowCard | undefined) => void;
}

/** Редактор карточки/галереи с изображениями. */
export default function CardEditor({ card, onChange }: CardEditorProps) {
    const createCardWithImage = () => {
        onChange({
            type: 'single',
            title: '',
            images: [{ src: '', title: '', description: '', button: undefined }],
        });
    };

    const addImage = () => {
        if (!card) return;
        onChange({
            ...card,
            images: [...card.images, { src: '', title: '', description: '', button: undefined }],
        });
    };

    const updateImage = (index: number, patch: Partial<FlowCardImage>) => {
        if (!card) return;
        const newImages = card.images.map((img, i) => (i === index ? { ...img, ...patch } : img));
        onChange({ ...card, images: newImages });
    };

    const removeImage = (index: number) => {
        if (!card) return;
        const newImages = card.images.filter((_, i) => i !== index);
        if (newImages.length === 0) {
            onChange(undefined);
        } else {
            onChange({ ...card, images: newImages });
        }
    };

    const updateCardType = (type: FlowCard['type']) => {
        if (!card) return;
        onChange({ ...card, type });
    };

    const updateCardTitle = (title: string) => {
        if (!card) return;
        onChange({ ...card, title });
    };

    const canAddImage = card && (card.type !== 'single' || card.images.length === 0);

    return (
        <div className="min-w-0 space-y-3">
            {card ? (
                <>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-white/60">
                                {t('props.cardSection')}
                            </span>
                            <HelpButton content={t('props.cardHelp')} />
                        </div>
                        <button
                            onClick={() => onChange(undefined)}
                            className="text-[10px] text-[#ff0055]/50 hover:text-[#ff0055]"
                        >
                            {t('props.removeCard')}
                        </button>
                    </div>
                    <div className="min-w-0 rounded border border-[rgba(255,255,255,0.1)] p-2 space-y-2">
                        <select
                            value={card.type}
                            onChange={(e) => updateCardType(e.target.value as FlowCard['type'])}
                            className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-white/80 focus:border-[#00f0ff] focus:outline-none"
                        >
                            <option value="single">{t('card.single')}</option>
                            <option value="list">{t('card.list')}</option>
                            <option value="gallery">{t('card.gallery')}</option>
                        </select>
                        <VariablePicker
                            value={card.title}
                            onChange={updateCardTitle}
                            placeholder={t('props.cardTitle')}
                            className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-white placeholder-white/35 focus:border-[#00f0ff] focus:outline-none"
                        />

                        {card.images.map((img, i) => (
                            <div
                                key={i}
                                className="rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-2 space-y-1.5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-white/30">
                                        #{i + 1}
                                    </span>
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="text-[10px] text-[#ff0055]/50 hover:text-[#ff0055]"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <VariablePicker
                                    value={img.src}
                                    onChange={(val) => updateImage(i, { src: val })}
                                    placeholder={t('action.imageUrl')}
                                    className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-white placeholder-white/35"
                                />
                                <VariablePicker
                                    value={img.title}
                                    onChange={(val) => updateImage(i, { title: val })}
                                    placeholder={t('props.imageTitle')}
                                    className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-white placeholder-white/35"
                                />
                                <VariablePicker
                                    value={img.description}
                                    onChange={(val) => updateImage(i, { description: val })}
                                    placeholder={t('props.imageDesc')}
                                    className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-white placeholder-white/35"
                                />
                                {/* Группа "При нажатии" */}
                                <div className="mt-1.5 rounded bg-[rgba(255,255,255,0.03)] p-1.5 space-y-1 border border-[rgba(255,255,255,0.05)]">
                                    <span className="text-[9px] font-medium text-white/25 uppercase tracking-wider">
                                        {t('props.onTap')}
                                    </span>
                                    <VariablePicker
                                        value={img.button?.title ?? ''}
                                        onChange={(val) => {
                                            const btn: FlowButton = {
                                                title: val,
                                                type: 'action',
                                                targetNodeId: img.button?.targetNodeId,
                                            };
                                            updateImage(i, { button: btn });
                                        }}
                                        placeholder={t('props.buttonTitle')}
                                        className="w-full rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-white placeholder-white/35"
                                    />
                                    <NodeSelector
                                        value={img.button?.targetNodeId ?? ''}
                                        onChange={(val) => {
                                            const btn: FlowButton = {
                                                title: img.button?.title ?? '',
                                                type: 'action',
                                                targetNodeId: val,
                                            };
                                            updateImage(i, { button: btn });
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        ))}

                        {canAddImage && (
                            <button
                                onClick={addImage}
                                className="w-full rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.15)] py-2 text-xs text-white/40 transition-colors hover:border-[rgba(0,240,255,0.3)] hover:bg-[rgba(0,240,255,0.05)] hover:text-[#00f0ff]"
                            >
                                + {t('props.addImage')}
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div>
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-xs font-medium text-white/60">
                            {t('props.cardSection')}
                        </span>
                        <HelpButton content={t('props.cardHelp')} />
                    </div>
                    <button
                        onClick={createCardWithImage}
                        className="w-full rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.15)] py-3 text-xs text-white/40 transition-colors hover:border-[rgba(0,240,255,0.3)] hover:bg-[rgba(0,240,255,0.05)] hover:text-[#00f0ff]"
                    >
                        {t('props.addCard')}
                    </button>
                </div>
            )}
        </div>
    );
}
