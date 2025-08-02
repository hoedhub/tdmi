import { Argon2id } from 'oslo/password';
import { db } from '$lib/drizzle';
import { usersTable, muridTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { userHasPermission } from '$lib/server/accessControl';
import { getAllRoles, updateUserRoles, getRoleHierarchy } from '$lib/server/accessControlDB';
import { generateId } from 'lucia';

export const load: PageServerLoad = async ({ locals }) => {
	// Pengecekan izin
	if (!locals.user) throw redirect(302, `/login`);
	const canWriteUsers = await userHasPermission(locals.user.id, 'perm-user-write');
	if (!canWriteUsers) {
		throw error(403, 'Akses Ditolak');
	}

	const [allRoles, allMurids, roleHierarchy] = await Promise.all([
		getAllRoles(),
		db.select({ id: muridTable.id, nama: muridTable.nama }).from(muridTable),
		getRoleHierarchy()
	]);

	return {
		allAvailableRoles: allRoles,
		allMurids,
		roleHierarchy
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		// Pengecekan izin
		if (!locals.user) throw error(401, 'Unauthorized');
		const canWriteUsers = await userHasPermission(locals.user.id, 'perm-user-write');
		if (!canWriteUsers) {
			return fail(403, { message: 'Akses Ditolak' });
		}

		const formData = await request.formData();

		// --- Ambil username dan password---
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
		const active = formData.has('active');
		const muridIdStr = formData.get('muridId') as string;
		const selectedRoles = formData.getAll('roles').map(String);

		let formState = { username, selectedRoles, active, muridIdStr, message: '' };

		// Validasi baru untuk username dan password
		if (!username || username.length < 3) {
			return fail(400, { ...formState, message: 'Username minimal 3 karakter.' });
		}
		if (!password || password.length < 6) {
			return fail(400, { ...formState, message: 'Password minimal 6 karakter.' });
		}

		// Cek jika username sudah ada
		const existingUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.username, username)
		});
		if (existingUser) {
			return fail(400, { ...formState, message: 'Username sudah digunakan.' });
		}

		let muridId: number | null = null;
		if (muridIdStr) {
			const parsedId = parseInt(muridIdStr, 10);
			if (isNaN(parsedId)) {
				return fail(400, { ...formState, message: 'Murid ID tidak valid.' });
			}
			muridId = parsedId;
		}

		try {
			const userId = generateId(15); // Buat ID unik untuk user baru
			const passwordHash = await new Argon2id().hash(password);

			// 1. Buat pengguna di usersTable
			await db.insert(usersTable).values({
				id: userId,
				username,
				passwordHash,
				active,
				muridId
			});
			// 2. Tetapkan peran di userRolesTable (jika ada yang dipilih)
			if (selectedRoles.length > 0) {
				await updateUserRoles(userId, selectedRoles); // Fungsi ini bisa kita gunakan kembali!
			}
		} catch (e: any) {
			console.error('Error creating user:', e);
			return fail(500, { ...formState, message: e.message || 'Gagal membuat pengguna.' });
		}

		throw redirect(303, '/admin/users');
	}
};
