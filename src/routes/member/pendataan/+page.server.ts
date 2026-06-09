import { error, redirect } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { muridTable, propTable, kokabTable, kecamatanTable, deskelTable } from '$lib/drizzle/schema';
import { desc, sql, notInArray, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		const [canAccessPendataan, canReadMurid, canWriteMurid] = await Promise.all([
			userHasPermission(locals.user.id, 'perm-pendataan-access'),
			userHasPermission(locals.user.id, 'perm-pendataan-read'),
			userHasPermission(locals.user.id, 'perm-pendataan-write')
		]);

		if (!canAccessPendataan) {
			throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman Pendataan.');
		}

		if (!canReadMurid) {
			throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk melihat data murid.');
		}

		// Fetch recently added (by ID)
		const recentlyAdded = await db
			.select({ id: muridTable.id, nama: muridTable.nama })
			.from(muridTable)
			.orderBy(desc(muridTable.id))
			.limit(3)
			.all();

		const addedIds = recentlyAdded.map((m) => m.id);

		// Fetch recently updated, excluding those already in recentlyAdded
		const recentlyUpdated = await db
			.select({ id: muridTable.id, nama: muridTable.nama, updatedAt: muridTable.updatedAt })
			.from(muridTable)
			.where(notInArray(muridTable.id, addedIds.length > 0 ? addedIds : [0]))
			.orderBy(desc(muridTable.updatedAt))
			.limit(3)
			.all();

		// Fetch murid counts per province for the map with detailed breakdown
		const sebaranRaw = await db
			.select({
				id: propTable.id,
				propinsi: propTable.propinsi,
				total: sql<number>`CAST(COUNT(${muridTable.id}) AS INTEGER)`,
				marhalah1: sql<number>`CAST(COUNT(CASE WHEN ${muridTable.marhalah} = 1 THEN 1 END) AS INTEGER)`,
				marhalah2: sql<number>`CAST(COUNT(CASE WHEN ${muridTable.marhalah} = 2 THEN 1 END) AS INTEGER)`,
				marhalah3: sql<number>`CAST(COUNT(CASE WHEN ${muridTable.marhalah} = 3 THEN 1 END) AS INTEGER)`,
				pria: sql<number>`CAST(COUNT(CASE WHEN ${muridTable.gender} = 1 THEN 1 END) AS INTEGER)`,
				wanita: sql<number>`CAST(COUNT(CASE WHEN ${muridTable.gender} = 0 THEN 1 END) AS INTEGER)`
			})
			.from(propTable)
			.leftJoin(kokabTable, eq(kokabTable.idProp, propTable.id))
			.leftJoin(kecamatanTable, eq(kecamatanTable.idKokab, kokabTable.id))
			.leftJoin(deskelTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
			.leftJoin(muridTable, eq(muridTable.deskelId, deskelTable.id))
			.groupBy(propTable.id, propTable.propinsi)
			.all();

		// Clean the data to ensure numbers
		const sebaranMurid = sebaranRaw.map(s => ({
			...s,
			total: Number(s.total || 0),
			marhalah1: Number(s.marhalah1 || 0),
			marhalah2: Number(s.marhalah2 || 0),
			marhalah3: Number(s.marhalah3 || 0),
			pria: Number(s.pria || 0),
			wanita: Number(s.wanita || 0)
		}));

		return {
			user: locals.user,
			canReadMurid,
			canWriteMurid,
			recentlyAdded,
			recentlyUpdated,
			sebaranMurid,
			totalItems: 0,
			dbError: false
		};
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e && typeof e.status === 'number' && e.status >= 400 && e.status < 500) {
			throw e;
		}
		console.error('Database error in /member/pendataan load:', e);
		return {
			user: locals.user,
			dbError: true,
			message: 'Gagal memuat data halaman: Tidak dapat terhubung ke server.',
			canReadMurid: false,
			canWriteMurid: false,
			recentlyAdded: [],
			recentlyUpdated: [],
			sebaranMurid: [],
			totalItems: 0
		};
	}
};
