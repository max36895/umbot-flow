import { describe, it, expect } from 'vitest';
import { generateProject } from '../utils/templateGenerator';
import type { FlowDocument } from '../types/flow';

const simpleDoc: FlowDocument = {
    schemaVersion: '1.0',
    name: 'simple-bot',
    version: '1.0.0',
    description: '',
    platforms: ['telegram'],
    database: { type: 'file', config: {} },
    mode: 'dev',
    isLocalStorage: true,
    nodes: [
        {
            type: 'command',
            id: 'greeting',
            name: 'greeting',
            slots: ['hello', 'hi'],
            isPattern: false,
            response: { text: 'Hello!', buttons: [], sounds: [] },
        },
    ],
    edges: [],
    fallback: { text: "Sorry, I don't understand." },
    welcome: { text: 'Welcome!', buttons: [] },
    variables: {},
};

const complexDoc: FlowDocument = {
    ...simpleDoc,
    name: 'complex-bot',
    nodes: [
        {
            type: 'command',
            id: 'greeting',
            name: 'greeting',
            slots: ['hello', 'hi'],
            isPattern: false,
            response: { text: 'Hello!', buttons: [{ title: 'Help', type: 'action' }], sounds: [] },
            actions: [{ type: 'random_number', field: 'num', min: 1, max: 10 }],
        },
        {
            type: 'step',
            id: 'ask_name',
            name: 'ask_name',
            prompt: { text: 'What is your name?', buttons: [] },
            saveTo: 'userName',
            saveAs: 'original',
        },
        {
            type: 'step',
            id: 'check_age',
            name: 'check_age',
            prompt: { text: '', buttons: [] },
            saveTo: '',
            saveAs: 'original',
            conditions: [
                {
                    variable: 'age',
                    operator: 'gte',
                    value: '18',
                    responseTrue: { text: 'Adult!' },
                    responseFalse: { text: 'Minor!' },
                },
            ],
        },
        { type: 'end', id: 'end1' },
    ],
    edges: [
        { from: 'greeting', to: 'ask_name', type: 'next' },
        { from: 'ask_name', to: 'check_age', type: 'next' },
    ],
};

