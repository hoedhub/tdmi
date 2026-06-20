import type { RequestHandler } from './$types';
import ExcelJS from 'exceljs';

export const GET: RequestHandler = async () => {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Template Data Murid');

	worksheet.autoFilter = {
		from: { row: 1, column: 1 },
		to: { row: 1, column: 19 }
	};

	const headerRow = worksheet.getRow(1);
	headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
	headerRow.fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: 'FF4472C4' }
	};
	headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

	const columns: { header: string; key: string; width: number; note?: string }[] = [
		{ header: 'Nama', key: 'nama', width: 30, note: 'Wajib diisi' },
		{ header: 'Nama Arab', key: 'namaArab', width: 25 },
		{ header: 'Jenis Kelamin', key: 'gender', width: 15, note: 'Laki-laki / Perempuan' },
		{ header: 'NIK', key: 'nik', width: 20, note: '16 digit angka' },
		{ header: 'Tanggal Lahir', key: 'tglLahir', width: 15, note: 'YYYY-MM-DD' },
		{ header: 'Provinsi', key: 'propinsi', width: 20, note: 'Nama provinsi' },
		{ header: 'Kabupaten/Kota', key: 'kokab', width: 20, note: 'Nama kabupaten/kota' },
		{ header: 'Kecamatan', key: 'kecamatan', width: 20, note: 'Nama kecamatan' },
		{ header: 'Desa/Kelurahan', key: 'deskel', width: 20, note: 'Nama desa/kelurahan' },
		{ header: 'Alamat', key: 'alamat', width: 30 },
		{ header: 'Nomor Telepon', key: 'nomorTelepon', width: 18 },
		{ header: 'Mursyid', key: 'mursyidNama', width: 25, note: 'Nama mursyid' },
		{ header: 'Baiat', key: 'baiatNama', width: 25, note: 'Nama pembaiat' },
		{ header: 'Wirid', key: 'wiridNama', width: 25, note: 'Nama pewirid' },
		{ header: 'Muhrim', key: 'muhrimNama', width: 25, note: 'Khusus perempuan' },
		{ header: 'Status Qari', key: 'qari', width: 15, note: 'Qari / Ghairu' },
		{ header: 'Marhalah', key: 'marhalah', width: 10, note: '1 / 2 / 3' },
		{ header: 'Aktif', key: 'aktif', width: 10, note: 'Ya / Tidak' },
		{ header: 'Partisipasi', key: 'partisipasi', width: 12, note: 'Ya / Tidak' }
	];
	worksheet.columns = columns;

	columns.forEach((col, i) => {
		if (col.note) {
			const cell = worksheet.getCell(1, i + 1);
			cell.note = col.note;
		}
	});

	const buffer = await workbook.xlsx.writeBuffer();

	return new Response(buffer, {
		status: 200,
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment; filename="template-import-murid.xlsx"'
		}
	});
};
