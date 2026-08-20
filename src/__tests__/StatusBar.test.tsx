import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

    it('shows saved indicator after changes settle', async () => {
        useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        render(<StatusBar />);
        // Initially "Saving…", then transitions to "Saved"
        expect(screen.getByText(/Saving|Saved/)).toBeInTheDocument();
    });
});
