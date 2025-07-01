import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { usersTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	// 1. Pastikan pengguna sudah login
	if (!locals.user) {
		throw redirect(302, `/login?redirectTo=${url.pathname}`);
	}

	// 2. Pastikan pengguna terhubung dengan data murid untuk mengakses fitur ini
	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, locals.user.id),
		columns: {
			muridId: true
		}
	});

	if (!user || !user.muridId) {
		// Beri pesan error yang jelas jika tidak terhubung
		throw error(403, 'Akses Ditolak: Akun Anda tidak terhubung dengan data murid untuk melihat data nasyath.');
	}

	// Kembalikan objek kosong. Data akan diambil oleh frontend.
	return {};
};
