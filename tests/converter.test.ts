import { describe, it, expect } from 'vitest';
import { emojiToIcon, convertEmojis, getSupportedEmojis } from '../src/utils/converter';

describe('converter', () => {
    describe('emojiToIcon', () => {
        it('should convert valid emojis to lucide icons', () => {
            expect(emojiToIcon('🤖', 'lucide')).toBe('bot');
            expect(emojiToIcon('🔥', 'lucide')).toBe('flame');
        });

        it('should return undefined for unknown emojis', () => {
            expect(emojiToIcon('🤷', 'lucide')).toBeUndefined();
        });

        it('should convert valid emojis to heroicons', () => {
            expect(emojiToIcon('🤖', 'heroicons')).toBe('CpuChipIcon');
            expect(emojiToIcon('🔥', 'heroicons')).toBe('FireIcon');
        });

        // We can add more tests for other styles later, e.g. heroicons
        // assuming similar structure, but I'll stick to lucide for now as I've verified it.
    });

    describe('getSupportedEmojis', () => {
        it('should return an array of supported emojis for a style', () => {
            const emojis = getSupportedEmojis('lucide');
            expect(Array.isArray(emojis)).toBe(true);
            expect(emojis.length).toBeGreaterThan(0);
            expect(emojis).toContain('🤖');
        });

        it('should return empty keys for invalid style (handled by typescript but runtime safe check)', () => {
            // @ts-ignore
            const emojis = getSupportedEmojis('invalid');
            // based on implementation: Object.keys(mappings[style] || {})
            expect(emojis).toEqual([]);
        });
    });

    describe('convertEmojis', () => {
        it('should replace emojis with icon placeholders', () => {
            const result = convertEmojis('Hello 🤖 world', 'lucide');
            expect(result).toBe('Hello <bot> world');
        });

        it('should replace multiple emojis', () => {
            const result = convertEmojis('🔥 code 🤖', 'lucide');
            expect(result).toBe('<flame> code <bot>');
        });

        it('should handle text with no emojis', () => {
            const result = convertEmojis('Just text', 'lucide');
            expect(result).toBe('Just text');
        });

        it('should handle sequential emojis', () => {
            // '🔥' -> 'flame', '🤖' -> 'bot'
            const result = convertEmojis('🔥🤖', 'lucide');
            expect(result).toBe('<flame><bot>');
        });
    });
});
