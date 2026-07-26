import { useState, useCallback } from 'react';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

/** Tag-style input for entering multiple values (e.g. slot triggers). */
export default function TagInput({ value, onChange, placeholder }: TagInputProps) {
    const [input, setInput] = useState('');

    const addTag = useCallback(
        (text: string) => {
            const trimmed = text.trim().toLowerCase();
            if (trimmed && !value.includes(trimmed)) {
                onChange([...value, trimmed]);
            }
            setInput('');
        },
        [value, onChange],
    );

    const removeTag = useCallback(
        (index: number) => {
            onChange(value.filter((_, i) => i !== index));
        },
        [value, onChange],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag(input);
            } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
                removeTag(value.length - 1);
            }
        },
        [input, addTag, removeTag, value],
    );

    const handleBlur = useCallback(() => {
        if (input.trim()) {
            addTag(input);
        }
    }, [input, addTag]);

    return (
        <div className="flex w-full flex-wrap items-center gap-1 rounded border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] px-2 py-1 focus-within:border-[#00f0ff] focus-within:shadow-[0_4px_8px_-4px_rgba(0,240,255,0.4)]">
            {value.map((tag, i) => (
                <span
                    key={`${tag}-${i}`}
                    className="inline-flex items-center gap-1 rounded bg-[rgba(0,240,255,0.15)] px-2 py-0.5 text-xs font-medium text-[#00f0ff]"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(i)}
                        className="ml-0.5 rounded-full text-[#00f0ff]/50 hover:text-[#00f0ff]"
                    >
                        &times;
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={value.length === 0 ? placeholder : ''}
                className="min-w-[80px] flex-1 border-none bg-transparent text-sm text-white placeholder-white/35 outline-none"
            />
        </div>
    );
}
