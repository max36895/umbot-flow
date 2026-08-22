import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface HelpButtonProps {
    content: string;
    className?: string;
}

/**
 * "?" кнопка — открывает лёгкий popover-подсказку рядом с кнопкой.
 * Позиция вычисляется по кнопке; popover рендерится в body через портал,
 * чтобы не обрезаться overflow-контейнерами панелей.
 */
export default function HelpButton({ content, className = '' }: HelpButtonProps) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const popRef = useRef<HTMLDivElement>(null);

    // Разбиваем текст на строки для отображения
    const lines = content.split('\n').filter(Boolean);

    const updatePos = useCallback(() => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (!rect) return;
        const width = 288; // w-72
        // Предпочтительно — под кнопкой, с выравниванием по левому краю кнопки;
        // прижимаем к краям экрана, чтобы не вылезал
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
        let top = rect.bottom + 6;
        // Если снизу мало места — показываем над кнопкой (оценка высоты ~160px)
        if (window.innerHeight - top < 180) top = Math.max(8, rect.top - 166);
        setPos({ top, left });
    }, []);

    useEffect(() => {
        if (!open) return;
        updatePos();
        window.addEventListener('resize', updatePos);
        document.addEventListener('scroll', updatePos, true);
        return () => {
            window.removeEventListener('resize', updatePos);
            document.removeEventListener('scroll', updatePos, true);
        };
    }, [open, updatePos]);

    // Закрытие при клике вне и по Escape
    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (btnRef.current?.contains(target)) return;
            if (popRef.current?.contains(target)) return;
            setOpen(false);
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [open]);

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-fg/10 text-[11px] font-bold text-fg/50 hover:bg-fg/20 hover:text-fg/70 ${className}`}
            >
                ?
            </button>
            {open &&
                pos &&
                createPortal(
                    <div
                        ref={popRef}
                        role="tooltip"
                        style={{ top: pos.top, left: pos.left }}
                        className="fixed z-alert w-72 rounded-lg border border-glass-border bg-surface-modal p-3.5 shadow-dropdown backdrop-blur-xl"
                    >
                        <div className="space-y-1.5 text-xs leading-relaxed text-fg/80">
                            {lines.map((line, i) => {
                                if (line.startsWith('•') || line.startsWith('-')) {
                                    return (
                                        <div key={i} className="flex gap-2 pl-1">
                                            <span className="text-info">•</span>
                                            <span>{line.replace(/^[\s•-]+/, '')}</span>
                                        </div>
                                    );
                                }
                                if (line.includes('  ')) {
                                    return (
                                        <code
                                            key={i}
                                            className="block rounded bg-fg/5 px-2 py-1 font-mono text-[11px] text-fg/70 border border-outline-variant"
                                        >
                                            {line.trim()}
                                        </code>
                                    );
                                }
                                return <p key={i}>{line}</p>;
                            })}
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
