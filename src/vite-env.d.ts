/// <reference types="vite/client" />

// Vite-специфичные импорты для TS: ?raw (файл как строка) и ?url (URL ассета).
// vitest использует тот же резолвер — тесты могут читать public/-файлы.
declare module '*?raw' {
    const src: string;
    export default src;
}
