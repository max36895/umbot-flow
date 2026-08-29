import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3001,
    },
    build: {
        // Мультистраничность: / — статический лендинг (index.html),
        // /app — SPA-редактор (app.html). Docs-страницы и прочая статика
        // из public/ копируются в dist/ как есть (publicDir по умолчанию):
        // в них нет JS-бандлов, прогон через Rollup не нужен.
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                app: resolve(__dirname, 'app.html'),
            },
            output: {
                // Разбиваем вендоров на отдельные чанки — они кэшируются браузером
                // независимо от кода приложения. Function-форма надёжнее object-формы:
                // react/react-dom иначе «прилипали» к основному чанку (react-чанк был пустым).
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined;
                    // @xyflow проверяем раньше react: путь @xyflow/react содержит 'react'
                    if (id.includes('@xyflow')) return 'xyflow';
                    if (id.includes('ajv')) return 'validation';
                    if (id.includes('react') || id.includes('scheduler')) return 'react';
                    return undefined;
                },
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        setupFiles: ['src/setupTests.ts'],
    },
});
