import { describe, it, expect } from 'vitest';
import {
	calculateAge,
	renderReferencedMurid,
	formatMuridGender,
	formatMuridMarhalah,
	formatMuridAlamat,
	formatMuridBoolean
} from '../formatMurid';

describe('calculateAge', () => {
	it('returns null for null input', () => {
		expect(calculateAge(null)).toBeNull();
	});

	it('returns null for empty string', () => {
		expect(calculateAge('')).toBeNull();
	});

	it('calculates age correctly when birthday has passed this year', () => {
		// Mock today's date
		const today = new Date();
		const birthYear = today.getFullYear() - 25;
		const birthDate = `${birthYear}-01-01`;
		expect(calculateAge(birthDate)).toBe(25);
	});

	it('calculates age correctly when birthday has not yet passed this year', () => {
		const today = new Date();
		const birthYear = today.getFullYear() - 30;
		const birthDate = `${birthYear}-12-31`;
		// If today is before Dec 31, age should be 29; if today is Dec 31 or later, 30
		const expected = today.getMonth() === 11 && today.getDate() >= 31 ? 30 : 29;
		expect(calculateAge(birthDate)).toBe(expected);
	});
});

describe('renderReferencedMurid', () => {
	it('returns "-" for null name', () => {
		expect(renderReferencedMurid(null, 3, true)).toBe('-');
	});

	it('returns plain escaped name for normal murid', () => {
		expect(renderReferencedMurid('Ahmad', 3, true)).toBe('Ahmad');
	});

	it('wraps in warning tooltip for low marhalah (< 3)', () => {
		const result = renderReferencedMurid('Ahmad', 2, true);
		expect(result).toContain('tooltip-warning');
		expect(result).toContain('Ahmad');
		expect(result).toContain('Belum Marhalah 3');
	});

	it('wraps in warning tooltip for ghoiru qari', () => {
		const result = renderReferencedMurid('Ahmad', 3, false);
		expect(result).toContain('tooltip-warning');
		expect(result).toContain('Ghoiru Qari');
	});

	it('wraps in warning tooltip for both low marhalah and ghoiru qari', () => {
		const result = renderReferencedMurid('Ahmad', 1, false);
		expect(result).toContain('Belum Marhalah 3');
		expect(result).toContain('Ghoiru Qari');
	});

	it('escapes HTML in name', () => {
		const result = renderReferencedMurid('<script>alert("xss")</script>', 3, true);
		expect(result).not.toContain('<script>');
		expect(result).toContain('&lt;script&gt;');
	});
});

describe('formatMuridGender', () => {
	it('returns "Pria" for true', () => {
		expect(formatMuridGender(true)).toBe('Pria');
	});

	it('returns "Wanita" for false', () => {
		expect(formatMuridGender(false)).toBe('Wanita');
	});
});

describe('formatMuridMarhalah', () => {
	it('returns string representation of marhalah', () => {
		expect(formatMuridMarhalah(1)).toBe('1');
		expect(formatMuridMarhalah(2)).toBe('2');
		expect(formatMuridMarhalah(3)).toBe('3');
	});
});

describe('formatMuridAlamat', () => {
	it('joins address parts with comma separator', () => {
		const row = {
			alamat: 'Jl. Merdeka 10',
			deskelName: 'Sukamaju',
			kecamatanName: 'Coblong',
			kokabName: 'Bandung',
			propinsiName: 'Jawa Barat'
		};
		expect(formatMuridAlamat(row)).toBe('Jl. Merdeka 10, Sukamaju, Coblong, Bandung, Jawa Barat');
	});

	it('filters out null/undefined/empty parts', () => {
		const row = {
			alamat: 'Jl. Merdeka 10',
			deskelName: null,
			kecamatanName: undefined,
			kokabName: '',
			propinsiName: 'Jawa Barat'
		};
		expect(formatMuridAlamat(row)).toBe('Jl. Merdeka 10, Jawa Barat');
	});

	it('returns empty string when all parts are empty', () => {
		const row = {
			alamat: null,
			deskelName: null,
			kecamatanName: null,
			kokabName: null,
			propinsiName: null
		};
		expect(formatMuridAlamat(row)).toBe('');
	});
});

describe('formatMuridBoolean', () => {
	it('returns "Ya" for true', () => {
		expect(formatMuridBoolean(true)).toBe('Ya');
	});

	it('returns "Tidak" for false', () => {
		expect(formatMuridBoolean(false)).toBe('Tidak');
	});
});
