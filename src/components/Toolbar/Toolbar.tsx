import { useRef, useEffect, useCallback, useState } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import { t, tf } from '../../i18n';
import { validate } from '../../utils/validator';
import PlatformSelector from '../ui/PlatformSelector';
import ProjectsMenu from './ProjectsMenu';
import {
    saveRecentProject,
    listRecentProjects,
    removeRecentProject,
    type ProjectSnapshot,
} from '../../utils/projectsStore';
import AlertDialog from '../ui/AlertDialog';
import ConfirmDialog from '../ui/ConfirmDialog';
import {
    IconUndo,
    IconRedo,
    IconNew,
    IconImport,
    IconExport,
    IconImage,
    IconChat,
    IconCheck,
    IconHelp,
    IconMinimap,
    IconSettings,
    IconMenu,
    IconSun,
    IconMoon,
} from './icons';

export default function Toolbar() {
    const undo = useFlowStore((s) => s.undo);
    const redo = useFlowStore((s) => s.redo);
    const toJSON = useFlowStore((s) => s.toJSON);
    const fromJSON = useFlowStore((s) => s.fromJSON);
    const togglePreview = useUiStore((s) => s.togglePreview);
    const toggleExportDialog = useUiStore((s) => s.toggleExportDialog);
    const toggleHelp = useUiStore((s) => s.toggleHelp);
    const toggleLocale = useUiStore((s) => s.toggleLocale);
    const toggleBotSettings = useUiStore((s) => s.toggleBotSettings);
    const toggleMinimap = useUiStore((s) => s.toggleMinimap);
    const minimapVisible = useUiStore((s) => s.minimapVisible);
    const toggleTheme = useUiStore((s) => s.toggleTheme);
    const theme = useUiStore((s) => s.theme);
    const locale = useUiStore((s) => s.locale);
    const metadata = useFlowStore((s) => s.metadata);
    const setMetadata = useFlowStore((s) => s.setMetadata);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);
    const [confirmNewOpen, setConfirmNewOpen] = useState(false);
    // Подтверждение открытия проекта из бургера живёт здесь, а не в BurgerMenu:
    // диалог рендерится порталом, клик по нему закрывает бургер и размонтировал бы его
    const [pendingProject, setPendingProject] = useState<ProjectSnapshot | null>(null);

    // Пасхалка: 10 кликов по лого-марке → служебный терминал UM-13 (/secret.html)
    const logoClicksRef = useRef(0);
    const logoResetTimerRef = useRef<number | undefined>(undefined);
    const [logoWiggle, setLogoWiggle] = useState(false);
    const handleLogoClick = useCallback(() => {
        logoClicksRef.current += 1;
        window.clearTimeout(logoResetTimerRef.current);
        // окно внимания 4 сек — как на лендинге, между кликами можно чуть подумать
        logoResetTimerRef.current = window.setTimeout(() => {
            logoClicksRef.current = 0;
            setLogoWiggle(false);
        }, 4000);
        if (logoClicksRef.current >= 7 && logoClicksRef.current < 10) setLogoWiggle(true);
        if (logoClicksRef.current >= 10) {
            logoClicksRef.current = 0;
            setLogoWiggle(false);
            window.clearTimeout(logoResetTimerRef.current);
            window.location.href = '/secret.html';
        }
    }, []);

    // Бургер-меню для узких экранов: показываем, когда тулбар переполнен
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [burgerOpen, setBurgerOpen] = useState(false);
    const burgerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = toolbarRef.current;
        if (!el) return;
        const check = () => setIsOverflowing(el.scrollWidth > el.clientWidth);
        check();
        const ro = new ResizeObserver(check);
        ro.observe(el);
        window.addEventListener('resize', check);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', check);
        };
    }, []);

    // Закрытие бургера по клику вне
    useEffect(() => {
        if (!burgerOpen) return;
        const handler = (e: MouseEvent) => {
            if (burgerRef.current && !burgerRef.current.contains(e.target as Node)) {
                setBurgerOpen(false);
            }
        };
        document.addEventListener('mousedown', handler, true);
        return () => document.removeEventListener('mousedown', handler, true);
    }, [burgerOpen]);

    // Автоматически сохраняем проект в историю при изменении (debounced)
    const nodes = useFlowStore((s) => s.nodes);
    useEffect(() => {
        if (nodes.length === 0) return;
        const timer = setTimeout(() => {
            saveRecentProject(metadata.name, toJSON());
        }, 2000);
        return () => clearTimeout(timer);
    }, [metadata.name, nodes, toJSON]);

    const handleNewProject = useCallback(() => {
        setConfirmNewOpen(true);
    }, []);

    const confirmNewProject = useCallback(() => {
        setConfirmNewOpen(false);
        fromJSON({
            schemaVersion: '1.0',
            name: 'New Bot',
            version: '1.0.0',
            description: '',
            platforms: [],
            database: { type: 'file', config: {} },
            mode: 'prod',
            isLocalStorage: true,
            nodes: [],
            edges: [],
            fallback: {
                text: locale === 'ru' ? 'Извините, я вас не понял.' : "Sorry, I didn't understand.",
            },
            welcome: { text: '', buttons: [] },
            helpText: { text: '' },
            variables: {},
        });
    }, [fromJSON, locale]);

    const handleExportJSON = useCallback(() => {
        const doc = toJSON();
        const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Безопасное имя файла: латиница, цифры, - и _ (иначе ломается команда ниже)
        const safeName = (metadata.name || 'flow').replace(/[^a-zA-Z0-9_-]+/g, '_');
        a.download = `${safeName}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [toJSON, metadata.name]);

    const handleImportJSON = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const doc = JSON.parse(reader.result as string);
                    // Валидация перед загрузкой в state
                    const errors = validate(doc);
                    if (errors.length > 0) {
                        setAlertDialog({
                            title: t('error.importTitle'),
                            message:
                                t('error.validationFailed') +
                                '\n\n' +
                                errors.map((e) => `• ${e.message}`).join('\n'),
                        });
                        return;
                    }
                    fromJSON(doc);
                    // Сохраняем в историю после успешного импорта
                    saveRecentProject(doc.name || 'imported', doc);
                } catch (err) {
                    setAlertDialog({
                        title: t('error.importTitle'),
                        message: tf('error.parseFailedDetail', {
                            details: err instanceof Error ? err.message : String(err),
                        }),
                    });
                }
            };
            reader.readAsText(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        [fromJSON],
    );

    const handleExportPNGFull = useCallback(async () => {
        try {
            const { toPng } = await import('html-to-image');
            // Просим react-flow fit все ноды перед экспортом
            const fitBtn = document.querySelector(
                '.react-flow__controls-fitview',
            ) as HTMLButtonElement;
            fitBtn?.click();
            // Даём react-flow перерисоваться
            await new Promise((resolve) => setTimeout(resolve, 300));
            const el = document.querySelector('.react-flow') as HTMLElement;
            if (!el) return;
            const canvasBg = getComputedStyle(document.documentElement)
                .getPropertyValue('--canvas-bg')
                .trim();
            const dataUrl = await toPng(el, { backgroundColor: canvasBg || '#0F0F14' });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${metadata.name || 'flow'}-full.png`;
            a.click();
        } catch {
            setAlertDialog({ title: t('error.exportTitle'), message: t('error.exportFailed') });
        }
    }, [metadata.name]);

    // Глобальные горячие клавиши
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const isInput =
                e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
            const mod = e.ctrlKey || e.metaKey;
            // toLowerCase — чтобы хоткеи работали и с включённым Caps Lock
            const key = e.key.toLowerCase();

            // Ctrl+N — новый проект
            if (mod && key === 'n') {
                e.preventDefault();
                handleNewProject();
                return;
            }

            // Ctrl+S — экспорт JSON (проект и так автосохранён в браузере —
            // говорим об этом явно, иначе Ctrl+S выглядит как «только сейчас сохранилось»)
            if (mod && key === 's') {
                e.preventDefault();
                handleExportJSON();
                useUiStore.getState().showToast(t('toast.exported'));
                return;
            }

            // Ctrl+P — превью чата
            if (mod && key === 'p' && !e.shiftKey) {
                e.preventDefault();
                togglePreview();
                return;
            }

            // Ctrl+Z — отмена
            if (mod && key === 'z' && !e.shiftKey && !isInput) {
                e.preventDefault();
                undo();
                return;
            }

            // Ctrl+Shift+Z — повтор
            if (mod && key === 'z' && e.shiftKey && !isInput) {
                e.preventDefault();
                redo();
                return;
            }

            // Escape — закрыть превью/диалог
            if (e.key === 'Escape') {
                const state = useUiStore.getState();
                if (state.previewOpen) useUiStore.setState({ previewOpen: false });
                if (state.exportDialogOpen) useUiStore.setState({ exportDialogOpen: false });
                if (state.helpOpen) useUiStore.setState({ helpOpen: false });
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleNewProject, handleExportJSON, togglePreview, undo, redo]);

    return (
        <>
            <div className="absolute left-[10px] right-[10px] top-[10px] z-toolbar flex items-center gap-2">
                {/* Лого-марка (клик 10 раз — пасхалка, см. handleLogoClick) */}
                <button
                    type="button"
                    onClick={handleLogoClick}
                    title="Umbot Flow"
                    aria-label="Umbot Flow"
                    className={`flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[9px] border border-glass-border bg-gradient-to-br from-info to-accent shadow-md transition-transform duration-200 ${
                        logoWiggle ? 'animate-pulse' : 'hover:scale-105'
                    }`}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                        <path
                            d="M5 7h5M5 12h9M5 17h13"
                            stroke="#051015"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                        />
                        <circle cx="19" cy="7" r="2.2" fill="#051015" />
                    </svg>
                </button>

                {/* Название бота — всегда видно, не скроллится */}
                <div className="relative flex-shrink-0">
                    <input
                        type="text"
                        value={metadata.name}
                        onChange={(e) => setMetadata({ name: e.target.value })}
                        className="w-40 rounded-lg border border-glass-border bg-surface-dim/70 px-3 py-1.5 text-sm font-semibold text-fg/90 backdrop-blur-xl transition-colors focus:border-info focus:ring-1 focus:ring-info focus:outline-none"
                        placeholder={t('toolbar.botName')}
                        title={t('detail.botNameHelp')}
                    />
                </div>

                {/* Скроллируемая часть тулбара */}
                <div
                    ref={toolbarRef}
                    className="toolbar-scroll flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-full border border-glass-border bg-surface-dim/70 px-4 py-2 shadow-lg backdrop-blur-xl"
                >
                    <Divider />

                    {/* История */}
                    <ToolBtn onClick={undo} title={t('toolbar.undo')}>
                        <IconUndo />
                    </ToolBtn>
                    <ToolBtn onClick={redo} title={t('toolbar.redo')}>
                        <IconRedo />
                    </ToolBtn>

                    <Divider />

                    {/* Файл */}
                    <ToolBtn onClick={handleNewProject} title={t('toolbar.newProject')}>
                        <IconNew />
                    </ToolBtn>
                    <ProjectsMenu />
                    <ToolBtn
                        onClick={() => fileInputRef.current?.click()}
                        title={t('toolbar.importJson')}
                    >
                        <IconImport />
                    </ToolBtn>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        className="hidden"
                    />
                    <ToolBtn
                        onClick={() => {
                            handleExportJSON();
                            useUiStore.getState().showToast(t('toast.exported'));
                        }}
                        title={t('toolbar.exportJson')}
                    >
                        <IconExport />
                    </ToolBtn>
                    <ToolBtn onClick={handleExportPNGFull} title={t('toolbar.exportPng')}>
                        <IconImage />
                    </ToolBtn>

                    <Divider />

                    {/* Тест — компактные кнопки с иконками */}
                    <ToolBtn onClick={togglePreview} title={t('toolbar.preview')} accent="chat">
                        <IconChat />
                    </ToolBtn>
                    {/* Главный CTA — иконка на градиенте, как раньше */}
                    <ToolBtn
                        onClick={toggleExportDialog}
                        title={t('toolbar.validate')}
                        accent="green"
                    >
                        <IconCheck />
                    </ToolBtn>

                    <Divider />

                    {/* Справка */}
                    <ToolBtn onClick={toggleHelp} title={t('toolbar.help')}>
                        <IconHelp />
                    </ToolBtn>

                    <div className="flex-1" />

                    {/* Настройки бота */}
                    <ToolBtn onClick={toggleBotSettings} title={t('toolbar.botSettings')}>
                        <IconSettings />
                    </ToolBtn>

                    {/* Миниатюра */}
                    <ToolBtn
                        onClick={toggleMinimap}
                        title={minimapVisible ? t('toolbar.hideMinimap') : t('toolbar.showMinimap')}
                        active={minimapVisible}
                    >
                        <IconMinimap />
                    </ToolBtn>

                    {/* Язык */}
                    <button
                        onClick={toggleLocale}
                        className="rounded-lg border border-glass-border px-2 py-1 text-xs font-medium text-fg/60 transition-colors hover:bg-fg/10 hover:text-fg/90"
                        title={locale === 'ru' ? t('toolbar.localeEn') : t('toolbar.localeRu')}
                    >
                        {locale === 'ru' ? 'RU' : 'EN'}
                    </button>

                    {/* Тема */}
                    <ToolBtn
                        onClick={toggleTheme}
                        title={theme === 'dark' ? t('toolbar.themeLight') : t('toolbar.themeDark')}
                    >
                        {theme === 'dark' ? <IconSun /> : <IconMoon />}
                    </ToolBtn>

                    <Divider />

                    {/* Платформы */}
                    <PlatformSelector
                        value={metadata.platforms}
                        onChange={(platforms) => setMetadata({ platforms })}
                    />
                </div>

                {/* Бургер — появляется, когда тулбар переполнен */}
                {isOverflowing && (
                    <div className="relative flex-shrink-0" ref={burgerRef}>
                        <button
                            onClick={() => setBurgerOpen(!burgerOpen)}
                            title={t('toolbar.more')}
                            className={`rounded-full border border-glass-border bg-surface-dim/70 p-2.5 backdrop-blur-xl transition-colors ${
                                burgerOpen
                                    ? 'bg-info/15 text-info'
                                    : 'text-fg/60 hover:bg-fg/10 hover:text-fg/90'
                            }`}
                        >
                            <IconMenu />
                        </button>

                        {burgerOpen && (
                            <BurgerMenu
                                onClose={() => setBurgerOpen(false)}
                                onOpenProject={setPendingProject}
                                onUndo={undo}
                                onRedo={redo}
                                onNew={handleNewProject}
                                onImport={() => fileInputRef.current?.click()}
                                onExportJson={handleExportJSON}
                                onExportPng={handleExportPNGFull}
                                onPreview={togglePreview}
                                onValidate={toggleExportDialog}
                                onHelp={toggleHelp}
                                onSettings={toggleBotSettings}
                                onMinimap={toggleMinimap}
                                minimapVisible={minimapVisible}
                                onLocale={toggleLocale}
                                locale={locale}
                                onTheme={toggleTheme}
                                theme={theme}
                            />
                        )}
                    </div>
                )}
            </div>

            {alertDialog && (
                <AlertDialog
                    title={alertDialog.title}
                    message={alertDialog.message}
                    onClose={() => setAlertDialog(null)}
                />
            )}

            {confirmNewOpen && (
                <ConfirmDialog
                    title={t('toolbar.newProject')}
                    message={t('toolbar.newProjectConfirm')}
                    onConfirm={confirmNewProject}
                    onCancel={() => setConfirmNewOpen(false)}
                />
            )}

            {pendingProject && (
                <ConfirmDialog
                    title={t('projects.openTitle')}
                    message={tf('projects.openConfirm', { name: pendingProject.name })}
                    onConfirm={() => {
                        fromJSON(pendingProject.doc);
                        setPendingProject(null);
                    }}
                    onCancel={() => setPendingProject(null)}
                />
            )}
        </>
    );
}

