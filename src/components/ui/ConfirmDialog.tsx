import { useEffect } from 'react';
import { t } from '../../i18n';
import { Modal } from './Modal';
import { PrimaryButton } from './PrimaryButton';

interface ConfirmDialogProps {
    title: string;
    message: string;
    /** Подпись кнопки подтверждения (по умолчанию t('confirm.ok')) */
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Единое модальное окно подтверждения (заменяет сырой window.confirm).
 * Кнопки «Отмена» / «Подтвердить», закрытие по ESC и клику вне.
 */
export default function ConfirmDialog({
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onCancel]);

    return (
        <Modal title={title} onClose={onCancel} maxWidth="md" zIndex="alert">
            <div className="px-6 py-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg/70">{message}</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-outline-variant px-6 py-4">
                <button
                    onClick={onCancel}
                    className="rounded-lg border border-outline px-4 py-2 text-sm text-fg/70 transition-colors hover:bg-fg/10"
                >
                    {t('confirm.cancel')}
                </button>
                <PrimaryButton onClick={onConfirm}>{confirmLabel ?? t('confirm.ok')}</PrimaryButton>
            </div>
        </Modal>
    );
}
