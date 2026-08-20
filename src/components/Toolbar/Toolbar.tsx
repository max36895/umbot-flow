import { useRef, useEffect, useCallback, useState } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import { t, tf } from '../../i18n';
import { validate } from '../../utils/validator';
import PlatformSelector from '../ui/PlatformSelector';
import ProjectsMenu from './ProjectsMenu';
import { saveRecentProject } from '../../utils/projectsStore';
import AlertDialog from '../ui/AlertDialog';
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
    const locale = useUiStore((s) => s.locale);
    const metadata = useFlowStore((s) => s.metadata);
    const setMetadata = useFlowStore((s) => s.setMetadata);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

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
        if (window.confirm(t('toolbar.newProject') + '?')) {
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
                    text:
                        locale === 'ru'
                            ? 'Извините, я вас не понял.'
                            : "Sorry, I didn't understand.",
                },
                welcome: { text: '', buttons: [] },
                helpText: { text: '' },
                variables: {},
            });
        }
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
            const dataUrl = await toPng(el, { backgroundColor: '#0F0F14' });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${metadata.name || 'flow'}-full.png`;
            a.click();
        } catch {
            alert(t('error.exportFailed'));
        }
    }, [metadata.name]);

    // Глобальные горячие клавиши
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const isInput =
                e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
            const mod = e.ctrlKey || e.metaKey;

            // Ctrl+N — новый проект
            if (mod && e.key === 'n') {
                e.preventDefault();
                handleNewProject();
                return;
            }

            // Ctrl+S — экспорт JSON
            if (mod && e.key === 's') {
                e.preventDefault();
                handleExportJSON();
                return;
            }

            // Ctrl+P — превью чата
            if (mod && e.key === 'p' && !e.shiftKey) {
                e.preventDefault();
                togglePreview();
                return;
            }

            // Ctrl+Z — отмена
            if (mod && e.key === 'z' && !e.shiftKey && !isInput) {
                e.preventDefault();
                undo();
                return;
            }

            // Ctrl+Shift+Z — повтор
            if (mod && e.key === 'z' && e.shiftKey && !isInput) {
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
        <div className="absolute left-[10px] right-[10px] top-[10px] z-toolbar flex items-center gap-2 rounded-full border border-glass-border bg-surface-dim/70 px-4 py-2 shadow-lg backdrop-blur-xl">
            {/* Название бота */}
            <div className="relative">
                <input
                    type="text"
                    value={metadata.name}
                    onChange={(e) => setMetadata({ name: e.target.value })}
                    className="w-40 rounded-lg border border-glass-border bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/90 transition-colors focus:border-info focus:ring-1 focus:ring-info focus:outline-none"
                    placeholder={t('toolbar.botName')}
                    title={t('detail.botNameHelp')}
                />
            </div>

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
            <ToolBtn onClick={() => fileInputRef.current?.click()} title={t('toolbar.importJson')}>
                <IconImport />
            </ToolBtn>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
            />
            <ToolBtn onClick={handleExportJSON} title={t('toolbar.exportJson')}>
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
            {/* Главный CTA — с текстовой подписью, чтобы не тонул среди иконок */}
            <button
                onClick={toggleExportDialog}
                title={t('toolbar.validate')}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#00ff9d] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_12px_rgba(0,255,157,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,255,157,0.5)]"
            >
                <IconCheck />
                {t('toolbar.validate')}
            </button>

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
                className="rounded-lg border border-[rgba(255,255,255,0.1)] px-2 py-1 text-xs font-medium text-white/60 transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white/90"
                title={locale === 'ru' ? t('toolbar.localeEn') : t('toolbar.localeRu')}
            >
                {locale === 'ru' ? 'RU' : 'EN'}
            </button>

            <Divider />

            {/* Платформы */}
            <PlatformSelector
                value={metadata.platforms}
                onChange={(platforms) => setMetadata({ platforms })}
            />
        </div>

            {alertDialog && (
                <AlertDialog
                    title={alertDialog.title}
                    message={alertDialog.message}
                    onClose={() => setAlertDialog(null)}
                />
            )}
        </>
    );
}

function Divider() {
    return <div className="mx-1 h-5 w-px bg-[rgba(255,255,255,0.1)]" />;
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
                active
                    ? 'bg-[rgba(0,240,255,0.15)] text-info'
                    : 'text-white/60 hover:bg-[rgba(255,255,255,0.1)] hover:text-white/90'
            } ${accent ? accentStyles[accent] : ''}`}
        >
            {children}
        </button>
    );
}

