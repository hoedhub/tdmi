import { error, redirect } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Periksa izin untuk nasyath
	const hasAccess = await userHasPermission(locals.user.id, 'perm-nasyath-access');

	if (!hasAccess) {
		throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman Nasyath.');
	}

	return {
		message: 'Selamat datang di halaman Nasyath. Akses diberikan.'
	};
};
