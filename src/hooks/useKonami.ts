import { useEffect, useRef, useState } from 'react';

/**
 * Konami-детектор (↑↑↓↓←→←→BA).
 *
 * Игнорирует ввод, когда фокус в поле ввода (иначе нельзя было бы
 * печатать стрелки в текст). Работает и на keydown-кодах
 * (ArrowUp), и на WASD — для клавиатур без стрелок.
 *
 * Второй вход (для тех, кто не знает Konami): набранное на странице
 * слово «um13» — четыре обычные клавиши, у-м-1-3 (раскладка не важна:
 * сравнение по e.code KeyU/KeyM/Digit1/Digit3). Слово и код делят
 * один unlock: тот же секрет, две двери.
 */
const KONAMI = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
];

/** Слово-вход: физические коды клавиш, локально-независимые. */
const UM13_WORD = ['KeyU', 'KeyM', 'Digit1', 'Digit3'];

const WASD_MAP: Record<string, string> = {
    w: 'ArrowUp',
    s: 'ArrowDown',
    a: 'ArrowLeft',
    d: 'ArrowRight',
};

export function useKonami(onUnlock: () => void, enabled = true) {
    const [progress, setProgress] = useState(0);
    const posRef = useRef(0);
    const firedRef = useRef(false);
    const wordPosRef = useRef(0);

    useEffect(() => {
        if (!enabled) return;

        const unlock = () => {
            if (firedRef.current) return;
            firedRef.current = true;
            onUnlock();
        };

        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const isInput =
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable);
            if (isInput || e.metaKey || e.ctrlKey || e.altKey) return;

            if (firedRef.current) return;

            // ── Слово-вход «um13»: u-m-1-3 по физическим кодам ──
            const expected = UM13_WORD[wordPosRef.current];
            if (e.code === expected) {
                wordPosRef.current += 1;
                if (wordPosRef.current === UM13_WORD.length) unlock();
            } else {
                wordPosRef.current = e.code === UM13_WORD[0] ? 1 : 0;
            }

            // Konami-код заканчивается на 'b','a' — WASD-замена 'a'→ArrowLeft
            // ломала финал последовательности. Поэтому WASD применяем только к
            // стрелочной части (до индекса 8), а 'b'/'a' оставляем как есть.
            let key = e.key;
            const pos = posRef.current;
            if (key.length === 1 && pos < 8) {
                key = WASD_MAP[key.toLowerCase()] ?? key.toLowerCase();
            } else if (key.length === 1) {
                key = key.toLowerCase();
            }

            const expectedKonami = KONAMI[posRef.current];
            if (key === expectedKonami || key.toLowerCase() === expectedKonami) {
                posRef.current += 1;
                setProgress(posRef.current / KONAMI.length);
                if (posRef.current === KONAMI.length) {
                    unlock();
                }
            } else {
                posRef.current = key === KONAMI[0] ? 1 : 0;
                setProgress(posRef.current / KONAMI.length);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onUnlock, enabled]);

    return { progress, fired: firedRef.current };
}
