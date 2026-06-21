import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { userHasPermission } from '$lib/server/accessControl';
import { db } from '$lib/drizzle';
import { muridTable, deskelTable, kecamatanTable, kokabTable, propTable } from '$lib/drizzle/schema';
import { eq, like, and, sql } from 'drizzle-orm';
import ExcelJS from 'exceljs';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');
	const canAccess = await userHasPermission(locals.user.id, 'perm-pendataan-access');
	if (!canAccess) throw error(403, 'Akses Ditolak.');
	const canWrite = await userHasPermission(locals.user.id, 'perm-pendataan-write');
	if (!canWrite) throw error(403, 'Anda tidak memiliki izin untuk menulis data murid.');
};

const MAX_SIZE = 100 * 1024 * 1024;
const SAMPLE_SIZE = 25;

function normalize(v: string | undefined | null): string {
	return (v || '').trim().toLowerCase();
}

function parseGender(v: string): boolean | null {
	const n = normalize(v);
	if (n === 'laki-laki' || n === 'laki' || n === 'pria' || n === 'true' || n === '1') return true;
	if (n === 'perempuan' || n === 'wanita' || n === 'false' || n === '0') return false;
	return null;
}

function parseBoolean(v: string): boolean | null {
	const n = normalize(v);
	if (n === 'ya' || n === 'aktif' || n === 'true' || n === '1' || n === 'qari' || n === "qāri'" || n === "qari'ah") return true;
	if (n === 'tidak' || n === 'nonaktif' || n === 'false' || n === '0' || n === 'ghairu') return false;
	return null;
}

function getCellText(cell: ExcelJS.Cell): string {
	const v = cell.value;
	if (v === null || v === undefined) return '';
	if (typeof v === 'object') {
		if ('result' in v) {
			const r = v.result;
			if (r === null || r === undefined) return '';
			return String(r).trim();
		}
		return '';
	}
	return String(v).trim();
}

function flattenRows(ws: ExcelJS.Worksheet): { rowNum: number; cells: string[] }[] {
	let maxCol = 0;
	ws.eachRow((row) => {
		row.eachCell((_cell, colNumber) => { if (colNumber > maxCol) maxCol = colNumber; });
	});
	if (maxCol === 0) maxCol = 1;

	const rows: { rowNum: number; cells: string[] }[] = [];
	ws.eachRow((row, rowNumber) => {
		const cells: string[] = [];
		for (let i = 1; i <= maxCol; i++) {
			const cell = row.getCell(i);
			cells.push(getCellText(cell));
		}
		rows.push({ rowNum: rowNumber, cells });
	});
	return rows;
}

function getHeaders(ws: ExcelJS.Worksheet): string[] {
	// Find the actual max column used in the ENTIRE sheet
	let maxCol = 0;
	ws.eachRow((row) => {
		row.eachCell((_c, colNumber) => { if (colNumber > maxCol) maxCol = colNumber; });
	});
	if (maxCol === 0) maxCol = 1;

	const row = ws.getRow(1);
	const headers: string[] = [];
	for (let i = 1; i <= maxCol; i++) {
		const cell = row.getCell(i);
		headers.push(getCellText(cell));
	}
	return headers;
}

const columnAliases: Record<string, string> = {
	'nama': 'nama',
	'nama arab': 'namaArab',
	'jenis kelamin': 'gender',
	'gender': 'gender',
	'nik': 'nik',
	'tanggal lahir': 'tglLahir',
	'tgl lahir': 'tglLahir',
	'provinsi': 'propinsi',
	'kabupaten/kota': 'kokab',
	'kabupaten': 'kokab',
	'kota': 'kokab',
	'kecamatan': 'kecamatan',
	'desa/kelurahan': 'deskel',
	'desa': 'deskel',
	'kelurahan': 'deskel',
	'alamat': 'alamat',
	'nomor telepon': 'nomorTelepon',
	'telepon': 'nomorTelepon',
	'mursyid': 'mursyidNama',
	'baiat': 'baiatNama',
	'wirid': 'wiridNama',
	'muhrim': 'muhrimNama',
	'status qari': 'qari',
	'qari': 'qari',
	'marhalah': 'marhalah',
	'aktif': 'aktif',
	'partisipasi': 'partisipasi'
};

function colLetter(n: number): string {
	let s = '';
	let i = n;
	while (i >= 0) {
		s = String.fromCharCode(65 + (i % 26)) + s;
		i = Math.floor(i / 26) - 1;
	}
	return s;
}