function Divider() {
    return <div className="mx-1 h-5 w-px bg-fg/10" />;
}

function ToolBtn({
    children,
    onClick,
    title,
    accent,
    active,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    accent?: 'green' | 'chat';
    active?: boolean;
}) {
    const accentStyles = {
        green: 'bg-gradient-to-r from-[#00f0ff] to-[#00ff9d] text-white shadow-[0_0_12px_rgba(0,255,157,0.3)] hover:shadow-[0_0_20px_rgba(0,255,157,0.5)]',
        chat: 'bg-gradient-to-r from-[#bc13fe] to-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]',
    };
    return (
        <button
            onClick={onClick}
            title={title}
            className={`rounded-lg p-2 transition-all duration-200 hover:-translate-y-0.5 ${
                active ? 'bg-info/15 text-info' : 'text-fg/60 hover:bg-fg/10 hover:text-fg/90'
            } ${accent ? accentStyles[accent] : ''}`}
        >
            {children}
        </button>
    );
}

/** Выпадающее меню бургера — все команды тулбара списком (для узких экранов). */
function BurgerMenu({
    onClose,
    onOpenProject,
    onUndo,
    onRedo,
    onNew,
    onImport,
    onExportJson,
    onExportPng,
    onPreview,
    onValidate,
    onHelp,
    onSettings,
    onMinimap,
    minimapVisible,
    onLocale,
    locale,
    onTheme,
    theme,
}: {
    onClose: () => void;
    onOpenProject: (project: ProjectSnapshot) => void;
    onUndo: () => void;
    onRedo: () => void;
    onNew: () => void;
    onImport: () => void;
    onExportJson: () => void;
    onExportPng: () => void;
    onPreview: () => void;
    onValidate: () => void;
    onHelp: () => void;
    onSettings: () => void;
    onMinimap: () => void;
    minimapVisible: boolean;
    onLocale: () => void;
    locale: string;
    onTheme: () => void;
    theme: 'dark' | 'light';
}) {
    const fromJSON = useFlowStore((s) => s.fromJSON);
    const metadata = useFlowStore((s) => s.metadata);
    const [projects, setProjects] = useState<ReturnType<typeof listRecentProjects>>([]);

    useEffect(() => {
        setProjects(listRecentProjects());
    }, []);

    const item = (
        icon: React.ReactNode,
        label: string,
        action: () => void,
        opts?: { active?: boolean },
    ) => (
        <button
            onClick={() => {
                action();
                onClose();
            }}
            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-fg/10 ${
                opts?.active ? 'text-info' : 'text-fg/80'
            }`}
        >
            <span className="flex-shrink-0">{icon}</span>
            <span className="min-w-0 truncate">{label}</span>
        </button>
    );

    return (
        <div className="absolute right-0 top-full z-menu mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-glass-border bg-surface-panel py-1.5 shadow-panel-lg backdrop-blur-xl">
            {item(<IconUndo />, t('toolbar.undo'), onUndo)}
            {item(<IconRedo />, t('toolbar.redo'), onRedo)}
            <div className="my-1 border-t border-outline-variant" />
            {item(<IconNew />, t('toolbar.newProject'), onNew)}
            {item(<IconImport />, t('toolbar.importJson'), onImport)}
            {item(<IconExport />, t('toolbar.exportJson'), onExportJson)}
            {item(<IconImage />, t('toolbar.exportPng'), onExportPng)}
            <div className="my-1 border-t border-outline-variant" />
            {item(<IconChat stroke="currentColor" />, t('toolbar.preview'), onPreview)}
            {item(<IconCheck stroke="currentColor" />, t('toolbar.validate'), onValidate)}
            <div className="my-1 border-t border-outline-variant" />
            {item(<IconSettings />, t('toolbar.botSettings'), onSettings)}
            {item(
                <IconMinimap />,
                minimapVisible ? t('toolbar.hideMinimap') : t('toolbar.showMinimap'),
                onMinimap,
                { active: minimapVisible },
            )}
            {item(<IconHelp />, t('toolbar.help'), onHelp)}
            {item(
                <span className="w-4 text-center text-xs font-bold">
                    {locale === 'ru' ? 'RU' : 'EN'}
                </span>,
                locale === 'ru' ? t('toolbar.localeEn') : t('toolbar.localeRu'),
                onLocale,
            )}
            {item(
                theme === 'dark' ? <IconSun /> : <IconMoon />,
                theme === 'dark' ? t('toolbar.themeLight') : t('toolbar.themeDark'),
                onTheme,
            )}

            {/* Недавние проекты */}
            {projects.length > 0 && (
                <>
                    <div className="my-1 border-t border-outline-variant" />
                    <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-fg/50">
                        {t('toolbar.recentProjects')}
                    </div>
                    {projects.map((p) => (
                        <div key={p.id} className="group flex items-center gap-1 pr-2">
                            <button
                                onClick={() => {
                                    if (p.name !== metadata.name) {
                                        onOpenProject(p);
                                    } else {
                                        fromJSON(p.doc);
                                    }
                                    onClose();
                                }}
                                className="flex min-w-0 flex-1 items-center gap-2 px-3 py-1.5 text-left text-sm text-fg/80 transition-colors hover:bg-fg/10"
                            >
                                {p.name === metadata.name && (
                                    <span className="flex-shrink-0 text-info">●</span>
                                )}
                                <span className="truncate">{p.name}</span>
                            </button>
                            <button
                                onClick={() => {
                                    removeRecentProject(p.id);
                                    setProjects(listRecentProjects());
                                }}
                                className="invisible rounded p-1 text-fg/50 hover:bg-error/15 hover:text-error group-hover:visible"
                                title={t('toolbar.removeProject')}
                            >
                                <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                >
                                    <path d="M2 2l8 8M10 2l-8 8" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