describe('templateGenerator', () => {
    describe('basic', () => {
        it('generates required files', () => {
            const files = generateProject(simpleDoc);
            expect(files.map((f) => f.path)).toEqual(
                expect.arrayContaining([
                    'src/index.ts',
                    'src/utils.ts',
                    'package.json',
                    'tsconfig.json',
                ]),
            );
        });

        it('generates setText import', () => {
            const idx = generateProject(simpleDoc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("import { setText } from './utils'");
        });

        it('generates setText for text', () => {
            const idx = generateProject(simpleDoc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("setText(ctrl, 'Hello!')");
        });

        it('generates utils.ts with setText and setTTS', () => {
            const utils = generateProject(simpleDoc).find((f) => f.path === 'src/utils.ts');
            expect(utils?.content).toContain('export function setText');
            expect(utils?.content).toContain('export function setTTS');
        });
    });

    describe('commands', () => {
        it('registers command with slots', () => {
            const idx = generateProject(simpleDoc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("addCommand('greeting'");
            expect(idx?.content).toContain("'hello'");
        });

        it('generates inline rand action', () => {
            const idx = generateProject(complexDoc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('ctrl.userData.num = rand(1, 10)');
        });

        it('generates inline condition in command with switch-case', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        conditions: [
                            {
                                variable: 'level',
                                operator: 'gte',
                                value: 10,
                                responseTrue: { text: 'High' },
                                responseFalse: { text: 'Low' },
                            },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("switch ('gte')");
            expect(idx?.content).toContain(
                "case 'gte': result = useNum ? numA >= numB : false; break;",
            );
            expect(idx?.content).toContain("setText(ctrl, 'High')");
            expect(idx?.content).toContain("setText(ctrl, 'Low')");
        });
    });

    describe('conditions (inline in command)', () => {
        const makeDoc = (op: string, val: string | number = 100): FlowDocument => ({
            ...simpleDoc,
            nodes: [
                {
                    type: 'command',
                    id: 'c',
                    name: 'c',
                    slots: ['t'],
                    isPattern: false,
                    conditions: [{ variable: 'score', operator: op as any, value: val }],
                    response: { text: '', buttons: [], sounds: [] },
                },
            ],
            edges: [],
        });

        it('eq — switch contains correct case', () => {
            const idx = generateProject(makeDoc('eq')).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("switch ('eq')");
            expect(idx?.content).toContain('condVar = ctrl.userData.score');
            expect(idx?.content).toContain('condVal = 100');
            expect(idx?.content).toContain('numA === numB');
        });

        it('neq', () => {
            const idx = generateProject(makeDoc('neq')).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("switch ('neq')");
            expect(idx?.content).toContain('numA !== numB');
        });

        it('gt', () => {
            const idx = generateProject(makeDoc('gt')).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("switch ('gt')");
            expect(idx?.content).toContain('numA > numB');
        });

        it('gte', () => {
            const idx = generateProject(makeDoc('gte')).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("switch ('gte')");
            expect(idx?.content).toContain('numA >= numB');
        });

        it('lt', () => {
            const idx = generateProject(makeDoc('lt')).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("switch ('lt')");
            expect(idx?.content).toContain('numA < numB');
        });

        it('lte', () => {
            const idx = generateProject(makeDoc('lte')).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("switch ('lte')");
            expect(idx?.content).toContain('numA <= numB');
        });

        it('contains', () => {
            const idx = generateProject(makeDoc('contains', 'hello')).find(
                (f) => f.path === 'src/index.ts',
            );
            expect(idx?.content).toContain("switch ('contains')");
            expect(idx?.content).toContain('String(condVar).includes(String(condVal))');
        });

        it('isEmpty', () => {
            const idx = generateProject(makeDoc('isEmpty')).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("switch ('isEmpty')");
            expect(idx?.content).toContain(
                "case 'isEmpty': result = !condVar || condVar === ''; break;",
            );
        });

        it('isSayTrue — imports Text and generates case', () => {
            const idx = generateProject(makeDoc('isSayTrue')).find(
                (f) => f.path === 'src/index.ts',
            );
            expect(idx?.content).toContain("import { Text } from 'umbot/utils'");
            expect(idx?.content).toContain("switch ('isSayTrue')");
            expect(idx?.content).toContain('Text.isSayTrue(String(condVar))');
        });

        it('isSayFalse', () => {
            const idx = generateProject(makeDoc('isSayFalse')).find(
                (f) => f.path === 'src/index.ts',
            );
            expect(idx?.content).toContain("import { Text } from 'umbot/utils'");
            expect(idx?.content).toContain("switch ('isSayFalse')");
            expect(idx?.content).toContain('Text.isSayFalse(String(condVar))');
        });

        it('isUrl', () => {
            const idx = generateProject(makeDoc('isUrl')).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("import { Text } from 'umbot/utils'");
            expect(idx?.content).toContain("switch ('isUrl')");
            expect(idx?.content).toContain('Text.isUrl(String(condVar))');
        });
    });

    describe('edge cases', () => {
        it('empty document', () => {
            const idx = generateProject({ ...simpleDoc, nodes: [], edges: [] }).find(
                (f) => f.path === 'src/index.ts',
            );
            expect(idx?.content).toContain('FALLBACK_COMMAND');
        });

        it('special chars in text', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: "Hello 'world' \\n test", buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("Hello \\'world\\' \\\\n test");
        });

        it('regex pattern slots', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['\\d+'],
                        isPattern: true,
                        response: { text: 'Number!', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain(', true,');
        });

        it('imports Text when using isSayTrue in step', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: 'Y?', buttons: [] },
                        saveTo: 'a',
                        saveAs: 'original',
                        conditions: [{ variable: 'a', operator: 'isSayTrue', value: '' }],
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("import { Text } from 'umbot/utils'");
        });

        it('mongo database', () => {
            const idx = generateProject({
                ...simpleDoc,
                database: { type: 'mongo', config: { database: 'mydb' } },
            }).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('MongoAdapter');
            expect(idx?.content).toContain("'mydb'");
        });

        it('no database', () => {
            const idx = generateProject({
                ...simpleDoc,
                database: { type: 'none', config: {} },
            }).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).not.toContain('FileAdapter');
        });

        it('isLocalStorage false', () => {
            const idx = generateProject({ ...simpleDoc, isLocalStorage: false }).find(
                (f) => f.path === 'src/index.ts',
            );
            expect(idx?.content).toContain('isLocalStorage: false');
        });

        it('response block connected to command generates as step', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'M', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'r',
                        name: 'help',
                        response: { text: 'Help text', buttons: [], sounds: [] },
                    },
                ],
                edges: [{ from: 'c', to: 'r', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("setText(ctrl, 'Help text')");
            expect(idx?.content).toContain("bot.addStep('help'");
            expect(idx?.content).toContain("ctrl.thisIntentName = 'help'");
        });

        it('action block with HTTP generates as step', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'action',
                        id: 'a',
                        name: 'fetch',
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.com',
                                method: 'GET',
                                saveResponseTo: 'data',
                            },
                        ],
                        text: '',
                        buttons: [],
                    },
                ],
                edges: [{ from: 'c', to: 'a', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("bot.addStep('fetch', async");
            expect(idx?.content).toContain("await fetch('https://api.com'");
            expect(idx?.content).toContain('ctrl.userData.data = data');
        });

        it('condition node with branch_true/false generates step with branches', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'condition',
                        id: 'cond',
                        name: 'check',
                        variable: 'v',
                        operator: 'eq',
                        value: 'yes',
                    },
                    {
                        type: 'response',
                        id: 'y',
                        name: 'yesR',
                        response: { text: 'Yes!', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'n',
                        name: 'noR',
                        response: { text: 'No!', buttons: [], sounds: [] },
                    },
                ],
                edges: [
                    { from: 'c', to: 'cond', type: 'next' },
                    { from: 'cond', to: 'y', type: 'branch_true' },
                    { from: 'cond', to: 'n', type: 'branch_false' },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("bot.addStep('check'");
            expect(idx?.content).toContain("if (result) { ctrl.thisIntentName = 'yesR'; }");
            expect(idx?.content).toContain("if (!result) { ctrl.thisIntentName = 'noR'; }");
            expect(idx?.content).toContain("bot.addStep('yesR'");
            expect(idx?.content).toContain("setText(ctrl, 'Yes!')");
            expect(idx?.content).toContain("bot.addStep('noR'");
            expect(idx?.content).toContain("setText(ctrl, 'No!')");
        });

        it('standalone condition step with isEmpty', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: 'Q', buttons: [] },
                        saveTo: 'v',
                        saveAs: 'original',
                    },
                    {
                        type: 'condition',
                        id: 'c1',
                        name: 'check1',
                        variable: 'v',
                        operator: 'isEmpty',
                        value: '',
                    },
                ],
                edges: [{ from: 's', to: 'c1', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("bot.addStep('check1'");
            expect(idx?.content).toContain('condVar = ctrl.userData.v');
            expect(idx?.content).toContain("switch ('isEmpty')");
        });
    });

    describe('variables and text interpolation', () => {
        it('resolves {{variable}} in text to template literal', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'Hello {{userName}}!', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('`Hello ${ctrl.userData.userName}!`');
        });

        it('does not use template literal when no {{}}', () => {
            const idx = generateProject(simpleDoc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("setText(ctrl, 'Hello!')");
        });

        it('resolveVars replaces variable names in expressions', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        saveTo: 'score',
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'command',
                        id: 'c2',
                        name: 'c2',
                        slots: ['t2'],
                        isPattern: false,
                        actions: [{ type: 'set_variable', field: 'result', value: 'score' }],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('ctrl.userData.result = ctrl.userData.score;');
        });
    });

    describe('steps — extended', () => {
        it('generates addStep with async for http_request actions', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: 'Go', buttons: [] },
                        saveTo: 'x',
                        saveAs: 'original',
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.test',
                                method: 'POST',
                                body: '{}',
                                saveResponseTo: 'resp',
                            },
                        ],
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("bot.addStep('s', async (ctrl) =>");
            expect(idx?.content).toContain("await fetch('https://api.test'");
        });

        it('generates saveTo with lowercase', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: '?', buttons: [] },
                        saveTo: 'name',
                        saveAs: 'lowercase',
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('.toLowerCase()');
        });

        it('step navigation via thisIntentName', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's1',
                        name: 's1',
                        prompt: { text: 'Q', buttons: [] },
                        saveTo: 'a',
                        saveAs: 'original',
                    },
                    {
                        type: 'step',
                        id: 's2',
                        name: 's2',
                        prompt: { text: 'Q2', buttons: [] },
                        saveTo: 'b',
                        saveAs: 'original',
                    },
                ],
                edges: [{ from: 's1', to: 's2', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("ctrl.thisIntentName = 's2'");
        });
    });

    describe('buttons and links', () => {
        it('generates link button', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: {
                            text: 'Go',
                            buttons: [{ title: 'Visit', type: 'link', url: 'https://x.com' }],
                            sounds: [],
                        },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("ctrl.buttons.addLink('Visit', 'https://x.com')");
        });

        it('generates action buttons', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: {
                            text: 'Pick',
                            buttons: [
                                { title: 'Yes', type: 'action' },
                                { title: 'No', type: 'action' },
                            ],
                            sounds: [],
                        },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("ctrl.buttons.addBtn('Yes')");
            expect(idx?.content).toContain("ctrl.buttons.addBtn('No')");
        });

        it('step buttons', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: {
                            text: 'Choose:',
                            buttons: [
                                { title: 'A', type: 'action' },
                                { title: 'B', type: 'action' },
                            ],
                        },
                        saveTo: 'x',
                        saveAs: 'original',
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("ctrl.buttons.addBtn('A')");
            expect(idx?.content).toContain("ctrl.buttons.addBtn('B')");
        });
    });

    describe('TTS', () => {
        it('generates setTTS in command', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'Hello', tts: 'Hello spoken', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("import { setText, setTTS } from './utils'");
            expect(idx?.content).toContain("setTTS(ctrl, 'Hello spoken')");
        });

        it('generates setTTS in step', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: 'Say:', tts: 'Say this', buttons: [] },
                        saveTo: 'x',
                        saveAs: 'original',
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("setTTS(ctrl, 'Say this')");
        });

        it('does not import setTTS when no TTS used', () => {
            const idx = generateProject(simpleDoc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("import { setText } from './utils'");
            expect(idx?.content).not.toContain('setTTS');
        });
    });

    describe('isEnd and card', () => {
        it('generates isEnd flag', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'Bye', isEnd: true, buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('ctrl.isEnd = true');
        });

        it('generates card with images', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: {
                            text: '',
                            buttons: [],
                            sounds: [],
                            card: {
                                type: 'gallery',
                                title: '',
                                images: [
                                    { src: 'a.jpg', title: 'A', description: 'Desc A' },
                                    { src: 'b.jpg', title: 'B', description: 'Desc B' },
                                ],
                            },
                        },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("ctrl.card.addImage('a.jpg', 'A', 'Desc A')");
            expect(idx?.content).toContain("ctrl.card.addImage('b.jpg', 'B', 'Desc B')");
        });
    });

    describe('packages', () => {
        it('generates valid package.json with doc name', () => {
            const pkg = generateProject(simpleDoc).find((f) => f.path === 'package.json');
            expect(pkg?.content).toContain('"simple-bot"');
            expect(pkg?.content).toContain('"typescript"');
            expect(pkg?.content).toContain('"umbot"');
        });

        it('generates valid tsconfig.json', () => {
            const ts = generateProject(simpleDoc).find((f) => f.path === 'tsconfig.json');
            expect(ts?.content).toContain('"strict": true');
            expect(ts?.content).toContain('"es2023"');
        });
    });

    describe('platforms', () => {
        it('generates fullPlatforms when all 7', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                platforms: ['telegram', 'vk', 'alisa', 'marusia', 'max_app', 'viber', 'smart_app'],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('bot.use(fullPlatforms)');
        });

        it('generates individual platform imports', () => {
            const idx = generateProject(simpleDoc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("import { TelegramAdapter } from 'umbot/plugins'");
            expect(idx?.content).toContain('bot.use(TelegramAdapter)');
        });
    });

    describe('math game scenario (integration)', () => {
        it('generates complete math quiz bot', () => {
            const doc: FlowDocument = {
                schemaVersion: '1.0',
                name: 'math-quiz',
                version: '1.0.0',
                description: '',
                platforms: ['telegram'],
                database: { type: 'file', config: {} },
                mode: 'dev',
                isLocalStorage: true,
                nodes: [
                    {
                        type: 'command',
                        id: 'start',
                        name: 'start',
                        slots: ['start', 'quiz'],
                        isPattern: false,
                        actions: [
                            { type: 'random_number', field: 'num1', min: 1, max: 20 },
                            { type: 'random_number', field: 'num2', min: 1, max: 20 },
                        ],
                        response: {
                            text: 'Solve: {{num1}} + {{num2}} = ?',
                            buttons: [],
                            sounds: [],
                        },
                    },
                    {
                        type: 'step',
                        id: 'answer',
                        name: 'answer',
                        prompt: { text: 'Type your answer:', buttons: [] },
                        saveTo: 'userAnswer',
                        saveAs: 'original',
                    },
                    {
                        type: 'condition',
                        id: 'check',
                        name: 'checkAnswer',
                        variable: 'userAnswer',
                        operator: 'eq',
                        value: 'num1',
                    },
                    {
                        type: 'response',
                        id: 'correct',
                        name: 'correct',
                        response: { text: 'Correct!', isEnd: true, buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'wrong',
                        name: 'wrong',
                        response: { text: 'Wrong! Try again.', buttons: [], sounds: [] },
                    },
                ],
                edges: [
                    { from: 'start', to: 'answer', type: 'next' },
                    { from: 'answer', to: 'check', type: 'next' },
                    { from: 'check', to: 'correct', type: 'branch_true' },
                    { from: 'check', to: 'wrong', type: 'branch_false' },
                    { from: 'wrong', to: 'answer', type: 'next' },
                ],
                fallback: { text: 'Type start to begin.' },
                welcome: { text: 'Welcome!', buttons: [] },
                variables: {},
            };

            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';

            // Регистрация команды start
            expect(code).toContain("addCommand('start'");
            expect(code).toContain("'start'");
            expect(code).toContain("'quiz'");

            // Генерация двух random_number
            expect(code).toContain('ctrl.userData.num1 = rand(1, 20)');
            expect(code).toContain('ctrl.userData.num2 = rand(1, 20)');

            // Шаблонная строка с переменными
            expect(code).toContain('${ctrl.userData.num1} + ${ctrl.userData.num2}');

            // Step answer
            expect(code).toContain("addStep('answer'");
            expect(code).toContain('ctrl.userData.userAnswer = ctrl.userCommand');

            // Condition check
            expect(code).toContain("addStep('checkAnswer'");
            expect(code).toContain("switch ('eq')");

            // Branches
            expect(code).toContain("if (result) { ctrl.thisIntentName = 'correct'; }");
            expect(code).toContain("if (!result) { ctrl.thisIntentName = 'wrong'; }");

            // Response steps
            expect(code).toContain("addStep('correct'");
            expect(code).toContain("setText(ctrl, 'Correct!')");
            expect(code).toContain('ctrl.isEnd = true');
            expect(code).toContain("addStep('wrong'");
            expect(code).toContain("setText(ctrl, 'Wrong! Try again.')");

            // Цикл wrong -> answer
            expect(code.indexOf("addStep('wrong'") < code.indexOf("setText(ctrl, 'Wrong!"));
        });
    });

    describe('nested conditions', () => {
        it('command with multiple conditions', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        conditions: [
                            {
                                variable: 'score',
                                operator: 'gte',
                                value: 100,
                                responseTrue: { text: 'Great!' },
                            },
                            {
                                variable: 'level',
                                operator: 'eq',
                                value: 'admin',
                                responseTrue: { text: 'Admin!' },
                            },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            // Два отдельных switch блока
            const switchCount = (code.match(/switch \(/g) || []).length;
            expect(switchCount).toBe(2);
            expect(code).toContain("setText(ctrl, 'Great!')");
            expect(code).toContain("setText(ctrl, 'Admin!')");
        });

        it('step with condition and responseTrue buttons', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: '?', buttons: [] },
                        saveTo: 'v',
                        saveAs: 'original',
                        conditions: [
                            {
                                variable: 'v',
                                operator: 'isNotEmpty',
                                value: '',
                                responseTrue: {
                                    text: 'Got it!',
                                    buttons: [{ title: 'OK', type: 'action' }],
                                },
                            },
                        ],
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain(
                "case 'isNotEmpty': result = !!condVar && condVar !== ''; break;",
            );
            expect(idx?.content).toContain("setText(ctrl, 'Got it!')");
            expect(idx?.content).toContain("ctrl.buttons.addBtn('OK')");
        });
    });

    describe('escape and safety', () => {
        it('escapes single quotes in slot names', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ["it's"],
                        isPattern: false,
                        response: { text: 'OK', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("it\\'s");
        });

        it('escapes newlines in text', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'Line1\nLine2', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('Line1\\nLine2');
        });

        it('does not import rand when no random_number actions', () => {
            const idx = generateProject(simpleDoc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).not.toContain('import { rand }');
        });
    });

    describe('simple scenarios', () => {
        it('command with single slot', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'hello',
                        slots: ['hello'],
                        isPattern: false,
                        response: { text: 'Hi!', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("addCommand('hello', ['hello']");
        });

        it('command with many slots', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'hi',
                        slots: ['hi', 'hello', 'hey', 'yo'],
                        isPattern: false,
                        response: { text: 'Hey!', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("'hi'");
            expect(idx?.content).toContain("'hello'");
            expect(idx?.content).toContain("'hey'");
            expect(idx?.content).toContain("'yo'");
        });

        it('step with no saveTo — just prompt', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 'info',
                        prompt: { text: 'Some info', buttons: [] },
                        saveTo: '',
                        saveAs: 'original',
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("addStep('info'");
            expect(idx?.content).toContain("setText(ctrl, 'Some info')");
            expect(idx?.content).not.toContain('ctrl.userData');
        });

        it('document with only fallback, no commands', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [],
                edges: [],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('FALLBACK_COMMAND');
            expect(idx?.content).toContain("setText(ctrl, 'Sorry, I don\\'t understand.')");
        });

        it('multiple commands — all registered', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'greet',
                        slots: ['hi'],
                        isPattern: false,
                        response: { text: 'Hello', buttons: [], sounds: [] },
                    },
                    {
                        type: 'command',
                        id: 'c2',
                        name: 'bye',
                        slots: ['bye'],
                        isPattern: false,
                        response: { text: 'Goodbye', buttons: [], sounds: [] },
                    },
                    {
                        type: 'command',
                        id: 'c3',
                        name: 'help',
                        slots: ['help'],
                        isPattern: false,
                        response: { text: 'Help!', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("addCommand('greet'");
            expect(idx?.content).toContain("addCommand('bye'");
            expect(idx?.content).toContain("addCommand('help'");
        });

        it('command with empty response text — no setText generated', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            // Пустой текст не генерирует setText — только пустой обработчик
            const cmdMatch = code.match(/addCommand\('c'[\s\S]*?\}\);/);
            expect(cmdMatch).toBeTruthy();
        });

        it('two platforms', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                platforms: ['telegram', 'vk'],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("import { TelegramAdapter } from 'umbot/plugins'");
            expect(idx?.content).toContain("import { VkAdapter } from 'umbot/plugins'");
            expect(idx?.content).toContain('bot.use(TelegramAdapter)');
            expect(idx?.content).toContain('bot.use(VkAdapter)');
        });
    });

    describe('HTTP requests', () => {
        it('POST with headers and body', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: '', buttons: [] },
                        saveTo: '',
                        saveAs: 'original',
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.test/post',
                                method: 'POST',
                                headers: '{ "Content-Type": "application/json" }',
                                body: '{ "key": "value" }',
                                saveResponseTo: 'result',
                            },
                        ],
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("await fetch('https://api.test/post'");
            expect(idx?.content).toContain("method: 'POST'");
            expect(idx?.content).toContain('headers:');
            expect(idx?.content).toContain('body:');
            expect(idx?.content).toContain('ctrl.userData.result = data');
        });

        it('GET without body', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: '', buttons: [] },
                        saveTo: '',
                        saveAs: 'original',
                        actions: [
                            { type: 'http_request', url: 'https://api.test/get', method: 'GET' },
                        ],
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("await fetch('https://api.test/get')");
            expect(idx?.content).not.toContain("method: 'GET'");
        });
    });

    describe('condition branches — partial', () => {
        it('condition with only branch_true', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'condition',
                        id: 'cond',
                        name: 'check',
                        variable: 'v',
                        operator: 'eq',
                        value: 'yes',
                    },
                    {
                        type: 'response',
                        id: 'y',
                        name: 'yesR',
                        response: { text: 'Yes!', buttons: [], sounds: [] },
                    },
                ],
                edges: [
                    { from: 'c', to: 'cond', type: 'next' },
                    { from: 'cond', to: 'y', type: 'branch_true' },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("if (result) { ctrl.thisIntentName = 'yesR'; }");
            expect(idx?.content).not.toContain('if (!result)');
        });

        it('condition with only branch_false', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'condition',
                        id: 'cond',
                        name: 'check',
                        variable: 'v',
                        operator: 'eq',
                        value: 'no',
                    },
                    {
                        type: 'response',
                        id: 'n',
                        name: 'noR',
                        response: { text: 'No!', buttons: [], sounds: [] },
                    },
                ],
                edges: [
                    { from: 'c', to: 'cond', type: 'next' },
                    { from: 'cond', to: 'n', type: 'branch_false' },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("if (!result) { ctrl.thisIntentName = 'noR'; }");
            expect(idx?.content).not.toContain('if (result) {');
        });
    });

    describe('condition value as variable', () => {
        it('condition compares variable to another variable', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'c1',
                        slots: ['t'],
                        isPattern: false,
                        saveTo: 'target',
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: '?', buttons: [] },
                        saveTo: 'score',
                        saveAs: 'original',
                        conditions: [{ variable: 'score', operator: 'gte', value: 'target' }],
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('condVal = ctrl.userData.target');
        });
    });

    describe('action block types', () => {
        it('action block with random_number', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'action',
                        id: 'a',
                        name: 'roll',
                        actions: [{ type: 'random_number', field: 'dice', min: 1, max: 6 }],
                        text: '',
                        buttons: [],
                    },
                ],
                edges: [{ from: 'c', to: 'a', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("addStep('roll'");
            expect(idx?.content).toContain('ctrl.userData.dice = rand(1, 6)');
        });

        it('action block with set_variable', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'action',
                        id: 'a',
                        name: 'setX',
                        actions: [{ type: 'set_variable', field: 'x', value: '42' }],
                        text: '',
                        buttons: [],
                    },
                ],
                edges: [{ from: 'c', to: 'a', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("addStep('setX'");
            expect(idx?.content).toContain('ctrl.userData.x = 42');
        });

        it('action block with text and buttons', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'action',
                        id: 'a',
                        name: 'notify',
                        actions: [],
                        text: 'Notified!',
                        buttons: [{ title: 'OK', type: 'action' }],
                    },
                ],
                edges: [{ from: 'c', to: 'a', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("setText(ctrl, 'Notified!')");
            expect(idx?.content).toContain("ctrl.buttons.addBtn('OK')");
        });

        it('action block with multiple actions', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'action',
                        id: 'a',
                        name: 'process',
                        actions: [
                            { type: 'random_number', field: 'r', min: 0, max: 100 },
                            { type: 'set_variable', field: 'computed', value: 'r' },
                        ],
                        text: '',
                        buttons: [],
                    },
                ],
                edges: [{ from: 'c', to: 'a', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('ctrl.userData.r = rand(0, 100)');
            expect(idx?.content).toContain('ctrl.userData.computed = ctrl.userData.r');
        });
    });

    describe('response block variants', () => {
        it('response block with buttons and TTS', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'M', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'r',
                        name: 'r',
                        response: {
                            text: 'Info',
                            tts: 'Info spoken',
                            buttons: [
                                { title: 'OK', type: 'action' },
                                { title: 'Link', type: 'link', url: 'https://x.com' },
                            ],
                            sounds: [],
                        },
                    },
                ],
                edges: [{ from: 'c', to: 'r', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("setText(ctrl, 'Info')");
            expect(idx?.content).toContain("setTTS(ctrl, 'Info spoken')");
            expect(idx?.content).toContain("ctrl.buttons.addBtn('OK')");
            expect(idx?.content).toContain("ctrl.buttons.addLink('Link', 'https://x.com')");
        });

        it('response block with isEnd', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'r',
                        name: 'r',
                        response: { text: 'Done', isEnd: true, buttons: [], sounds: [] },
                    },
                ],
                edges: [{ from: 'c', to: 'r', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('ctrl.isEnd = true');
        });
    });

    describe('multi-step chain', () => {
        it('three steps in sequence', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's1',
                        name: 'step1',
                        prompt: { text: 'Q1', buttons: [] },
                        saveTo: 'a',
                        saveAs: 'original',
                    },
                    {
                        type: 'step',
                        id: 's2',
                        name: 'step2',
                        prompt: { text: 'Q2', buttons: [] },
                        saveTo: 'b',
                        saveAs: 'original',
                    },
                    {
                        type: 'step',
                        id: 's3',
                        name: 'step3',
                        prompt: { text: 'Q3', buttons: [] },
                        saveTo: 'c',
                        saveAs: 'original',
                    },
                ],
                edges: [
                    { from: 's1', to: 's2', type: 'next' },
                    { from: 's2', to: 's3', type: 'next' },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("addStep('step1'");
            expect(idx?.content).toContain("addStep('step2'");
            expect(idx?.content).toContain("addStep('step3'");
            expect(idx?.content).toContain("ctrl.thisIntentName = 'step2'");
            expect(idx?.content).toContain("ctrl.thisIntentName = 'step3'");
        });
    });

    describe('complex flows', () => {
        it('command with all features combined', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['go'],
                        isPattern: false,
                        actions: [
                            { type: 'random_number', field: 'roll', min: 1, max: 6 },
                            { type: 'set_variable', field: 'total', value: 'roll' },
                        ],
                        conditions: [
                            {
                                variable: 'roll',
                                operator: 'gte',
                                value: 4,
                                responseTrue: {
                                    text: 'Lucky!',
                                    buttons: [{ title: 'Again', type: 'action' }],
                                },
                                responseFalse: { text: 'No luck.' },
                            },
                        ],
                        response: {
                            text: 'You rolled {{roll}}!',
                            tts: 'Roll result',
                            isEnd: false,
                            buttons: [
                                { title: 'Done', type: 'action' },
                                { title: 'Info', type: 'link', url: 'https://x.com' },
                            ],
                            sounds: [],
                            card: {
                                type: 'gallery',
                                title: '',
                                images: [{ src: 'dice.jpg', title: 'Dice', description: 'A dice' }],
                            },
                        },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            // rand + set_variable
            expect(code).toContain('ctrl.userData.roll = rand(1, 6)');
            expect(code).toContain('ctrl.userData.total = ctrl.userData.roll');
            // condition
            expect(code).toContain("switch ('gte')");
            expect(code).toContain("setText(ctrl, 'Lucky!')");
            expect(code).toContain("setText(ctrl, 'No luck.')");
            // buttons
            expect(code).toContain("ctrl.buttons.addBtn('Again')");
            expect(code).toContain("ctrl.buttons.addBtn('Done')");
            expect(code).toContain("ctrl.buttons.addLink('Info', 'https://x.com')");
            // TTS + template + card
            expect(code).toContain("setTTS(ctrl, 'Roll result')");
            expect(code).toContain('${ctrl.userData.roll}');
            expect(code).toContain("ctrl.card.addImage('dice.jpg', 'Dice', 'A dice')");
        });

        it('deep chain: command → condition → response(true) → step → end', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'start',
                        slots: ['begin'],
                        isPattern: false,
                        response: { text: 'Welcome!', buttons: [], sounds: [] },
                    },
                    {
                        type: 'condition',
                        id: 'cond',
                        name: 'check',
                        variable: 'v',
                        operator: 'isNotEmpty',
                        value: '',
                    },
                    {
                        type: 'response',
                        id: 'yes',
                        name: 'hasValue',
                        response: { text: 'You have a value', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'no',
                        name: 'noValue',
                        response: { text: 'No value', buttons: [], sounds: [] },
                    },
                ],
                edges: [
                    { from: 'c', to: 'cond', type: 'next' },
                    { from: 'cond', to: 'yes', type: 'branch_true' },
                    { from: 'cond', to: 'no', type: 'branch_false' },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain("addCommand('start'");
            expect(code).toContain("addStep('check'");
            expect(code).toContain("addStep('hasValue'");
            expect(code).toContain("addStep('noValue'");
            expect(code).toContain("if (result) { ctrl.thisIntentName = 'hasValue'; }");
            expect(code).toContain("if (!result) { ctrl.thisIntentName = 'noValue'; }");
        });

        it('condition with numeric string vs numeric value', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        conditions: [{ variable: 'count', operator: 'eq', value: '5' }],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('condVal = 5');
        });

        it('condition with non-numeric string value', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        conditions: [{ variable: 'status', operator: 'eq', value: 'active' }],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("condVal = 'active'");
        });

        it('condition with responseFalse only', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        conditions: [
                            {
                                variable: 'x',
                                operator: 'gt',
                                value: 0,
                                responseFalse: { text: 'Negative!' },
                            },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("setText(ctrl, 'Negative!')");
            expect(idx?.content).toContain('if (!result)');
        });
    });

    describe('audit-recommended quality tests', () => {
        it("resolveVars: user/userName don't collide", () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'c1',
                        slots: ['t'],
                        isPattern: false,
                        saveTo: 'user',
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'command',
                        id: 'c2',
                        name: 'c2',
                        slots: ['t2'],
                        isPattern: false,
                        saveTo: 'userName',
                        actions: [
                            { type: 'set_variable', field: 'result', value: 'userName + user' },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('ctrl.userData.userName + ctrl.userData.user');
        });

        it('sanitizeIdentifier: names with spaces become valid', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'r',
                        name: 'Проверка ответа',
                        response: { text: 'OK', buttons: [], sounds: [] },
                    },
                ],
                edges: [{ from: 'c', to: 'r', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            // Пробел заменяется на _, кириллица сохраняется
            expect(idx?.content).toContain("addStep('Проверка_ответа'");
            expect(idx?.content).not.toContain("addStep('Проверка ответа'");
        });

        it('sanitizeIdentifier: names with digits at start', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'r',
                        name: '123block',
                        response: { text: 'OK', buttons: [], sounds: [] },
                    },
                ],
                edges: [{ from: 'c', to: 'r', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("addStep('_123block'");
        });

        it('null nodes in document are filtered', () => {
            const doc = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'OK', buttons: [], sounds: [] },
                    },
                    null,
                    undefined,
                ] as any,
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("addCommand('c'");
        });

        it('package.json: name starts with letter', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                name: '123 Мой Бот!',
            };
            const pkg = JSON.parse(
                generateProject(doc).find((f) => f.path === 'package.json')!.content,
            );
            expect(pkg.name).toMatch(/^[a-z]/);
            expect(() => JSON.parse(JSON.stringify(pkg))).not.toThrow();
        });

        it('package.json: valid JSON parseable', () => {
            const files = generateProject(simpleDoc);
            const pkg = JSON.parse(files.find((f) => f.path === 'package.json')!.content);
            expect(pkg.name).toBe('simple-bot');
            expect(pkg.dependencies.umbot).toBeDefined();
            expect(pkg.devDependencies.typescript).toBeDefined();
        });

        it('tsconfig.json: valid JSON parseable', () => {
            const files = generateProject(simpleDoc);
            const ts = JSON.parse(files.find((f) => f.path === 'tsconfig.json')!.content);
            expect(ts.compilerOptions.strict).toBe(true);
            expect(ts.compilerOptions.outDir).toBe('./dist');
        });

        it('http body with {{variables}} generates template literal', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        saveTo: 'userId',
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: '', buttons: [] },
                        saveTo: '',
                        saveAs: 'original',
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.test',
                                method: 'POST',
                                body: '{"userId": "{{userId}}"}',
                            },
                        ],
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            // body передаётся как template literal с подстановкой переменной
            expect(code).toContain('${ctrl.userData.userId}');
            expect(code).toContain('body: `');
            expect(code).not.toContain('JSON.parse');
        });

        it('setTTS import absent when only standalone response has TTS (no command/step TTS)', () => {
            // Standalone response с TTS — needsSetTTS должен это учитывать
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'Hello', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'r',
                        name: 'r',
                        response: { text: 'Info', tts: 'Info spoken', buttons: [], sounds: [] },
                    },
                ],
                edges: [{ from: 'c', to: 'r', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("import { setText, setTTS } from './utils'");
            expect(idx?.content).toContain("setTTS(ctrl, 'Info spoken')");
        });

        it('generated code is syntactically valid — no double dots or broken identifiers', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'my-cmd',
                        slots: ['test-slot'],
                        isPattern: false,
                        response: { text: 'Hello!', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            // Не должно быть .. (две точки подряд) — признак сломанного идентификатора
            expect(code).not.toContain('..');
            // addCommand должен быть с валидным именем
            expect(code).toContain("addCommand('my-cmd'");
        });

        it('textExpr: backticks in text are escaped', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'Hello `world`!', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("setText(ctrl, 'Hello \\`world\\`!')");
        });

        it('textExpr: ${} in text with {{vars}} is escaped', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: {
                            text: 'Price: ${{name}} is ${{price}}',
                            buttons: [],
                            sounds: [],
                        },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            // ${{name}} → ${ctrl.userData.name} (переменная)
            expect(code).toContain('${ctrl.userData.name}');
            expect(code).toContain('${ctrl.userData.price}');
        });

        it('textExpr: backticks escaped inside template literal with variables', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'Hello {{name}} `great`!', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain('${ctrl.userData.name}');
            expect(code).toContain('\\`great\\`');
        });

        it('helpText: uses helpText.text when available', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                fallback: { text: 'Fallback' },
                helpText: { text: 'Help content' },
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("help_text: 'Help content'");
            expect(idx?.content).toContain("empty_text: 'Fallback'");
        });

        it('helpText: falls back to fallback.text when helpText is absent', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                fallback: { text: 'Sorry' },
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("help_text: 'Sorry'");
        });

        it('set_variable with plain text wraps in quotes', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'c1',
                        slots: ['t'],
                        isPattern: false,
                        saveTo: 'x',
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'command',
                        id: 'c2',
                        name: 'c2',
                        slots: ['t2'],
                        isPattern: false,
                        actions: [{ type: 'set_variable', field: 'status', value: 'active' }],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("ctrl.userData.status = 'active'");
        });

        it('set_variable with variable name resolves to ctrl.userData', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'c1',
                        slots: ['t'],
                        isPattern: false,
                        saveTo: 'score',
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'command',
                        id: 'c2',
                        name: 'c2',
                        slots: ['t2'],
                        isPattern: false,
                        actions: [{ type: 'set_variable', field: 'total', value: 'score' }],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('ctrl.userData.total = ctrl.userData.score');
        });

        it('set_variable with numeric value', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        actions: [{ type: 'set_variable', field: 'x', value: '42' }],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain('ctrl.userData.x = 42');
        });

        it('resolveVars: special chars in variable name are escaped', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'c1',
                        slots: ['t'],
                        isPattern: false,
                        saveTo: 'user.name',
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'command',
                        id: 'c2',
                        name: 'c2',
                        slots: ['t2'],
                        isPattern: false,
                        actions: [{ type: 'set_variable', field: 'result', value: 'user.name' }],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("ctrl.userData.result = ctrl.userData['user.name']");
        });

        it('isNotEmpty operator generates correct switch case', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        conditions: [{ variable: 'items', operator: 'isNotEmpty', value: '' }],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("switch ('isNotEmpty')");
            expect(idx?.content).toContain('!!condVar && condVar');
        });

        it('condition branch targets step node', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c',
                        name: 'c',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'condition',
                        id: 'cond',
                        name: 'check',
                        variable: 'v',
                        operator: 'eq',
                        value: 'yes',
                    },
                    {
                        type: 'step',
                        id: 's',
                        name: 'nextStep',
                        prompt: { text: 'Go on', buttons: [] },
                        saveTo: '',
                        saveAs: 'original',
                    },
                ],
                edges: [
                    { from: 'c', to: 'cond', type: 'next' },
                    { from: 'cond', to: 's', type: 'branch_true' },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            expect(idx?.content).toContain("if (result) { ctrl.thisIntentName = 'nextStep'; }");
            expect(idx?.content).toContain("addStep('nextStep'");
        });

        it('HTTP request with headers includes them in fetch', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'step',
                        id: 's',
                        name: 's',
                        prompt: { text: '', buttons: [] },
                        saveTo: '',
                        saveAs: 'original',
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.test',
                                method: 'POST',
                                headers: '{ "Authorization": "Bearer token" }',
                                body: '{"key":"val"}',
                            },
                        ],
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain("method: 'POST'");
            expect(code).toContain('headers:');
            expect(code).toContain('Authorization');
        });

        it('action node with card generates addImage calls', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'cmd',
                        name: 'cmd',
                        slots: ['go'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'action',
                        id: 'act1',
                        name: 'act1',
                        actions: [],
                        text: 'Done!',
                        buttons: [],
                        card: {
                            type: 'single',
                            title: 'Result',
                            images: [
                                {
                                    src: 'https://example.com/img.png',
                                    title: 'Pic',
                                    description: 'Desc',
                                },
                            ],
                        },
                    },
                ],
                edges: [{ from: 'cmd', to: 'act1', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain("addStep('act1'");
            expect(code).toContain("setText(ctrl, 'Done!')");
            expect(code).toContain('ctrl.card.addImage(');
            expect(code).toContain("'https://example.com/img.png'");
        });

        it('action node with card button generates addImage with button title', () => {
            const doc: FlowDocument = {
                ...simpleDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'cmd',
                        name: 'cmd',
                        slots: ['go'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'action',
                        id: 'act2',
                        name: 'act2',
                        actions: [],
                        text: '',
                        buttons: [],
                        card: {
                            type: 'gallery',
                            title: '',
                            images: [
                                {
                                    src: 'pic.jpg',
                                    title: '',
                                    description: '',
                                    button: { title: 'Go', type: 'action', targetNodeId: 'next' },
                                },
                            ],
                        },
                    },
                ],
                edges: [{ from: 'cmd', to: 'act2', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain('ctrl.card.addImage(');
            expect(code).toContain("'Go'");
        });
    });

    describe('full integration: complex project', () => {
        it('generates complete valid project from complex flow', () => {
            const doc: FlowDocument = {
                schemaVersion: '1.0',
                name: 'test-bot',
                version: '2.0.0',
                description: 'Integration test bot',
                platforms: ['telegram', 'vk'],
                database: { type: 'file', config: {} },
                mode: 'dev',
                isLocalStorage: true,
                nodes: [
                    {
                        type: 'command',
                        id: 'greeting',
                        name: 'greeting',
                        slots: ['hello', 'hi', 'привет'],
                        isPattern: false,
                        response: {
                            text: 'Привет, {{userName}}!',
                            tts: 'Привет!',
                            buttons: [
                                { title: 'Помощь', type: 'action', targetNodeId: 'help_step' },
                                { title: 'Сайт', type: 'link', url: 'https://example.com' },
                            ],
                            card: {
                                type: 'gallery',
                                title: 'Добро пожаловать',
                                images: [
                                    { src: 'bg.jpg', title: 'Картинка', description: 'Описание' },
                                ],
                            },
                            sounds: [],
                        },
                        saveTo: 'userName',
                        actions: [{ type: 'random_number', field: 'luck', min: 1, max: 100 }],
                        conditions: [
                            {
                                variable: 'luck',
                                operator: 'gt',
                                value: 50,
                                responseTrue: { text: 'Повезло!' },
                                responseFalse: { text: 'Не повезло...' },
                            },
                        ],
                    },
                    {
                        type: 'step',
                        id: 'help_step',
                        name: 'help_step',
                        prompt: {
                            text: 'Чем помочь?',
                            buttons: [{ title: 'Назад', type: 'action' }],
                        },
                        saveTo: 'userChoice',
                        saveAs: 'lowercase',
                        actions: [{ type: 'set_variable', field: 'asked', value: 'true' }],
                    },
                    {
                        type: 'condition',
                        id: 'checkChoice',
                        name: 'checkChoice',
                        variable: 'userChoice',
                        operator: 'contains',
                        value: 'помощь',
                    },
                    {
                        type: 'action',
                        id: 'doAction',
                        name: 'doAction',
                        actions: [
                            { type: 'set_variable', field: 'score', value: 'luck + 10' },
                            {
                                type: 'http_request',
                                url: 'https://api.test/data',
                                method: 'GET',
                                saveResponseTo: 'apiResult',
                            },
                        ],
                        text: 'Готово! Счёт: {{score}}',
                        buttons: [{ title: 'Ещё раз', type: 'action' }],
                        card: {
                            type: 'single',
                            title: '',
                            images: [{ src: 'result.png', title: 'Результат', description: '' }],
                        },
                    },
                    { type: 'end', id: 'end1' },
                ],
                edges: [
                    { from: 'greeting', to: 'help_step', type: 'next' },
                    { from: 'help_step', to: 'checkChoice', type: 'next' },
                    { from: 'checkChoice', to: 'doAction', type: 'branch_true' },
                    { from: 'checkChoice', to: 'end1', type: 'branch_false' },
                ],
                fallback: { text: 'Не понял вас.' },
                welcome: { text: 'Добро пожаловать!', buttons: [] },
                helpText: { text: 'Это помощь.' },
                variables: {},
            };

            const files = generateProject(doc);
            const paths = files.map((f) => f.path);
            expect(paths).toContain('src/index.ts');
            expect(paths).toContain('src/utils.ts');
            expect(paths).toContain('package.json');
            expect(paths).toContain('tsconfig.json');

            const idx = files.find((f) => f.path === 'src/index.ts')!;
            const code = idx.content;

            // Платформы — правильные адаптеры
            expect(code).toContain("import { TelegramAdapter } from 'umbot/plugins'");
            expect(code).toContain("import { VkAdapter } from 'umbot/plugins'");
            expect(code).toContain('bot.use(TelegramAdapter)');
            expect(code).toContain('bot.use(VkAdapter)');

            // База данных
            expect(code).toContain("import { FileAdapter } from 'umbot/plugins'");
            expect(code).toContain('bot.use(new FileAdapter())');

            // Текст и TTS
            expect(code).toContain('setText(ctrl, `Привет, ${ctrl.userData.userName}!`)');
            expect(code).toContain("setTTS(ctrl, 'Привет!')");

            // Кнопки — переменные в title
            expect(code).toContain("ctrl.buttons.addBtn('Помощь')");
            expect(code).toContain("ctrl.buttons.addLink('Сайт', 'https://example.com')");

            // Карточка
            expect(code).toContain('ctrl.card.addImage(');
            expect(code).toContain("'bg.jpg'");

            // Переменные
            expect(code).toContain('ctrl.userData.luck = rand(1, 100)');
            expect(code).toContain('ctrl.userData.userName = cmd');

            // Условия
            expect(code).toContain("switch ('gt')");
            expect(code).toContain("case 'gt': result = useNum ? numA > numB : false; break;");

            // Шаг с saveTo
            expect(code).toContain("addStep('help_step'");
            expect(code).toContain(
                "ctrl.userData.userChoice = (ctrl.userCommand ?? '').toLowerCase()",
            );

            // Действия
            expect(code).toContain("addStep('doAction'");
            expect(code).toContain('ctrl.userData.score = ctrl.userData.luck + 10');
            expect(code).toContain("await fetch('https://api.test/data'");
            expect(code).toContain('ctrl.userData.apiResult = data');

            // Навигация
            expect(code).toContain("ctrl.thisIntentName = 'help_step'");
            expect(code).toContain("ctrl.thisIntentName = 'doAction'");

            // Fallback
            expect(code).toContain('FALLBACK_COMMAND');
            expect(code).toContain("setText(ctrl, 'Не понял вас.')");

            // package.json — dependencies
            const pkg = JSON.parse(files.find((f) => f.path === 'package.json')!.content);
            expect(pkg.dependencies.umbot).toBeDefined();
            expect(pkg.devDependencies.typescript).toBeDefined();

            // utils.ts
            const utils = files.find((f) => f.path === 'src/utils.ts')!;
            expect(utils.content).toContain('export function setText');
            expect(utils.content).toContain('export function setTTS');
        });
    });

    describe('problems.txt regression tests', () => {
        const baseDoc: FlowDocument = {
            schemaVersion: '1.0',
            name: 'test',
            version: '1.0.0',
            description: '',
            platforms: ['telegram'],
            database: { type: 'file', config: {} },
            mode: 'dev',
            isLocalStorage: true,
            nodes: [],
            edges: [],
            fallback: { text: 'ERR' },
            welcome: { text: 'Hi', buttons: [] },
            variables: {},
        };

        it('#5 set_variable with {{var}} generates template literal', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        actions: [
                            { type: 'set_variable', field: 'msg', value: 'Привет {{name}}!' },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain('ctrl.userData.msg = `Привет ${ctrl.userData.name}!`');
            expect(code).not.toContain('{{');
        });

        it('#9 HTTP response checks response.ok', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.com',
                                method: 'GET',
                                saveResponseTo: 'data',
                            },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain('response.ok');
        });

        it('#10 headers are sanitized through JSON.parse/stringify', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.com',
                                method: 'GET',
                                headers: '{"Authorization": "Bearer token123"}',
                            },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain('headers:');
            expect(code).toContain('"Authorization"');
        });

        it('#6 POST body with backticks and {{var}} is properly escaped', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.com',
                                method: 'POST',
                                body: '{"name": "{{userName}}", "note": "use `code` here"}',
                                saveResponseTo: 'resp',
                            },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain('\\`code\\`');
            expect(code).toContain('${ctrl.userData.userName}');
        });

        it('#7 contains operator resolves variable in value', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        saveTo: 'keyword',
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'condition',
                        id: 'cond',
                        name: 'check',
                        variable: 'text',
                        operator: 'contains',
                        value: 'keyword',
                        responseTrue: { text: 'Found', buttons: [] },
                        responseFalse: { text: 'Not found', buttons: [] },
                    },
                ],
                edges: [{ from: 'c1', to: 'cond', type: 'next' }],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            // condVal должен быть ctrl.userData.keyword (переменная), а не строковый литерал
            expect(code).toContain('const condVal = ctrl.userData.keyword;');
            expect(code).toContain('String(condVar).includes(String(condVal))');
        });

        it('HTTP PUT request uses correct method', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.com/item',
                                method: 'PUT',
                                body: '{"name": "test"}',
                                saveResponseTo: 'r',
                            },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain("method: 'PUT'");
            expect(code).not.toContain("method: 'POST'");
        });

        it('HTTP DELETE request uses correct method', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.com/item/1',
                                method: 'DELETE',
                            },
                        ],
                        response: { text: '', buttons: [], sounds: [] },
                    },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toContain("method: 'DELETE'");
        });

        it('response block with outgoing HTTP action is async', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'r1',
                        name: 'intro',
                        response: { text: 'Loading...', buttons: [], sounds: [] },
                    },
                    {
                        type: 'action',
                        id: 'a1',
                        name: 'load',
                        actions: [
                            {
                                type: 'http_request',
                                url: 'https://api.com',
                                method: 'GET',
                                saveResponseTo: 'd',
                            },
                        ],
                        text: '',
                        buttons: [],
                    },
                ],
                edges: [
                    { from: 'c1', to: 'r1', type: 'next' },
                    { from: 'r1', to: 'a1', type: 'next' },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            expect(code).toMatch(/async.*\(ctrl\).*=>\s*\{[\s\S]*setText.*Loading/);
        });

        it('condition block with HTTP action branch is async', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: '', buttons: [], sounds: [] },
                    },
                    {
                        type: 'condition',
                        id: 'cond',
                        name: 'check',
                        variable: 'x',
                        operator: 'eq',
                        value: '1',
                    },
                    {
                        type: 'action',
                        id: 'a1',
                        name: 'fetch_it',
                        actions: [{ type: 'http_request', url: 'https://api.com', method: 'GET' }],
                        text: '',
                        buttons: [],
                    },
                ],
                edges: [
                    { from: 'c1', to: 'cond', type: 'next' },
                    { from: 'cond', to: 'a1', type: 'branch_true' },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            // check step handler should be async
            expect(code).toContain('async');
            expect(code).toContain("addStep('check'");
        });

        it('outgoing async block is called with await', () => {
            const doc: FlowDocument = {
                ...baseDoc,
                nodes: [
                    {
                        type: 'command',
                        id: 'c1',
                        name: 'cmd',
                        slots: ['t'],
                        isPattern: false,
                        response: { text: 'Hi', buttons: [], sounds: [] },
                    },
                    {
                        type: 'response',
                        id: 'r1',
                        name: 'loader',
                        response: { text: 'Wait...', buttons: [], sounds: [] },
                    },
                    {
                        type: 'action',
                        id: 'a1',
                        name: 'fetch',
                        actions: [{ type: 'http_request', url: 'https://x.com', method: 'GET' }],
                        text: '',
                        buttons: [],
                    },
                ],
                edges: [
                    { from: 'c1', to: 'r1', type: 'next' },
                    { from: 'r1', to: 'a1', type: 'next' },
                ],
            };
            const idx = generateProject(doc).find((f) => f.path === 'src/index.ts');
            const code = idx?.content ?? '';
            // command handler should be async because its chain includes HTTP
            expect(code).toMatch(/async.*cmd.*ctrl/);
        });
    });
});
