import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { muridTable, deskelTable, kecamatanTable, kokabTable, propTable, nasyathTable } from '$lib/drizzle/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { getPublicFileUrl } from '$lib/server/cloudinary';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Verify user is logged in
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const muridId = parseInt(params.muridId, 10);
	if (isNaN(muridId)) {
		throw error(400, 'Invalid Murid ID');
	}

	// Define aliases for self-joins
	const muhrim = alias(muridTable, 'muhrim');
	const mursyid = alias(muridTable, 'mursyid');
	const baiat = alias(muridTable, 'baiat');
	const wirid = alias(muridTable, 'wirid');

	try {
		// Fetch main murid data with relations
		const results = await db
			.select({
				murid: muridTable,
				deskelName: deskelTable.deskel,
				kecamatanName: kecamatanTable.kecamatan,
				kokabName: kokabTable.kokab,
				propinsiName: propTable.propinsi,
				muhrimName: muhrim.nama,
				mursyidName: mursyid.nama,
				baiatName: baiat.nama,
				wiridName: wirid.nama,
				muhrimMarhalah: muhrim.marhalah,
				mursyidMarhalah: mursyid.marhalah,
				baiatMarhalah: baiat.marhalah,
				wiridMarhalah: wirid.marhalah,
				muhrimQari: muhrim.qari,
				mursyidQari: mursyid.qari,
				baiatQari: baiat.qari,
				wiridQari: wirid.qari
			})
			.from(muridTable)
			.leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
			.leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
			.leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
			.leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
			.leftJoin(muhrim, eq(muridTable.muhrimId, muhrim.id))
			.leftJoin(mursyid, eq(muridTable.mursyidId, mursyid.id))
			.leftJoin(baiat, eq(muridTable.baiatId, baiat.id))
			.leftJoin(wirid, eq(muridTable.wiridId, wirid.id))
			.where(eq(muridTable.id, muridId))
			.limit(1);

		if (!results || results.length === 0) {
			throw error(404, 'Murid tidak ditemukan');
		}

		// Also fetch some recent nasyath (activities) for this murid
		const nasyathResults = await db
			.select()
			.from(nasyathTable)
			.where(eq(nasyathTable.muridId, muridId))
			.orderBy(desc(nasyathTable.tanggalMulai))
			.limit(5);

		// Fetch mustarsyad: murid whose mursyidId = this murid
		// Include subquery to check if each mustarsyad also has their own mustarsyad
		const mustarsyadList = await db
			.select({
				id: muridTable.id,
				nama: muridTable.nama,
				gender: muridTable.gender,
				nomorTelepon: muridTable.nomorTelepon,
				tglLahir: muridTable.tglLahir,
				qari: muridTable.qari,
				marhalah: muridTable.marhalah,
				aktif: muridTable.aktif,
				partisipasi: muridTable.partisipasi,
				hasMustarsyad: sql<number>`(SELECT COUNT(*) FROM murid AS sub WHERE sub.mursyid_id = murid.id)`.as('has_mustarsyad')
			})
			.from(muridTable)
			.where(eq(muridTable.mursyidId, muridId))
			.orderBy(asc(muridTable.nama));

		// Permissions
		// Assuming we can derive basic permissions here
		// The parent layout usually provides this, but we can pass it down if needed.
		// For simplicity, we assume if they can reach here, they have read access.

		let fotoUrl: string | null = null;
		if (results[0].murid.fotoPublicId) {
			fotoUrl = getPublicFileUrl(results[0].murid.fotoPublicId);
		}

		return {
			detail: {
				...results[0],
				fotoUrl
			},
			recentNasyath: nasyathResults,
			mustarsyadList
		};
	} catch (err) {
		console.error('Error fetching murid detail:', err);
		if ((err as any).status === 404) throw err;
		throw error(500, 'Gagal mengambil detail data murid');
	}
};
