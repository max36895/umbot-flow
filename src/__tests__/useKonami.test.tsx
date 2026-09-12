import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { useKonami } from '../hooks/useKonami';

/**
 * Тесты детекторов секрета редактора:
 *  • Konami-код (↑↑↓↓←→←→BA и WASD-вариант) — классический вход;
 *  • слово «um13» (u-m-1-3 по физическим кодам клавиш) — вторая
 *    дверь из креативного аудита (Б3): для тех, кто Konami не знает.
 * Оба триггера ведут в один unlock; поля ввода не перехватывают
 * клавиши; счётчики не мешают друг другу (набор Konami не должен
 * случайно собрать слово и наоборот).
 */

const konamiKeys = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
];

const konamiCodes = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA',
];

function press(key: string, code: string) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true }));
}

describe('useKonami — детекторы секрета', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    afterEach(() => {
        cleanup();
    });

    it('Konami-код вызывает unlock', () => {
        const unlock = vi.fn();
        render(<Probe onUnlock={unlock} />);
        konamiKeys.forEach((k, i) =>
            act(() => press(k, konamiCodes[i] ?? 'Key' + k)),
        );
        expect(unlock).toHaveBeenCalledTimes(1);
    });

    it('слово um13 (KeyU KeyM Digit1 Digit3) вызывает unlock', () => {
        const unlock = vi.fn();
        render(<Probe onUnlock={unlock} />);
        ['KeyU', 'KeyM', 'Digit1', 'Digit3'].forEach((code) =>
            act(() => press(code.toLowerCase(), code)),
        );
        expect(unlock).toHaveBeenCalledTimes(1);
    });

    it('слово um13 работает на русской раскладке (e.code физический)', () => {
        const unlock = vi.fn();
        render(<Probe onUnlock={unlock} />);
        // на русской раскладке e.key для тех же физических клавиш — «г», «ь»…
        const ruKeys = ['г', 'ь', '1', '3'];
        const codes = ['KeyU', 'KeyM', 'Digit1', 'Digit3'];
        codes.forEach((code, i) => act(() => press(ruKeys[i]!, code)));
        expect(unlock).toHaveBeenCalledTimes(1);
    });

    it('набор Konami не собирает слово случайно (независимые счётчики)', () => {
        const unlock = vi.fn();
        render(<Probe onUnlock={unlock} />);
        // WASD-вариант Konami: wwssadadba — содержит a/m-подобные клавиши,
        // но НЕ u-m-1-3 подряд: слово не должно сработать раньше кода
        const wasd = ['w', 'w', 's', 's', 'a', 'd', 'a', 'd', 'b', 'a'];
        const wasdCodes = ['KeyW', 'KeyW', 'KeyS', 'KeyS', 'KeyA', 'KeyD', 'KeyA', 'KeyD', 'KeyB', 'KeyA'];
        wasd.forEach((k, i) => act(() => press(k, wasdCodes[i]!)));
        expect(unlock).toHaveBeenCalledTimes(1); // только Konami
    });

    it('неверное слово сбрасывает прогресс: um13 ≠ um14', () => {
        const unlock = vi.fn();
        render(<Probe onUnlock={unlock} />);
        act(() => press('u', 'KeyU'));
        act(() => press('m', 'KeyM'));
        act(() => press('1', 'Digit1'));
        act(() => press('4', 'Digit4')); // промах — сброс
        act(() => press('u', 'KeyU'));   // снова начало
        expect(unlock).not.toHaveBeenCalled();
        act(() => press('m', 'KeyM'));
        act(() => press('1', 'Digit1'));
        act(() => press('3', 'Digit3'));
        expect(unlock).toHaveBeenCalledTimes(1); // после сброса собралось
    });

    it('поля ввода не триггерят детекторы', () => {
        const unlock = vi.fn();
        render(<Probe onUnlock={unlock} />);
        const input = document.createElement('input');
        document.body.appendChild(input);
        const ev = new KeyboardEvent('keydown', { key: 'u', code: 'KeyU', bubbles: true });
        Object.defineProperty(ev, 'target', { value: input });
        act(() => window.dispatchEvent(ev));
        expect(unlock).not.toHaveBeenCalled();
        input.remove();
    });
});

/** Обёртка над хуком (хук нельзя звать вне компонента). */
function Probe({ onUnlock }: { onUnlock: () => void }) {
    const { fired } = useKonami(onUnlock);
    return <div data-testid="probe">{fired ? 'fired' : 'idle'}</div>;
}
