import { useState, useEffect } from 'react';
import useUiStore from '../../store/uiStore';
import { t } from '../../i18n';
import { NodeIcon } from '../ui/NodeIcons';

type Tab = 'intro' | 'nodes' | 'slots' | 'userData' | 'export' | 'custom' | 'sysvars' | 'shortcuts';

const TABS: { id: Tab; labelKey: string }[] = [
    { id: 'intro', labelKey: 'help.whatIs' },
    { id: 'nodes', labelKey: 'help.nodeTypes' },
    { id: 'slots', labelKey: 'help.slotsTitle' },
    { id: 'userData', labelKey: 'help.userDataTitle' },
    { id: 'sysvars', labelKey: 'help.sysVarsTitle' },
    { id: 'export', labelKey: 'help.exportTitle' },
    { id: 'custom', labelKey: 'help.customTitle' },
    { id: 'shortcuts', labelKey: 'help.shortcutsTitle' },
];

export default function HelpModal() {
    const toggleHelp = useUiStore((s) => s.toggleHelp);
    const [activeTab, setActiveTab] = useState<Tab>('intro');
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setAnimate(true));
    }, []);

    const handleClose = () => {
        setAnimate(false);
        setTimeout(() => toggleHelp(), 150);
    };

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${animate ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
        >
            <div
                className={`flex w-full max-w-2xl flex-col rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,25,0.98)] shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-150 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                style={{ maxHeight: '80vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
                    <h2 className="text-lg font-bold text-white/90">{t('help.title')}</h2>
                    <button onClick={handleClose} className="text-white/30 hover:text-white/60">
                        <NodeIcon name="close" size={14} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Tabs */}
                    <div className="w-48 flex-shrink-0 overflow-y-auto border-r border-[rgba(255,255,255,0.08)] p-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-[rgba(0,240,255,0.1)] font-medium text-info'
                                        : 'text-white/50 hover:bg-[rgba(255,255,255,0.05)]'
                                }`}
                            >
                                {t(tab.labelKey)}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'intro' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.whatIs')}
                                </h3>
                                <p className="text-sm leading-relaxed text-white/60">
                                    {t('help.whatIsDesc')}
                                </p>
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.howToStart')}
                                </h3>
                                <pre className="whitespace-pre-wrap rounded-lg bg-[rgba(255,255,255,0.05)] p-3 text-sm text-white/70 border border-[rgba(255,255,255,0.08)]">
                                    {t('help.howToStartDesc')}
                                </pre>
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.howItWorks')}
                                </h3>
                                <div className="flex items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.03)] p-4 border border-[rgba(255,255,255,0.08)]">
                                    <FlowStep color="#bc13fe" label={t('help.flowEditor')} />
                                    <Arrow />
                                    <FlowStep color="#00f0ff" label={t('help.flowJson')} />
                                    <Arrow />
                                    <FlowStep color="#ff9d00" label={t('help.flowCli')} />
                                    <Arrow />
                                    <FlowStep color="#00ff9d" label={t('help.flowTs')} />
                                </div>
                                <p className="text-xs text-white/50 text-center">
                                    {t('help.howItWorksDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'nodes' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.nodeTypes')}
                                </h3>
                                <NodeDoc
                                    color="#00f0ff"
                                    badge={t('node.badge.cmd')}
                                    descKey="help.cmdDesc"
                                />
                                <NodeDoc
                                    color="#00ff9d"
                                    badge={t('node.badge.response')}
                                    descKey="help.responseDesc"
                                />
                                <NodeDoc
                                    color="#bc13fe"
                                    badge={t('node.badge.step')}
                                    descKey="help.stepDesc"
                                />
                                <NodeDoc
                                    color="#ff0055"
                                    badge={t('node.badge.if')}
                                    descKey="help.condDesc"
                                />
                                <NodeDoc
                                    color="#ef4444"
                                    badge={t('node.badge.end')}
                                    descKey="help.endDesc"
                                />
                                <NodeDoc
                                    color="#ff9d00"
                                    badge={t('node.badge.action')}
                                    descKey="help.actionDesc"
                                />
                            </div>
                        )}

                        {activeTab === 'slots' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.slotsTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-white/60">
                                    {t('help.slotsDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'userData' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.userDataTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-white/60">
                                    {t('help.userDataDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'export' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.exportTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-white/60">
                                    {t('help.exportDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'custom' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.customTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-white/60">
                                    {t('help.customDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'sysvars' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.sysVarsTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-white/60">
                                    {t('help.sysVarsDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'shortcuts' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-white/90">
                                    {t('help.shortcutsTitle')}
                                </h3>
                                <div className="space-y-1.5">
                                    {(
                                        [
                                            ['Ctrl+K', 'help.shortcutSearch'],
                                            ['Ctrl+N', 'help.shortcutNew'],
                                            ['Ctrl+S', 'help.shortcutExport'],
                                            ['Ctrl+P', 'help.shortcutPreview'],
                                            ['Ctrl+Z', 'help.shortcutUndo'],
                                            ['Ctrl+Shift+Z', 'help.shortcutRedo'],
                                            ['Ctrl+C', 'help.shortcutCopy'],
                                            ['Ctrl+V', 'help.shortcutPaste'],
                                            ['Ctrl+D', 'help.shortcutDuplicate'],
                                            ['Delete / Backspace', 'help.shortcutDelete'],
                                        ] as [string, string][]
                                    ).map(([key, labelKey]) => (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5"
                                        >
                                            <span className="text-xs text-white/60">
                                                {t(labelKey)}
                                            </span>
                                            <kbd className="rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.08)] px-1.5 py-0.5 font-mono text-[10px] text-info">
                                                {key}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-[rgba(255,255,255,0.08)] px-6 py-3 text-right">
                    <button
                        onClick={handleClose}
                        className="rounded-lg bg-gradient-to-r from-[#bc13fe] to-[#00f0ff] px-4 py-2 text-sm text-white shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all"
                    >
                        {t('help.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

function NodeDoc({ color, badge, descKey }: { color: string; badge: string; descKey: string }) {
    return (
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3">
            <div className="mb-1 flex items-center gap-2">
                <span
                    className="rounded-lg border px-2 py-0.5 text-xs font-bold"
                    style={{
                        borderColor: `${color}40`,
                        backgroundColor: `${color}15`,
                        color: color,
                    }}
                >
                    {badge}
                </span>
            </div>
            <p className="text-sm text-white/60">{t(descKey)}</p>
        </div>
    );
}

function FlowStep({ color, label }: { color: string; label: string }) {
    return (
        <div
            className="rounded-lg border px-3 py-2 text-center text-xs font-medium"
            style={{
                borderColor: `${color}40`,
                backgroundColor: `${color}15`,
                color: color,
            }}
        >
            {label}
        </div>
    );
}

function Arrow() {
    return <span className="text-lg text-white/20">→</span>;
}
