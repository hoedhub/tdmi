import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { userHasPermission } from '$lib/server/accessControl'; // <-- Impor fungsi RBAC kita
import { afterNavigate } from '$app/navigation';
import { retryCount } from '$lib/stores';

// afterNavigate berjalan setiap kali navigasi selesai.
afterNavigate(({ from, to }) => {
	// Kita hanya ingin mereset jika ini adalah navigasi ke halaman baru,
	// BUKAN saat halaman error yang sama dimuat ulang.
	// Halaman error tidak memiliki 'route.id' yang sama dengan halaman tujuan.
	if (to?.route.id !== from?.route.id) {
		retryCount.set(0);
	}
});

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/login?redirectTo=${url.pathname}`);
	}

	try {
		const canAccess = await userHasPermission(locals.user.id, 'perm-admin-access');

		if (!canAccess) {
			throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.');
		}

		const [canManagePiket, canCreateBackup] = await Promise.all([
			userHasPermission(locals.user.id, 'perm-piket-read'),
			userHasPermission(locals.user.id, 'perm-backup-create')
		]);

		return {
			user: locals.user,
			canManagePiket,
			canCreateBackup
		};
	} catch (e) {
		// Check if it's a controlled error from our logic (like 403)
		if (e && typeof e === 'object' && 'status' in e && e.status === 403) {
			throw e; // Re-throw the specific 403 error
		}
		// Handle unexpected/database errors
		console.error(`Database error in admin layout load for user ${locals.user.id}:`, e);
		throw error(503, 'Gagal memuat data admin: Server tidak dapat dihubungi.');
	}
};
