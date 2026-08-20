import { useState, useRef, useEffect, useMemo } from 'react';
import useFlowStore from '../../store/flowStore';
import { listRecentProjects, removeRecentProject, MAX_PROJECTS } from '../../utils/projectsStore';
import { t, tf } from '../../i18n';

/**
 * Дроп-даун недавних проектов — быстрый переход между ботами.
 * Хранится в localStorage, до 8 последних.
 */
export default function ProjectsMenu() {
    const metadata = useFlowStore((s) => s.metadata);
    const fromJSON = useFlowStore((s) => s.fromJSON);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        // Capture phase + pointerdown для React Flow, который перехватывает события холста
        document.addEventListener('mousedown', handler, true);
        document.addEventListener('pointerdown', handler as EventListener, true);
        return () => {
            document.removeEventListener('mousedown', handler, true);
            document.removeEventListener('pointerdown', handler as EventListener, true);
        };
    }, [open]);

    // Перечитываем список каждый раз, когда открываем меню
    const projects = useMemo(() => {
        if (!open) return [];
        return listRecentProjects();
    }, [open, metadata.name]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                title={t('toolbar.recentProjects')}
                className={`rounded-lg p-2 transition-all duration-200 hover:-translate-y-0.5 ${
                    open
                        ? 'bg-[rgba(0,240,255,0.15)] text-info'
                        : 'text-white/60 hover:bg-[rgba(255,255,255,0.1)] hover:text-white/90'
                }`}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M2 4h5l1 2h6v7H2V4z" />
                    <path d="M2 4V3a1 1 0 0 1 1-1h3l1 2" />
                </svg>
            </button>

            {open && (
                <div className="absolute left-0 top-full z-[150] mt-1 w-64 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(30,30,35,0.98)] shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
                        <span>{t('toolbar.recentProjects')}</span>
                        <span className="text-white/20">
                            {projects.length}/{MAX_PROJECTS}
                        </span>
                    </div>
                    {projects.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-white/30">
                            {t('toolbar.noProjects')}
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto">
                            {projects.map((p) => {
                                const isCurrent = p.name === metadata.name;
                                const date = new Date(p.updatedAt);
                                const dateStr = date.toLocaleString();
                                return (
                                    <div
                                        key={p.id}
                                        className={`group flex items-center gap-2 px-3 py-2 transition-colors ${
                                            isCurrent
                                                ? 'bg-[rgba(0,240,255,0.08)]'
                                                : 'hover:bg-[rgba(255,255,255,0.05)]'
                                        }`}
                                    >
                                        <button
                                            onClick={() => {
                                                if (
                                                    !isCurrent &&
                                                    !window.confirm(
                                                        tf('projects.openConfirm', {
                                                            name: p.name,
                                                        }),
                                                    )
                                                ) {
                                                    return;
                                                }
                                                fromJSON(p.doc);
                                                setOpen(false);
                                            }}
                                            className="flex-1 text-left"
                                            title={dateStr}
                                        >
                                            <div className="truncate text-sm text-white/90">
                                                {isCurrent && (
                                                    <span className="mr-1 text-info">●</span>
                                                )}
                                                {p.name}
                                            </div>
                                            <div className="text-[10px] text-white/30">
                                                {p.doc.nodes.length} {t('export.nodes')} · {dateStr}
                                            </div>
                                        </button>
                                        {!isCurrent && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeRecentProject(p.id);
                                                    setOpen(false);
                                                    setTimeout(() => setOpen(true), 0);
                                                }}
                                                className="invisible rounded p-1 text-white/30 hover:bg-[rgba(255,0,85,0.15)] hover:text-error group-hover:visible"
                                                title={t('toolbar.removeProject')}
                                            >
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 12 12"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                >
                                                    <path d="M2 2l8 8M10 2l-8 8" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
