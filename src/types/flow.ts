/** Supported umbot platforms. */
export type Platform = 'alisa' | 'marusia' | 'smart_app' | 'telegram' | 'vk' | 'max_app' | 'viber';

/** Database type. */
export type DatabaseType = 'file' | 'mongo' | 'none';

/** Bot mode. */
export type BotMode = 'dev' | 'prod' | 'strict_prod';

/** Edge type between nodes. */
export type EdgeType = 'next' | 'slot_match' | 'branch_true' | 'branch_false';

/** Condition operators. */
export type ConditionOperator =
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'contains'
    | 'isEmpty'
    | 'isNotEmpty'
    | 'isSayTrue'
    | 'isSayFalse'
    | 'isUrl';

/** Button type in response. */
export type ButtonType = 'action' | 'link';

/** Card type. */
export type CardType = 'single' | 'list' | 'gallery';

/** Step save mode. */
export type SaveAs = 'original' | 'lowercase';

/** Sound type. */
export type SoundType = 'standard' | 'custom';

/** Action block types for the Action node. */
export type ActionType = 'set_variable' | 'random_number' | 'http_request';

/** A single action block inside an Action node. */
export interface ActionBlock {
    type: ActionType;
    /** set_variable: field name in userData */
    field?: string;
    /** Comment for the field (shown in data panel) */
    fieldComment?: string;
    /** set_variable: value expression (e.g. "num1 + num2", "userData.num1 * 2") */
    value?: string;
    /** random_number: minimum value */
    min?: number;
    /** random_number: maximum value */
    max?: number;
    /** http_request: URL (supports {{variable}}) */
    url?: string;
    /** http_request: HTTP method */
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /** http_request: headers as JSON string */
    headers?: string;
    /** http_request: body as JSON string (supports {{variable}}) */
    body?: string;
    /** http_request: save response to this userData field */
    saveResponseTo?: string;
    /** show_text: text to display (supports {{variable}}) */
    text?: string;
    /** show_text: save text to this userData field (optional) */
    saveTextTo?: string;
    /** navigate: target node ID */
    targetNodeId?: string;
}

/** Button definition in response. */
export interface FlowButton {
    title: string;
    type: ButtonType;
    targetNodeId?: string;
    url?: string;
}

/** Image in a card. */
export interface FlowCardImage {
    src: string;
    title: string;
    description: string;
    button?: FlowButton;
}

/** Card definition in response. */
export interface FlowCard {
    type: CardType;
    title: string;
    images: FlowCardImage[];
}

/** Sound definition. */
export interface FlowSound {
    type: SoundType;
    key?: string;
    src?: string;
    placeholder?: string;
}

/** Response block (used in commands). */
export interface FlowResponse {
    text: string;
    tts?: string;
    emotion?: string;
    isEnd?: boolean;
    shuffleButtons?: boolean;
    buttons: FlowButton[];
    card?: FlowCard;
    sounds: FlowSound[];
}

/** Prompt block (used in steps). */
export interface FlowPrompt {
    text: string;
    tts?: string;
    emotion?: string;
    shuffleButtons?: boolean;
    buttons: FlowButton[];
    card?: FlowCard;
}

/** Condition response (true/false branch). */
export interface ConditionResponse {
    text?: string;
    buttons?: FlowButton[];
    targetNodeId?: string;
}

/** Condition definition (inline in command/step). */
export interface FlowCondition {
    variable: string;
    operator: ConditionOperator;
    value: string | number;
    responseTrue?: ConditionResponse;
    responseFalse?: ConditionResponse;
}

/** Command node in the flow. */
export interface CommandNodeData {
    type: 'command';
    id: string;
    name: string;
    slots: string[];
    isPattern: boolean;
    response: FlowResponse;
    /** Save the matched user input to this userData field (optional). */
    saveTo?: string;
    /** Comment for the saveTo variable (shown in data panel). */
    varComment?: string;
    /** Inline action blocks (random_number, set_variable, http_request). */
    actions?: ActionBlock[];
    /** Inline condition blocks. */
    conditions?: FlowCondition[];
    /** Role: 'command' (default), 'welcome' (startup), 'help' (help intent), 'fallback' (unrecognized input). */
    role?: 'command' | 'welcome' | 'help' | 'fallback';
    [key: string]: unknown;
}

