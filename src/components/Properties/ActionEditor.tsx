import type { ActionBlock } from '../../types/flow';
import { ActionBlockEditor } from './shared/ActionBlockEditor';

interface Props {
    actions: ActionBlock[];
    onChange: (actions: ActionBlock[]) => void;
}

/**
 * Inline action editor для Command/Step узлов.
 * Использует общий ActionBlockEditor — одинаковый внешний вид с ActionProps.
 */
export function ActionEditor({ actions, onChange }: Props) {
    return <ActionBlockEditor actions={actions} onChange={onChange} />;
}
