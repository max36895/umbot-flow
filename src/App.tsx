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
import useUiStore from './store/uiStore';
import { useEffect, useState } from 'react';
import { useLocale } from './i18n/hook';
import useFlowStore from './store/flowStore';
import { buildStarterDocument } from './utils/starterDoc';

export default function App() {
    const previewOpen = useUiStore((s) => s.previewOpen);
    const exportDialogOpen = useUiStore((s) => s.exportDialogOpen);
    const helpOpen = useUiStore((s) => s.helpOpen);
    const botSettingsOpen = useUiStore((s) => s.botSettingsOpen);
    const [paletteOpen, setPaletteOpen] = useState(false);
    // Подписка на locale — триггерит перерендер всего дерева при переключении языка
    useLocale();

    useEffect(() => {
        const store = useFlowStore.getState();
        store.autoLoad();
        // Если после загрузки холст пуст и localStorage не содержит данных — засеем starter-пример
        const state = useFlowStore.getState();
        const hasSavedData = localStorage.getItem('umbot-flow-editor') !== null;
        if (!hasSavedData && state.nodes.length === 0) {
            state.fromJSON(buildStarterDocument());
        }
    }, []);

    // Ctrl+K — палитра команд
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
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

            // Ctrl+D — дублирование (всегда работает)
            if (mod && e.key === 'd' && !isInput) {
                e.preventDefault();
                const id = useUiStore.getState().selectedNodeId;
                if (id) {
                    const newId = useFlowStore.getState().duplicateNode(id);
                    if (newId) setTimeout(() => useUiStore.getState().selectNode(newId), 50);
                }
            }

            // Ctrl+C — копирование (fallback через localStorage)
            if (mod && e.key === 'c' && !isInput) {
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
            if (mod && e.key === 'x' && !isInput) {
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
            if (mod && e.key === 'v' && !isInput) {
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
                    </div>
                    <StatusBar />
                </div>
                <PropertiesPanel />
                {exportDialogOpen && <ExportDialog />}
                {helpOpen && <HelpModal />}
                {botSettingsOpen && <BotSettingsModal />}
                {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
            </div>
        </ReactFlowProvider>
    );
}
