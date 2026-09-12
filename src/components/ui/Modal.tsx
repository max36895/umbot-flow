import { useEffect, useState, type ReactNode } from 'react';
import { t } from '../../i18n';
import { NodeIcon } from './NodeIcons';

interface ModalProps {
    /** Заголовок модалки */
    title: string;
    /** Callback закрытия — вызывается после анимации */
    onClose: () => void;
    /** Максимальная ширина панели */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    /** Максимальная высота (CSS класс), по умолчанию max-h-[85vh] */
    maxHeightClass?: string;
    /** Дополнительный класс панели */
    panelClassName?: string;
    /** Слой z-index — по умолчанию modal (200) */
    zIndex?: 'modal' | 'alert' | 'palette';
    children: ReactNode;
}

const MAX_WIDTH_CLASS = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
} as const;

const Z_CLASS = {
    modal: 'z-modal',
    alert: 'z-alert',
    palette: 'z-palette',
} as const;

/**
 * Единый модальный контейнер: overlay + panel + анимация + close on ESC/click-outside.
 * Заменяет дублирующиеся реализации в HelpModal, BotSettingsModal, ExportDialog, AlertDialog, HelpButton.
 *
 * Footer и action-кнопки передаются внутри children.
 */
export function Modal({
    title,
    onClose,
    maxWidth = 'lg',
    maxHeightClass = 'max-h-[85vh]',
    panelClassName = '',
    zIndex = 'modal',
    children,
}: ModalProps) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setAnimate(true));
    }, []);

    const handleClose = () => {
        setAnimate(false);
        setTimeout(onClose, 150);
    };

    return (
        <div
            className={`fixed inset-0 ${Z_CLASS[zIndex]} flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${animate ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`flex w-full ${MAX_WIDTH_CLASS[maxWidth]} ${maxHeightClass} flex-col rounded-xl border border-glass-border bg-surface-modal shadow-modal backdrop-blur-xl transition-all duration-150 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${panelClassName}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
                    <h2 className="text-lg font-bold text-fg/90">{title}</h2>
                    <button
                        onClick={handleClose}
                        className="text-fg/50 transition-colors hover:text-fg/60"
                        aria-label={t('help.close')}
                    >
                        <NodeIcon name="close" size={14} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
