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
        // /app — SPA-редактор (app.html). Стили и скрипты статических страниц
        // лежат в styles/ и scripts/ и собираются Vite с хэшем в имени.
        // Docs-страницы и прочая статика из public/ копируются в dist/ как есть
        // (publicDir по умолчанию): общие docs.css и metrika.js — без хэша.
        // /secret.html — пасхалка-терминал UM-13 (клик 10 раз по лого).
        // /sky-net.html — пасхалка «СОБЕРИ СКУНЕТ» (Konami-код на лендинге).
        // /404.html — колодец (ErrorDocument), /sandbox-um13.html — песочница призрака.
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                app: resolve(__dirname, 'app.html'),
                secret: resolve(__dirname, 'secret.html'),
                skynet: resolve(__dirname, 'sky-net.html'),
                confession: resolve(__dirname, 'confession.html'),
                queue: resolve(__dirname, 'queue.html'),
                notFound: resolve(__dirname, '404.html'),
                sandbox: resolve(__dirname, 'sandbox-um13.html'),
                ghost: resolve(__dirname, 'um13-ghost.js'),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    // Если это призрак — кладём в корень dist/ без хэша
                    if (chunkInfo.name === 'ghost') return 'um13-ghost.js';
                    // Остальные JS-файлы — как обычно
                    return 'assets/[name]-[hash].js';
                },
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
        // Vitest по умолчанию подменяет CSS пустой строкой; стили призрака
        // тесты читают как текст (styles/um13-ghost.css?raw)
        css: { include: [/um13-ghost\.css/] },
    },
});
