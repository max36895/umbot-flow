import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom не реализует scrollIntoView — стаб для компонентов с автопрокруткой
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});

// Автоочистка DOM после каждого теста
afterEach(() => {
    cleanup();
});
