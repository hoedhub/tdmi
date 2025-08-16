import { error } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import { getAllUsers } from '$lib/server/accessControlDB';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// 1. Pastikan pengguna memiliki sesi
	if (!locals.user) {
		throw error(401, 'Tidak terautentikasi');
	}

	// 2. Periksa izin untuk membuat jadwal
	const canWrite = await userHasPermission(locals.user.id, 'perm-piket-write');
	if (!canWrite) {
		throw error(403, 'Akses ditolak: Anda tidak memiliki izin untuk menyusun jadwal piket.');
	}

	// 3. Ambil semua data pengguna untuk ditampilkan di form
	const users = await getAllUsers();

	// 4. Kirim data pengguna ke komponen Svelte
	return {
		users
	};
};
