import { describe, it, expect } from 'vitest';
// 簡単な関数をテスト
function add(a, b) {
    return a + b;
}
function multiply(a, b) {
    return a * b;
}
describe('Simple Math Tests', () => {
    it('should add two numbers correctly', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
        expect(add(0, 0)).toBe(0);
    });
    it('should multiply two numbers correctly', () => {
        expect(multiply(2, 3)).toBe(6);
        expect(multiply(-1, 5)).toBe(-5);
        expect(multiply(0, 10)).toBe(0);
    });
    it('should handle edge cases', () => {
        expect(add(1.5, 2.5)).toBe(4);
        expect(multiply(0.5, 2)).toBe(1);
    });
});
//# sourceMappingURL=simple.test.js.map