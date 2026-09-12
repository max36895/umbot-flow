import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExportDialog from '../components/Toolbar/ExportDialog';
import useFlowStore from '../store/flowStore';
import useUiStore from '../store/uiStore';
import { setLocale } from '../i18n';
import type { FlowDocument } from '../types/flow';

/**
 * Диалог «Проверить и экспортировать»:
 * демо-флоу UM-13 (inject из исповедальни) содержит намеренных
 * блоков-сирот. Без подсказки «2 ошибки» при первом заходе читаются
 * как «я что-то сломал» — диалог обязан объяснить учебный характер.
 */

const UM13_DEMO: FlowDocument = {
    schemaVersion: '1.0',
    name: 'um-13',
    version: '13.0.13',
    description: 'UM-13 demo',
    platforms: ['telegram'],
    database: { type: 'file', config: {} },
    mode: 'prod',
    isLocalStorage: true,
    fallback: { text: 'UM-13: я вас не понял' },
    welcome: { text: '', buttons: [] },
    helpText: { text: '' },
    variables: {},
    nodes: [
        // связанная цепочка (валидна)…
        {
            type: 'command', id: 'welcome', name: 'welcome', slots: [], isPattern: false,
            role: 'welcome',
            response: { text: 'Привет', buttons: [], sounds: [] },
        },
        { type: 'end', id: 'end_um13' },
        // …и намеренный блок-сирота как в реальном демо
        {
            type: 'command', id: 'orphan', name: 'command', slots: [], isPattern: false,
            response: { text: '', buttons: [], sounds: [] },
        },
    ],
    edges: [{ from: 'welcome', to: 'end_um13', type: 'next' }],
} as unknown as FlowDocument;

beforeEach(() => {
    useUiStore.setState({ exportDialogOpen: true, selectedNodeId: null });
    useFlowStore.getState().clearHistory();
    setLocale('ru');
    localStorage.clear();
});

describe('ExportDialog: подсказка про учебное демо', () => {
    it('демо um-13 с ошибками показывает пояснение «учебный пример»', () => {
        useFlowStore.getState().fromJSON(UM13_DEMO);
        render(<ExportDialog />);
        expect(screen.getByText(/учебный пример/i)).toBeInTheDocument();
    });

    it('обычный проект с ошибками НЕ показывает демо-подсказку', () => {
        useFlowStore.getState().fromJSON({ ...UM13_DEMO, name: 'my-shop-bot' });
        render(<ExportDialog />);
        expect(screen.queryByText(/учебный пример/i)).not.toBeInTheDocument();
    });

    it('демо um-13 без ошибок не показывает подсказку (нечего объяснять)', () => {
        useFlowStore.getState().fromJSON({
            ...UM13_DEMO,
            nodes: UM13_DEMO.nodes.filter((n) => n.id !== 'orphan'),
        } as FlowDocument);
        render(<ExportDialog />);
        expect(screen.queryByText(/учебный пример/i)).not.toBeInTheDocument();
    });
});
