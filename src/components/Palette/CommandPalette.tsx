import { useEffect, useMemo, useRef, useState } from 'react';
import useFlowStore from '../../store/flowStore';
import useUiStore from '../../store/uiStore';
import { t } from '../../i18n';
import { NODE_COLORS, type NodeTypeKey } from '../Canvas/nodes/nodeColors';

interface Props {
    onClose: () => void;
}

/**
 * Быстрый поиск по нодам — Cmd/Ctrl+K.
 * Позволяет быстро перейти к нужному блоку на big flow.
 */
export default function CommandPalette({ onClose }: Props) {
    const nodes = useFlowStore((s) => s.nodes);
    const selectNode = useUiStore((s) => s.selectNode);
    const [search, setSearch] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return nodes.slice(0, 10);
        const q = search.toLowerCase();
        return nodes
            .filter((n) => {
                const data = n.data as { name?: string; type?: string };
                return (
                    (data.name ?? '').toLowerCase().includes(q) ||
                    (data.type ?? '').toLowerCase().includes(q) ||
                    n.id.toLowerCase().includes(q)
                );
            })
            .slice(0, 10);
    }, [nodes, search]);

    useEffect(() => {
        setSelectedIdx(0);
    }, [filtered.length]);

    const handleSelect = (id: string) => {
        selectNode(id);
        onClose();
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx((i) => Math.max(i - 1, 0));
            return;
        }
        if (e.key === 'Enter' && filtered[selectedIdx]) {
            e.preventDefault();
            handleSelect(filtered[selectedIdx].id);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[300] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[15vh]"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-xl border border-outline bg-surface-modal shadow-[0_0_60px_rgba(0,0,0,0.7)] backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={t('palette.placeholder')}
                    className="w-full border-b border-glass-border bg-transparent px-4 py-3 text-sm text-fg placeholder-fg/30 focus:outline-none"
                />
                <div className="max-h-72 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-fg/50">
                            {t('palette.noResults')}
                        </div>
                    ) : (
                        filtered.map((node, i) => {
                            const data = node.data as { name?: string; type?: string };
                            const color = NODE_COLORS[(node.type ?? 'command') as NodeTypeKey];
                            const isSelected = i === selectedIdx;
                            return (
                                <button
                                    key={node.id}
                                    onClick={() => handleSelect(node.id)}
                                    onMouseEnter={() => setSelectedIdx(i)}
                                    className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                                        isSelected ? 'bg-info/10' : ''
                                    }`}
                                >
                                    <span
                                        className="h-2 w-2 flex-shrink-0 rounded-full"
                                        style={{ backgroundColor: color?.cssVar ?? '#888' }}
                                    />
                                    <span className="flex-1 truncate text-sm text-fg/90">
                                        {data.name || node.id}
                                    </span>
                                    <span className="text-[11px] uppercase tracking-wider text-fg/50">
                                        {node.type}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
                <div className="border-t border-outline-variant px-4 py-2 text-[11px] text-fg/50">
                    <span>{t('palette.navHint')}</span>
                    <span className="mx-2">·</span>
                    <span>{t('palette.selectHint')}</span>
                    <span className="mx-2">·</span>
                    <span>{t('palette.closeHint')}</span>
                </div>
            </div>
        </div>
    );
}
