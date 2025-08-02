import { db } from '$lib/drizzle';
import { usersTable, rolesTable, userRolesTable } from '$lib/drizzle/schema';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { count, eq } from 'drizzle-orm';

// --- Impor dari service database RBAC ---
import { userHasPermission } from '$lib/server/accessControl'; // File utama pemeriksa izin
import { getAllRoles, getRoleHierarchy, updateUserRoles } from '$lib/server/accessControlDB'; // File data akses DB

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const canReadUsers = await userHasPermission(locals.user.id, 'perm-user-read');
	if (!canReadUsers) {
		throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk melihat data pengguna.');
	}

	// Data fetching is moved to the client-side to improve resilience.
	return {
		// Pass the current user for potential client-side checks (e.g., cannot delete self)
		user: locals.user,
		// Initial empty state, client will fetch the real data.
		users: [],
		totalItems: 0,
		allRoles: [],
		roleHierarchy: []
	};
};

export const actions: Actions = {
	updateUserRoles: async ({ request, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');
		// Periksa apakah pengguna memiliki izin untuk mengubah data pengguna.
		const canWriteUsers = await userHasPermission(locals.user.id, 'perm-user-write');
		if (!canWriteUsers) {
			return fail(403, {
				message: 'Akses Ditolak. Anda tidak memiliki izin untuk mengubah peran pengguna.'
			});
		}

		const data = await request.formData();
		const userId = data.get('userId')?.toString();
		const selectedRoles = data.getAll('roles').map(String);

		if (!userId) {
			return fail(400, { message: 'User ID dibutuhkan.' });
		}

		try {
			await updateUserRoles(userId, selectedRoles);
			return { success: true, message: `Peran untuk pengguna ${userId} berhasil diperbarui.` };
		} catch (e) {
			console.error(`Error updating roles for user ${userId}:`, e);
			return fail(500, { message: `Gagal memperbarui peran untuk pengguna ${userId}.` });
		}
	}
};
