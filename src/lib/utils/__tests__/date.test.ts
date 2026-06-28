import { describe, it, expect } from 'vitest';
import { formatDateShort } from '../date';

describe('formatDateShort', () => {
	it('formats a Date object as DD/MM/YYYY', () => {
		const date = new Date(2023, 0, 15); // Jan 15, 2023
		expect(formatDateShort(date)).toBe('15/01/2023');
	});

	it('formats a date string as DD/MM/YYYY', () => {
		expect(formatDateShort('2023-06-20T00:00:00Z')).toBe('20/06/2023');
	});

	it('returns "-" for null', () => {
		expect(formatDateShort(null)).toBe('-');
	});

	it('returns "-" for undefined', () => {
		expect(formatDateShort(undefined)).toBe('-');
	});

	it('returns "-" for invalid date string', () => {
		expect(formatDateShort('not-a-date')).toBe('-');
	});

	it('pads single-digit day and month with leading zero', () => {
		const date = new Date(2023, 2, 5); // Mar 5, 2023
		expect(formatDateShort(date)).toBe('05/03/2023');
	});
});
