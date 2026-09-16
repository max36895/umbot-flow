import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
        },
        rules: {
            // Проект сознательно использует any-совместимые паттерны в нескольких местах
            '@typescript-eslint/no-explicit-any': 'warn',
            // Неиспользуемые переменные — ошибка, кроме _-префикса
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            // eval убран из проекта; если появится — блокируем
            'no-eval': 'error',
            'no-debugger': 'error',
            'prefer-const': 'error',
            eqeqeq: ['error', 'smart'],
        },
    },
    {
        // Ванильные скрипты статических страниц (лендинг, пасхалки), Метрика
        // и призрак UM-13 (классический defer-скрипт, не ES-модуль)
        files: ['scripts/**/*.js', 'public/**/*.js', 'um13-ghost.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
        },
        rules: {
            // try/catch вокруг localStorage/clipboard/audio: сбой — не ошибка,
            // страница молча работает без фичи
            'no-empty': ['error', { allowEmptyCatch: true }],
            '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
            'no-var': 'error',
            'prefer-const': 'error',
            'no-eval': 'error',
            'no-debugger': 'error',
            eqeqeq: ['error', 'smart'],
        },
    },
    {
        files: ['um13-ghost.js'],
        languageOptions: { sourceType: 'script' },
    },
    {
        // Тесты: допускаем non-null assertions и приведения типов
        files: ['src/__tests__/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-non-null-assertion': 'off',
        },
    },
    {
        // Тест ванильного IIFE-модуля um13-ghost.js: исходник скрипта
        // выполняется в jsdom как предмет теста (модуль без экспортов).
        // Это не инъекция чужого кода — тестируем ровно наш файл из корня репозитория.
        files: ['src/__tests__/um13Ghost.test.ts'],
        rules: {
            'no-eval': 'off',
        },
    },
);
