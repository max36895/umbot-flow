import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3001,
    },
    build: {
        rollupOptions: {
            output: {
                // Разбиваем вендоров на отдельные чанки — они кэшируются браузером
                // независимо от кода приложения
                manualChunks: {
                    react: ['react', 'react-dom'],
                    xyflow: ['@xyflow/react'],
                    validation: ['ajv', 'ajv-formats'],
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
