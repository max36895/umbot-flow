import { useState, useEffect, useCallback } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import { validate } from '../../utils/validator';
import type { ValidationError } from '../../utils/validator';
import { t } from '../../i18n';

export default function ExportDialog() {
    const { toggleExportDialog, selectNode } = useUiStore();
    const toJSON = useFlowStore((s) => s.toJSON);
    const doc = toJSON();
    const errors = validate(doc);
    const [animate, setAnimate] = useState(false);
    const [commandCopied, setCommandCopied] = useState(false);

    const command = `npx umbot create from-flow ${doc.name || 'flow'}.json --output ./my-bot`;

    useEffect(() => {
        requestAnimationFrame(() => setAnimate(true));
    }, []);

    const handleClose = () => {
        setAnimate(false);
        setTimeout(() => toggleExportDialog(), 150);
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.name || 'flow'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(doc, null, 2)).then(() => {
            alert(t('export.copied'));
        });
    };

    const handleCopyCommand = useCallback(() => {
        navigator.clipboard.writeText(command).then(() => {
            setCommandCopied(true);
            setTimeout(() => setCommandCopied(false), 2000);
        });
    }, [command]);

    const handleErrorClick = (nodeId: string) => {
        selectNode(nodeId);
        handleClose();
    };

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${animate ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-lg rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,25,0.98)] p-6 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-150 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white/90">{t('export.title')}</h2>
                    <button onClick={handleClose} className="text-white/30 hover:text-white/60">
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <h3 className="mb-2 text-sm font-semibold text-white/70">
                        {t('export.validation')}
                    </h3>
                    {errors.length === 0 ? (
                        <div className="rounded-lg bg-[rgba(0,255,157,0.1)] p-3 text-sm text-[#00ff9d] border border-[rgba(0,255,157,0.2)]">
                            {t('export.valid')}
                        </div>
                    ) : (
                        <div className="max-h-48 overflow-y-auto rounded-lg bg-[rgba(255,0,85,0.1)] p-3 border border-[rgba(255,0,85,0.2)]">
                            <p className="mb-2 text-sm font-medium text-[#ff0055]">
                                {errors.length} {t('export.errors')}
                            </p>
                            <ul className="space-y-1.5">
                                {errors.map((err: ValidationError, i: number) => (
                                    <li
                                        key={i}
                                        className={`text-xs text-white/70 flex items-start gap-2 ${err.nodeId ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                                        onClick={() => err.nodeId && handleErrorClick(err.nodeId)}
                                    >
                                        <span className="text-[#ff0055] mt-0.5">•</span>
                                        <span>{err.message}</span>
                                        {err.nodeId && (
                                            <span className="text-[10px] text-white/30 ml-auto">
                                                →
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mb-4 rounded-lg bg-[rgba(255,255,255,0.05)] p-3 border border-[rgba(255,255,255,0.08)]">
                    <p className="text-xs text-white/60">
                        <strong className="text-white/80">{doc.name}</strong> v{doc.version} —{' '}
                        {doc.nodes.length} {t('export.nodes')}, {doc.edges.length}{' '}
                        {t('export.edges')}, {doc.platforms.length} {t('export.platforms')}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="rounded-lg border border-[rgba(255,255,255,0.15)] px-4 py-2 text-sm text-white/70 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                        {t('export.copyJson')}
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={errors.length > 0}
                        className="rounded-lg bg-gradient-to-r from-[#bc13fe] to-[#00f0ff] px-4 py-2 text-sm text-white shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] disabled:cursor-not-allowed disabled:from-white/20 disabled:to-white/20 disabled:shadow-none transition-all"
                    >
                        {t('export.download')}
                    </button>
                </div>

                {errors.length === 0 && (
                    <div className="mt-5 rounded-lg border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.05)] p-4">
                        <h3 className="mb-3 text-sm font-bold text-[#00f0ff]">
                            {t('export.readyTitle')}
                        </h3>

                        <div className="space-y-3 text-xs text-white/60">
                            <div className="flex items-start gap-3">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(0,240,255,0.15)] text-[10px] font-bold text-[#00f0ff]">
                                    1
                                </span>
                                <div>
                                    <p>{t('export.step1')}</p>
                                    <a
                                        href="https://nodejs.org"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-block rounded bg-[rgba(0,255,157,0.1)] px-2 py-0.5 font-mono text-[10px] text-[#00ff9d] border border-[rgba(0,255,157,0.2)] hover:bg-[rgba(0,255,157,0.2)] transition-colors"
                                    >
                                        nodejs.org
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(0,240,255,0.15)] text-[10px] font-bold text-[#00f0ff]">
                                    2
                                </span>
                                <div>
                                    <p>{t('export.step2')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(0,240,255,0.15)] text-[10px] font-bold text-[#00f0ff]">
                                    3
                                </span>
                                <div className="flex-1">
                                    <p>{t('export.step3')}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <code className="flex-1 rounded-lg bg-[rgba(0,240,255,0.1)] px-3 py-2 font-mono text-[11px] text-[#00f0ff] border border-[rgba(0,240,255,0.2)] break-all">
                                            {command}
                                        </code>
                                        <button
                                            onClick={handleCopyCommand}
                                            title={t('export.copyCommand')}
                                            className="flex-shrink-0 rounded-lg border border-[rgba(0,255,157,0.3)] bg-[rgba(0,255,157,0.1)] p-2 text-[#00ff9d] transition-colors hover:bg-[rgba(0,255,157,0.2)]"
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
                                    <div className="mt-2 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-2">
                                        <p className="text-[10px] text-white/40">
                                            {t('export.cloudTitle')}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <code className="flex-1 rounded bg-[rgba(0,240,255,0.05)] px-2 py-1 font-mono text-[10px] text-[#00f0ff]/70 break-all">
                                                npx umbot create from-flow {doc.name || 'flow'}.json
                                                --output ./my-bot --usecloud
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        `npx umbot create from-flow ${doc.name || 'flow'}.json --output ./my-bot --usecloud`,
                                                    );
                                                }}
                                                title={t('export.copyCommand')}
                                                className="flex-shrink-0 rounded border border-[rgba(0,255,157,0.3)] bg-[rgba(0,255,157,0.1)] p-1 text-[#00ff9d] transition-colors hover:bg-[rgba(0,255,157,0.2)]"
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
                                        <p className="mt-1 text-[10px] text-white/30">
                                            {t('export.cloudDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-3 text-[11px] text-white/50">{t('export.afterCommand')}</p>

                        <p className="mt-2 text-[11px] text-[#00f0ff]/60 italic">
                            {t('export.tip')}
                        </p>

                        <p className="mt-2 text-[11px] text-[#00f0ff]/40">
                            {t('export.jsonFormatHint')}{' '}
                            <a
                                href="https://github.com/max36895/universal_bot-ts/blob/main/repos/umbot-flow-editor/src/docs/json-format.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-[#00f0ff]/70 transition-colors"
                            >
                                src/docs/json-format.md
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
