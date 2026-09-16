/**
 * Global regex constants for the Flow.
 * Created once, reused across all files for better performance.
 */

// === Template variable patterns ===

/** Matches {{variable}} template syntax */
export const TEMPLATE_VAR_REGEX = /\{\{(\w+)\}\}/g;

// === ChatPreview patterns ===

/** Matches agreement phrases (Russian) */
export const IS_SAY_TRUE_REGEX = /(да|конечно|согласен|согласна|хорошо|точно|верно|ага|угу|ок)/i;

/** Matches disagreement phrases (Russian) */
export const IS_SAY_FALSE_REGEX = /(нет|неа|не|ни|никак|отказ|невозможно)/i;

/** Matches HTTP/HTTPS URLs */
export const URL_REGEX = /^https?:\/\/.+/i;

// === Validator patterns ===

/** Validates JS identifier (letter/$/_ + letters/digits/$/_, cannot start with digit) */
export const JS_IDENTIFIER_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

// === Template generator patterns ===

/** Characters that need escaping in regex */
export const REGEX_ESCAPE_CHARS = /[.*+?^${}()|[\]\\]/g;

/** Matches non-Unicode letters/numbers (for sanitizeIdentifier) */
export const NON_UNICODE_CHARS = /[^\p{L}\p{N}_$]/gu;

/** Matches leading digit (for sanitizeIdentifier prefix) */
export const LEADING_DIGIT_REGEX = /^(\p{N})/u;

// === Package name patterns ===

/** Matches non-alphanumeric characters except hyphens */
export const NON_ALPHANUMERIC_HYPHEN = /[^a-z0-9-]/gi;

/** Matches multiple consecutive hyphens */
export const MULTIPLE_HYPHENS = /-+/g;

/** Matches leading/trailing hyphens */
export const LEADING_TRAILING_HYPHENS = /^-+|-+$/g;
