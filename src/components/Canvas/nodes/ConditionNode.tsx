import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ConditionNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { t } from '../../../i18n';
import NodeHelpButton from './NodeHelpButton';
import { OPERATOR_SYMBOLS } from '../../../types/operators';
import { getNodeClasses, getNodeStyles } from './useNodeClasses';

function ConditionNodeComponent({ data, id }: NodeProps & { data: ConditionNodeData }) {
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected;
    const operator = OPERATOR_SYMBOLS[data.operator as string] ?? '?';

    return (
        <div
            className={getNodeClasses('condition', isSelected, isDimmed, false)}
            style={{ minWidth: 180, ...getNodeStyles('condition', isSelected, false) }}
            onClick={() => selectNode(id)}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#ff0055] !shadow-[0_0_8px_rgba(255,0,85,0.5)]"
            />

            <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,0,85,0.25)] px-2.5 py-1 text-[10px] font-semibold text-white">
                    <span className="text-sm">🔀</span>
                    {t('node.badge.if')}
                </span>
                <span className="font-semibold text-white">{data.name}</span>
                <NodeHelpButton content={t('help.condDesc')} color="#ff0055" />
            </div>

            <div className="rounded-lg bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 text-xs">
                <span className="font-mono text-[#ff0055]">{data.variable || '?'}</span>
                <span className="mx-1 font-bold text-white/30">{operator}</span>
                <span className="font-mono text-white/50">{String(data.value ?? '?')}</span>
            </div>

            {/* True — green handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#00ff9d] !shadow-[0_0_8px_rgba(0,255,157,0.5)]"
                style={{ left: '30%' }}
            />
            {/* False — red handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className="!h-3 !w-3 !border-2 !border-[rgba(255,255,255,0.3)] !bg-[#ff0055] !shadow-[0_0_8px_rgba(255,0,85,0.5)]"
                style={{ left: '70%' }}
            />
        </div>
    );
}

export const ConditionNode = memo(ConditionNodeComponent);
