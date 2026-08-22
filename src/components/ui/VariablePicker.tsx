import { useState, useRef, useEffect, useMemo } from 'react';
import useFlowStore from '../../store/flowStore';
import type { ActionBlock } from '../../types/flow';
import { t } from '../../i18n';
import { NodeIcon } from './NodeIcons';

interface VariablePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    rows?: number;
    /** Режим: 'text' — вставляет {{var}}, 'value' — вставляет выражение */
    mode?: 'text' | 'value';
    /** ID текущей ноды — для группировки переменных на "из этого блока" / "из других" */
    currentNodeId?: string;
}

/**
 * Текстовое поле с выпадающим списком переменных.
 * Нажмите {var}, чтобы вставить {{имя_переменной}} в текст.
 */
export default function VariablePicker({
    value,
    onChange,
    placeholder,
    className,
    rows,
    mode = 'text',
    currentNodeId,
}: VariablePickerProps) {
    const [showPicker, setShowPicker] = useState(false);
    const nodes = useFlowStore((s) => s.nodes);
    const metadataVariables = useFlowStore((s) => s.metadata.variables);
    const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Собираем все переменные из нод (мемоизировано)
    // Группируем: из текущей ноды vs из других
    interface VariableSource {
        name: string;
        source: 'current' | 'other' | 'metadata';
        sourceNode?: string; // имя ноды-источника
    }
    const variablesBySource = useMemo(() => {
        const map = new Map<string, VariableSource>();
        for (const node of nodes) {
            const data = node.data as Record<string, unknown>;
            const nodeName = (data.name as string) || node.id;

            const addVar = (name: string | undefined | null) => {
                if (!name) return;
                map.set(name, {
                    name,
                    source: node.id === currentNodeId ? 'current' : 'other',
                    sourceNode: nodeName,
                });
            };

            addVar(data.saveTo as string);
            addVar(data.field as string);
            addVar(data.variable as string);
            addVar(data.saveResponseTo as string);
            addVar(data.saveTextTo as string);

            const actions = data.actions as ActionBlock[] | undefined;
            if (actions) {
                for (const action of actions) {
                    addVar(action.field);
                    addVar(action.saveResponseTo);
                    addVar(action.saveTextTo);
                }
            }
        }

        for (const key of Object.keys(metadataVariables ?? {})) {
            if (key && !map.has(key)) {
                map.set(key, { name: key, source: 'metadata' });
            }
        }
        return map;
    }, [nodes, metadataVariables, currentNodeId]);

    const currentVars = [...variablesBySource.values()].filter((v) => v.source === 'current');
    const otherVars = [...variablesBySource.values()].filter((v) => v.source === 'other');
    const metaVars = [...variablesBySource.values()].filter((v) => v.source === 'metadata');

    // Закрытие при клике вне
    useEffect(() => {
        if (!showPicker) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPicker]);

    const insertVariable = (varName: string) => {
        let insert: string;
        if (mode === 'value') {
            // В режиме value вставляем как выражение (без фигурных скобок)
            insert = varName;
        } else {
            // В режиме text вставляем как {{var}}
            insert = `{{${varName}}}`;
        }
        onChange(value + insert);
        setShowPicker(false);
        inputRef.current?.focus();
    };

    // Системные переменные
    const systemVars = [
        { name: '__currentTime', label: t('variable.currentTime') },
        { name: '__currentDate', label: t('variable.currentDate') },
        { name: '__currentTimestamp', label: t('variable.currentTimestamp') },
        { name: '__randomNumber', label: t('variable.randomNumber') },
        { name: '__userName', label: t('variable.userName') },
    ];

    // Дефолтные стили, если className не передан
    const defaultInputClass =
        'w-full resize-none border-0 border-b border-outline bg-transparent px-0 py-2 pr-16 text-sm text-fg placeholder-fg/35 transition-colors focus:border-b-2 focus:border-info focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none';

    return (
        <div className="relative min-w-0" ref={pickerRef}>
            {rows ? (
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    className={`${defaultInputClass} ${className ?? ''}`}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${defaultInputClass} ${className ?? ''}`}
                    placeholder={placeholder}
                />
            )}
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-full border border-info/30 bg-info/15 px-2 py-0.5 text-[11px] text-info transition-colors hover:bg-info/25 hover:shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                title={t('variable.insertVar')}
            >
                <span>+</span>
                <span>{'{var}'}</span>
            </button>
            {showPicker && (
                <div className="absolute left-0 top-full z-[100] max-h-60 w-full overflow-y-auto rounded-b border border-glass-border border-t-0 bg-surface-modal shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    {/* Системные переменные */}
                    <div className="border-b border-outline-variant px-3 py-1 text-[11px] font-medium text-fg/50">
                        {t('variable.system')}
                    </div>
                    {systemVars.map((sv) => (
                        <button
                            key={sv.name}
                            onClick={() => insertVariable(sv.name)}
                            className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs text-fg/70 hover:bg-fg/5"
                        >
                            <span className="text-fg/50">
                                <NodeIcon name="gear" size={11} />
                            </span>
                            {sv.label}
                        </button>
                    ))}

                    {/* Переменные из текущего блока */}
                    {currentVars.length > 0 && (
                        <>
                            <div className="flex items-center gap-1 border-b border-info/20 bg-info/5 px-3 py-1 text-[11px] font-medium text-info/70">
                                <NodeIcon name="pin" size={10} />
                                {t('variable.thisBlock')}
                            </div>
                            {currentVars.map((v) => (
                                <button
                                    key={`cur-${v.name}`}
                                    onClick={() => insertVariable(v.name)}
                                    className="block w-full px-3 py-1.5 text-left text-xs text-fg/70 hover:bg-info/[0.08]"
                                >
                                    {'{{' + v.name + '}}'}
                                </button>
                            ))}
                        </>
                    )}

                    {/* Переменные из других блоков */}
                    {otherVars.length > 0 && (
                        <>
                            <div className="border-b border-outline-variant px-3 py-1 text-[11px] font-medium text-fg/50">
                                {t('userData.title')}
                            </div>
                            {otherVars.map((v) => (
                                <button
                                    key={`oth-${v.name}`}
                                    onClick={() => insertVariable(v.name)}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-fg/70 hover:bg-fg/5"
                                >
                                    <span className="flex-1">{'{{' + v.name + '}}'}</span>
                                    <span className="text-[11px] text-fg/45">{v.sourceNode}</span>
                                </button>
                            ))}
                        </>
                    )}

                    {/* Глобальные переменные */}
                    {metaVars.length > 0 && (
                        <>
                            <div className="border-b border-outline-variant px-3 py-1 text-[11px] font-medium text-fg/50">
                                {t('variable.global')}
                            </div>
                            {metaVars.map((v) => (
                                <button
                                    key={`meta-${v.name}`}
                                    onClick={() => insertVariable(v.name)}
                                    className="block w-full px-3 py-1.5 text-left text-xs text-fg/70 hover:bg-fg/5"
                                >
                                    {'{{' + v.name + '}}'}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
