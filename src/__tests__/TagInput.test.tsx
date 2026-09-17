import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TagInput from '../components/ui/TagInput';

/** Поле слотов: обычные слоты — в нижнем регистре, регулярные выражения — как введены. */
describe('TagInput', () => {
    function type(text: string, key = 'Enter', isPattern = false) {
        const onChange = vi.fn();
        render(
            <TagInput value={[]} onChange={onChange} placeholder="slot" isPattern={isPattern} />,
        );
        const input = screen.getByPlaceholderText('slot');
        fireEvent.change(input, { target: { value: text } });
        fireEvent.keyDown(input, { key });
        return onChange;
    }

    it('обычный слот приводится к нижнему регистру', () => {
        expect(type('Привет').mock.calls[0]?.[0]).toEqual(['привет']);
    });

    it('регулярное выражение сохраняет регистр: \\D и \\d — разные классы', () => {
        expect(type('^\\D+\\S*$', 'Enter', true).mock.calls[0]?.[0]).toEqual(['^\\D+\\S*$']);
    });

    it('запятая разделяет обычные слоты', () => {
        expect(type('кот', ',').mock.calls[0]?.[0]).toEqual(['кот']);
    });

    it('запятая не режет регулярку с квантификатором {1,3}', () => {
        expect(type('\\d{1', ',', true)).not.toHaveBeenCalled();
    });
});
