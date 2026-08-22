import { create } from 'zustand';

/**
 * Централизованный store ошибок валидации графа.
 * Валидация выполняется ОДИН раз в ValidationSync, результат распределяется по узлам.
 * Каждый узел селектит только свои ошибки → ре-рендер только при изменении своих ошибок.
 */
interface ValidationStore {
    /** Map nodeId → массив сообщений об ошибках. Пустой Record если ошибок нет. */
    nodeErrors: Record<string, string[]>;
    setNodeErrors: (errors: Record<string, string[]>) => void;
}

const useValidationStore = create<ValidationStore>((set) => ({
    nodeErrors: {},
    setNodeErrors: (errors) => set({ nodeErrors: errors }),
}));

export default useValidationStore;
