import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface NodeHelpButtonProps {
    content: string;
    color: string;
}

/**
 * Кнопка "?" на ноде — открывает лёгкий popover с описанием типа блока.
 * Обёрнута в memo: пропсы (content, color) — стабильные строки, поэтому
 * компонент не ре-рендерится вместе с родительской нодой без необходимости.
 */
function NodeHelpButtonComponent({ content, color }: NodeHelpButtonProps) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const popRef = useRef<HTMLDivElement>(null);

    const updatePos = useCallback(() => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (!rect) return;
        const width = 288; // w-72
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
        let top = rect.bottom + 6;
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
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                aria-expanded={open}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-fg/10 text-[11px] font-bold text-fg/50 transition-colors hover:bg-fg/20 hover:text-fg/70"
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
                        className="fixed z-popover w-72 rounded-lg border bg-surface-modal p-3.5 shadow-dropdown backdrop-blur-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-2 h-0.5 w-8 rounded-full" style={{ backgroundColor: color }} />
                        <p className="text-xs leading-relaxed text-fg/80">{content}</p>
                    </div>,
                    document.body,
                )}
        </>
    );
}

const NodeHelpButton = memo(NodeHelpButtonComponent);
export default NodeHelpButton;
