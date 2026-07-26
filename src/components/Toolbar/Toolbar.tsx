import { useRef, useEffect, useCallback } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import { t } from '../../i18n';
import { validate } from '../../utils/validator';
import PlatformSelector from '../ui/PlatformSelector';

export default function Toolbar() {
    const { undo, redo, toJSON, fromJSON } = useFlowStore();
    const { togglePreview, toggleExportDialog, toggleHelp, toggleLocale, locale } = useUiStore();
    const metadata = useFlowStore((s) => s.metadata);
    const setMetadata = useFlowStore((s) => s.setMetadata);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNewProject = useCallback(() => {
        if (window.confirm(t('toolbar.newProject') + '?')) {
            fromJSON({
                schemaVersion: '1.0.0',
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
    }, [fromJSON]);

    const handleExportJSON = useCallback(() => {
        const doc = toJSON();
        const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${metadata.name || 'flow'}.json`;
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
                        alert(
                            t('error.validationFailed') +
                                '\n' +
                                errors.map((e) => e.message).join('\n'),
                        );
                        return;
                    }
                    fromJSON(doc);
                } catch {
                    alert(t('error.parseFailed'));
                }
            };
            reader.readAsText(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        [fromJSON],
    );

    const handleExportPNG = useCallback(async () => {
        try {
            const { toPng } = await import('html-to-image');
            const el = document.querySelector('.react-flow') as HTMLElement;
            if (!el) return;
            const dataUrl = await toPng(el, { backgroundColor: '#0F0F14' });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${metadata.name || 'flow'}.png`;
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
        <div className="absolute left-[10px] right-[10px] top-[10px] z-[100] flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(15,15,20,0.7)] px-4 py-2 shadow-lg backdrop-blur-xl">
            {/* Название бота */}
            <input
                type="text"
                value={metadata.name}
                onChange={(e) => setMetadata({ name: e.target.value })}
                className="w-40 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm font-semibold text-white/90 transition-colors focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] focus:outline-none"
                placeholder={t('toolbar.botName')}
            />

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
            <ToolBtn onClick={handleExportPNG} title={t('toolbar.exportPng')}>
                <IconImage />
            </ToolBtn>

            <Divider />

            {/* Тест — компактные кнопки с иконками */}
            <ToolBtn onClick={togglePreview} title={t('toolbar.preview')} accent="chat">
                <IconChat />
            </ToolBtn>
            <ToolBtn onClick={toggleExportDialog} title={t('toolbar.validate')} accent="green">
                <IconCheck />
            </ToolBtn>

            <Divider />

            {/* Справка */}
            <ToolBtn onClick={toggleHelp} title={t('toolbar.help')}>
                <IconHelp />
            </ToolBtn>

            <div className="flex-1" />

            {/* Настройки бота */}
            <ToolBtn
                onClick={useUiStore.getState().toggleBotSettings}
                title={t('toolbar.botSettings')}
            >
                <IconSettings />
            </ToolBtn>

            {/* Миниатюра */}
            <ToolBtn
                onClick={useUiStore.getState().toggleMinimap}
                title={
                    useUiStore.getState().minimapVisible
                        ? t('toolbar.hideMinimap')
                        : t('toolbar.showMinimap')
                }
                active={useUiStore.getState().minimapVisible}
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
                    ? 'bg-[rgba(0,240,255,0.15)] text-[#00f0ff]'
                    : 'text-white/60 hover:bg-[rgba(255,255,255,0.1)] hover:text-white/90'
            } ${accent ? accentStyles[accent] : ''}`}
        >
            {children}
        </button>
    );
}

// SVG иконки — единый стиль 16x16, stroke-based
function IconUndo() {
    return (
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
            <path d="M3 7h6a3 3 0 0 1 0 6H9" />
            <path d="M6 4L3 7l3 3" />
        </svg>
    );
}

function IconRedo() {
    return (
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
            <path d="M13 7H7a3 3 0 0 0 0 6h1" />
            <path d="M10 4l3 3-3 3" />
        </svg>
    );
}

function IconNew() {
    return (
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
            <rect x="3" y="2" width="10" height="12" rx="1" />
            <path d="M8 5v6M5 8h6" />
        </svg>
    );
}

function IconImport() {
    return (
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
            <path d="M8 2v8M5 7l3 3 3-3" />
            <path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
        </svg>
    );
}

function IconExport() {
    return (
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
            <path d="M8 10V2M5 5l3-3 3 3" />
            <path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
        </svg>
    );
}

function IconImage() {
    return (
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
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <circle cx="5.5" cy="5.5" r="1" />
            <path d="M14 10l-3-3-7 7" />
        </svg>
    );
}

function IconChat() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="rgba(0,0,0,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 2h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3 3V3a1 1 0 0 1 1-1z" />
        </svg>
    );
}

function IconCheck() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="rgba(0,0,0,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 8l3 3 7-7" />
        </svg>
    );
}

function IconHelp() {
    return (
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
            <circle cx="8" cy="8" r="6" />
            <path d="M6 6a2 2 0 1 1 2 2v1" />
            <circle cx="8" cy="12" r="0.5" fill="currentColor" />
        </svg>
    );
}

function IconMinimap() {
    return (
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
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <rect x="4" y="4" width="3" height="3" rx="0.5" />
            <rect x="9" y="8" width="3" height="3" rx="0.5" />
        </svg>
    );
}

function IconSettings() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6.58 2.27a1.25 1.25 0 0 1 1.84 0l.42.6a1.25 1.25 0 0 0 .9.42h.72a1.25 1.25 0 0 1 1.25 1.25v.72a1.25 1.25 0 0 0 .42.9l.6.42a1.25 1.25 0 0 1 0 1.84l-.6.42a1.25 1.25 0 0 0-.42.9v.72a1.25 1.25 0 0 1-1.25 1.25h-.72a1.25 1.25 0 0 0-.9.42l-.42.6a1.25 1.25 0 0 1-1.84 0l-.42-.6a1.25 1.25 0 0 0-.9-.42H4.5a1.25 1.25 0 0 1-1.25-1.25v-.72a1.25 1.25 0 0 0-.42-.9l-.6-.42a1.25 1.25 0 0 1 0-1.84l.6-.42a1.25 1.25 0 0 0 .42-.9v-.72A1.25 1.25 0 0 1 4.5 3.29h.72a1.25 1.25 0 0 0 .9-.42l.42-.6Z" />
            <circle cx="7.5" cy="7.5" r="2" />
        </svg>
    );
}
