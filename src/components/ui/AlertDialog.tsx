import { useEffect } from 'react';
import { t } from '../../i18n';
import { Modal } from './Modal';
import { PrimaryButton } from './PrimaryButton';
import { NodeIcon } from './NodeIcons';

interface AlertDialogProps {
    title: string;
    message: string;
    onClose: () => void;
}

/**
 * Единое модальное окно сообщений об ошибке/предупреждения.
 * Заменяет сырой alert() — единый стиль, локализованная кнопка закрытия.
 */
export default function AlertDialog({ title, message, onClose }: AlertDialogProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Enter') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <Modal
            title={title}
            onClose={onClose}
            maxWidth="md"
            zIndex="alert"
            panelClassName="!border-error/30 !shadow-glow-pink-lg"
        >
            <div className="px-6 py-4">
                <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-error/15 text-error">
                        <NodeIcon name="warning" size={16} />
                    </span>
                </div>
                <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-outline-variant bg-white/[0.03] p-3 text-xs leading-relaxed text-white/70">
                    {message}
                </pre>
            </div>
            <div className="flex justify-end border-t border-outline-variant px-6 py-4">
                <PrimaryButton onClick={onClose}>{t('help.close')}</PrimaryButton>
            </div>
        </Modal>
    );
}
