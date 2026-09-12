import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import StatusBar from '../components/StatusBar/StatusBar';
import useFlowStore from '../store/flowStore';
import useUiStore from '../store/uiStore';
import { setLocale } from '../i18n';

beforeEach(() => {
    useFlowStore.setState({ nodes: [], edges: [] });
    useFlowStore.getState().clearHistory();
    useUiStore.setState({ exportDialogOpen: false, selectedNodeId: null });
    setLocale('en');
    localStorage.clear();
});

describe('StatusBar', () => {
    it('renders node and edge counts', () => {
        useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        useFlowStore.getState().addNode('step', { x: 100, y: 0 });
        render(<StatusBar />);
        // "2 blocks · 0 connections"
        expect(screen.getByText(/2/)).toBeInTheDocument();
        expect(screen.getByText(/blocks/)).toBeInTheDocument();
    });

    it('toggles export dialog on status click', () => {
        render(<StatusBar />);
        const statusButton = screen.getByRole('button');
        fireEvent.click(statusButton);
        expect(useUiStore.getState().exportDialogOpen).toBe(true);
    });

    it('shows saving indicator while pending, saved after write', async () => {
        useFlowStore.setState({ saveState: 'saving' });
        render(<StatusBar />);
        expect(screen.getByText(/Saving/)).toBeInTheDocument();

        act(() => {
            useFlowStore.setState({ saveState: 'saved' });
        });
        expect(screen.getByText(/Saved/)).toBeInTheDocument();
    });

    it('shows no save indicator when idle (nothing to save)', () => {
        // Регрессия: idle раньше рисовался как «Saving…» и выглядел как вечная запись
        useFlowStore.setState({ saveState: 'idle' });
        render(<StatusBar />);
        expect(screen.queryByText(/Saving|Saved/)).not.toBeInTheDocument();
    });

    it('shows save-error warning with export action when storage fails', () => {
        useFlowStore.setState({ saveState: 'error' });
        render(<StatusBar />);
        // Краткий текст ошибки + tooltip с деталями, клик открывает экспорт
        const btn = screen.getByRole('button', { name: /Not saved/ });
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(useUiStore.getState().exportDialogOpen).toBe(true);
    });
});
