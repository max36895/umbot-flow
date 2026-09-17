interface CardImage {
    src: string;
    title: string;
    description: string;
    button?: { title: string; targetNodeId?: string };
}

interface MessageBubbleProps {
    role: 'user' | 'bot';
    text: string;
    buttons?: { title: string; targetNodeId?: string; url?: string }[];
    card?: {
        type: 'single' | 'list' | 'gallery';
        title?: string;
        images: CardImage[];
    };
    onButtonClick?: (btn: { title: string; targetNodeId?: string; url?: string }) => void;
}

export function MessageBubble({ role, text, buttons, card, onButtonClick }: MessageBubbleProps) {
    const isUser = role === 'user';

    return (
        <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${isUser ? 'order-2' : ''}`}>
                {/* Text */}
                {text && (
                    <div
                        className={`whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm ${
                            isUser
                                ? 'bg-gradient-to-r from-[#bc13fe] to-[#00f0ff] text-white'
                                : 'bg-surface-panel text-fg/80 border border-outline-variant'
                        }`}
                    >
                        {text}
                    </div>
                )}

                {/* Card / Gallery */}
                {card && card.images.length > 0 && !isUser && (
                    <div className="mt-2">
                        {card.title && (
                            <div className="mb-1 text-xs font-semibold text-fg/60">
                                {card.title}
                            </div>
                        )}
                        <div
                            className={`rounded-lg border border-outline-variant bg-surface-panel overflow-hidden ${
                                card.type === 'gallery' ? 'flex gap-1 overflow-x-auto' : ''
                            }`}
                        >
                            {card.images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`${
                                        card.type === 'gallery' ? 'w-32 flex-shrink-0' : ''
                                    } ${card.type !== 'gallery' && i > 0 ? 'border-t border-outline-variant' : ''}`}
                                >
                                    {img.src && (
                                        <img
                                            src={img.src}
                                            alt={img.title}
                                            className={`w-full object-cover ${card.type === 'gallery' ? 'h-24' : 'h-32'}`}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display =
                                                    'none';
                                            }}
                                        />
                                    )}
                                    <div className="p-2">
                                        {img.title && (
                                            <div className="text-xs font-medium text-fg/80">
                                                {img.title}
                                            </div>
                                        )}
                                        {img.description && (
                                            <div className="mt-0.5 text-[11px] text-fg/55">
                                                {img.description}
                                            </div>
                                        )}
                                        {img.button && onButtonClick && (
                                            <button
                                                onClick={() =>
                                                    onButtonClick({
                                                        title: img.button!.title,
                                                        targetNodeId: img.button!.targetNodeId,
                                                    })
                                                }
                                                className="mt-1 rounded bg-info/15 px-2 py-0.5 text-[11px] text-info hover:bg-info/25"
                                            >
                                                {img.button.title}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Buttons */}
                {buttons && buttons.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {buttons.map((btn, i) => (
                            <button
                                key={i}
                                onClick={() => onButtonClick?.(btn)}
                                className="rounded-full border border-info/30 bg-info/5 px-2 py-0.5 text-[11px] text-info hover:bg-info/15"
                            >
                                {btn.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
