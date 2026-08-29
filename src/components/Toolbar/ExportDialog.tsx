import { useState, useCallback } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import { validate } from '../../utils/validator';
import type { ValidationError } from '../../utils/validator';
import { t } from '../../i18n';
import { NodeIcon } from '../ui/NodeIcons';
import { Modal } from '../ui/Modal';

export default function ExportDialog() {
    const toggleExportDialog = useUiStore((s) => s.toggleExportDialog);
    const selectNode = useUiStore((s) => s.selectNode);
    const toJSON = useFlowStore((s) => s.toJSON);
    const doc = toJSON();
    const errors = validate(doc);
    const [commandCopied, setCommandCopied] = useState(false);
    const [jsonCopied, setJsonCopied] = useState(false);

    // Безопасное имя файла: пробелы/спецсимволы ломают shell-команду — подменяем на _
    const safeFileName = (doc.name || 'flow').replace(/[^a-zA-Z0-9_-]+/g, '_');
    const command = `npx umbot create from-flow ${safeFileName}.json --output ./my-bot`;

    const handleClose = () => toggleExportDialog();

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(doc.name || 'flow').replace(/[^a-zA-Z0-9_-]+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard
            ?.writeText(JSON.stringify(doc, null, 2))
            .then(() => {
                setJsonCopied(true);
                setTimeout(() => setJsonCopied(false), 2000);
            })
            .catch(() => {
                /* clipboard недоступен (например, http-контекст) — молча игнорируем */
            });
    };

    const handleCopyCommand = useCallback(() => {
        navigator.clipboard
            ?.writeText(command)
            .then(() => {
                setCommandCopied(true);
                setTimeout(() => setCommandCopied(false), 2000);
            })
            .catch(() => {
                /* clipboard недоступен — молча игнорируем */
            });
    }, [command]);

    const handleErrorClick = (nodeId: string) => {
        selectNode(nodeId);
        handleClose();
    };

    return (
        <Modal title={t('export.title')} onClose={handleClose} maxWidth="lg">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                <div className="mb-4">
                    <h3 className="mb-2 text-sm font-semibold text-fg/70">
                        {t('export.validation')}
                    </h3>
                    {errors.length === 0 ? (
                        <div className="rounded-lg bg-success/10 p-3 text-sm text-success border border-success/20">
                            {t('export.valid')}
                        </div>
                    ) : (
                        <div className="max-h-48 overflow-y-auto rounded-lg bg-error/10 p-3 border border-error/20">
                            <p className="mb-2 text-sm font-medium text-error">
                                {errors.length} {t('export.errors')}
                            </p>
                            <ul className="space-y-1.5">
                                {errors.map((err: ValidationError, i: number) => (
                                    <li
                                        key={i}
                                        className={`text-xs text-fg/70 flex items-start gap-2 ${err.nodeId ? 'cursor-pointer hover:text-fg transition-colors' : ''}`}
                                        onClick={() => err.nodeId && handleErrorClick(err.nodeId)}
                                    >
                                        <span className="text-error mt-0.5">•</span>
                                        <span>{err.message}</span>
                                        {err.nodeId && (
                                            <span className="text-[11px] text-fg/50 ml-auto">
                                                →
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mb-4 rounded-lg bg-fg/5 p-3 border border-outline-variant">
                    <p className="text-xs text-fg/60">
                        <strong className="text-fg/80">{doc.name}</strong> v{doc.version} —{' '}
                        {doc.nodes.length} {t('export.nodes')}, {doc.edges.length}{' '}
                        {t('export.edges')}, {doc.platforms.length} {t('export.platforms')}
                    </p>
                    <p className="mt-2 text-[11px] text-fg/55">{t('export.note')}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                            jsonCopied
                                ? 'border-success/40 bg-success/10 text-success'
                                : 'border-outline text-fg/70 hover:bg-fg/10'
                        }`}
                    >
                        {jsonCopied ? (
                            <span className="inline-flex items-center gap-1.5">
                                <NodeIcon name="check" size={12} strokeWidth={2} />
                                {t('export.copied')}
                            </span>
                        ) : (
                            t('export.copyJson')
                        )}
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={errors.length > 0}
                        className="rounded-lg bg-gradient-to-r from-accent to-info px-4 py-2 text-sm text-white shadow-glow-cyan transition-all hover:shadow-glow-cyan-lg disabled:cursor-not-allowed disabled:from-white/20 disabled:to-white/20 disabled:shadow-none"
                    >
                        {t('export.download')}
                    </button>
                </div>

                {errors.length === 0 && (
                    <div className="mt-5 rounded-lg border border-info/20 bg-info/5 p-4">
                        <h3 className="mb-3 text-sm font-bold text-info">
                            {t('export.readyTitle')}
                        </h3>

                        <div className="space-y-3 text-xs text-fg/70">
                            <div className="flex items-start gap-3">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-info/15 text-[11px] font-bold text-info">
                                    1
                                </span>
                                <div>
                                    <p>{t('export.step1')}</p>
                                    <a
                                        href="https://nodejs.org"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-block rounded bg-success/10 px-2 py-0.5 font-mono text-[11px] text-success border border-success/20 hover:bg-success/20 transition-colors"
                                    >
                                        nodejs.org
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-info/15 text-[11px] font-bold text-info">
                                    2
                                </span>
                                <div>
                                    <p>{t('export.step2')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-info/15 text-[11px] font-bold text-info">
                                    3
                                </span>
                                <div className="flex-1">
                                    <p>{t('export.step3')}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <code className="flex-1 rounded-lg bg-info/10 px-3 py-2 font-mono text-[11px] text-info border border-info/20 break-all">
                                            {command}
                                        </code>
                                        <button
                                            onClick={handleCopyCommand}
                                            title={t('export.copyCommand')}
                                            className="flex-shrink-0 rounded-lg border border-success/30 bg-success/10 p-2 text-success transition-colors hover:bg-success/20"
                                        >
                                            {commandCopied ? (
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M3 8l3 3 7-7" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect x="5" y="5" width="9" height="9" rx="1" />
                                                    <path d="M2 11V3a1 1 0 0 1 1-1h8" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="mt-2 rounded-lg border border-outline-variant bg-fg/[0.02] p-2">
                                        <p className="text-[11px] text-fg/60">
                                            {t('export.cloudTitle')}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <code className="flex-1 rounded bg-info/5 px-2 py-1 font-mono text-[11px] text-info/80 break-all">
                                                npx umbot create from-flow {safeFileName}.json
                                                --output ./my-bot --usecloud
                                            </code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard
                                                    ?.writeText(
                                                        `npx umbot create from-flow ${safeFileName}.json --output ./my-bot --usecloud`,
                                                    )
                                                    .catch(() => {
                                                        /* clipboard недоступен — молча игнорируем */
                                                    });
                                            }}
                                                title={t('export.copyCommand')}
                                                className="flex-shrink-0 rounded border border-success/30 bg-success/10 p-1 text-success transition-colors hover:bg-success/20"
                                            >
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <rect x="5" y="5" width="9" height="9" rx="1" />
                                                    <path d="M2 11V3a1 1 0 0 1 1-1h8" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="mt-1 text-[11px] text-fg/50">
                                            {t('export.cloudDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-3 text-[11px] text-fg/60">{t('export.afterCommand')}</p>

                        <p className="mt-2 text-[11px] text-info/70 italic">
                            {t('export.tip')}
                        </p>

                        <p className="mt-2 text-[11px] text-info/60">
                            {t('export.jsonFormatHint')}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
