import { describe, it, expect } from 'vitest';
import { safeEvalExpression } from '../utils/safeMath';

describe('safeEvalExpression', () => {
    it('evaluates basic arithmetic', () => {
        expect(safeEvalExpression('2 + 2')).toBe('4');
        expect(safeEvalExpression('10 - 4')).toBe('6');
        expect(safeEvalExpression('3 * 7')).toBe('21');
        expect(safeEvalExpression('20 / 4')).toBe('5');
        expect(safeEvalExpression('10 % 3')).toBe('1');
    });

    it('respects operator precedence', () => {
        expect(safeEvalExpression('2 + 3 * 4')).toBe('14');
        expect(safeEvalExpression('(2 + 3) * 4')).toBe('20');
        expect(safeEvalExpression('10 - 2 * 3 + 1')).toBe('5');
    });

    it('supports unary minus and plus', () => {
        expect(safeEvalExpression('-5 + 3')).toBe('-2');
        expect(safeEvalExpression('-(2 + 3)')).toBe('-5');
        expect(safeEvalExpression('+7')).toBe('7');
    });

    it('supports decimals', () => {
        expect(safeEvalExpression('1.5 + 2.5')).toBe('4');
        expect(safeEvalExpression('.5 * 4')).toBe('2');
    });

    it('concatenates strings like JS when an operand is a string', () => {
        expect(safeEvalExpression("1 + '2'")).toBe('12');
        expect(safeEvalExpression("'a' + 'b'")).toBe('ab');
    });

    it('coerces strings to numbers for multiplication', () => {
        expect(safeEvalExpression("'5' * 2")).toBe('10');
    });

    it('handles whitespace', () => {
        expect(safeEvalExpression('  2   +   2  ')).toBe('4');
    });

    it('returns null for non-arithmetic input', () => {
        expect(safeEvalExpression('alert(1)')).toBeNull();
        expect(safeEvalExpression('fetch("x")')).toBeNull();
        expect(safeEvalExpression('constructor')).toBeNull();
        expect(safeEvalExpression('window')).toBeNull();
        expect(safeEvalExpression('')).toBeNull();
    });

    it('returns null for malformed expressions', () => {
        expect(safeEvalExpression('(2 + 3')).toBeNull();
        expect(safeEvalExpression('2 +')).toBeNull();
        expect(safeEvalExpression('* 2')).toBeNull();
        expect(safeEvalExpression('1.2.3')).toBeNull();
        expect(safeEvalExpression("'unterminated")).toBeNull();
        expect(safeEvalExpression('2 2')).toBeNull();
    });

    it('does not execute code even with quotes and operators', () => {
        // Попытка инъекции через строковый литерал — остаётся строкой
        expect(safeEvalExpression("'; 1 + 1; '")).toBe('; 1 + 1; ');
    });
});
