import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import useFlowStore from '../../store/flowStore';
import {
    listRecentProjects,
    removeRecentProject,
    MAX_PROJECTS,
    type ProjectSnapshot,
} from '../../utils/projectsStore';
import { t, tf } from '../../i18n';
import ConfirmDialog from '../ui/ConfirmDialog';

/**
 * Дроп-даун недавних проектов — быстрый переход между ботами.
 * Хранится в localStorage, до 8 последних.
 *
 * Меню рендерится через портал в body с position: fixed — тулбар имеет
 * overflow-x-auto, который по спецификации CSS делает overflow-y != visible
 * и обрезал бы выпадающее вниз меню.
 */
export default function ProjectsMenu() {
    const metadata = useFlowStore((s) => s.metadata);
    const fromJSON = useFlowStore((s) => s.fromJSON);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const [pendingProject, setPendingProject] = useState<ProjectSnapshot | null>(null);

    // Позиция меню привязана к кнопке; пересчитываем при скролле/ресайзе,
    // чтобы меню не «отрывалось» от кнопки при горизонтальном скролле тулбара
    useEffect(() => {
        if (!open) return;
        const update = () => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;
            const width = 256; // w-64
            const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
            setPos({ top: rect.bottom + 4, left });
        };
        update();
        window.addEventListener('resize', update);
        document.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            document.removeEventListener('scroll', update, true);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (ref.current?.contains(target)) return;
            // Меню в портале вне ref, поэтому проверяем его отдельно
            if (menuRef.current?.contains(target)) return;
            setOpen(false);
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
                    open ? 'bg-info/15 text-info' : 'text-fg/60 hover:bg-fg/10 hover:text-fg/90'
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

            {open &&
                pos &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ top: pos.top, left: pos.left }}
                        className="fixed z-menu w-64 overflow-hidden rounded-xl border border-glass-border bg-surface-modal shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between border-b border-outline-variant px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-fg/50">
                            <span>{t('toolbar.recentProjects')}</span>
                            <span className="text-fg/40">
                                {projects.length}/{MAX_PROJECTS}
                            </span>
                        </div>
                        {projects.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-fg/50">
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
                                                isCurrent ? 'bg-info/[0.08]' : 'hover:bg-fg/5'
                                            }`}
                                        >
                                            <button
                                                onClick={() => {
                                                    if (!isCurrent) {
                                                        // Меню закрываем сразу: диалог в портале,
                                                        // и клик по нему всё равно считался бы кликом «вне»
                                                        setPendingProject(p);
                                                        setOpen(false);
                                                        return;
                                                    }
                                                    fromJSON(p.doc);
                                                    setOpen(false);
                                                }}
                                                className="flex-1 text-left"
                                                title={dateStr}
                                            >
                                                <div className="truncate text-sm text-fg/90">
                                                    {isCurrent && (
                                                        <span className="mr-1 text-info">●</span>
                                                    )}
                                                    {p.name}
                                                </div>
                                                <div className="text-[10px] text-fg/50">
                                                    {p.doc.nodes.length} {t('export.nodes')} ·{' '}
                                                    {dateStr}
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
                                                    className="invisible rounded p-1 text-fg/50 hover:bg-error/15 hover:text-error group-hover:visible"
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
                    </div>,
                    document.body,
                )}

            {pendingProject && (
                <ConfirmDialog
                    title={t('projects.openTitle')}
                    message={tf('projects.openConfirm', { name: pendingProject.name })}
                    onConfirm={() => {
                        fromJSON(pendingProject.doc);
                        setPendingProject(null);
                        setOpen(false);
                    }}
                    onCancel={() => setPendingProject(null)}
                />
            )}
        </div>
    );
}
