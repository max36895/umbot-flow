import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
 *
 * Меню рендерится через портал в body с position: fixed — тулбар имеет
 * overflow-x-auto, который по спецификации CSS делает overflow-y != visible
 * и обрезал бы выпадающее вниз меню.
 */
export default function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number } | null>(null);

    // Позиция меню привязана к кнопке; пересчитываем при скролле/ресайзе,
    // чтобы меню не «отрывалось» от кнопки при горизонтальном скролле тулбара
    useEffect(() => {
        if (!isOpen) return;
        const update = () => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;
            const width = 224; // w-56
            // Меню выровнено по правому краю кнопки
            const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
            const top = rect.bottom + 4;
            // Ограничиваем высоту, чтобы меню не вылезало за нижний край экрана
            const maxHeight = Math.max(120, window.innerHeight - top - 8);
            setPos({ top, left, maxHeight });
        };
        update();
        window.addEventListener('resize', update);
        document.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            document.removeEventListener('scroll', update, true);
        };
    }, [isOpen]);

    // Закрытие при клике вне — только когда меню открыто
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (ref.current?.contains(target)) return;
            // Меню в портале вне ref, поэтому проверяем его отдельно
            if (menuRef.current?.contains(target)) return;
            setIsOpen(false);
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
                className="flex items-center gap-1 rounded-lg border border-glass-border bg-fg/5 px-2 py-1 text-xs text-fg/60 transition-colors hover:bg-fg/10 hover:text-fg/90"
                title={t('toolbar.platforms')}
            >
                <NodeIcon name="link" size={12} />
                <span className="max-w-[140px] truncate">{displayText}</span>
                <NodeIcon name={isOpen ? 'chevronDown' : 'chevronRight'} size={8} strokeWidth={2} />
            </button>

            {isOpen &&
                pos &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ top: pos.top, left: pos.left, maxHeight: pos.maxHeight }}
                        className="fixed z-menu w-56 overflow-y-auto rounded-lg border border-glass-border bg-surface-modal shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                    >
                    {/* Группы */}
                    <div className="border-b border-outline-variant p-2">
                        {PLATFORM_GROUPS.map((group) => {
                            const allSelected = group.platforms.every((p) => value.includes(p));
                            return (
                                <button
                                    key={group.labelKey}
                                    onClick={() => selectGroup(group.platforms)}
                                    className={`block w-full rounded px-2 py-1 text-left text-xs ${
                                        allSelected
                                            ? 'bg-info/10 text-info'
                                            : 'text-fg/50 hover:bg-fg/5'
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
                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-fg/70 hover:bg-fg/5"
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
                    </div>,
                    document.body,
                )}
        </div>
    );
}
