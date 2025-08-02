import { error } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Periksa izin untuk nasyath
	const hasAccess = userHasPermission(locals.user.id, 'perm-nasyath-access');

	if (!hasAccess) {
		throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman Nasyath.');
	}

	return {
		message: 'Selamat datang di halaman Nasyath. Akses diberikan.'
	};
};
