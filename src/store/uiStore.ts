import { create } from 'zustand';
import { getLocale, setLocale, type Locale } from '../i18n';

interface UIStore {
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    sidebarOpen: boolean;
    previewOpen: boolean;
    exportDialogOpen: boolean;
    helpOpen: boolean;
    locale: Locale;
    /** Режим панели свойств: docked (справа) или floating (плавающая) */
    propertiesPanelMode: 'docked' | 'floating';
    /** Позиция плавающей панели */
    propertiesPanelPosition: { x: number; y: number };
    /** Видимость миниатюры */
    minimapVisible: boolean;
    /** ID активного шага в превью */
    activePreviewNodeId: string | null;
    /** Модальное окно настроек бота */
    botSettingsOpen: boolean;

    selectNode: (id: string | null) => void;
    selectEdge: (id: string | null) => void;
    toggleSidebar: () => void;
    togglePreview: () => void;
    toggleExportDialog: () => void;
    toggleHelp: () => void;
    toggleLocale: () => void;
    togglePropertiesPanelMode: () => void;
    setPropertiesPanelPosition: (pos: { x: number; y: number }) => void;
    toggleMinimap: () => void;
    setActivePreviewNodeId: (id: string | null) => void;
    toggleBotSettings: () => void;
}

const useUiStore = create<UIStore>((set) => ({
    selectedNodeId: null,
    selectedEdgeId: null,
    sidebarOpen: true,
    previewOpen: false,
    exportDialogOpen: false,
    helpOpen: false,
    locale: getLocale(),
    propertiesPanelMode: 'docked',
    propertiesPanelPosition: { x: window.innerWidth - 350, y: 100 },
    minimapVisible: true,
    activePreviewNodeId: null,
    botSettingsOpen: false,

    selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
    selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    togglePreview: () => set((s) => ({ previewOpen: !s.previewOpen })),
    toggleExportDialog: () => set((s) => ({ exportDialogOpen: !s.exportDialogOpen })),
    toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
    toggleLocale: () =>
        set((s) => {
            const newLocale: Locale = s.locale === 'ru' ? 'en' : 'ru';
            setLocale(newLocale);
            return { locale: newLocale };
        }),
    togglePropertiesPanelMode: () =>
        set((s) => ({
            propertiesPanelMode: s.propertiesPanelMode === 'docked' ? 'floating' : 'docked',
        })),
    setPropertiesPanelPosition: (pos) => {
        // Ограничиваем позицию в пределах видимой области экрана
        const panelWidth = 320;
        const headerOffset = 80; // отступ от шапки
        const minX = 0;
        const minY = headerOffset;
        const maxX = Math.max(0, window.innerWidth - panelWidth);
        const maxY = Math.max(0, window.innerHeight - 100); // минимум 100px видно
        set({
            propertiesPanelPosition: {
                x: Math.max(minX, Math.min(pos.x, maxX)),
                y: Math.max(minY, Math.min(pos.y, maxY)),
            },
        });
    },
    toggleMinimap: () => set((s) => ({ minimapVisible: !s.minimapVisible })),
    setActivePreviewNodeId: (id) => set({ activePreviewNodeId: id }),
    toggleBotSettings: () => set((s) => ({ botSettingsOpen: !s.botSettingsOpen })),
}));

export default useUiStore;
