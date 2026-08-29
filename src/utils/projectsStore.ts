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

/**
 * Освобождает место в localStorage для записи текущего проекта.
 * Удаляет самые старые снапшоты истории (кроме protectName — текущего проекта),
 * пока сумма (остающаяся история + incomingBytes) не помещается в эмпирический
 * бюджет квоты. Возвращает true, если что-то удалили (вызывающий должен повторить
 * запись), false — если удалять больше нечего.
 *
 * Механика проверки — пробная запись: после каждой эвикции пытаемся записать
 * тестовый ключ размером с incoming данные. Это точнее оценки байтов, потому
 * что quota зависит от origin и уже занятых ключей.
 */
export function evictProjectsForSpace(incomingBytes: number, protectName?: string): boolean {
    let evicted = false;
    // Защищаем текущий проект по имени (id строится из имени)
    let protectId: string | null = null;
    if (protectName) {
        protectId = `proj_${protectName.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '_')}`;
    }

    const probeKey = 'umbot-flow-quota-probe';
    const probeData = 'x'.repeat(Math.max(incomingBytes, 1024));

    for (;;) {
        // Помещается ли (история + incoming) в квоту? Пробуем записать incoming.
        try {
            localStorage.setItem(probeKey, probeData);
            localStorage.removeItem(probeKey);
            break; // place есть (или эвекция изначально не требовалась)
        } catch {
            // квоты не хватает — удаляем самый старый незащищённый снапшот.
            // Сортируем по убыванию updatedAt и берём последний: при равных
            // метках (записи в одну миллисекунду) последним оказывается снапшот,
            // записанный раньше (unshift кладёт новые в начало массива).
            const projects = readProjects();
            const victim = [...projects]
                .filter((p) => p.id !== protectId)
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .pop();
            if (!victim) break; // удалять больше нечего
            writeProjects(projects.filter((p) => p.id !== victim.id));
            evicted = true;
        }
    }

    return evicted;
}
