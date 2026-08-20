import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ConditionNodeData } from '../../../types/flow';
import useUiStore from '../../../store/uiStore';
import { useT } from '../../../i18n/hook';
import NodeHelpButton from './NodeHelpButton';
import { OPERATOR_SYMBOLS } from '../../../types/operators';
import { getNodeClasses, getNodeStyles, NODE_COLORS } from './useNodeClasses';
import { useNodeErrorsMap, NodeErrorsBadge } from './useNodeErrors';
import { NodeIcon } from '../../ui/NodeIcons';

function ConditionNodeComponent({ data, id }: NodeProps & { data: ConditionNodeData }) {
    const t = useT();
    const selectNode = useUiStore((s) => s.selectNode);
    const selectedNodeId = useUiStore((s) => s.selectedNodeId);
    const isSelected = selectedNodeId === id;
    const isDimmed = selectedNodeId !== null && !isSelected;
    const operator = OPERATOR_SYMBOLS[data.operator as string] ?? '?';
    const nodeErrors = useNodeErrorsMap();
    const errors = nodeErrors.get(id);
    const hasErrors = (errors?.length ?? 0) > 0;
    const nodeColor = NODE_COLORS.condition;
    const successColor = NODE_COLORS.response;

    return (
        <div
            className={`relative min-w-[180px] ${getNodeClasses('condition', isSelected, isDimmed, false, hasErrors)}`}
            style={getNodeStyles('condition', isSelected, false)}
            onClick={() => selectNode(id)}
        >
            <NodeErrorsBadge errors={errors} />
            <Handle
                type="target"
                position={Position.Top}
                className="!-top-3 !h-4 !w-4 !border-2 !border-white/30"
                style={{
                    backgroundColor: nodeColor.hex,
                    boxShadow: `0 0 8px rgba(${nodeColor.rgb},0.5)`,
                }}
            />

            <div className="mb-2 flex items-center gap-2">
                <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: `rgba(${nodeColor.rgb},0.25)` }}
                >
                    <NodeIcon name="condition" size={12} />
                    {t('node.badge.if')}
                </span>
                <span className="font-semibold text-white">{data.name}</span>
                <NodeHelpButton content={t('help.condDesc')} color={nodeColor.hex} />
            </div>

            <div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs">
                <span className="font-mono" style={{ color: nodeColor.hex }}>
                    {data.variable || '?'}
                </span>
                <span className="mx-1 font-bold text-white/30">{operator}</span>
                <span className="font-mono text-white/50">{String(data.value ?? '?')}</span>
            </div>

            {/* Подписи веток прямо на ноде — чтобы пользователь видел, куда тянуть */}
            <div className="pointer-events-none absolute -bottom-1.5 left-0 right-0 flex items-end justify-between px-6 text-[9px] font-medium">
                <span
                    className="inline-flex items-center gap-0.5 rounded px-1 py-0.5"
                    style={{
                        backgroundColor: 'rgba(0,255,157,0.15)',
                        color: successColor.hex,
                    }}
                >
                    <NodeIcon name="check" size={9} strokeWidth={2} />
                    {t('condition.true')}
                </span>
                <span
                    className="inline-flex items-center gap-0.5 rounded px-1 py-0.5"
                    style={{ backgroundColor: 'rgba(255,0,85,0.15)', color: nodeColor.hex }}
                >
                    <NodeIcon name="cross" size={9} strokeWidth={2} />
                    {t('condition.false')}
                </span>
            </div>

            <div className="relative flex">
                {/* True — green handle */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="true"
                    className="!-bottom-3 !-left-[3px] !h-4 !w-4 !border-2 !border-white/30"
                    style={{
                        backgroundColor: successColor.hex,
                        boxShadow: `0 0 8px rgba(${successColor.rgb},0.5)`,
                    }}
                />
                {/* False — red handle */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="false"
                    className="!-bottom-3 !h-4 !w-4 !border-2 !border-white/30"
                    style={{
                        left: 'calc(100% - 13px)',
                        backgroundColor: nodeColor.hex,
                        boxShadow: `0 0 8px rgba(${nodeColor.rgb},0.5)`,
                    }}
                />
            </div>
        </div>
    );
}

export const ConditionNode = memo(ConditionNodeComponent);
