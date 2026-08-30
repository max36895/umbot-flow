import useFlowStore from '../../store/flowStore';

interface NodeSelectorProps {
    value: string;
    onChange: (nodeId: string) => void;
    excludeId?: string;
    className?: string;
}

/** Выпадающий список для выбора ноды по имени (вместо ручного ввода ID). */
export default function NodeSelector({
    value,
    onChange,
    excludeId,
    className = '',
}: NodeSelectorProps) {
    const nodes = useFlowStore((s) => s.nodes);

    // Исключаем текущую ноду и стартовую: End — легитимная цель
    // («после этого шага завершить диалог»). Welcome остаётся в списке.
    const availableNodes = nodes.filter((n) => n.id !== excludeId && n.type !== 'start');

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`rounded border border-glass-border bg-fg/5 px-2 py-1 text-xs text-fg/80 focus:border-info focus:outline-none ${className}`}
        >
            <option value="">—</option>
            {availableNodes.map((n) => {
                const data = n.data as { name?: string; type?: string };
                const label = data.name || n.id;
                // Нативный <option> не рендерит SVG — используем короткие текстовые маркеры
                const typeLabel =
                    n.type === 'command'
                        ? '[cmd]'
                        : n.type === 'step'
                          ? '[step]'
                          : n.type === 'condition'
                            ? '[if]'
                            : n.type === 'action'
                              ? '[act]'
                              : n.type === 'response'
                                ? '[resp]'
                                : n.type === 'end'
                                  ? '[end]'
                                  : '';
                return (
                    <option key={n.id} value={n.id}>
                        {typeLabel} {label}
                    </option>
                );
            })}
        </select>
    );
}
