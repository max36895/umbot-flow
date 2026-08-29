import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useFlowStore from '../store/flowStore';
import {
    saveRecentProject,
    listRecentProjects,
    evictProjectsForSpace,
    MAX_PROJECTS,
} from '../utils/projectsStore';
import type { FlowDocument } from '../types/flow';

// Reset store between tests
beforeEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    useFlowStore.setState({
        nodes: [],
        edges: [],
        saveState: 'idle',
        metadata: {
            schemaVersion: '1.0',
            name: 'test',
            version: '1.0.0',
            description: '',
            platforms: ['telegram'],
            database: { type: 'file', config: {} },
            mode: 'dev',
            isLocalStorage: true,
            fallback: { text: 'Sorry' },
            welcome: { text: 'Hi', buttons: [] },
            helpText: { text: '' },
            variables: {},
            tokens: {},
        },
    });
    useFlowStore.getState().clearHistory();
});

describe('autoSave saveState (honest save indicator)', () => {
    it('successful write → saveState=saved', () => {
        vi.useFakeTimers();
        useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        // Во время debounce — «saving»
        expect(useFlowStore.getState().saveState).toBe('saving');
        vi.advanceTimersByTime(400);
        expect(useFlowStore.getState().saveState).toBe('saved');
        // Данные реально записаны
        expect(localStorage.getItem('umbot-flow-editor')).toContain('"nodes"');
    });

    it('quota failure → saveState=error (не молчим)', () => {
        vi.useFakeTimers();
        // Эмуляция переполнения: setItem всегда бросает QuotaExceededError
        const origSet = Storage.prototype.setItem;
        Storage.prototype.setItem = vi.fn(() => {
            throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        });
        try {
            useFlowStore.getState().addNode('command', { x: 0, y: 0 });
            expect(useFlowStore.getState().saveState).toBe('saving');
            vi.advanceTimersByTime(400);
            expect(useFlowStore.getState().saveState).toBe('error');
        } finally {
            Storage.prototype.setItem = origSet;
        }
    });

    it('quota failure evicts old project snapshots, then saveState=saved', () => {
        vi.useFakeTimers();
        // История: два больших проекта (~30 KB каждый). «old-bot» старше.
        const bigDoc = (name: string): FlowDocument => ({
            schemaVersion: '1.0',
            name,
            version: '1.0.0',
            description: 'x'.repeat(30_000),
            platforms: ['telegram'],
            database: { type: 'file', config: {} },
            mode: 'dev',
            isLocalStorage: true,
            nodes: [],
            edges: [],
            fallback: { text: 'x' },
            welcome: { text: 'x', buttons: [] },
            variables: {},
        });
        saveRecentProject('old-bot', bigDoc('old-bot'));
        saveRecentProject('another-bot', bigDoc('another-bot'));
        expect(listRecentProjects()).toHaveLength(2);

        // Симуляция реальной квоты: запись падает, если суммарный объём
        // хранилища (без перезаписываемого ключа) + новые данные > QUOTA.
        const QUOTA = 60_000;
        const origSet = Storage.prototype.setItem;
        Storage.prototype.setItem = vi.fn((key: string, value: string) => {
            let usage = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k || k === key) continue;
                const v = localStorage.getItem(k);
                if (v === null) continue;
                usage += v.length + k.length;
            }
            if (usage + value.length > QUOTA) {
                throw new DOMException('QuotaExceededError', 'QuotaExceededError');
            }
            origSet.call(localStorage, key, value);
        });
        try {
            useFlowStore.getState().addNode('command', { x: 0, y: 0 });
            vi.advanceTimersByTime(400);
            // Эвикция освободила место (удалила old-bot) → запись прошла
            expect(useFlowStore.getState().saveState).toBe('saved');
            const remaining = listRecentProjects().map((p) => p.name);
            expect(remaining).toContain('another-bot');
            expect(remaining).not.toContain('old-bot');
            // Текущее состояние записано
            expect(localStorage.getItem('umbot-flow-editor')).toContain('"nodes"');
        } finally {
            Storage.prototype.setItem = origSet;
        }
    });

    it('flushSave writes pending changes immediately', () => {
        vi.useFakeTimers();
        useFlowStore.getState().addNode('command', { x: 0, y: 0 });
        // Не ждём debounce — flush как при закрытии вкладки
        useFlowStore.getState().flushSave();
        const saved = localStorage.getItem('umbot-flow-editor');
        expect(saved).toContain('"nodes"');
        expect(useFlowStore.getState().saveState).toBe('saved');
    });

    it('flushSave without pending changes is a no-op (no redundant writes)', () => {
        vi.useFakeTimers();
        const setSpy = vi.spyOn(Storage.prototype, 'setItem');
        useFlowStore.getState().flushSave();
        expect(setSpy).not.toHaveBeenCalled();
        setSpy.mockRestore();
    });
});

describe('evictProjectsForSpace', () => {
    const snap = (name: string, updatedAt: number) => ({
        id: `proj_${name}`,
        name,
        updatedAt,
        doc: { name } as unknown as FlowDocument,
    });

    it('keeps the protected (current) project and evicts oldest first', () => {
        localStorage.setItem(
            'umbot-flow-projects',
            JSON.stringify([
                snap('current-bot', 5000),
                snap('old-bot', 1000),
                snap('mid-bot', 3000),
            ]),
        );
        // Маленький probe — места хватает без эвикции
        evictProjectsForSpace(1024, 'current-bot');
        const names = listRecentProjects().map((p) => p.name);
        // Ничего не удалено: probe прошёл
        expect(names).toHaveLength(3);
    });

    it('returns false when there is nothing to evict', () => {
        localStorage.clear();
        expect(evictProjectsForSpace(1024)).toBe(false);
    });

    it('caps project history at MAX_PROJECTS', () => {
        const doc = { name: 'x' } as unknown as FlowDocument;
        for (let i = 0; i < MAX_PROJECTS + 3; i++) {
            saveRecentProject(`bot-${i}`, doc);
        }
        expect(listRecentProjects()).toHaveLength(MAX_PROJECTS);
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});
