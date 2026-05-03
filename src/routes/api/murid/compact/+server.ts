import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import {
	muridTable,
	deskelTable,
	kecamatanTable,
	kokabTable,
	propTable
} from '$lib/drizzle/schema';
import { asc, eq } from 'drizzle-orm';
import { userHasPermission } from '$lib/server/accessControl';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Permission check (using pendataan access as proxy for basic read)
	const canRead = await userHasPermission(locals.user.id, 'perm-pendataan-access');
	if (!canRead) {
		return json({ error: 'Access denied' }, { status: 403 });
	}

	try {
		// Fetch ID, Nama, and address components
		const rawMurids = await db
			.select({
				id: muridTable.id,
				nama: muridTable.nama,
				alamat: muridTable.alamat,
				deskel: deskelTable.deskel,
				kecamatan: kecamatanTable.kecamatan,
				kokab: kokabTable.kokab,
				propinsi: propTable.propinsi
			})
			.from(muridTable)
			.leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
			.leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
			.leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
			.leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
			.orderBy(asc(muridTable.nama))
			.all();

		// Flatten address into a single string for minimal cache storage
		const murids = rawMurids.map((m) => ({
			id: m.id,
			nama: m.nama,
			alamat: [m.alamat, m.deskel, m.kecamatan, m.kokab, m.propinsi].filter(Boolean).join(', ') || null
		}));

		return json({ murids });
	} catch (error) {
		console.error('Error fetching compact murids:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
