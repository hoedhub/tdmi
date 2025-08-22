import { error, redirect } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import type { PageServerLoad } from './$types';

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

		return {
			user: locals.user,
			canReadMurid,
			canWriteMurid,
			totalItems: 0,
			dbError: false
		};
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e && typeof e.status === 'number' && e.status >= 400 && e.status < 500) {
			throw e;
		}
		console.error('Database error in /member/pendataan load:', e);
		return {
			user: locals.user, // Still return user data if available
			dbError: true,
			message: 'Gagal memuat data halaman: Tidak dapat terhubung ke server.'
		};
	}
};
