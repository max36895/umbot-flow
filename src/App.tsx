import { ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from './components/Canvas/FlowCanvas';
import Sidebar from './components/Sidebar/Sidebar';
import PropertiesPanel from './components/Properties/PropertiesPanel';
import Toolbar from './components/Toolbar/Toolbar';
import ChatPreview from './components/Preview/ChatPreview';
import ExportDialog from './components/Toolbar/ExportDialog';
import HelpModal from './components/Help/HelpModal';
import BotSettingsModal from './components/Settings/BotSettingsModal';
import useUiStore from './store/uiStore';
import { useEffect } from 'react';
import useFlowStore from './store/flowStore';

export default function App() {
    const { previewOpen, exportDialogOpen, helpOpen, botSettingsOpen } = useUiStore();

    useEffect(() => {
        useFlowStore.getState().autoLoad();
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
                            const pos = {
                                x: 100 + Math.random() * 200,
                                y: 100 + Math.random() * 200,
                            };
                            const newId = useFlowStore.getState().pasteNode(data, pos);
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
            <div className="flex h-screen w-screen overflow-hidden bg-[#0F0F14]">
                <Sidebar />
                <div className="relative min-w-0 flex-1 overflow-hidden">
                    <Toolbar />
                    <div className="relative h-full">
                        <FlowCanvas />
                        {previewOpen && <ChatPreview />}
                    </div>
                </div>
                <PropertiesPanel />
                {exportDialogOpen && <ExportDialog />}
                {helpOpen && <HelpModal />}
                {botSettingsOpen && <BotSettingsModal />}
            </div>
        </ReactFlowProvider>
    );
}
