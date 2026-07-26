import { useState, useRef, useEffect, useMemo } from 'react';
import useFlowStore from '../../store/flowStore';
import type { ActionBlock } from '../../types/flow';
import { t } from '../../i18n';

interface VariablePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    rows?: number;
    /** Режим: 'text' — вставляет {{var}}, 'value' — вставляет выражение */
    mode?: 'text' | 'value';
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
}: VariablePickerProps) {
    const [showPicker, setShowPicker] = useState(false);
    const nodes = useFlowStore((s) => s.nodes);
    const metadataVariables = useFlowStore((s) => s.metadata.variables);
    const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Собираем все переменные из нод (мемоизировано)
    const variables = useMemo(() => {
        const vars = new Set<string>();
        for (const node of nodes) {
            const data = node.data as Record<string, unknown>;
            if (data.saveTo) vars.add(data.saveTo as string);
            if (data.field) vars.add(data.field as string);
            if (data.variable) vars.add(data.variable as string);
            if (data.saveResponseTo) vars.add(data.saveResponseTo as string);
            if (data.saveTextTo) vars.add(data.saveTextTo as string);

            const actions = data.actions as ActionBlock[] | undefined;
            if (actions) {
                for (const action of actions) {
                    if (action.field) vars.add(action.field);
                    if (action.saveResponseTo) vars.add(action.saveResponseTo);
                    if (action.saveTextTo) vars.add(action.saveTextTo);
                }
            }
        }

        for (const key of Object.keys(metadataVariables ?? {})) {
            if (key) vars.add(key);
        }
        return vars;
    }, [nodes, metadataVariables]);

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
        'w-full resize-none border-0 border-b border-[rgba(255,255,255,0.2)] bg-transparent px-0 py-2 pr-12 text-sm text-white placeholder-white/35 transition-colors focus:border-b-2 focus:border-[#00f0ff] focus:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)] focus:outline-none';

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
                className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.15)] px-2 py-0.5 text-[10px] text-[#00f0ff] transition-colors hover:bg-[rgba(0,240,255,0.25)] hover:shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                title={t('variable.insertVar')}
            >
                <span>+</span>
                <span>{'{var}'}</span>
            </button>
            {showPicker && (
                <div className="absolute left-0 top-full z-[100] max-h-60 w-full overflow-y-auto rounded-b border border-[rgba(255,255,255,0.1)] border-t-0 bg-[rgba(30,30,35,0.98)] shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    {/* Системные переменные */}
                    <div className="border-b border-[rgba(255,255,255,0.08)] px-3 py-1 text-[10px] font-medium text-white/30">
                        {t('variable.system')}
                    </div>
                    {systemVars.map((sv) => (
                        <button
                            key={sv.name}
                            onClick={() => insertVariable(sv.name)}
                            className="block w-full px-3 py-1.5 text-left text-xs text-white/70 hover:bg-[rgba(255,255,255,0.05)]"
                        >
                            <span className="text-white/30">⚙️</span> {sv.label}
                        </button>
                    ))}

                    {/* Пользовательские переменные */}
                    {variables.size > 0 && (
                        <>
                            <div className="border-b border-[rgba(255,255,255,0.08)] px-3 py-1 text-[10px] font-medium text-white/30">
                                {t('userData.title')}
                            </div>
                            {[...variables].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => insertVariable(v)}
                                    className="block w-full px-3 py-1.5 text-left text-xs text-white/70 hover:bg-[rgba(255,255,255,0.05)]"
                                >
                                    {'{{' + v + '}}'}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
