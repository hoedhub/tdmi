import { userHasPermission } from '$lib/server/accessControl';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	// Jika tidak ada user, load function di layout sudah melakukan redirect,
	// tapi kita tetap bisa menambahkan pengecekan di sini untuk keamanan.
	if (!user) {
		return {
			canCreateBackup: false
		};
	}

	const canCreateBackup = await userHasPermission(user.id, 'perm-backup-create');

	return {
		canCreateBackup
	};
};
