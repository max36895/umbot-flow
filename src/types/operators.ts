import type { ConditionOperator } from './flow';

/** Операторы условий — единый источник правды для ConditionProps, ConditionEditor и ConditionNode. */
export const OPERATORS: { value: ConditionOperator; labelKey: string; symbol: string }[] = [
    { value: 'eq', labelKey: 'operator.eq', symbol: '==' },
    { value: 'neq', labelKey: 'operator.neq', symbol: '!=' },
    { value: 'gt', labelKey: 'operator.gt', symbol: '>' },
    { value: 'gte', labelKey: 'operator.gte', symbol: '>=' },
    { value: 'lt', labelKey: 'operator.lt', symbol: '<' },
    { value: 'lte', labelKey: 'operator.lte', symbol: '<=' },
    { value: 'contains', labelKey: 'operator.contains', symbol: '∈' },
    { value: 'isEmpty', labelKey: 'operator.isEmpty', symbol: '∅' },
    { value: 'isNotEmpty', labelKey: 'operator.isNotEmpty', symbol: '≠∅' },
    { value: 'isSayTrue', labelKey: 'operator.isSayTrue', symbol: '👍' },
    { value: 'isSayFalse', labelKey: 'operator.isSayFalse', symbol: '👎' },
    { value: 'isUrl', labelKey: 'operator.isUrl', symbol: '🔗' },
];

/** Маппинг оператор → символ для отображения на Canvas нодах. */
export const OPERATOR_SYMBOLS: Record<string, string> = Object.fromEntries(
    OPERATORS.map((op) => [op.value, op.symbol]),
);

/** Пресеты условий — единый источник для ConditionProps и ConditionEditor. */
export const CONDITION_PRESETS: {
    labelKey: string;
    variable: string;
    operator: ConditionOperator;
    value: string | number;
    responseTrueText?: string;
    responseFalseText?: string;
}[] = [
    {
        labelKey: 'condition.preset.isYes',
        variable: '',
        operator: 'isSayTrue',
        value: '',
        responseTrueText: 'Хорошо!',
    },
    {
        labelKey: 'condition.preset.isNo',
        variable: '',
        operator: 'isSayFalse',
        value: '',
        responseFalseText: 'Хорошо!',
    },
    {
        labelKey: 'condition.preset.isUrl',
        variable: '',
        operator: 'isUrl',
        value: '',
        responseTrueText: 'Это ссылка!',
        responseFalseText: 'Это не ссылка.',
    },
    {
        labelKey: 'condition.preset.isEmpty',
        variable: '',
        operator: 'isEmpty',
        value: '',
        responseTrueText: 'Пожалуйста, введите значение.',
    },
    {
        labelKey: 'condition.preset.isNotEmpty',
        variable: '',
        operator: 'isNotEmpty',
        value: '',
        responseFalseText: 'Отлично!',
    },
    {
        labelKey: 'condition.preset.numberGt10',
        variable: '',
        operator: 'gt',
        value: 10,
        responseTrueText: 'Число больше 10!',
        responseFalseText: 'Число меньше или равно 10.',
    },
    {
        labelKey: 'condition.preset.numberLt100',
        variable: '',
        operator: 'lt',
        value: 100,
        responseTrueText: 'Число меньше 100!',
        responseFalseText: 'Число больше или равно 100.',
    },
];

/** Операторы, которые не требуют поля значения. */
export const NO_VALUE_OPERATORS = new Set<string>([
    'isEmpty',
    'isNotEmpty',
    'isSayTrue',
    'isSayFalse',
    'isUrl',
]);
