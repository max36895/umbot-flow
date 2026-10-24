import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import Toolbar from '../components/Toolbar/Toolbar';
import useFlowStore from '../store/flowStore';
import { setLocale, t } from '../i18n';
import { buildStarterDocument } from '../utils/starterDoc';

// Тулбар следит за переполнением через ResizeObserver — в jsdom его нет
vi.stubGlobal(
    'ResizeObserver',
    class {
        observe() {}
        disconnect() {}
    },
);

beforeEach(() => {
    localStorage.clear();
    setLocale('ru');
    useFlowStore.getState().fromJSON(buildStarterDocument('ru'));
});

function importFile(container: HTMLElement, text: string) {
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([text], 'flow.json', { type: 'application/json' });
    fireEvent.change(input, { target: { files: [file] } });
}

describe('Toolbar: импорт JSON', () => {
    // Регрессия: импорт гонял полную валидацию и отклонял недоделанный флоу,
    // выгруженный «Экспортом JSON» (несвязанный шаг без переменной) —
    // сохранённую в файл работу нельзя было открыть.
    it('недоделанный флоу (ошибки графа) открывается', async () => {
        const doc = buildStarterDocument('ru');
        doc.nodes.push({
            type: 'step',
            id: 'wip',
            name: 'step_2',
            prompt: { text: '', buttons: [] },
            saveTo: '',
            saveAs: 'original',
        });
        const { container } = render(<Toolbar />);
        importFile(container, JSON.stringify(doc));
        await waitFor(() =>
            expect(useFlowStore.getState().nodes.some((n) => n.id === 'wip')).toBe(true),
        );
        expect(screen.queryByText(t('error.importTitle'))).toBeNull();
    });

    it('файл не по схеме по-прежнему отклоняется', async () => {
        const doc = { ...buildStarterDocument('ru'), schemaVersion: '2.0', name: 'bad' };
        const { container } = render(<Toolbar />);
        importFile(container, JSON.stringify(doc));
        await screen.findByText(t('error.importTitle'));
        expect(useFlowStore.getState().metadata.name).toBe('my-first-bot');
    });
});
