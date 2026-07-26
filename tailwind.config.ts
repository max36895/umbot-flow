import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                neon: {
                    cyan: '#00f0ff',
                    purple: '#bc13fe',
                    green: '#00ff9d',
                    orange: '#ff9d00',
                    pink: '#ff0055',
                },
                glass: {
                    bg: '#0F0F14',
                    surface: 'rgba(30, 30, 35, 0.8)',
                    surfaceHigh: 'rgba(40, 40, 48, 0.85)',
                    border: 'rgba(255, 255, 255, 0.1)',
                },
                node: {
                    command: '#00f0ff',
                    step: '#bc13fe',
                    condition: '#ff0055',
                    end: '#ef4444',
                    start: '#22c55e',
                },
            },
        },
    },
    plugins: [],
};

export default config;
