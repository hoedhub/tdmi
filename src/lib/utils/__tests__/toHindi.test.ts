import { describe, it, expect } from 'vitest';
import { toHindi } from '../toHindi';

describe('toHindi', () => {
	it('converts Arabic digits to Hindi (Arabic-Indic) digits', () => {
		expect(toHindi('0123456789')).toBe('٠١٢٣٤٥٦٧٨٩');
	});

	it('converts a number to Hindi digits', () => {
		expect(toHindi(42)).toBe('٤٢');
	});

	it('returns "-" for null', () => {
		expect(toHindi(null)).toBe('-');
	});

	it('returns "-" for undefined', () => {
		expect(toHindi(undefined)).toBe('-');
	});

	it('preserves non-digit characters', () => {
		expect(toHindi('Level 3')).toBe('Level ٣');
	});

	it('handles string with no digits', () => {
		expect(toHindi('hello')).toBe('hello');
	});

	it('handles zero', () => {
		expect(toHindi(0)).toBe('٠');
	});
});
