import { error } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import { getAllUsers } from '$lib/server/accessControlDB';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// 1. Periksa izin untuk mengakses halaman
	const canRead = await userHasPermission(locals.user.id, 'perm-piket-read');
	if (!canRead) {
		throw error(403, 'Akses ditolak. Anda tidak memiliki izin untuk melihat halaman ini.');
	}

	// 2. Periksa izin untuk melakukan aksi tulis (buat/edit/hapus)
	const canWrite = await userHasPermission(locals.user.id, 'perm-piket-write');

	// 3. Ambil data yang diperlukan untuk form (hanya users)
	const users = await getAllUsers();

	// 4. Kirim data dan flag izin ke komponen Svelte
	return {
		users,
		permissions: {
			canWrite
		}
	};
};
