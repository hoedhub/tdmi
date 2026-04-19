import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const muridId = parseInt(params.muridId, 10);
	if (isNaN(muridId)) {
		throw error(400, 'Invalid Murid ID');
	}

	const results = await db
		.select({
			id: muridTable.id,
			nama: muridTable.nama
		})
		.from(muridTable)
		.where(eq(muridTable.id, muridId))
		.limit(1);

	if (!results || results.length === 0) {
		throw error(404, 'Murid tidak ditemukan');
	}

	return {
		murid: results[0]
	};
};
