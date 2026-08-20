import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Semantic colors — hex значения. Поддерживают opacity-модификаторы (bg-info/10).
                info: '#00f0ff',
                error: '#ff0055',
                success: '#00ff9d',
                warning: '#ff9d00',
                accent: '#bc13fe',

                // Neon accent palette (node colors)
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

                // Glass/surface colors
                glass: {
                    bg: '#0F0F14',
                    surface: 'rgba(30, 30, 35, 0.8)',
                    surfaceHigh: 'rgba(40, 40, 48, 0.85)',
                    border: 'rgba(255, 255, 255, 0.1)',
                },

                // Surface shades
                surface: {
                    DEFAULT: 'rgba(30, 30, 35, 0.8)',
                    dim: '#0f0f14',
                    container: 'rgba(40, 40, 48, 0.85)',
                    'container-low': 'rgba(25, 25, 30, 0.9)',
                    'container-high': 'rgba(50, 50, 58, 0.9)',
                    panel: 'rgba(30, 30, 35, 0.9)',
                    'panel-docked': 'rgba(20, 20, 25, 0.95)',
                    modal: 'rgba(20, 20, 25, 0.98)',
                },

                // Outline / borders
                outline: 'rgba(255, 255, 255, 0.15)',
                'outline-variant': 'rgba(255, 255, 255, 0.08)',
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
