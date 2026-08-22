import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { getLocale, setLocale, type Locale } from '../i18n';

export type Theme = 'dark' | 'light';

/** Выставляет/снимает data-theme на <html> — CSS-переменные переключаются сами. */
function applyTheme(theme: Theme) {
    if (typeof document === 'undefined') return;
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
}

/**
 * Обёртка над localStorage: пропускает запись, если сериализованное значение
 * не изменилось. Без этого persist пишет в localStorage на каждый set(),
 * включая изменения исключённых полей (selectedNodeId, activePreviewNodeId).
 */
const skipUnchangedStorage: StateStorage = {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => {
        if (localStorage.getItem(name) === value) return;
        localStorage.setItem(name, value);
    },
    removeItem: (name) => localStorage.removeItem(name),
};

interface UIStore {
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    sidebarOpen: boolean;
    previewOpen: boolean;
    exportDialogOpen: boolean;
    helpOpen: boolean;
    locale: Locale;
    /** Тема оформления */
    theme: Theme;
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
    /** Состояние раскрытия расширенных настроек для каждой ноды. Ключ — nodeId. */
    advancedExpanded: Record<string, boolean>;

    selectNode: (id: string | null) => void;
    selectEdge: (id: string | null) => void;
    toggleSidebar: () => void;
    togglePreview: () => void;
    toggleExportDialog: () => void;
    toggleHelp: () => void;
    toggleLocale: () => void;
    toggleTheme: () => void;
    togglePropertiesPanelMode: () => void;
    setPropertiesPanelPosition: (pos: { x: number; y: number }) => void;
    toggleMinimap: () => void;
    setActivePreviewNodeId: (id: string | null) => void;
    toggleBotSettings: () => void;
    /** Установить состояние раскрытия расширенных настроек для ноды. */
    setAdvancedExpanded: (nodeId: string, expanded: boolean) => void;
}

const useUiStore = create<UIStore>()(
    persist(
        (set) => ({
            selectedNodeId: null,
            selectedEdgeId: null,
            sidebarOpen: true,
            previewOpen: false,
            exportDialogOpen: false,
            helpOpen: false,
            locale: getLocale(),
            theme: 'dark',
            propertiesPanelMode: 'docked',
            propertiesPanelPosition: {
                x: typeof window !== 'undefined' ? window.innerWidth - 350 : 1000,
                y: 100,
            },
            minimapVisible: true,
            activePreviewNodeId: null,
            botSettingsOpen: false,
            advancedExpanded: {},

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
            toggleTheme: () =>
                set((s) => {
                    const theme: Theme = s.theme === 'dark' ? 'light' : 'dark';
                    applyTheme(theme);
                    return { theme };
                }),
            togglePropertiesPanelMode: () =>
                set((s) => ({
                    propertiesPanelMode: s.propertiesPanelMode === 'docked' ? 'floating' : 'docked',
                })),
            setPropertiesPanelPosition: (pos) => {
                if (typeof window === 'undefined') return;
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
            setAdvancedExpanded: (nodeId, expanded) =>
                set((s) => ({
                    advancedExpanded: { ...s.advancedExpanded, [nodeId]: expanded },
                })),
        }),
        {
            name: 'umbot-flow-editor-ui',
            storage: createJSONStorage(() => skipUnchangedStorage),
            // Сохраняем только UI-настройки, не сессионное состояние
            partialize: (state) => ({
                locale: state.locale,
                theme: state.theme,
                propertiesPanelMode: state.propertiesPanelMode,
                propertiesPanelPosition: state.propertiesPanelPosition,
                minimapVisible: state.minimapVisible,
                advancedExpanded: state.advancedExpanded,
                sidebarOpen: state.sidebarOpen,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) applyTheme(state.theme);
            },
        },
    ),
);

export default useUiStore;
