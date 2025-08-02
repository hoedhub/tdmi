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
	// 1. Pengecekan pertama: Apakah pengguna sudah login?
	// Logika ini tetap sama dan sudah benar.
	if (!locals.user) {
		throw redirect(302, `/login?redirectTo=${url.pathname}`);
	}

	// 2. Pengecekan kedua: Apakah pengguna yang login punya IZIN untuk mengakses area admin?
	const canAccess = await userHasPermission(locals.user.id, 'perm-admin-access');

	if (!canAccess) {
		// Jika tidak punya izin, hentikan dan tampilkan halaman error.
		throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.');
	}

	// 3. Jika semua pengecekan berhasil, lanjutkan dan berikan data pengguna.
	return {
		user: locals.user
	};
};
