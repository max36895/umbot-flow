import { useState } from 'react';
import useUiStore from '../../store/uiStore';
import { t, getLocale } from '../../i18n';
import { Modal } from '../ui/Modal';
import { PrimaryButton } from '../ui/PrimaryButton';
import { NODE_COLORS, nodeColorAlpha, type NodeTypeKey } from '../Canvas/nodes/nodeColors';

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

    return (
        <Modal
            title={t('help.title')}
            onClose={toggleHelp}
            maxWidth="2xl"
            maxHeightClass="max-h-[80vh]"
        >
            <div className="flex flex-1 overflow-hidden">
                {/* Tabs */}
                <div className="w-48 flex-shrink-0 overflow-y-auto border-r border-outline-variant p-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-info/10 font-medium text-info'
                                    : 'text-fg/60 hover:bg-fg/5'
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
                                <h3 className="text-base font-semibold text-fg/90">
                                    {t('help.whatIs')}
                                </h3>
                                <p className="text-sm leading-relaxed text-fg/60">
                                    {t('help.whatIsDesc')}
                                </p>
                                <h3 className="text-base font-semibold text-fg/90">
                                    {t('help.howToStart')}
                                </h3>
                                <pre className="whitespace-pre-wrap rounded-lg bg-fg/5 p-3 text-sm text-fg/70 border border-outline-variant">
                                    {t('help.howToStartDesc')}
                                </pre>
                                <h3 className="text-base font-semibold text-fg/90">
                                    {t('help.howItWorks')}
                                </h3>
                                <div className="flex items-center justify-center gap-2 rounded-lg bg-fg/[0.03] p-4 border border-outline-variant">
                                    <FlowStep type="step" label={t('help.flowEditor')} />
                                    <Arrow />
                                    <FlowStep type="command" label={t('help.flowJson')} />
                                    <Arrow />
                                    <FlowStep type="action" label={t('help.flowCli')} />
                                    <Arrow />
                                    <FlowStep type="response" label={t('help.flowTs')} />
                                </div>
                                <p className="text-xs text-fg/60 text-center">
                                    {t('help.howItWorksDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'nodes' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-fg/90">
                                    {t('help.nodeTypes')}
                                </h3>
                                <NodeDoc
                                    type="command"
                                    badge={t('node.badge.cmd')}
                                    descKey="help.cmdDesc"
                                />
                                <NodeDoc
                                    type="response"
                                    badge={t('node.badge.response')}
                                    descKey="help.responseDesc"
                                />
                                <NodeDoc
                                    type="step"
                                    badge={t('node.badge.step')}
                                    descKey="help.stepDesc"
                                />
                                <NodeDoc
                                    type="condition"
                                    badge={t('node.badge.if')}
                                    descKey="help.condDesc"
                                />
                                <NodeDoc
                                    type="end"
                                    badge={t('node.badge.end')}
                                    descKey="help.endDesc"
                                />
                                <NodeDoc
                                    type="action"
                                    badge={t('node.badge.action')}
                                    descKey="help.actionDesc"
                                />
                            </div>
                        )}

                        {activeTab === 'slots' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-fg/90">
                                    {t('help.slotsTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-fg/60">
                                    {t('help.slotsDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'userData' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-fg/90">
                                    {t('help.userDataTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-fg/60">
                                    {t('help.userDataDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'export' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-fg/90">
                                    {t('help.exportTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-fg/60">
                                    {t('help.exportDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'custom' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-fg/90">
                                    {t('help.customTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-fg/60">
                                    {t('help.customDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'sysvars' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-fg/90">
                                    {t('help.sysVarsTitle')}
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-fg/60">
                                    {t('help.sysVarsDesc')}
                                </p>
                            </div>
                        )}

                        {activeTab === 'shortcuts' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-fg/90">
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
                                            className="flex items-center justify-between rounded-lg border border-outline-variant bg-fg/[0.03] px-3 py-1.5"
                                        >
                                            <span className="text-xs text-fg/70">
                                                {t(labelKey)}
                                            </span>
                                            <kbd className="rounded border border-outline bg-fg/[0.08] px-1.5 py-0.5 font-mono text-[11px] text-info">
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
            <div className="flex items-center justify-between border-t border-outline-variant px-6 py-3">
                <a
                    href={getLocale() === 'en' ? '/docs/en' : '/docs'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-info/80 transition-colors hover:text-info"
                >
                    {t('help.docsLink')} ↗
                </a>
                <PrimaryButton onClick={toggleHelp}>{t('help.close')}</PrimaryButton>
            </div>
        </Modal>
    );
}

function NodeDoc({ type, badge, descKey }: { type: NodeTypeKey; badge: string; descKey: string }) {
    const color = NODE_COLORS[type].cssVar;
    return (
        <div className="rounded-lg border border-outline-variant bg-fg/[0.03] p-3">
            <div className="mb-1 flex items-center gap-2">
                <span
                    className="rounded-lg border px-2 py-0.5 text-xs font-bold"
                    style={{
                        borderColor: nodeColorAlpha(type, 25),
                        backgroundColor: nodeColorAlpha(type, 8),
                        color,
                    }}
                >
                    {badge}
                </span>
            </div>
            <p className="text-sm text-fg/70">{t(descKey)}</p>
        </div>
    );
}

function FlowStep({ type, label }: { type: NodeTypeKey; label: string }) {
    return (
        <div
            className="rounded-lg border px-3 py-2 text-center text-xs font-medium"
            style={{
                borderColor: nodeColorAlpha(type, 25),
                backgroundColor: nodeColorAlpha(type, 8),
                color: NODE_COLORS[type].cssVar,
            }}
        >
            {label}
        </div>
    );
}

function Arrow() {
    return <span className="text-lg text-fg/55">→</span>;
}
