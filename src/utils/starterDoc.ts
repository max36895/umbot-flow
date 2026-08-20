import type { FlowDocument } from '../types/flow';
import { DEFAULT_METADATA } from '../types/flow';

/**
 * Стартовый пример флоу — показывается при первом запуске.
 * Демонстрирует основные блоки и связи: Welcome → Step (имя) → Condition (проверка) → Response.
 */
export function buildStarterDocument(): FlowDocument {
    return {
        ...DEFAULT_METADATA,
        name: 'my-first-bot',
        description: 'Пример бота: приветствие и знакомство',
        nodes: [
            {
                type: 'command',
                id: 'welcome',
                name: 'welcome',
                slots: [],
                isPattern: false,
                response: {
                    text: 'Привет! Я демо-бот. Как тебя зовут?',
                    buttons: [],
                    sounds: [],
                },
                role: 'welcome',
            },
            {
                type: 'step',
                id: 'ask_name',
                name: 'ask_name',
                prompt: {
                    text: 'Напишите ваше имя:',
                    buttons: [],
                },
                saveTo: 'userName',
                saveAs: 'original',
            },
            {
                type: 'condition',
                id: 'check_name',
                name: 'check_name',
                variable: 'userName',
                operator: 'isNotEmpty',
                value: '',
            },
            {
                type: 'response',
                id: 'greet_user',
                name: 'greet_user',
                response: {
                    text: 'Приятно познакомиться, {{userName}}! Этот бот создан в Umbot Flow Editor. Откройте любой блок справа чтобы изменить его.',
                    buttons: [],
                    sounds: [],
                },
            },
            {
                type: 'end',
                id: 'end_final',
            },
        ],
        edges: [
            { from: 'welcome', to: 'ask_name', type: 'next' },
            { from: 'ask_name', to: 'check_name', type: 'next' },
            { from: 'check_name', to: 'greet_user', type: 'branch_true' },
            { from: 'check_name', to: 'end_final', type: 'branch_false' },
            { from: 'greet_user', to: 'end_final', type: 'next' },
        ],
    };
}
