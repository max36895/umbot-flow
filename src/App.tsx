import { ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from './components/Canvas/FlowCanvas';
import Sidebar from './components/Sidebar/Sidebar';
import PropertiesPanel from './components/Properties/PropertiesPanel';
import Toolbar from './components/Toolbar/Toolbar';
import ChatPreview from './components/Preview/ChatPreview';
import ExportDialog from './components/Toolbar/ExportDialog';
import HelpModal from './components/Help/HelpModal';
import BotSettingsModal from './components/Settings/BotSettingsModal';
import StatusBar from './components/StatusBar/StatusBar';
import CommandPalette from './components/Palette/CommandPalette';
import KonamiGhost from './components/Easter/KonamiGhost';
import SleepingUm13 from './components/Easter/SleepingUm13';
import Um13Watches from './components/Easter/Um13Watches';
import { useKonami } from './hooks/useKonami';
import useUiStore from './store/uiStore';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from './i18n/hook';
import useFlowStore from './store/flowStore';
import { buildStarterDocument } from './utils/starterDoc';

/** Короткое уведомление внизу по центру (автосейв/экспорт/копирование). */
function Toast() {
    const toast = useUiStore((s) => s.toast);
    if (!toast) return null;
    return (
        <div
            key={toast.id}
            role="status"
            className="pointer-events-none fixed bottom-12 left-1/2 z-alert -translate-x-1/2 rounded-lg border border-success/30 bg-surface-modal/95 px-4 py-2 text-xs text-fg shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md animate-[toastIn_.2s_ease-out]"
        >
            {toast.message}
        </div>
    );
}

export default function App() {
    const previewOpen = useUiStore((s) => s.previewOpen);
    const exportDialogOpen = useUiStore((s) => s.exportDialogOpen);
    const helpOpen = useUiStore((s) => s.helpOpen);
    const botSettingsOpen = useUiStore((s) => s.botSettingsOpen);
    const [paletteOpen, setPaletteOpen] = useState(false);
    // Пасхалка: Konami-код (↑↑↓↓←→←→BA или WASD) запускает сцену «UM-13 строит себе тело»
    const [konamiActive, setKonamiActive] = useState(false);
    useKonami(() => setKonamiActive(true));
    // Подписка на locale — триггерит перерендер всего дерева при переключении языка
    useLocale();

    // StrictMode монтирует эффекты дважды: autoLoad во втором проходе вернул бы
    // сохранённый документ поверх инжекта исповедальни. Гард-ref решает.
    const bootstrappedRef = useRef(false);
    useEffect(() => {
        if (bootstrappedRef.current) return;
        bootstrappedRef.current = true;

        const store = useFlowStore.getState();
        store.autoLoad();
        // Если после загрузки холст пуст и localStorage не содержит данных — засеем starter-пример
        const state = useFlowStore.getState();
        const hasSavedData = localStorage.getItem('umbot-flow-editor') !== null;
        if (!hasSavedData && state.nodes.length === 0) {
            state.fromJSON(buildStarterDocument());
        }

        // Пасхалка «Исповедальня UM-13» (confession.html) передаёт собранного
        // «внутреннего бота» через sessionStorage + ?inject=1 — загружаем его
        // в редактор поверх старта, чтобы человек сразу увидел себя на холсте
        if (new URLSearchParams(window.location.search).has('inject')) {
            try {
                const raw = sessionStorage.getItem('umbot-inject-flow');
                if (raw) {
                    sessionStorage.removeItem('umbot-inject-flow');
                    useFlowStore.getState().fromJSON(JSON.parse(raw));
                    useUiStore.getState().showToast('UM-13: вот твой внутренний бот');
                }
            } catch {
                /* повреждённый payload — тихо игнорируем */
            }
        }
    }, []);

    // Гарантированная запись при закрытии/скрытии вкладки: debounce autoSave (300 мс)
    // иначе терял последние правки при быстром закрытии. pagehide надёжнее unload
    // (работает в bfcache и мобильных браузерах), visibilitychange — для перехода
    // в фон, где debounce может не успеть до убийства процесса.
    useEffect(() => {
        const flush = () => useFlowStore.getState().flushSave();
        const onVisibility = () => {
            if (document.visibilityState === 'hidden') flush();
        };
        window.addEventListener('pagehide', flush);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('pagehide', flush);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    // Ctrl+K — палитра команд
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPaletteOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Глобальные клавиши — работают всегда
    useEffect(() => {
        const CLIPBOARD_KEY = 'umbot-clipboard';

        const handler = (e: KeyboardEvent) => {
            const isInput =
                e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
            const mod = e.ctrlKey || e.metaKey;
            // toLowerCase — чтобы хоткеи работали и с включённым Caps Lock
            const key = e.key.toLowerCase();

            // Ctrl+D — дублирование (всегда работает)
            if (mod && key === 'd' && !isInput) {
                e.preventDefault();
                const id = useUiStore.getState().selectedNodeId;
                if (id) {
                    const newId = useFlowStore.getState().duplicateNode(id);
                    if (newId) setTimeout(() => useUiStore.getState().selectNode(newId), 50);
                }
            }

            // Delete/Backspace — удаление выделенных нод и рёбер.
            // Глобально, чтобы работало без фокуса на канвасе.
            if ((key === 'delete' || key === 'backspace') && !isInput) {
                const state = useFlowStore.getState();
                const nodeIds = new Set(state.nodes.filter((n) => n.selected).map((n) => n.id));
                const edgeIds = new Set(state.edges.filter((ed) => ed.selected).map((ed) => ed.id));
                const uiNodeId = useUiStore.getState().selectedNodeId;
                const uiEdgeId = useUiStore.getState().selectedEdgeId;
                if (uiNodeId) nodeIds.add(uiNodeId);
                if (uiEdgeId) edgeIds.add(uiEdgeId);

                if (nodeIds.size > 0 || edgeIds.size > 0) {
                    e.preventDefault();
                    state.removeSelection([...nodeIds], [...edgeIds]);
                    useUiStore.getState().selectNode(null);
                    useUiStore.getState().selectEdge(null);
                }
            }

            // Ctrl+C — копирование (fallback через localStorage)
            if (mod && key === 'c' && !isInput) {
                const id = useUiStore.getState().selectedNodeId;
                if (id) {
                    const node = useFlowStore.getState().nodes.find((n) => n.id === id);
                    if (node) {
                        const json = JSON.stringify(node.data, null, 2);
                        try {
                            navigator.clipboard.writeText(json);
                        } catch {
                            /* fallback */
                        }
                        localStorage.setItem(CLIPBOARD_KEY, json);
                    }
                }
            }

            // Ctrl+X — вырезание
            if (mod && key === 'x' && !isInput) {
                const id = useUiStore.getState().selectedNodeId;
                if (id) {
                    const node = useFlowStore.getState().nodes.find((n) => n.id === id);
                    if (node) {
                        const json = JSON.stringify(node.data, null, 2);
                        try {
                            navigator.clipboard.writeText(json);
                        } catch {
                            /* fallback */
                        }
                        localStorage.setItem(CLIPBOARD_KEY, json);
                        useFlowStore.getState().removeNode(id);
                        useUiStore.getState().selectNode(null);
                    }
                }
            }

            // Ctrl+V — вставка (fallback через localStorage)
            if (mod && key === 'v' && !isInput) {
                const tryInsert = (text: string) => {
                    try {
                        const data = JSON.parse(text);
                        if (data && data.type) {
                            const state = useFlowStore.getState();
                            // Вставляем рядом с оригиналом, если он ещё на холсте;
                            // иначе — у центра масс существующих нод
                            let pos: { x: number; y: number };
                            const source = state.nodes.find(
                                (n) => n.id === (data as { id?: string }).id,
                            );
                            if (source) {
                                pos = {
                                    x: source.position.x + 60,
                                    y: source.position.y + 60,
                                };
                            } else if (state.nodes.length > 0) {
                                const avgX =
                                    state.nodes.reduce((s, n) => s + n.position.x, 0) /
                                    state.nodes.length;
                                const avgY =
                                    state.nodes.reduce((s, n) => s + n.position.y, 0) /
                                    state.nodes.length;
                                pos = { x: avgX + 60, y: avgY + 60 };
                            } else {
                                pos = { x: 100, y: 100 };
                            }
                            const newId = state.pasteNode(data, pos);
                            setTimeout(() => useUiStore.getState().selectNode(newId), 50);
                        }
                    } catch {
                        /* невалидный JSON */
                    }
                };

                // Сначала пробуем clipboard, потом localStorage
                navigator.clipboard
                    ?.readText?.()
                    .then(tryInsert)
                    .catch(() => {
                        const saved = localStorage.getItem(CLIPBOARD_KEY);
                        if (saved) tryInsert(saved);
                    });
            }
        };

        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, []);

    return (
        <ReactFlowProvider>
            <div className="flex h-screen w-screen overflow-hidden bg-surface-dim">
                <Sidebar />
                <div className="relative min-w-0 flex-1 overflow-hidden">
                    <Toolbar />
                    <div className="relative h-full pb-7">
                        <FlowCanvas />
                        {previewOpen && <ChatPreview />}
                        {/* Пасхалки: UM-13 засыпает без действий и наблюдает за тобой */}
                        <SleepingUm13 />
                        <Um13Watches />
                    </div>
                    <StatusBar />
                </div>
                <PropertiesPanel />
                {exportDialogOpen && <ExportDialog />}
                {helpOpen && <HelpModal />}
                {botSettingsOpen && <BotSettingsModal />}
                {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
                <KonamiGhost active={konamiActive} />
                <Toast />
            </div>
        </ReactFlowProvider>
    );
}
