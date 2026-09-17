import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatPreview from '../components/Preview/ChatPreview';
import useFlowStore from '../store/flowStore';
import useUiStore from '../store/uiStore';
import { setLocale } from '../i18n';
import type { Node } from '@xyflow/react';

function makeCommandNode(
    id: string,
    name: string,
    slots: string[],
    text: string,
    role?: 'welcome' | 'help' | 'fallback',
): Node {
    return {
        id,
        type: 'command',
        position: { x: 0, y: 0 },
        data: {
            type: 'command',
            id,
            name,
            slots,
            isPattern: false,
            response: { text, buttons: [], sounds: [] },
            ...(role ? { role } : {}),
        },
    };
}

beforeEach(() => {
    useFlowStore.setState({ nodes: [], edges: [] });
    useFlowStore.getState().clearHistory();
    useUiStore.setState({ previewOpen: true, activePreviewNodeId: null });
    setLocale('en');
    localStorage.clear();
});

describe('ChatPreview', () => {
    it('shows welcome message on open', () => {
        useFlowStore.setState({
            nodes: [makeCommandNode('w1', 'welcome', [], 'Hello, welcome!', 'welcome')],
        });
        render(<ChatPreview />);
        expect(screen.getByText('Hello, welcome!')).toBeInTheDocument();
    });

    it('responds to a matching command slot', async () => {
        useFlowStore.setState({
            nodes: [
                makeCommandNode('w1', 'welcome', [], 'Welcome!', 'welcome'),
                makeCommandNode('c1', 'greet', ['hello'], 'Hi there!'),
            ],
        });
        render(<ChatPreview />);

        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'hello' } });
        fireEvent.click(screen.getByText('Send'));

        await waitFor(() => {
            expect(screen.getByText('Hi there!')).toBeInTheDocument();
        });
        // User message is shown too
        expect(screen.getByText('hello')).toBeInTheDocument();
    });

    it('falls back for unrecognized input', async () => {
        useFlowStore.setState({
            nodes: [makeCommandNode('c1', 'greet', ['hello'], 'Hi there!')],
        });
        // metadata fallback text
        useFlowStore.setState((s) => ({
            metadata: { ...s.metadata, fallback: { text: 'I did not understand' } },
        }));
        render(<ChatPreview />);

        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'xyzzy' } });
        fireEvent.click(screen.getByText('Send'));

        await waitFor(() => {
            expect(screen.getByText('I did not understand')).toBeInTheDocument();
        });
    });

    it('without any welcome the dialog starts with fallback — as the generated bot does on /start', () => {
        useFlowStore.setState({ nodes: [] });
        useFlowStore.setState((s) => ({
            metadata: {
                ...s.metadata,
                welcome: { text: '', buttons: [] },
                fallback: { text: 'I did not understand' },
            },
        }));
        render(<ChatPreview />);
        expect(screen.getByText('I did not understand')).toBeInTheDocument();
    });

    it('shows empty state hint when the start produces no message', () => {
        // Fallback-нода без текста: бот на старте ничего не отправит
        useFlowStore.setState({ nodes: [makeCommandNode('f1', 'fallback', [], '', 'fallback')] });
        useFlowStore.setState((s) => ({
            metadata: { ...s.metadata, welcome: { text: '', buttons: [] } },
        }));
        render(<ChatPreview />);
        expect(screen.getByText('Type a message to test your bot')).toBeInTheDocument();
    });
});
