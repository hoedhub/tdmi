// src/lib/server/accessControlData.ts
import { db } from '$lib/drizzle';
import {
	rolesTable,
	permissionsTable,
	userRolesTable,
	rolePermissionsTable,
	roleHierarchyTable
} from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';

// =================================================================
// DATA MASTER RBAC
// Inisialisasi data peran, izin, dan hierarki langsung di sini.
// =================================================================

const rolesData = [
	{ id: 'SUPERADMIN', name: 'Super Administrator', description: 'Full access to all system features.' },
	{ id: 'ADMIN', name: 'Administrator', description: 'Manages users and system settings.' },
	{ id: 'PENDATAAN', name: 'Petugas Pendataan', description: 'Manages member data.' },
	{ id: 'NASYATH', name: 'Petugas Nasyath', description: 'Manages activity data.' },
	{ id: 'MEMBER', name: 'Member', description: 'Standard user access.' }
];

const permissionsData = [
    // Admin Permissions
    { id: 'perm-admin-access', name: 'Akses Panel Admin', description: 'Bisa mengakses halaman /admin' },
    { id: 'perm-user-read', name: 'Lihat Pengguna', description: 'Bisa melihat daftar pengguna' },
    { id: 'perm-user-write', name: 'Kelola Pengguna', description: 'Bisa membuat, mengedit, dan menghapus pengguna' },
    { id: 'perm-role-read', name: 'Lihat Peran', description: 'Bisa melihat daftar peran dan izinnya' },
    { id: 'perm-role-write', name: 'Kelola Peran', description: 'Bisa membuat, mengedit, dan menghapus peran' },

    // Pendataan Permissions
    { id: 'perm-pendataan-access', name: 'Akses Pendataan', description: 'Bisa mengakses halaman /member/pendataan' },
    { id: 'perm-murid-read', name: 'Lihat Data Murid', description: 'Bisa melihat data semua murid' },
    { id: 'perm-murid-write', name: 'Kelola Data Murid', description: 'Bisa membuat, mengedit, dan menghapus data murid' },
    { id: 'perm-murid-export', name: 'Ekspor Data Murid', description: 'Bisa mengekspor data murid ke file' },

    // Nasyath Permissions
    { id: 'perm-nasyath-access', name: 'Akses Nasyath', description: 'Bisa mengakses halaman /member/nasyath' },
    { id: 'perm-nasyath-read', name: 'Lihat Data Nasyath', description: 'Bisa melihat data nasyath' },
    { id: 'perm-nasyath-write', name: 'Kelola Data Nasyath', description: 'Bisa membuat, mengedit, dan menghapus data nasyath' },
    { id: 'perm-nasyath-export', name: 'Ekspor Data Nasyath', description: 'Bisa mengekspor data nasyath' },

    // General Member Permissions
    { id: 'perm-profile-read', name: 'Lihat Profil Sendiri', description: 'Bisa melihat halaman profil sendiri' },
    { id: 'perm-profile-write', name: 'Edit Profil Sendiri', description: 'Bisa mengedit profil sendiri' },
];


const roleHierarchyData = [
	{ parent: 'SUPERADMIN', child: 'ADMIN' },
	{ parent: 'ADMIN', child: 'PENDATAAN' },
	{ parent: 'ADMIN', child: 'NASYATH' },
	{ parent: 'PENDATAAN', child: 'MEMBER' },
	{ parent: 'NASYATH', child: 'MEMBER' }
];

// =================================================================
// FUNGSI SEEDING
// =================================================================

export async function seedRbacData() {
	try {
		console.log('Starting RBAC data seeding...');

		// 1. Hapus data lama untuk memastikan kebersihan (opsional, tergantung kebutuhan)
		await db.delete(roleHierarchyTable);
		await db.delete(rolePermissionsTable);
		await db.delete(userRolesTable);
		await db.delete(permissionsTable);
		await db.delete(rolesTable);
		console.log('Old RBAC data cleared.');

		// 2. Masukkan Peran (Roles)
		await db.insert(rolesTable).values(rolesData).onConflictDoNothing();
		console.log('Roles seeded.');

		// 3. Masukkan Izin (Permissions)
		await db.insert(permissionsTable).values(permissionsData).onConflictDoNothing();
		console.log('Permissions seeded.');

		// 4. Tetapkan semua izin ke SUPERADMIN
		const allPermissionIds = permissionsData.map((p) => p.id);
		const superAdminPermissions = allPermissionIds.map((permId) => ({
			roleId: 'SUPERADMIN',
			permissionId: permId
		}));
		await db.insert(rolePermissionsTable).values(superAdminPermissions).onConflictDoNothing();
		console.log('SUPERADMIN permissions seeded.');

        // 5. Tetapkan izin spesifik untuk peran lain
        const otherRolePermissions = [
            // ADMIN
            { roleId: 'ADMIN', permissionId: 'perm-admin-access' },
            { roleId: 'ADMIN', permissionId: 'perm-user-read' },
            { roleId: 'ADMIN', permissionId: 'perm-user-write' },
            { roleId: 'ADMIN', permissionId: 'perm-role-read' },
            { roleId: 'ADMIN', permissionId: 'perm-role-write' },
            // PENDATAAN
            { roleId: 'PENDATAAN', permissionId: 'perm-pendataan-access' },
            { roleId: 'PENDATAAN', permissionId: 'perm-murid-read' },
            { roleId: 'PENDATAAN', permissionId: 'perm-murid-write' },
            { roleId: 'PENDATAAN', permissionId: 'perm-murid-export' },
            // NASYATH
            { roleId: 'NASYATH', permissionId: 'perm-nasyath-access' },
            { roleId: 'NASYATH', permissionId: 'perm-nasyath-read' },
            { roleId: 'NASYATH', permissionId: 'perm-nasyath-write' },
            { roleId: 'NASYATH', permissionId: 'perm-nasyath-export' },
            // MEMBER
            { roleId: 'MEMBER', permissionId: 'perm-profile-read' },
            { roleId: 'MEMBER', permissionId: 'perm-profile-write' },
        ];
        await db.insert(rolePermissionsTable).values(otherRolePermissions).onConflictDoNothing();
        console.log('Other role permissions seeded.');


		// 6. Bangun Hierarki Peran
		const hierarchyToInsert = roleHierarchyData.map((h) => ({
			parentRoleId: h.parent,
			childRoleId: h.child
		}));
		await db.insert(roleHierarchyTable).values(hierarchyToInsert).onConflictDoNothing();
		console.log('Role hierarchy seeded.');

		console.log('RBAC data seeding completed successfully.');
		return { success: true, message: 'RBAC data seeded successfully.' };
	} catch (error) {
		console.error('Error seeding RBAC data:', error);
		return { success: false, message: 'Failed to seed RBAC data.', error };
	}
}

// =================================================================
// FUNGSI UTILITAS (jika diperlukan)
// Contoh: Fungsi untuk menetapkan peran ke pengguna
// =================================================================

export async function assignRoleToUser(userId: string, roleId: string) {
	try {
		await db.insert(userRolesTable).values({ userId, roleId }).onConflictDoNothing();
		console.log(`Role '${roleId}' assigned to user '${userId}'.`);
		return { success: true };
	} catch (error) {
		console.error(`Error assigning role '${roleId}' to user '${userId}':`, error);
		return { success: false, error };
	}
}