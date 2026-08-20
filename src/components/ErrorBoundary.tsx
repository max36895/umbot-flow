import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '../i18n';

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
                <div className="w-full max-w-md rounded-xl border border-[rgba(255,0,85,0.3)] bg-[rgba(20,20,25,0.98)] p-6 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
                    <h1 className="mb-2 text-lg font-bold text-white/90">
                        {t('error.crashTitle')}
                    </h1>
                    <p className="mb-4 text-sm text-white/60">{t('error.crashDesc')}</p>
                    <pre className="mb-4 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[rgba(255,255,255,0.08)] bg-white/[0.03] p-3 text-xs text-error/80">
                        {this.state.error.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-gradient-to-r from-[#bc13fe] to-[#00f0ff] px-4 py-2 text-sm text-white shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                    >
                        {t('error.reload')}
                    </button>
                </div>
            </div>
        );
    }
}
