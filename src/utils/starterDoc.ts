import type { FlowDocument } from '../types/flow';
import { DEFAULT_METADATA } from '../types/flow';
import { getLocale, type Locale } from '../i18n';

/**
 * Стартовый пример флоу — показывается при первом запуске.
 * Демонстрирует основные блоки и связи: Welcome → Step (имя) → Condition (проверка) → Response.
 * Тексты демо-бота следуют текущей локали интерфейса, чтобы англоязычный пользователь
 * получил демо-контент на понятном языке.
 */
export function buildStarterDocument(locale: Locale = getLocale()): FlowDocument {
    const isRu = locale === 'ru';
    const t = (ru: string, en: string) => (isRu ? ru : en);

    return {
        ...DEFAULT_METADATA,
        name: 'my-first-bot',
        description: t(
            'Пример бота: приветствие и знакомство',
            'Example bot: greeting and getting acquainted',
        ),
        fallback: { text: t('Извините, я вас не понял.', "Sorry, I didn't understand.") },
        nodes: [
            {
                type: 'command',
                id: 'welcome',
                name: 'welcome',
                slots: [],
                isPattern: false,
                response: {
                    text: t(
                        'Привет! Я демо-бот. Как тебя зовут?',
                        "Hi! I'm a demo bot. What's your name?",
                    ),
                    buttons: [],
                    sounds: [],
                },
                role: 'welcome',
            },
            {
                type: 'step',
                id: 'ask_name',
                name: 'ask_name',
                // Вопрос «Как тебя зовут?» задаёт welcome перед шагом. Текст шага
                // отправляется ПОСЛЕ ответа пользователя — здесь он не нужен.
                prompt: { text: '', buttons: [] },
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
                    text: t(
                        'Приятно познакомиться, {{userName}}! Этот бот создан в Umbot Flow. Откройте любой блок справа чтобы изменить его.',
                        'Nice to meet you, {{userName}}! This bot was created in Umbot Flow. Open any block on the right to change it.',
                    ),
                    buttons: [],
                    sounds: [],
                },
            },
            { type: 'end', id: 'end_final' },
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
