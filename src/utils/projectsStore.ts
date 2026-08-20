import type { FlowDocument } from '../types/flow';

/**
 * Хранилище истории недавних проектов.
 * Хранит до MAX_PROJECTS последних проектов с быстрым переключением.
 */

export interface ProjectSnapshot {
    id: string;
    name: string;
    updatedAt: number;
    doc: FlowDocument;
}

const PROJECTS_KEY = 'umbot-flow-projects';
export const MAX_PROJECTS = 8;

function readProjects(): ProjectSnapshot[] {
    try {
        const raw = localStorage.getItem(PROJECTS_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function writeProjects(list: ProjectSnapshot[]): void {
    try {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
    } catch {
        /* quota exceeded — silent */
    }
}

/** Получить список недавних проектов, отсортированный по дате обновления. */
export function listRecentProjects(): ProjectSnapshot[] {
    const projects = readProjects();
    return projects.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_PROJECTS);
}

/** Сохранить/обновить проект в истории. Существующий с тем же именем перезаписывается. */
export function saveRecentProject(name: string, doc: FlowDocument): void {
    const projects = readProjects();
    const id = `proj_${name.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '_')}`;

    const snapshot: ProjectSnapshot = {
        id,
        name,
        updatedAt: Date.now(),
        doc,
    };

    // Удаляем старую версию с таким же именем
    const filtered = projects.filter((p) => p.id !== id);
    filtered.unshift(snapshot);

    // Ограничиваем количество
    writeProjects(filtered.slice(0, MAX_PROJECTS));
}

/** Удалить проект из истории. */
export function removeRecentProject(id: string): void {
    const projects = readProjects();
    writeProjects(projects.filter((p) => p.id !== id));
}

/** Получить конкретный проект. */
export function getRecentProject(id: string): ProjectSnapshot | null {
    return readProjects().find((p) => p.id === id) ?? null;
}
