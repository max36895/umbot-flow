import useUiStore from '../../store/uiStore';
import useFlowStore from '../../store/flowStore';
import type { FlowNodeData } from '../../types/flow';
import { t } from '../../i18n';
import { useState } from 'react';
import { NodeIcon, type NodeIconName } from '../ui/NodeIcons';
import { NODE_COLORS, nodeColorAlpha, type NodeTypeKey } from '../Canvas/nodes/nodeColors';

const NODE_TYPES: {
    type: FlowNodeData['type'] | 'welcome' | 'help' | 'fallback';
    labelKey: string;
    descKey: string;
    colorKey: NodeTypeKey;
    icon: NodeIconName;
    tooltipKey: string;
    role?: 'welcome' | 'help' | 'fallback';
}[] = [
    {
        type: 'welcome',
        labelKey: 'sidebar.welcome.label',
        descKey: 'sidebar.welcome.desc',
        colorKey: 'welcome',
        icon: 'welcome',
        tooltipKey: 'sidebar.welcome.desc',
        role: 'welcome',
    },
    {
        type: 'help',
        labelKey: 'sidebar.help.label',
        descKey: 'sidebar.help.desc',
        colorKey: 'help',
        icon: 'help',
        tooltipKey: 'sidebar.help.desc',
        role: 'help',
    },
    {
        type: 'fallback',
        labelKey: 'sidebar.fallback.label',
        descKey: 'sidebar.fallback.desc',
        colorKey: 'fallback',
        icon: 'fallback',
        tooltipKey: 'sidebar.fallback.desc',
        role: 'fallback',
    },
    {
        type: 'command',
        labelKey: 'sidebar.command.label',
        descKey: 'sidebar.command.desc',
        colorKey: 'command',
        icon: 'command',
        tooltipKey: 'help.cmdDesc',
    },
    {
        type: 'response',
        labelKey: 'sidebar.response.label',
        descKey: 'sidebar.response.desc',
        colorKey: 'response',
        icon: 'response',
        tooltipKey: 'help.responseDesc',
    },
    {
        type: 'step',
        labelKey: 'sidebar.step.label',
        descKey: 'sidebar.step.desc',
        colorKey: 'step',
        icon: 'step',
        tooltipKey: 'help.stepDesc',
    },
    {
        type: 'action',
        labelKey: 'sidebar.custom.label',
        descKey: 'sidebar.custom.desc',
        colorKey: 'action',
        icon: 'action',
        tooltipKey: 'help.actionDesc',
    },
    {
        type: 'condition',
        labelKey: 'sidebar.condition.label',
        descKey: 'sidebar.condition.desc',
        colorKey: 'condition',
        icon: 'condition',
        tooltipKey: 'help.condDesc',
    },
    {
        type: 'end',
        labelKey: 'sidebar.end.label',
        descKey: 'sidebar.end.desc',
        colorKey: 'end',
        icon: 'end',
        tooltipKey: 'help.endDesc',
    },
];

