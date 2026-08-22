import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '../i18n';
import { PrimaryButton } from './ui/PrimaryButton';

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

/**
 * Глобальный ErrorBoundary — ловит ошибки рендера, чтобы приложение
 * не падало белым экраном. Показывает сообщение и кнопку перезагрузки.
 */
export default class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[umbot-flow] Uncaught render error:', error, info.componentStack);
    }

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <div className="flex h-screen w-screen items-center justify-center bg-surface-dim p-6">
                <div className="w-full max-w-md rounded-xl border border-error/30 bg-surface-modal p-6 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
                    <h1 className="mb-2 text-lg font-bold text-fg/90">
                        {t('error.crashTitle')}
                    </h1>
                    <p className="mb-4 text-sm text-fg/60">{t('error.crashDesc')}</p>
                    <pre className="mb-4 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-outline-variant bg-fg/[0.03] p-3 text-xs text-error/80">
                        {this.state.error.message}
                    </pre>
                    <PrimaryButton onClick={() => window.location.reload()}>
                        {t('error.reload')}
                    </PrimaryButton>
                </div>
            </div>
        );
    }
}
