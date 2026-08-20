import { useState, useRef, useEffect } from 'react';
import { t } from '../../i18n';
import type { Platform } from '../../types/flow';
import { NodeIcon } from './NodeIcons';

interface PlatformSelectorProps {
    value: Platform[];
    onChange: (platforms: Platform[]) => void;
}

/** Все доступные платформы umbot */
const ALL_PLATFORMS: Platform[] = [
    'alisa',
    'telegram',
    'vk',
    'marusia',
    'max_app',
    'viber',
    'smart_app',
];

/** Человекочитаемые имена платформ */
const PLATFORM_I18N: Record<Platform, string> = {
    alisa: 'platform.alisa',
    telegram: 'platform.telegram',
    vk: 'platform.vk',
    marusia: 'platform.marusia',
    max_app: 'platform.max',
    viber: 'platform.viber',
    smart_app: 'platform.smartApp',
};

/** Группы платформ для быстрого выбора */
const PLATFORM_GROUPS: { labelKey: string; platforms: Platform[] }[] = [
    { labelKey: 'toolbar.platformsAll', platforms: ALL_PLATFORMS },
    { labelKey: 'toolbar.platformsVoice', platforms: ['alisa', 'marusia', 'smart_app'] },
    { labelKey: 'toolbar.platformsChat', platforms: ['telegram', 'vk', 'max_app', 'viber'] },
];

/**
 * Мульти-селектор платформ сгруппированный по типам.
 * Позволяет выбрать одну, несколько или все платформы.
 */
export default function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Закрытие при клике вне — только когда меню открыто
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const togglePlatform = (platform: Platform) => {
        if (value.includes(platform)) {
            onChange(value.filter((p) => p !== platform));
        } else {
            onChange([...value, platform]);
        }
    };

    const selectGroup = (platforms: Platform[]) => {
        const allSelected = platforms.every((p) => value.includes(p));
        if (allSelected) {
            onChange(value.filter((p) => !platforms.includes(p)));
        } else {
            const newValue = [...new Set([...value, ...platforms])];
            onChange(newValue);
        }
    };

    const displayText =
        value.length === 0
            ? t('toolbar.platforms')
            : value.length === ALL_PLATFORMS.length
              ? t('toolbar.platformsAll')
              : value.map((p) => t(PLATFORM_I18N[p]) ?? p).join(', ');

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-xs text-white/60 transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white/90"
                title={t('toolbar.platforms')}
            >
                <NodeIcon name="link" size={12} />
                <span className="max-w-[140px] truncate">{displayText}</span>
                <NodeIcon name={isOpen ? 'chevronDown' : 'chevronRight'} size={8} strokeWidth={2} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(30,30,35,0.98)] shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    {/* Группы */}
                    <div className="border-b border-[rgba(255,255,255,0.08)] p-2">
                        {PLATFORM_GROUPS.map((group) => {
                            const allSelected = group.platforms.every((p) => value.includes(p));
                            return (
                                <button
                                    key={group.labelKey}
                                    onClick={() => selectGroup(group.platforms)}
                                    className={`block w-full rounded px-2 py-1 text-left text-xs ${
                                        allSelected
                                            ? 'bg-[rgba(0,240,255,0.1)] text-info'
                                            : 'text-white/50 hover:bg-[rgba(255,255,255,0.05)]'
                                    }`}
                                >
                                    {t(group.labelKey)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Отдельные платформы */}
                    <div className="p-2">
                        {ALL_PLATFORMS.map((platform) => (
                            <label
                                key={platform}
                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-white/70 hover:bg-[rgba(255,255,255,0.05)]"
                            >
                                <input
                                    type="checkbox"
                                    checked={value.includes(platform)}
                                    onChange={() => togglePlatform(platform)}
                                    className="h-3 w-3 rounded accent-info"
                                />
                                <span>{t(PLATFORM_I18N[platform])}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
