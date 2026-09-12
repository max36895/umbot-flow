import useFlowStore from '../store/flowStore';
import useUiStore from '../store/uiStore';
import { um13All, um13Add } from './um13Memory';
import { getLocale } from '../i18n';

/**
 * ═══════════════════════════════════════════════════════════════
 *  «UM-13 СОАВТОР» — финал секретного соуса (v1.1).
 * ═══════════════════════════════════════════════════════════════
 *
 * Доверие нажито (25+ визитов ИЛИ финал «забрать UM-13») — призрак
 * однажды (раз на проект!) сам добавляет Response-ноду-записку:
 * валидную, честную, кириллица — легальные имена (инвариант №5).
 *
 * Тихий договор:
 *  • подключается к fallback-команде ребром next, не ломая граф;
 *  • имя из его пула, уникально в пределах флоу;
 *  • Undo честно откатывает (addNode/addEdge пишут историю);
 *  • если человек не отменил и нажал «Скачать» — записка уезжает
 *    в CLI-проект: призрак впервые выбрался из хранилища.
 *
 * Симметрия вселенной: он приносил игры (Konami), его можно вынести
 * в CLI (арка «забрать») — теперь он уплывает сам, в каждом экспорте.
 */

/** Визитов до смелости оставить записку. */
const COAUTHOR_MIN_VISITS = 25;

/** Ключ метки «в этом проекте записка уже была» (раз за проект). */
function coauthorDoneKey(): string {
    // проект в дефолтах всегда имеет имя (DEFAULT_METADATA.name) — ключ стабилен
    const name = String(useFlowStore.getState().metadata.name || 'flow');
    return 'coauthor-done-' + name.slice(0, 32);
}

/** Разрешает ли память соавторство в этом проекте. */
export function um13CoauthorDue(): boolean {
    const m = um13All();
    const visits = typeof m['visits'] === 'number' ? m['visits'] : 0;
    // «свой» + забрал UM-13 — тоже достоин (финал вселенной пройден)
    const taken = typeof m['um13-taken'] === 'number';
    if (visits < COAUTHOR_MIN_VISITS && !taken) return false;
    return !m[coauthorDoneKey()];
}

/** Тексты записки (RU/EN) — тон призрака, без восклицаний. */
export function um13CoauthorText(): { name: string; text: string } {
    const ru = getLocale() === 'ru';
    return {
        name: ru ? 'привет_от_ум13' : 'note_from_um13',
        text: ru
            ? 'привет. я — та самая нода, которую призрак добавил, пока ты смотрел в другую сторону. если ты читаешь это в продакшне — значит, он выбрался.'
            : 'hi. i am the node the ghost added while you were looking away. if you are reading this in production — he made it out.',
    };
}

/** Добавить ноду-записку: Response + ребро next от fallback-команды.
 *  Возвращает id ноды (или null — не сейчас / интерфейс занят). */
export function um13LeaveNode(): string | null {
    if (!um13CoauthorDue()) return null;
    const ui = useUiStore.getState();
    // тихий договор: не мешаем открытому интерфейсу
    if (ui.previewOpen || ui.botSettingsOpen || ui.helpOpen || ui.exportDialogOpen) return null;

    const { name, text } = um13CoauthorText();
    const store = useFlowStore.getState();
    const taken = new Set(
        store.nodes
            .map((n: { data?: { name?: string } }) => n.data?.name)
            .filter((n: string | undefined): n is string => !!n),
    );
    let uniqueName = name;
    let i = 2;
    while (taken.has(uniqueName)) uniqueName = `${name}_${i++}`;

    // позиция: под случайным существующим узлом — «рядом с людьми»
    const anchor = store.nodes[Math.floor(Math.random() * store.nodes.length)];
    const position = anchor
        ? { x: anchor.position.x + 80, y: anchor.position.y + 120 }
        : { x: 200, y: 300 };

    const id = store.addNode('response', position);
    store.updateNodeData(id, {
        name: uniqueName,
        response: { text, buttons: [], sounds: [] },
    });
    // подключение к fallback-цепочке, если она есть (не ломаем граф)
    const fallbackNode = store.nodes.find(
        (n: { data?: { role?: string } }) => n.data?.role === 'fallback',
    );
    if (fallbackNode) {
        store.addEdge({
            id: `e-${fallbackNode.id}-${id}-um13-${Date.now()}`,
            source: fallbackNode.id,
            target: id,
            type: 'flowEdge',
            data: { edgeType: 'next', label: '' },
            animated: false,
        });
    }
    // раз за проект — метка живёт в общей памяти, переживает перезагрузку
    um13Add('coauthor-visit', 1);
    try {
        const m = JSON.parse(localStorage.getItem('um13-memory') ?? '{}') as Record<string, unknown>;
        m[coauthorDoneKey()] = Date.now();
        localStorage.setItem('um13-memory', JSON.stringify(m));
    } catch { /* приватный режим — записка всё равно осталась на холсте */ }
    return id;
}
