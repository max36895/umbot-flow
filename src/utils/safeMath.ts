/**
 * Безопасное вычисление арифметических выражений без eval().
 *
 * Поддерживаются: числа (целые и дробные), строки в одинарных/двойных кавычках,
 * операторы + - * / %, скобки, унарный минус/плюс.
 * Семантика близка к JS: `2 + 2` → `4`, `1 + '2'` → `12` (конкатенация),
 * `'5' * 2` → `10`.
 *
 * Любой вход, не являющийся валидным арифметическим выражением
 * (буквы, идентификаторы, незакрытые скобки и т.п.), возвращает null —
 * вызывающий код сам решает, что делать с исходной строкой.
 */

type Value = number | string;

interface Token {
    type: 'number' | 'string' | 'op' | 'lparen' | 'rparen';
    value: string;
}

/** Разбивает выражение на токены. Возвращает null при недопустимом символе. */
function tokenize(expr: string): Token[] | null {
    const tokens: Token[] = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr.charAt(i);
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        if (ch === '(') {
            tokens.push({ type: 'lparen', value: ch });
            i++;
            continue;
        }
        if (ch === ')') {
            tokens.push({ type: 'rparen', value: ch });
            i++;
            continue;
        }
        if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%') {
            tokens.push({ type: 'op', value: ch });
            i++;
            continue;
        }
        if (ch === "'" || ch === '"') {
            const quote = ch;
            let j = i + 1;
            let content = '';
            while (j < expr.length && expr.charAt(j) !== quote) {
                content += expr.charAt(j);
                j++;
            }
            if (j >= expr.length) return null; // незакрытая кавычка
            tokens.push({ type: 'string', value: content });
            i = j + 1;
            continue;
        }
        if (/[0-9.]/.test(ch)) {
            let j = i;
            while (j < expr.length && /[0-9.]/.test(expr.charAt(j))) j++;
            const raw = expr.slice(i, j);
            // Отсекаем "1.2.3" и одиночную точку
            if (!/^(\d+\.?\d*|\.\d+)$/.test(raw)) return null;
            tokens.push({ type: 'number', value: raw });
            i = j;
            continue;
        }
        return null; // недопустимый символ (буквы, идентификаторы и т.п.)
    }
    return tokens;
}

function toNumber(v: Value): number {
    return typeof v === 'number' ? v : Number(v);
}

/** Сложение: если хотя бы один операнд строка — конкатенация (семантика JS). */
function add(a: Value, b: Value): Value {
    if (typeof a === 'string' || typeof b === 'string') {
        return String(a) + String(b);
    }
    return a + b;
}

/** Рекурсивный нисходящий парсер с приоритетами операторов. */
class Parser {
    private pos = 0;

    constructor(private readonly tokens: Token[]) {}

    parse(): Value | null {
        if (this.tokens.length === 0) return null;
        const value = this.parseExpr();
        // После выражения не должно остаться «лишних» токенов
        if (value === null || this.pos !== this.tokens.length) return null;
        return value;
    }

    private peek(): Token | undefined {
        return this.tokens[this.pos];
    }

    private next(): Token | undefined {
        return this.tokens[this.pos++];
    }

    /** expr := term (('+' | '-') term)* */
    private parseExpr(): Value | null {
        let left = this.parseTerm();
        if (left === null) return null;
        for (;;) {
            const tok = this.peek();
            if (tok?.type === 'op' && (tok.value === '+' || tok.value === '-')) {
                this.next();
                const right = this.parseTerm();
                if (right === null) return null;
                left = tok.value === '+' ? add(left, right) : toNumber(left) - toNumber(right);
            } else {
                break;
            }
        }
        return left;
    }

    /** term := factor (('*' | '/' | '%') factor)* */
    private parseTerm(): Value | null {
        let left = this.parseFactor();
        if (left === null) return null;
        for (;;) {
            const tok = this.peek();
            if (
                tok?.type === 'op' &&
                (tok.value === '*' || tok.value === '/' || tok.value === '%')
            ) {
                this.next();
                const right = this.parseFactor();
                if (right === null) return null;
                const a = toNumber(left);
                const b = toNumber(right);
                left = tok.value === '*' ? a * b : tok.value === '/' ? a / b : a % b;
            } else {
                break;
            }
        }
        return left;
    }

    /** factor := ('+' | '-') factor | primary */
    private parseFactor(): Value | null {
        const tok = this.peek();
        if (tok?.type === 'op' && (tok.value === '+' || tok.value === '-')) {
            this.next();
            const v = this.parseFactor();
            if (v === null) return null;
            return tok.value === '-' ? -toNumber(v) : toNumber(v);
        }
        return this.parsePrimary();
    }

    /** primary := NUMBER | STRING | '(' expr ')' */
    private parsePrimary(): Value | null {
        const tok = this.next();
        if (!tok) return null;
        if (tok.type === 'number') return Number(tok.value);
        if (tok.type === 'string') return tok.value;
        if (tok.type === 'lparen') {
            const v = this.parseExpr();
            if (v === null) return null;
            const close = this.next();
            if (close?.type !== 'rparen') return null;
            return v;
        }
        return null;
    }
}

/**
 * Вычисляет арифметическое выражение.
 * Возвращает строковый результат либо null, если вход — не валидная арифметика.
 */
export function safeEvalExpression(expr: string): string | null {
    const tokens = tokenize(expr);
    if (!tokens) return null;
    const result = new Parser(tokens).parse();
    if (result === null) return null;
    return String(result);
}
