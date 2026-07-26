import { useState } from 'react';
import { t } from '../../../i18n';

interface NodeHelpButtonProps {
    content: string;
    color: string;
}

/**
 * Кнопка "?" на ноде — открывает модальное окно с описанием типа блока.
 */
export default function NodeHelpButton({ content, color }: NodeHelpButtonProps) {
    const [show, setShow] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setShow(true);
                }}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)] text-[9px] font-bold text-white/40 transition-colors hover:bg-[rgba(255,255,255,0.2)] hover:text-white/70"
            >
                ?
            </button>
            {show && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShow(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl border bg-[rgba(20,20,25,0.98)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                        style={{ borderColor: `${color}40` }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-base leading-relaxed text-white/80">{content}</p>
                        <button
                            onClick={() => setShow(false)}
                            className="mt-5 w-full rounded-lg bg-[rgba(255,255,255,0.1)] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-[rgba(255,255,255,0.15)]"
                        >
                            {t('help.close')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
