import { db } from '$lib/drizzle';
import { usersTable, rolesTable, userRolesTable } from '$lib/drizzle/schema';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { sql, count, eq } from 'drizzle-orm';

// --- DIUBAH: Impor dari service database RBAC ---
import { userHasPermission } from '$lib/server/accessControl'; // File utama pemeriksa izin
import {
    getAllRoles,
    getRoleHierarchy,
    updateUserRoles
} from '$lib/server/accessControlDB'; // File data akses DB

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    const canReadUsers = await userHasPermission(locals.user.id, 'perm-user-read');
    if (!canReadUsers) {
        throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk melihat data pengguna.');
    }

    try {
        // --- Query Manual yang Sudah Diperbaiki ---

        // 1. Definisikan query manual dengan JOIN menggunakan NAMA PROPERTI JS
        const usersAndRolesQuery = db
            .select({
                id: usersTable.id,
                username: usersTable.username,
                active: usersTable.active,
                muridId: usersTable.muridId,
                createdAt: usersTable.createdAt,
                roleId: rolesTable.id
            })
            .from(usersTable)
            // --- DIUBAH DI SINI: Gunakan 'userId' bukan 'user_id' ---
            .leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
            // --- DIUBAH DI SINI: Gunakan 'roleId' bukan 'role_id' ---
            .leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .orderBy(usersTable.username);

        // 2. Definisikan query lainnya
        const otherQueries = Promise.all([
            db.select({ totalCount: count() }).from(usersTable),
            getAllRoles(),
            getRoleHierarchy()
        ]);

        // 3. Jalankan semua query secara bersamaan
        const [usersAndRoles, [countResult, allRoles, roleHierarchy]] = await Promise.all([
            usersAndRolesQuery,
            otherQueries
        ]);

        // 4. Proses hasil query manual (logika ini sudah benar)
        const usersMap = new Map();
        usersAndRoles.forEach(row => {
            if (!usersMap.has(row.id)) {
                usersMap.set(row.id, {
                    id: row.id,
                    username: row.username,
                    active: row.active,
                    muridId: row.muridId,
                    createdAt: row.createdAt,
                    assignedRoles: []
                });
            }
            if (row.roleId) {
                usersMap.get(row.id).assignedRoles.push(row.roleId);
            }
        });

        const usersForClient = Array.from(usersMap.values());

        // --- DIUBAH DI SINI: Akses properti 'totalCount' dari objek hasil ---
        return {
            users: usersForClient,
            totalItems: countResult[0].totalCount, // <-- Ambil dari countResult
            allRoles,
            roleHierarchy
        };

    } catch (e) {
        console.error("Error fetching users:", e);
        throw error(500, "Gagal memuat pengguna karena kesalahan server.");
    }
};

export const actions: Actions = {
    updateUserRoles: async ({ request, locals }) => {
        // --- DIUBAH: Pengecekan izin yang lebih baik ---
        if (!locals.user) throw error(401, 'Unauthorized');
        // Periksa apakah pengguna memiliki izin untuk mengubah data pengguna.
        const canWriteUsers = await userHasPermission(locals.user.id, 'perm-user-write');
        if (!canWriteUsers) {
            return fail(403, { message: 'Akses Ditolak. Anda tidak memiliki izin untuk mengubah peran pengguna.' });
        }

        const data = await request.formData();
        const userId = data.get('userId')?.toString();
        const selectedRoles = data.getAll('roles').map(String);

        if (!userId) {
            return fail(400, { message: 'User ID dibutuhkan.' });
        }

        try {
            // --- DIUBAH: Gunakan fungsi update berbasis database ---
            await updateUserRoles(userId, selectedRoles);
            return { success: true, message: `Peran untuk pengguna ${userId} berhasil diperbarui.` };
        } catch (e) {
            console.error(`Error updating roles for user ${userId}:`, e);
            return fail(500, { message: `Gagal memperbarui peran untuk pengguna ${userId}.` });
        }
    }
};