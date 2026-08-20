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
        // Тесты: допускаем non-null assertions и приведения типов
        files: ['src/__tests__/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-non-null-assertion': 'off',
        },
    },
);
