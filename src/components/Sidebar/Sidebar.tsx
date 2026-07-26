import useUiStore from '../../store/uiStore';
import useFlowStore from '../../store/flowStore';
import type { FlowNodeData } from '../../types/flow';
import { t } from '../../i18n';

const NODE_TYPES: {
    type: FlowNodeData['type'] | 'welcome' | 'help';
    labelKey: string;
    descKey: string;
    borderColor: string;
    icon: string;
    tooltipKey: string;
    role?: 'welcome' | 'help';
}[] = [
    {
        type: 'welcome',
        labelKey: 'sidebar.welcome.label',
        descKey: 'sidebar.welcome.desc',
        borderColor: '#22c55e',
        icon: '🚀',
        tooltipKey: 'sidebar.welcome.desc',
        role: 'welcome',
    },
    {
        type: 'help',
        labelKey: 'sidebar.help.label',
        descKey: 'sidebar.help.desc',
        borderColor: '#eab308',
        icon: '❓',
        tooltipKey: 'sidebar.help.desc',
        role: 'help',
    },
    {
        type: 'command',
        labelKey: 'sidebar.command.label',
        descKey: 'sidebar.command.desc',
        borderColor: '#00f0ff',
        icon: '💬',
        tooltipKey: 'help.cmdDesc',
    },
    {
        type: 'response',
        labelKey: 'sidebar.response.label',
        descKey: 'sidebar.response.desc',
        borderColor: '#00ff9d',
        icon: '📢',
        tooltipKey: 'help.responseDesc',
    },
    {
        type: 'step',
        labelKey: 'sidebar.step.label',
        descKey: 'sidebar.step.desc',
        borderColor: '#bc13fe',
        icon: '📝',
        tooltipKey: 'help.stepDesc',
    },
    {
        type: 'action',
        labelKey: 'sidebar.custom.label',
        descKey: 'sidebar.custom.desc',
        borderColor: '#ff9d00',
        icon: '⚡',
        tooltipKey: 'help.actionDesc',
    },
    {
        type: 'condition',
        labelKey: 'sidebar.condition.label',
        descKey: 'sidebar.condition.desc',
        borderColor: '#ff0055',
        icon: '🔀',
        tooltipKey: 'help.condDesc',
    },
    {
        type: 'end',
        labelKey: 'sidebar.end.label',
        descKey: 'sidebar.end.desc',
        borderColor: '#ef4444',
        icon: '⏹',
        tooltipKey: 'help.endDesc',
    },
];

export default function Sidebar() {
    const { sidebarOpen, toggleSidebar, selectNode } = useUiStore();
    const addNode = useFlowStore((s) => s.addNode);
    const nodes = useFlowStore((s) => s.nodes);

    const handleAddNode = (
        type: FlowNodeData['type'] | 'welcome' | 'help',
        role?: 'welcome' | 'help',
    ) => {
        // Проверка уникальности для welcome/help
        if (role) {
            const exists = nodes.some((n) => (n.data as { role?: string }).role === role);
            if (exists) return;
        }
        const x = 200 + Math.random() * 200;
        const y = 200 + Math.random() * 200;
        const newId = addNode(type as FlowNodeData['type'], { x, y });
        setTimeout(() => selectNode(newId), 50);
    };

    const onDragStart = (
        e: React.DragEvent,
        type: FlowNodeData['type'] | 'welcome' | 'help',
        role?: 'welcome' | 'help',
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
                className="fixed left-2 top-24 z-10 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(30,30,35,0.8)] p-2 text-white/60 shadow-lg backdrop-blur-xl hover:bg-[rgba(255,255,255,0.1)] hover:text-white/90"
            >
                ☰
            </button>
        );
    }

    return (
        <div className="flex min-w-[220px] max-w-[280px] flex-1 flex-col border-r border-[rgba(255,255,255,0.08)] bg-[rgba(20,20,25,0.95)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-4 py-3">
                <h2 className="text-sm font-bold text-white/80">{t('sidebar.nodes')}</h2>
                <button
                    onClick={toggleSidebar}
                    className="text-white/30 transition-colors hover:text-white/60"
                >
                    ✕
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-2">
                    {NODE_TYPES.map((nt) => {
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
                                        : 'cursor-grab hover:bg-[rgba(255,255,255,0.05)] hover:shadow-lg hover:scale-[1.02] active:cursor-grabbing active:scale-[0.98]'
                                }`}
                                style={{
                                    borderLeftColor: nt.borderColor,
                                    backgroundColor: `${nt.borderColor}10`,
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{nt.icon}</span>
                                    <span className="text-sm font-medium text-white/80">
                                        {t(nt.labelKey)}
                                    </span>
                                    {isDisabled && (
                                        <span className="ml-auto text-[10px] text-white/30">
                                            {t('sidebar.added')}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-[11px] text-white/55">{t(nt.descKey)}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6">
                    <h3 className="mb-2 text-xs font-bold text-white/50 uppercase">
                        {t('sidebar.howToUse')}
                    </h3>
                    <ul className="space-y-1 text-[11px] text-white/55">
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
