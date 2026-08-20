import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../components/Sidebar/Sidebar';
import useFlowStore from '../store/flowStore';
import useUiStore from '../store/uiStore';
import { setLocale } from '../i18n';

beforeEach(() => {
    useFlowStore.setState({ nodes: [], edges: [] });
    useFlowStore.getState().clearHistory();
    useUiStore.setState({ sidebarOpen: true, selectedNodeId: null });
    setLocale('en');
    localStorage.clear();
});

describe('Sidebar', () => {
    it('renders all node type labels', () => {
        render(<Sidebar />);
        expect(screen.getByText('Command')).toBeInTheDocument();
        expect(screen.getByText('Step')).toBeInTheDocument();
        expect(screen.getByText('Condition')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Response')).toBeInTheDocument();
        expect(screen.getByText('End')).toBeInTheDocument();
    });

    it('adds a command node on click', () => {
        render(<Sidebar />);
        fireEvent.click(screen.getByText('Command'));
        const nodes = useFlowStore.getState().nodes;
        expect(nodes).toHaveLength(1);
        expect(nodes[0]?.type).toBe('command');
    });

    it('adds a step node on click', () => {
        render(<Sidebar />);
        fireEvent.click(screen.getByText('Step'));
        const nodes = useFlowStore.getState().nodes;
        expect(nodes).toHaveLength(1);
        expect(nodes[0]?.type).toBe('step');
    });

    it('prevents duplicate welcome node', () => {
        // Add a welcome node first
        useFlowStore.getState().addNode('welcome', { x: 0, y: 0 });
        render(<Sidebar />);
        fireEvent.click(screen.getByText('Start'));
        const nodes = useFlowStore.getState().nodes;
        // Should still be 1 — duplicate prevented
        expect(nodes).toHaveLength(1);
    });

    it('filters nodes by search query', () => {
        render(<Sidebar />);
        const searchInput = screen.getByPlaceholderText('Search blocks...');
        fireEvent.change(searchInput, { target: { value: 'condition' } });
        expect(screen.getByText('Condition')).toBeInTheDocument();
        expect(screen.queryByText('Command')).not.toBeInTheDocument();
    });

    it('shows no results message for empty search', () => {
        render(<Sidebar />);
        const searchInput = screen.getByPlaceholderText('Search blocks...');
        fireEvent.change(searchInput, { target: { value: 'zzzzz' } });
        expect(screen.getByText('No blocks found')).toBeInTheDocument();
    });

    it('collapses sidebar and shows toggle button', () => {
        useUiStore.setState({ sidebarOpen: false });
        render(<Sidebar />);
        // When collapsed, only the toggle button is shown
        expect(screen.queryByText('Command')).not.toBeInTheDocument();
    });
});