function detectMapping(headers: string[]): Record<string, string> {
	const m: Record<string, string> = {};
	headers.forEach((h, i) => {
		const field = columnAliases[normalize(h)];
		if (field && !m[field]) m[field] = colLetter(i);
	});
	return m;
}

async function lookupDeskelId(propinsi: string, kokab: string, kecamatan: string, deskel: string): Promise<number | null> {
	if (!propinsi || !kokab || !kecamatan || !deskel) return null;
	const prop = await db.select({ id: propTable.id }).from(propTable).where(like(propTable.propinsi, `%${normalize(propinsi)}%`)).get();
	if (!prop) return null;
	const kab = await db.select({ id: kokabTable.id }).from(kokabTable).where(and(eq(kokabTable.idProp, prop.id), like(kokabTable.kokab, `%${normalize(kokab)}%`))).get();
	if (!kab) return null;
	const kec = await db.select({ id: kecamatanTable.id }).from(kecamatanTable).where(and(eq(kecamatanTable.idKokab, kab.id), like(kecamatanTable.kecamatan, `%${normalize(kecamatan)}%`))).get();
	if (!kec) return null;
	const des = await db.select({ id: deskelTable.id }).from(deskelTable).where(and(eq(deskelTable.idKecamatan, kec.id), like(deskelTable.deskel, `%${normalize(deskel)}%`))).get();
	return des?.id ?? null;
}

async function lookupMuridId(nama: string): Promise<number | null> {
	if (!nama) return null;
	const m = await db.select({ id: muridTable.id }).from(muridTable).where(like(muridTable.nama, `%${normalize(nama)}%`)).get();
	return m?.id ?? null;
}

async function getWorkbook(file: File): Promise<ExcelJS.Workbook> {
	if (file.size > MAX_SIZE) throw new Error('File terlalu besar. Maksimal 100MB.');
	const ext = file.name.split('.').pop()?.toLowerCase();
	if (!['xlsx', 'xls', 'csv'].includes(ext || '')) throw new Error('Format file harus .xlsx, .xls, atau .csv.');
	const buf = await file.arrayBuffer();
	const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buf); return wb;
}

function parseWorksheet(ws: ExcelJS.Worksheet, hasHeader: boolean, dataStartRow: number): {
	headers: string[];
	dataRows: { rowNum: number; cells: string[] }[];
} {
	const all = flattenRows(ws);
	if (hasHeader) {
		const headers = all[0]?.cells || [];
		const dataRows = all.slice(dataStartRow - 1);
		return { headers, dataRows };
	} else {
		const maxCols = Math.max(1, ...all.map((r) => r.cells.length));
		const headers = Array.from({ length: maxCols }, (_, i) => `Kolom ${i + 1}`);
		const dataRows = all.slice(dataStartRow - 1);
		return { headers, dataRows };
	}
}

function buildColumnIndex(mapping: Record<string, string>): Record<string, number> {
	const colIdx: Record<string, number> = {};
	for (const [field, value] of Object.entries(mapping)) {
		if (value && value !== 'default') {
			let idx = 0;
			for (const c of value.toUpperCase()) {
				idx = idx * 26 + (c.charCodeAt(0) - 64);
			}
			colIdx[field] = idx - 1;
		}
	}
	return colIdx;
}

