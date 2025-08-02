import { db } from '$lib/drizzle';
import { json } from '@sveltejs/kit';
import { deskelTable, kecamatanTable, kokabTable, propTable } from '$lib/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET({ url }) {
	const deskelId = Number(url.searchParams.get('deskelId'));

	if (!deskelId || isNaN(deskelId)) {
		return json({ error: 'deskelId tidak valid' }, { status: 400 });
	}

	try {
		// Menggunakan satu query JOIN untuk mendapatkan semua data sekaligus
		const result = await db
			.select({
				deskel: deskelTable,
				kecamatan: kecamatanTable,
				kokab: kokabTable,
				propinsi: propTable
			})
			.from(deskelTable)
			.where(eq(deskelTable.id, deskelId))
			.innerJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
			.innerJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
			.innerJoin(propTable, eq(kokabTable.idProp, propTable.id));

		if (result.length === 0) {
			return json({ error: 'Wilayah tidak ditemukan' }, { status: 404 });
		}

		// Karena kita juga butuh list untuk dropdown, kita ambil list di level yang sama
		const [kokabList, kecamatanList, deskelList] = await Promise.all([
			db.select().from(kokabTable).where(eq(kokabTable.idProp, result[0].propinsi.id)),
			db.select().from(kecamatanTable).where(eq(kecamatanTable.idKokab, result[0].kokab.id)),
			db.select().from(deskelTable).where(eq(deskelTable.idKecamatan, result[0].kecamatan.id))
		]);

		return json({
			selectedPropinsi: result[0].propinsi,
			selectedKokab: result[0].kokab,
			selectedKecamatan: result[0].kecamatan,
			// List untuk mengisi dropdown
			kokabList,
			kecamatanList,
			deskelList
		});
	} catch (e) {
		console.error('Error fetching wilayah by deskel:', e);
		return json({ error: 'Gagal mengambil data wilayah' }, { status: 500 });
	}
}