export default function Sidebar() {
    const sidebarOpen = useUiStore((s) => s.sidebarOpen);
    const toggleSidebar = useUiStore((s) => s.toggleSidebar);
    const selectNode = useUiStore((s) => s.selectNode);
    const addNode = useFlowStore((s) => s.addNode);
    const nodes = useFlowStore((s) => s.nodes);
    const [searchQuery, setSearchQuery] = useState('');

    const handleAddNode = (
        type: FlowNodeData['type'] | 'welcome' | 'help' | 'fallback',
        role?: 'welcome' | 'help' | 'fallback',
    ) => {
        // Проверка уникальности для welcome/help/fallback
        if (role) {
            const exists = nodes.some((n) => (n.data as { role?: string }).role === role);
            if (exists) return;
        }
        // Ставим ноду у центра масс существующих нод (каскадом), а не в случайную точку
        let x: number;
        let y: number;
        if (nodes.length > 0) {
            const avgX = nodes.reduce((s, n) => s + n.position.x, 0) / nodes.length;
            const avgY = nodes.reduce((s, n) => s + n.position.y, 0) / nodes.length;
            const cascade = (nodes.length % 5) * 40;
            x = avgX + 80 + cascade;
            y = avgY + 80 + cascade;
        } else {
            x = 200;
            y = 200;
        }
        const newId = addNode(type as FlowNodeData['type'], { x, y });
        setTimeout(() => selectNode(newId), 50);
    };

    const onDragStart = (
        e: React.DragEvent,
        type: FlowNodeData['type'] | 'welcome' | 'help' | 'fallback',
        role?: 'welcome' | 'help' | 'fallback',
    ) => {
        if (role) {
            const exists = nodes.some((n) => (n.data as { role?: string }).role === role);
            if (exists) return;
        }
        e.dataTransfer.setData('application/reactflow', type);
        e.dataTransfer.effectAllowed = 'move';
    };

    if (!sidebarOpen) {
        return (
            <button
                onClick={toggleSidebar}
                className="fixed left-2 top-24 z-sticky rounded-lg border border-glass-border bg-surface p-2 text-fg/60 shadow-lg backdrop-blur-xl hover:bg-fg/10 hover:text-fg/90"
            >
                <NodeIcon name="menu" size={16} />
            </button>
        );
    }

    // Фильтрация блоков по поисковому запросу — работает и по имени, и по описанию
    const filteredNodeTypes = NODE_TYPES.filter((nt) => {
        const query = searchQuery.toLowerCase();
        return (
            t(nt.labelKey).toLowerCase().includes(query) ||
            t(nt.descKey).toLowerCase().includes(query)
        );
    });

    return (
        <div className="flex min-w-[220px] max-w-[280px] flex-1 flex-col border-r border-outline-variant bg-surface-panel-docked backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
                <h2 className="text-sm font-bold text-fg/80">{t('sidebar.nodes')}</h2>
                <button
                    onClick={toggleSidebar}
                    className="text-fg/50 transition-colors hover:text-fg/60"
                >
                    <NodeIcon name="close" size={14} />
                </button>
            </div>

            {/* Поиск по блокам */}
            <div className="border-b border-outline-variant px-3 py-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('sidebar.searchPlaceholder')}
                    className="w-full rounded-lg border border-glass-border bg-fg/5 px-3 py-2 text-sm text-fg/90 placeholder-fg/30 focus:border-info focus:outline-none"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-2">
                    {filteredNodeTypes.map((nt) => {
                        const isDisabled = nt.role
                            ? nodes.some((n) => (n.data as { role?: string }).role === nt.role)
                            : false;
                        return (
                            <div
                                key={nt.type + (nt.role ?? '')}
                                draggable={!isDisabled}
                                onDragStart={(e) => onDragStart(e, nt.type, nt.role)}
                                onClick={() => handleAddNode(nt.type, nt.role)}
                                className={`rounded-xl border-l-4 p-3 transition-all duration-200 ${
                                    isDisabled
                                        ? 'cursor-not-allowed opacity-40'
                                        : 'cursor-grab hover:bg-fg/5 hover:shadow-lg hover:scale-[1.02] active:cursor-grabbing active:scale-[0.98]'
                                }`}
                                style={{
                                    borderLeftColor: NODE_COLORS[nt.colorKey].cssVar,
                                    backgroundColor: nodeColorAlpha(nt.colorKey, 6),
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span style={{ color: NODE_COLORS[nt.colorKey].cssVar }}>
                                        <NodeIcon name={nt.icon} size={16} />
                                    </span>
                                    <span className="text-sm font-medium text-fg/80">
                                        {t(nt.labelKey)}
                                    </span>
                                    {isDisabled && (
                                        <span className="ml-auto text-[11px] text-fg/50">
                                            {t('sidebar.added')}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-[11px] text-fg/55">{t(nt.descKey)}</p>
                            </div>
                        );
                    })}
                </div>

                {filteredNodeTypes.length === 0 && (
                    <div className="py-8 text-center text-xs text-fg/50 italic">
                        {t('sidebar.noResults')}
                    </div>
                )}

                <div className="mt-6">
                    <h3 className="mb-2 text-xs font-bold text-fg/50 uppercase">
                        {t('sidebar.howToUse')}
                    </h3>
                    <ul className="space-y-1 text-[11px] text-fg/55">
                        <li>{t('sidebar.tip1')}</li>
                        <li>{t('sidebar.tip2')}</li>
                        <li>{t('sidebar.tip3')}</li>
                        <li>{t('sidebar.tip4')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
