import { fail, error } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import {
	getAllUsers,
	getAllRoles,
	getAllPermissions,
	getRoleHierarchy,
	getUserRoleMap,
	getRolePermissionMap,
	updateUserRoles,
	createRole,
	updateRole,
	deleteRole,
	updateRolePermissions
} from '$lib/server/accessControlDB';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const canAccess = await userHasPermission(locals.user.id, 'perm-admin-access');
	if (!canAccess) {
		throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengelola RBAC.');
	}

	// Ambil semua data RBAC secara paralel
	const [users, roles, permissions, userRoleMap, rolePermissionMap, roleHierarchy] =
		await Promise.all([
			getAllUsers(),
			getAllRoles(),
			getAllPermissions(),
			getUserRoleMap(),
			getRolePermissionMap(),
			getRoleHierarchy()
		]);

	// Gabungkan data pengguna dengan peran mereka untuk kemudahan tampilan
	const usersWithRoles = users.map((user) => ({
		...user,
		roles: userRoleMap.filter((ur) => ur.userId === user.id).map((ur) => ur.roleId)
	}));

	return {
		users: usersWithRoles,
		roles,
		permissions,
		rolePermissionMap,
		roleHierarchy
	};
};

export const actions: Actions = {
	updateUserRoles: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}
		const canWrite = await userHasPermission(locals.user.id, 'perm-user-write');
		if (!canWrite) {
			return fail(403, { message: 'Akses ditolak. Anda tidak memiliki izin untuk mengubah peran pengguna.' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const selectedRoles = formData.getAll('roles') as string[];

		if (!userId) {
			return fail(400, { message: 'User ID tidak valid.' });
		}

		try {
			await updateUserRoles(userId, selectedRoles);
			return { success: true, message: `Peran untuk pengguna ${userId} berhasil diperbarui.` };
		} catch (e) {
			console.error('Gagal memperbarui peran pengguna:', e);
			return fail(500, { message: 'Gagal memperbarui peran di server.' });
		}
	},

	createRole: async ({ request, locals }) => {
		if (!locals.user) throw error(401);
		const canWrite = await userHasPermission(locals.user.id, 'perm-role-write');
		if (!canWrite) return fail(403, { message: 'Akses ditolak.' });

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		const errors: { [key: string]: string[] } = {};
		if (!id || id.length < 3) errors.id = ['ID harus minimal 3 karakter'];
		if (id && !/^[a-z0-9-]+$/.test(id)) errors.id = ['ID hanya boleh berisi huruf kecil, angka, dan tanda hubung.'];
		if (!name || name.length < 3) errors.name = ['Nama harus minimal 3 karakter'];

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		try {
			await createRole({ id, name, description });
			return { success: true, message: `Peran "${name}" berhasil dibuat.`, action: 'createRole' };
		} catch (e) {
			return fail(500, { message: 'Gagal membuat peran. ID mungkin sudah ada.' });
		}
	},

	updateRole: async ({ request, locals }) => {
		if (!locals.user) throw error(401);
		const canWrite = await userHasPermission(locals.user.id, 'perm-role-write');
		if (!canWrite) return fail(403, { message: 'Akses ditolak.' });

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		if (!name || name.length < 3) {
			return fail(400, { errors: { name: ['Nama harus minimal 3 karakter'] } });
		}

		try {
			await updateRole(id, { name, description });
			return { success: true, message: `Peran "${name}" berhasil diperbarui.` };
		} catch (e) {
			return fail(500, { message: 'Gagal memperbarui peran.' });
		}
	},

	deleteRole: async ({ request, locals }) => {
		if (!locals.user) throw error(401);
		const canWrite = await userHasPermission(locals.user.id, 'perm-role-write');
		if (!canWrite) return fail(403, { message: 'Akses ditolak.' });

		const formData = await request.formData();
		const roleId = formData.get('id') as string;

		if (!roleId) {
			return fail(400, { message: 'Role ID tidak valid.' });
		}

		try {
			await deleteRole(roleId);
			return { success: true, message: `Peran ${roleId} berhasil dihapus.`, action: 'deleteRole' };
		} catch (e) {
			console.error(`Gagal menghapus peran ${roleId}:`, e);
			return fail(500, { message: 'Gagal menghapus peran di server.' });
		}
	},

	updateRolePermissions: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}
		const canWrite = await userHasPermission(locals.user.id, 'perm-role-write');
		if (!canWrite) {
			return fail(403, { message: 'Akses ditolak. Anda tidak memiliki izin untuk mengubah izin peran.' });
		}

		const formData = await request.formData();
		const roleId = formData.get('roleId') as string;
		const selectedPermissions = formData.getAll('permissions') as string[];

		if (!roleId) {
			return fail(400, { message: 'Role ID tidak valid.' });
		}

		try {
			await updateRolePermissions(roleId, selectedPermissions);
			return { success: true, message: `Izin untuk peran ${roleId} berhasil diperbarui.` };
		} catch (e) {
			console.error('Gagal memperbarui izin peran:', e);
			return fail(500, { message: 'Gagal memperbarui izin di server.' });
		}
	},

	updateUsersForRole: async ({ request, locals }) => {
		if (!locals.user) throw error(401);
		const canWrite = await userHasPermission(locals.user.id, 'perm-user-write');
		if (!canWrite) return fail(403, { message: 'Akses ditolak.' });

		const formData = await request.formData();
		const roleId = formData.get('roleId') as string;
		const userIds = formData.getAll('userIds') as string[];

		if (!roleId) {
			return fail(400, { message: 'Role ID tidak valid.' });
		}

		try {
			await updateUsersForRole(roleId, userIds);
			return { success: true, message: `Keanggotaan peran ${roleId} berhasil diperbarui.` };
		} catch (e) {
			console.error(`Gagal memperbarui pengguna untuk peran ${roleId}:`, e);
			return fail(500, { message: 'Gagal memperbarui keanggotaan peran.' });
		}
	}
};