/** Step node in the flow. */
export interface StepNodeData {
    type: 'step';
    id: string;
    name: string;
    prompt: FlowPrompt;
    saveTo: string;
    saveAs: SaveAs;
    /** Comment for the saveTo variable (shown in data panel). */
    varComment?: string;
    next?: string;
    /** Inline action blocks. */
    actions?: ActionBlock[];
    /** Inline condition blocks. */
    conditions?: FlowCondition[];
    [key: string]: unknown;
}

/** Condition node in the flow. */
export interface ConditionNodeData {
    type: 'condition';
    id: string;
    name: string;
    variable: string;
    operator: ConditionOperator;
    value: unknown;
    [key: string]: unknown;
}

/** Action node — executes code blocks (set variables, HTTP, random numbers, etc.). */
export interface ActionNodeData {
    type: 'action';
    id: string;
    name: string;
    actions: ActionBlock[];
    /** Text to show the user after executing actions (supports {{variable}}). */
    text: string;
    /** Buttons to show after executing actions. */
    buttons: FlowButton[];
    /** Card/gallery to show after executing actions. */
    card?: FlowCard;
    /** Save all action results to this userData field as an object. */
    saveResultsTo?: string;
    [key: string]: unknown;
}

/** End node in the flow. */
export interface EndNodeData {
    type: 'end';
    id: string;
    [key: string]: unknown;
}

/** Response node — shows text with variables and buttons, no slots needed. */
export interface ResponseNodeData {
    type: 'response';
    id: string;
    name: string;
    response: FlowResponse;
    /** Inline action blocks (used by games: score counters etc). */
    actions?: ActionBlock[];
    [key: string]: unknown;
}

/** Any node data type. */
export type FlowNodeData =
    | CommandNodeData
    | StepNodeData
    | ConditionNodeData
    | ActionNodeData
    | EndNodeData
    | ResponseNodeData;

/** Edge between nodes. */
export interface FlowEdge {
    from: string;
    to: string;
    type: EdgeType;
    label?: string;
}

/** Database configuration. */
export interface FlowDatabase {
    type: DatabaseType;
    config: Record<string, unknown>;
}

/** Flow metadata / root config. */
export interface FlowMetadata {
    schemaVersion: string;
    name: string;
    version: string;
    description: string;
    platforms: Platform[];
    database: FlowDatabase;
    mode: BotMode;
    isLocalStorage: boolean;
    fallback: { text: string };
    welcome: { text: string; buttons: FlowButton[] };
    helpText: { text: string };
    variables: Record<string, string>;
    tokens: Record<string, string>;
}

/** Complete flow document. */
export interface FlowDocument {
    schemaVersion: string;
    name: string;
    version: string;
    description: string;
    platforms: Platform[];
    database: FlowDatabase;
    mode: BotMode;
    isLocalStorage: boolean;
    nodes: FlowNodeData[];
    edges: FlowEdge[];
    fallback: { text: string };
    welcome: { text: string; buttons: FlowButton[] };
    helpText?: { text: string };
    variables: Record<string, string>;
    tokens?: Record<string, string>;
}

/** Validation error. */
export interface ValidationError {
    code: string;
    message: string;
    nodeId?: string;
    /** Какое поле ноды сломано (для подсветки в панели свойств): 'name' | 'saveTo' | 'slots' | 'actions' | 'conditions' | 'variable' | 'value' | 'text' | и т.д. */
    field?: string;
}

/** Default metadata values. */
export const DEFAULT_METADATA: FlowMetadata = {
    schemaVersion: '1.0',
    name: 'my-bot',
    version: '1.0.0',
    description: '',
    platforms: ['alisa', 'telegram'],
    database: { type: 'file', config: {} },
    mode: 'dev',
    isLocalStorage: true,
    fallback: { text: 'Извините, я вас не понял.' },
    welcome: { text: 'Привет!', buttons: [] },
    helpText: { text: '' },
    variables: {},
    tokens: {},
};

/** Default command response. */
export const DEFAULT_RESPONSE: FlowResponse = {
    text: '',
    buttons: [],
    sounds: [],
};

/** Default step prompt. */
export const DEFAULT_PROMPT: FlowPrompt = {
    text: '',
    buttons: [],
};
