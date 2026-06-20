import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import {
	muridTable,
	deskelTable,
	kecamatanTable,
	kokabTable,
	propTable
} from '$lib/drizzle/schema';
import { eq, asc, aliasedTable } from 'drizzle-orm';
import { userHasPermission } from '$lib/server/accessControl';
import ExcelJS from 'exceljs';

const mursyidAlias = aliasedTable(muridTable, 'mursyid');
const baiatAlias = aliasedTable(muridTable, 'baiat');
const wiridAlias = aliasedTable(muridTable, 'wirid');
const muhrimAlias = aliasedTable(muridTable, 'muhrim');

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const canRead = await userHasPermission(locals.user.id, 'perm-pendataan-access');
	if (!canRead) {
		throw error(403, 'Akses Ditolak.');
	}

	try {
		const data = await db
			.select({
				id: muridTable.id,
				nama: muridTable.nama,
				namaArab: muridTable.namaArab,
				gender: muridTable.gender,
				nik: muridTable.nik,
				tglLahir: muridTable.tglLahir,
				alamat: muridTable.alamat,
				nomorTelepon: muridTable.nomorTelepon,
				qari: muridTable.qari,
				marhalah: muridTable.marhalah,
				aktif: muridTable.aktif,
				partisipasi: muridTable.partisipasi,
				deskel: deskelTable.deskel,
				kecamatan: kecamatanTable.kecamatan,
				kokab: kokabTable.kokab,
				propinsi: propTable.propinsi,
				mursyidNama: mursyidAlias.nama,
				baiatNama: baiatAlias.nama,
				wiridNama: wiridAlias.nama,
				muhrimNama: muhrimAlias.nama
			})
			.from(muridTable)
			.leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
			.leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
			.leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
			.leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
			.leftJoin(mursyidAlias, eq(muridTable.mursyidId, mursyidAlias.id))
			.leftJoin(baiatAlias, eq(muridTable.baiatId, baiatAlias.id))
			.leftJoin(wiridAlias, eq(muridTable.wiridId, wiridAlias.id))
			.leftJoin(muhrimAlias, eq(muridTable.muhrimId, muhrimAlias.id))
			.orderBy(asc(muridTable.nama))
			.all() as Array<{
				id: number;
				nama: string;
				namaArab: string | null;
				gender: boolean;
				nik: string | null;
				tglLahir: string | null;
				alamat: string | null;
				nomorTelepon: string | null;
				qari: boolean;
				marhalah: number;
				aktif: boolean;
				partisipasi: boolean;
				deskel: string | null;
				kecamatan: string | null;
				kokab: string | null;
				propinsi: string | null;
				mursyidNama: string | null;
				baiatNama: string | null;
				wiridNama: string | null;
				muhrimNama: string | null;
			}>;

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Data Murid');

		worksheet.autoFilter = {
			from: { row: 1, column: 1 },
			to: { row: 1, column: 17 }
		};

		const headerRow = worksheet.getRow(1);
		headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
		headerRow.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF4472C4' }
		};
		headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

		const columns: { header: string; key: string; width: number }[] = [
			{ header: 'Nama', key: 'nama', width: 30 },
			{ header: 'Nama Arab', key: 'namaArab', width: 25 },
			{ header: 'Jenis Kelamin', key: 'gender', width: 15 },
			{ header: 'NIK', key: 'nik', width: 20 },
			{ header: 'Tanggal Lahir', key: 'tglLahir', width: 15 },
			{ header: 'Provinsi', key: 'propinsi', width: 20 },
			{ header: 'Kabupaten/Kota', key: 'kokab', width: 20 },
			{ header: 'Kecamatan', key: 'kecamatan', width: 20 },
			{ header: 'Desa/Kelurahan', key: 'deskel', width: 20 },
			{ header: 'Alamat', key: 'alamat', width: 30 },
			{ header: 'Nomor Telepon', key: 'nomorTelepon', width: 18 },
			{ header: 'Mursyid', key: 'mursyidNama', width: 25 },
			{ header: 'Baiat', key: 'baiatNama', width: 25 },
			{ header: 'Wirid', key: 'wiridNama', width: 25 },
			{ header: 'Muhrim', key: 'muhrimNama', width: 25 },
			{ header: 'Status Qari', key: 'qari', width: 15 },
			{ header: 'Marhalah', key: 'marhalah', width: 10 },
			{ header: 'Aktif', key: 'aktif', width: 10 },
			{ header: 'Partisipasi', key: 'partisipasi', width: 12 }
		];
		worksheet.columns = columns;

		for (const row of data) {
			worksheet.addRow({
				nama: row.nama,
				namaArab: row.namaArab || '',
				gender: row.gender ? 'Laki-laki' : 'Perempuan',
				nik: row.nik || '',
				tglLahir: row.tglLahir || '',
				propinsi: row.propinsi || '',
				kokab: row.kokab || '',
				kecamatan: row.kecamatan || '',
				deskel: row.deskel || '',
				alamat: row.alamat || '',
				nomorTelepon: row.nomorTelepon || '',
				mursyidNama: row.mursyidNama || '',
				baiatNama: row.baiatNama || '',
				wiridNama: row.wiridNama || '',
				muhrimNama: row.muhrimNama || '',
				qari: row.qari ? 'Qāri\'/Qāri\'ah' : 'Ghairu Qāri\'/Qāri\'ah',
				marhalah: row.marhalah,
				aktif: row.aktif ? 'Ya' : 'Tidak',
				partisipasi: row.partisipasi ? 'Ya' : 'Tidak'
			});
		}

		const fileName = `pendataan-murid-${new Date().toISOString().split('T')[0]}.xlsx`;
		const buffer = await workbook.xlsx.writeBuffer();

		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'Content-Disposition': `attachment; filename="${fileName}"`
			}
		});
	} catch (e) {
		console.error('Error exporting murid data:', e);
		throw error(500, 'Gagal mengekspor data karena kesalahan server.');
	}
};
