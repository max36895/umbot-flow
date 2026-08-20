import type { ActionBlock } from '../../types/flow';
import { ActionBlockEditor } from './shared/ActionBlockEditor';

interface Props {
    actions: ActionBlock[];
    onChange: (actions: ActionBlock[]) => void;
    /** Ошибки валидации по индексу: Map<actionIndex, messages[]> */
    actionErrors?: Map<number, string[]>;
}

/**
 * Inline action editor для Command/Step узлов.
 * Использует общий ActionBlockEditor — одинаковый внешний вид с ActionProps.
 */
export function ActionEditor({ actions, onChange, actionErrors }: Props) {
    return (
        <ActionBlockEditor actions={actions} onChange={onChange} actionErrors={actionErrors} />
    );
}
