import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Semantic colors — через CSS-переменные темы (dark/light).
                // Формат rgb(var / <alpha-value>) поддерживает opacity-модификаторы (bg-info/10).
                info: 'rgb(var(--info-rgb) / <alpha-value>)',
                error: 'rgb(var(--error-rgb) / <alpha-value>)',
                success: 'rgb(var(--success-rgb) / <alpha-value>)',
                warning: 'rgb(var(--warning-rgb) / <alpha-value>)',
                accent: 'rgb(var(--accent-rgb) / <alpha-value>)',

                // Foreground — текст/иконки (белый в тёмной теме, тёмный в светлой)
                fg: 'rgb(var(--fg-rgb) / <alpha-value>)',

                // Neon accent palette (node colors) — фиксированные брендовые цвета
                neon: {
                    cyan: '#00f0ff',
                    purple: '#bc13fe',
                    green: '#00ff9d',
                    orange: '#ff9d00',
                    pink: '#ff0055',
                },

                // Node type colors
                node: {
                    command: '#00f0ff',
                    step: '#bc13fe',
                    condition: '#ff0055',
                    action: '#ff9d00',
                    response: '#00ff9d',
                    end: '#ef4444',
                    start: '#22c55e',
                    welcome: '#22c55e',
                    help: '#eab308',
                },

                // Glass/surface colors — через переменные темы
                glass: {
                    bg: 'var(--surface-dim)',
                    surface: 'var(--surface)',
                    surfaceHigh: 'var(--surface-container-high)',
                    border: 'var(--glass-border)',
                },

                // Surface shades
                surface: {
                    DEFAULT: 'var(--surface)',
                    dim: 'rgb(var(--surface-dim-rgb) / <alpha-value>)',
                    container: 'var(--surface-container)',
                    'container-low': 'var(--surface-container-low)',
                    'container-high': 'var(--surface-container-high)',
                    panel: 'var(--surface-panel)',
                    'panel-docked': 'rgb(var(--surface-panel-docked-rgb) / <alpha-value>)',
                    modal: 'var(--surface-modal)',
                },

                // Outline / borders
                outline: 'var(--outline)',
                'outline-variant': 'var(--outline-variant)',
            },

            zIndex: {
                base: '0',
                sticky: '10',
                overlay: '20',
                preview: '30',
                panel: '40',
                popover: '50',
                toolbar: '100',
                menu: '150',
                modal: '200',
                palette: '300',
                alert: '400',
            },

            boxShadow: {
                'glow-cyan': '0 0 10px rgba(0, 240, 255, 0.3)',
                'glow-cyan-lg': '0 0 15px rgba(0, 240, 255, 0.5)',
                'glow-pink': '0 0 10px rgba(255, 0, 85, 0.5)',
                'glow-pink-lg': '0 0 12px rgba(255, 0, 85, 0.3)',
                'panel': '0 0 30px rgba(0, 0, 0, 0.4)',
                'panel-lg': '0 0 30px rgba(0, 0, 0, 0.6)',
                'modal': '0 0 60px rgba(0, 0, 0, 0.6)',
                'dropdown': '0 0 20px rgba(0, 0, 0, 0.5)',
            },
        },
    },
    plugins: [],
};

export default config;