export const actions: Actions = {
	upload: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { errors: { _form: ['Unauthorized'] } });
		const fd = await request.formData();
		const file = fd.get('file') as File | null;
		if (!file || file.size === 0) return fail(400, { errors: { _form: ['File tidak ditemukan.'] } });

		try {
			const wb = await getWorkbook(file);
			const sheets = wb.worksheets.map((ws, i) => {
				const headers = getHeaders(ws);
				const all = flattenRows(ws);
				const sampleRows = all.slice(0, SAMPLE_SIZE).map((r) => ({ rowNum: r.rowNum, cells: r.cells }));
				const detectedMapping = detectMapping(headers);
				return { index: i, name: ws.name || `Sheet${i + 1}`, headers, sampleRows, detectedMapping };
			});
			return { uploaded: true as const, sheets };
		} catch (e: any) {
			return fail(400, { errors: { _form: [e.message || 'Gagal memproses file.'] } });
		}
	},

	preview: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { errors: { _form: ['Unauthorized'] } });
		const fd = await request.formData();
		const file = fd.get('file') as File | null;
		if (!file) return fail(400, { errors: { _form: ['File tidak ditemukan.'] } });

		const sheetIndex = parseInt(fd.get('sheetIndex')?.toString() || '0');
		const mappingRaw = fd.get('mapping')?.toString();
		const customValuesRaw = fd.get('customValues')?.toString() || '{}';
		const dataStartRow = parseInt(fd.get('dataStartRow')?.toString() || '2');
		const hasHeader = dataStartRow > 1;

		if (!mappingRaw) return fail(400, { errors: { _form: ['Mapping kolom tidak ditemukan.'] } });

		let mapping: Record<string, string>, customValues: Record<string, string>;
		try { mapping = JSON.parse(mappingRaw); } catch { return fail(400, { errors: { _form: ['Format mapping tidak valid.'] } }); }
		try { customValues = JSON.parse(customValuesRaw); } catch { customValues = {}; }

		try {
			const wb = await getWorkbook(file);
			const ws = wb.worksheets[sheetIndex];
			if (!ws) return fail(400, { errors: { _form: ['Sheet tidak ditemukan.'] } });

			const { headers, dataRows } = parseWorksheet(ws, hasHeader, dataStartRow);
			const totalRows = dataRows.length;
			const colIdx = buildColumnIndex(mapping);

			const getVal = (row: typeof dataRows[0], field: string): string => {
				if (customValues[field]) return customValues[field];
				const v = mapping[field];
				if (!v || v === 'default' || v === '__custom__') return '';
				const idx = colIdx[field];
				return idx !== undefined ? (row.cells[idx] || '').trim() : '';
			};

			const errorRows: { row: number; errors: { field: string; message: string }[] }[] = [];
			let validCount = 0, errorCount = 0;

			for (const row of dataRows) {
				const errs: { field: string; message: string }[] = [];

				const nama = getVal(row, 'nama');
				if (!nama || nama.length < 2) errs.push({ field: 'nama', message: 'Nama wajib diisi (minimal 2 karakter).' });

				const nik = getVal(row, 'nik');
				if (nik && !/^\d{16}$/.test(nik)) errs.push({ field: 'nik', message: 'NIK harus 16 digit angka.' });

				const tgl = getVal(row, 'tglLahir');
				if (tgl && !/^\d{4}-\d{2}-\d{2}$/.test(tgl)) errs.push({ field: 'tglLahir', message: 'Format tanggal lahir harus YYYY-MM-DD.' });

				const telp = getVal(row, 'nomorTelepon');
				if (telp && telp.length < 8) errs.push({ field: 'nomorTelepon', message: 'Nomor telepon minimal 8 digit.' });

				const mr = getVal(row, 'marhalah');
				if (mr) { const m = parseInt(mr); if (![1, 2, 3].includes(m)) errs.push({ field: 'marhalah', message: 'Marhalah harus 1, 2, atau 3.' }); }

				if (errs.length === 0) {
					const prop = getVal(row, 'propinsi'), kab = getVal(row, 'kokab'), kec = getVal(row, 'kecamatan'), des = getVal(row, 'deskel');
					if (des && prop && kab && kec) {
						const did = await lookupDeskelId(prop, kab, kec, des);
						if (!did) errs.push({ field: 'deskel', message: 'Wilayah tidak ditemukan. Periksa nama provinsi/kabupaten/kecamatan/desa.' });
					}

					const ms = getVal(row, 'mursyidNama');
					if (ms && !await lookupMuridId(ms)) errs.push({ field: 'mursyidNama', message: `Mursyid "${ms}" tidak ditemukan.` });
					const ba = getVal(row, 'baiatNama');
					if (ba && !await lookupMuridId(ba)) errs.push({ field: 'baiatNama', message: `Baiat "${ba}" tidak ditemukan.` });
					const wi = getVal(row, 'wiridNama');
					if (wi && !await lookupMuridId(wi)) errs.push({ field: 'wiridNama', message: `Wirid "${wi}" tidak ditemukan.` });
					const mu = getVal(row, 'muhrimNama');
					if (mu && !await lookupMuridId(mu)) errs.push({ field: 'muhrimNama', message: `Muhrim "${mu}" tidak ditemukan.` });
				}

				if (errs.length > 0) { errorCount++; errorRows.push({ row: row.rowNum, errors: errs }); }
				else validCount++;
			}

			return { preview: true as const, headers, mapping, totalRows, validCount, errorCount, errorRows };
		} catch (e: any) {
			return fail(400, { errors: { _form: [e.message || 'Gagal memproses file.'] } });
		}
	},

	import: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { errors: { _form: ['Unauthorized'] } });
		const fd = await request.formData();
		const file = fd.get('file') as File | null;
		if (!file) return fail(400, { errors: { _form: ['File tidak ditemukan.'] } });
		if (fd.get('confirmed') !== 'true') return fail(400, { errors: { _form: ['Konfirmasi diperlukan.'] } });

		const sheetIndex = parseInt(fd.get('sheetIndex')?.toString() || '0');
		const mappingRaw = fd.get('mapping')?.toString();
		const customValuesRaw = fd.get('customValues')?.toString() || '{}';
		const dataStartRow = parseInt(fd.get('dataStartRow')?.toString() || '2');
		const hasHeader = dataStartRow > 1;

		if (!mappingRaw) return fail(400, { errors: { _form: ['Mapping kolom tidak ditemukan.'] } });

		let mapping: Record<string, string>, customValues: Record<string, string>;
		try { mapping = JSON.parse(mappingRaw); } catch { return fail(400, { errors: { _form: ['Format mapping tidak valid.'] } }); }
		try { customValues = JSON.parse(customValuesRaw); } catch { customValues = {}; }

		try {
			const wb = await getWorkbook(file);
			const ws = wb.worksheets[sheetIndex];
			if (!ws) return fail(400, { errors: { _form: ['Sheet tidak ditemukan.'] } });

			const { headers, dataRows } = parseWorksheet(ws, hasHeader, dataStartRow);
			const colIdx = buildColumnIndex(mapping);

			const getVal = (row: typeof dataRows[0], field: string): string => {
				if (customValues[field]) return customValues[field];
				const v = mapping[field];
				if (!v || v === 'default' || v === '__custom__') return '';
				const idx = colIdx[field];
				return idx !== undefined ? (row.cells[idx] || '').trim() : '';
			};

			const importErrors: { row: number; message: string }[] = [];
			let importedCount = 0;

			// Backup tabel murid sebelum import
			const ts = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
			const backupTable = `murid_backup_${ts}`;
			await db.run(sql.raw(`CREATE TABLE IF NOT EXISTS ${backupTable} AS SELECT * FROM murid`));

			for (const row of dataRows) {
				const nama = getVal(row, 'nama');
				if (!nama || nama.length < 2) { importErrors.push({ row: row.rowNum, message: 'Nama tidak valid.' }); continue; }

				const nik = getVal(row, 'nik');
				if (nik && !/^\d{16}$/.test(nik)) { importErrors.push({ row: row.rowNum, message: `NIK "${nik}" tidak valid (harus 16 digit).` }); continue; }

				let marhalah: 1 | 2 | 3 = 1;
				const mr = getVal(row, 'marhalah');
				if (mr) { const m = parseInt(mr); if (m === 1 || m === 2 || m === 3) marhalah = m; }

				if (nik) {
					const dup = await db.select({ id: muridTable.id }).from(muridTable).where(eq(muridTable.nik, nik)).get();
					if (dup) { importErrors.push({ row: row.rowNum, message: `NIK ${nik} sudah terdaftar (ID: ${dup.id}).` }); continue; }
				}

				try {
					await db.insert(muridTable).values({
						nama,
						namaArab: getVal(row, 'namaArab') || null,
						gender: parseGender(getVal(row, 'gender')) ?? true,
						nik: nik || null,
						tglLahir: getVal(row, 'tglLahir') || null,
						alamat: getVal(row, 'alamat') || null,
						nomorTelepon: getVal(row, 'nomorTelepon') || null,
						qari: parseBoolean(getVal(row, 'qari')) ?? true,
						marhalah,
						aktif: parseBoolean(getVal(row, 'aktif')) ?? true,
						partisipasi: parseBoolean(getVal(row, 'partisipasi')) ?? true,
						deskelId: await lookupDeskelId(
							getVal(row, 'propinsi'), getVal(row, 'kokab'),
							getVal(row, 'kecamatan'), getVal(row, 'deskel')
						),
						mursyidId: await lookupMuridId(getVal(row, 'mursyidNama')),
						baiatId: await lookupMuridId(getVal(row, 'baiatNama')),
						wiridId: await lookupMuridId(getVal(row, 'wiridNama')),
						muhrimId: await lookupMuridId(getVal(row, 'muhrimNama')),
						updaterId: locals.user.id
					} as any);
					importedCount++;
				} catch (e: any) {
					importErrors.push({ row: row.rowNum, message: e.message || 'Gagal menyimpan.' });
				}
			}

			const rollbackSQL = [
				`DELETE FROM murid;`,
				`INSERT INTO murid SELECT * FROM ${backupTable};`,
				`DROP TABLE IF EXISTS ${backupTable};`
			].join('\n');

			return { success: true as const, importedCount, failedCount: dataRows.length - importedCount, importErrors, backupTable, rollbackSQL };
		} catch (e: any) {
			return fail(400, { errors: { _form: [e.message || 'Gagal memproses file.'] } });
		}
	}
};
