import { describe, it, expect } from 'vitest';
import { toTitleCase } from '../string';

describe('toTitleCase', () => {
	it('converts a lowercase string to title case', () => {
		expect(toTitleCase('hello world')).toBe('Hello World');
	});

	it('handles a single word', () => {
		expect(toTitleCase('javascript')).toBe('Javascript');
	});

	it('handles already title-cased input', () => {
		expect(toTitleCase('Hello World')).toBe('Hello World');
	});

	it('handles mixed case', () => {
		expect(toTitleCase('hELLO wORLD')).toBe('Hello World');
	});

	it('handles empty string', () => {
		expect(toTitleCase('')).toBe('');
	});

	it('handles multiple spaces between words', () => {
		expect(toTitleCase('hello   world')).toBe('Hello   World');
	});
});
