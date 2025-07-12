import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { usersTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { userHasPermission } from '$lib/server/accessControl';

export const load: PageServerLoad = async ({ locals, url }) => {
	// 1. Pastikan pengguna sudah login
	if (!locals.user) {
		throw redirect(302, `/login?redirectTo=${url.pathname}`);
	}

	// 2. Periksa apakah pengguna memiliki izin untuk melihat semua nasyath (admin)
	const canReadAll = await userHasPermission(locals.user.id, 'perm-nasyath-read');

	// 3. Jika bukan admin, pastikan pengguna terhubung dengan data murid
	if (!canReadAll) {
		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, locals.user.id),
			columns: {
				muridId: true
			}
		});

		if (!user || !user.muridId) {
			throw error(
				403,
				'Akses Ditolak: Akun Anda tidak terhubung dengan data murid untuk melihat data nasyath.'
			);
		}
	}

	// 4. Kembalikan data ke frontend
	return { canReadAll };
};
