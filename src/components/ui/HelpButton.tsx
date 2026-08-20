import { useState, useEffect } from 'react';
import { t } from '../../i18n';

interface HelpButtonProps {
    content: string;
    className?: string;
}

/** "?" кнопка — открывает всплывающую подсказку с пояснением. */
export default function HelpButton({ content, className = '' }: HelpButtonProps) {
    const [open, setOpen] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setAnimate(true));
        } else {
            setAnimate(false);
        }
    }, [open]);

    // Разбиваем текст на строки для отображения
    const lines = content.split('\n').filter(Boolean);

    const handleClose = () => {
        setAnimate(false);
        setTimeout(() => setOpen(false), 150);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)] text-[10px] font-bold text-white/40 hover:bg-[rgba(255,255,255,0.2)] hover:text-white/60 ${className}`}
            >
                ?
            </button>
            {open && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${animate ? 'opacity-100' : 'opacity-0'}`}
                    onClick={handleClose}
                >
                    <div
                        className={`max-w-sm rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,25,0.98)] p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-150 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 space-y-2 text-sm leading-relaxed text-white/70">
                            {lines.map((line, i) => {
                                if (line.startsWith('•') || line.startsWith('-')) {
                                    return (
                                        <div key={i} className="flex gap-2 pl-2">
                                            <span className="text-info">•</span>
                                            <span>{line.replace(/^[\s•-]+/, '')}</span>
                                        </div>
                                    );
                                }
                                if (line.includes('  ')) {
                                    return (
                                        <code
                                            key={i}
                                            className="block rounded-lg bg-[rgba(255,255,255,0.05)] px-3 py-1.5 font-mono text-xs text-white/60 border border-[rgba(255,255,255,0.08)]"
                                        >
                                            {line.trim()}
                                        </code>
                                    );
                                }
                                return <p key={i}>{line}</p>;
                            })}
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full rounded-lg bg-gradient-to-r from-[#bc13fe] to-[#00f0ff] px-4 py-2 text-sm font-medium text-white shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all"
                        >
                            {t('help.close')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
