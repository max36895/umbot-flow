import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ActionProps } from '../components/Properties/ActionProps';
import useFlowStore from '../store/flowStore';
import { setLocale, t } from '../i18n';

beforeEach(() => {
    vi.useFakeTimers();
    useFlowStore.setState({ nodes: [], edges: [] });
    useFlowStore.getState().clearHistory();
    setLocale('ru');
    localStorage.clear();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('ActionProps', () => {
    // Регрессия: блок «Действие» передавал в ActionBlockEditor массив ошибок
    // вместо Map по индексу — «r.get is not a function» при первой же ошибке
    // валидации действия (пустое имя переменной у «Задать переменную»).
    it('добавление «Задать переменную» не роняет панель, ошибка — у своего блока', () => {
        const id = useFlowStore.getState().addNode('action', { x: 0, y: 0 });
        render(<ActionProps nodeId={id} />);
        fireEvent.click(screen.getByText(t('action.set_variable')));
        // валидация идёт с дебаунсом — дожидаемся её прогона
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(useFlowStore.getState().nodes[0]!.data).toMatchObject({
            actions: [{ type: 'set_variable' }],
        });
        expect(document.querySelectorAll('.input-error-container').length).toBeGreaterThan(0);
    });
});
