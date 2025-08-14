// src/lib/server/accessControlData.ts
import { db } from '$lib/drizzle';
import {
	rolesTable,
	permissionsTable,
	userRolesTable,
	rolePermissionsTable,
	roleHierarchyTable
} from '$lib/drizzle/schema';

// =================================================================
// DATA MASTER RBAC - DISINKRONKAN DENGAN DATABASE AKTUAL
// =================================================================

const rolesData = [
	{ id: 'role-admin', name: 'Admin', description: 'First level user: Admin' },
	{ id: 'role-naib', name: 'Naib', description: 'First level user: Naib' },
	{ id: 'role-wakil-naib', name: 'Wakil Naib', description: 'First level user: Wakil Naib' },
	{ id: 'role-legalitas', name: 'Legalitas', description: 'Second level user: Legalitas' },
	{ id: 'role-maaliyah', name: 'Maaliyah', description: 'Second level user: Maaliyah' },
	{ id: 'role-nasyath', name: 'Nasyath', description: 'Second level user: Nasyath' },
	{ id: 'role-pendataan', name: 'Pendataan', description: 'Second level user: Pendataan' },
	{
		id: 'role-legalitas-propinsi',
		name: 'Legalitas Propinsi',
		description: 'Third level user: Legalitas scoped to Propinsi'
	},
	{
		id: 'role-maaliyah-propinsi',
		name: 'Maaliyah Propinsi',
		description: 'Third level user: Maaliyah scoped to Propinsi'
	},
	{
		id: 'role-nasyath-propinsi',
		name: 'Nasyath Propinsi',
		description: 'Third level user: Nasyath scoped to Propinsi'
	},
	{
		id: 'role-pendataan-propinsi',
		name: 'Pendataan Propinsi',
		description: 'Third level user: Pendataan scoped to Propinsi'
	},
	{ id: 'role-manager', name: 'Manager', description: 'General Manager' },
	{ id: 'role-editor', name: 'Editor', description: 'General Editor' },
	{ id: 'role-viewer', name: 'Viewer', description: 'General Viewer' },
	{
		id: 'role-territory-manager',
		name: 'Territory Manager',
		description: 'Territory Manager'
	},
	{ id: 'role-territory-editor', name: 'Territory Editor', description: 'Territory Editor' },
	{
		id: 'role-piket-admin',
		name: 'Piket Admin',
		description: 'Peran untuk mengelola jadwal dan administrasi piket'
	},
	{
		id: 'role-piket-manager',
		name: "Manajer Ruasa'",
		description: "Peran untuk mengelola jadwal ruasa'"
	}
];

const permissionsData = [
	{ id: 'perm-user-read', name: 'Read Users', description: 'Allows reading user data' },
	{
		id: 'perm-user-write',
		name: 'Write Users',
		description: 'Allows creating/updating/deleting user data'
	},
	{ id: 'perm-role-read', name: 'Read Roles', description: 'Allows reading role data' },
	{
		id: 'perm-role-write',
		name: 'Write Roles',
		description: 'Allows creating/updating/deleting role data'
	},
	{
		id: 'perm-territory-read',
		name: 'Read Territories',
		description: 'Allows reading territory data'
	},
	{
		id: 'perm-data-read-all',
		name: 'Read All Data',
		description: 'Allows reading all application data'
	},
	{
		id: 'perm-data-write-scoped',
		name: 'Write Scoped Data',
		description: 'Allows writing data within assigned scope/territory'
	},
	{
		id: 'perm-pendataan-access',
		name: 'Access Pendataan',
		description: 'Allows access to Pendataan section'
	},
	{
		id: 'perm-nasyath-access',
		name: 'Access Nasyath',
		description: 'Allows access to Nasyath section'
	},
	{
		id: 'perm-admin-access',
		name: 'Access Admin Area',
		description: 'Allows access to the admin dashboard and menus'
	},
	{
		id: 'perm-pendataan-write',
		name: 'Write Pendataan',
		description: 'Allows creating/updating/deleting pendataan/muriddata'
	},
	{
		id: 'perm-pendataan-read',
		name: 'Read Pendataan',
		description: 'Allows reading pendataan/murid data'
	},
	{ id: 'perm-nasyath-read', name: 'Write Nasyath', description: 'Allows writing data to Nasyath' },
	{
		id: 'perm-piket-read',
		name: "Lihat Jadwal Ruasa'",
		description: "Bisa melihat halaman manajemen jadwal ruasa'"
	},
	{
		id: 'perm-piket-write',
		name: "Kelola Jadwal Ruasa'",
		description: "Bisa membuat, mengedit, dan menghapus jadwal ruasa'"
	},
	// --- IZIN BARU UNTUK BACKUP ---
	{
		id: 'perm-backup-create',
		name: 'Buat Backup',
		description: 'Bisa membuat dan mengunduh backup database'
	}
];

const roleHierarchyData = [
	{ parent: 'role-admin', child: 'role-naib' },
	{ parent: 'role-admin', child: 'role-wakil-naib' },
	{ parent: 'role-naib', child: 'role-legalitas' },
	{ parent: 'role-naib', child: 'role-maaliyah' },
	{ parent: 'role-naib', child: 'role-nasyath' },
	{ parent: 'role-naib', child: 'role-pendataan' },
	{ parent: 'role-wakil-naib', child: 'role-legalitas' },
	{ parent: 'role-wakil-naib', child: 'role-maaliyah' },
	{ parent: 'role-wakil-naib', child: 'role-nasyath' },
	{ parent: 'role-wakil-naib', child: 'role-pendataan' },
	{ parent: 'role-legalitas', child: 'role-legalitas-propinsi' },
	{ parent: 'role-maaliyah', child: 'role-maaliyah-propinsi' },
	{ parent: 'role-nasyath', child: 'role-nasyath-propinsi' },
	{ parent: 'role-pendataan', child: 'role-pendataan-propinsi' },
	{ parent: 'role-admin', child: 'role-piket-admin' }
];

// =================================================================
// FUNGSI SEEDING
// =================================================================

export async function seedRbacData() {
	try {
		console.log('Starting RBAC data seeding...');

		// Hapus data lama untuk memastikan kebersihan
		await db.delete(roleHierarchyTable);
		await db.delete(rolePermissionsTable);
		// await db.delete(userRolesTable); // DIHAPUS - Ini adalah data penting yang tidak boleh di-reset.
		await db.delete(permissionsTable);
		await db.delete(rolesTable);
		console.log('Old RBAC data cleared.');

		// Masukkan Peran (Roles)
		await db.insert(rolesTable).values(rolesData).onConflictDoNothing();
		console.log('Roles seeded.');

		// Masukkan Izin (Permissions)
		await db.insert(permissionsTable).values(permissionsData).onConflictDoNothing();
		console.log('Permissions seeded.');

		// Tetapkan izin spesifik untuk peran
		const rolePermissions = [
			{ roleId: 'role-manager', permissionId: 'perm-user-read' },
			{ roleId: 'role-manager', permissionId: 'perm-role-read' },
			{ roleId: 'role-manager', permissionId: 'perm-data-write-scoped' },
			{ roleId: 'role-editor', permissionId: 'perm-user-read' },
			{ roleId: 'role-editor', permissionId: 'perm-data-write-scoped' },
			{ roleId: 'role-territory-manager', permissionId: 'perm-user-read' },
			{ roleId: 'role-territory-manager', permissionId: 'perm-data-write-scoped' },
			{ roleId: 'role-territory-editor', permissionId: 'perm-user-read' },
			{ roleId: 'role-territory-editor', permissionId: 'perm-data-write-scoped' },
			{ roleId: 'role-viewer', permissionId: 'perm-user-read' },
			{ roleId: 'role-viewer', permissionId: 'perm-territory-read' },
			{ roleId: 'role-pendataan', permissionId: 'perm-pendataan-access' },
			{ roleId: 'role-pendataan-propinsi', permissionId: 'perm-pendataan-access' },
			{ roleId: 'role-nasyath', permissionId: 'perm-nasyath-access' },
			{ roleId: 'role-nasyath-propinsi', permissionId: 'perm-nasyath-access' },
			{ roleId: 'role-pendataan', permissionId: 'perm-pendataan-write' },
			{ roleId: 'role-pendataan', permissionId: 'perm-pendataan-read' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-admin-access' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-nasyath-access' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-pendataan-access' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-data-read-all' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-pendataan-read' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-role-read' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-territory-read' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-user-read' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-pendataan-write' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-role-write' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-data-write-scoped' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-user-write' },
			{ roleId: 'role-admin', permissionId: 'perm-admin-access' },
			{ roleId: 'role-admin', permissionId: 'perm-nasyath-access' },
			{ roleId: 'role-admin', permissionId: 'perm-pendataan-access' },
			{ roleId: 'role-admin', permissionId: 'perm-data-read-all' },
			{ roleId: 'role-admin', permissionId: 'perm-pendataan-read' },
			{ roleId: 'role-admin', permissionId: 'perm-role-read' },
			{ roleId: 'role-admin', permissionId: 'perm-territory-read' },
			{ roleId: 'role-admin', permissionId: 'perm-user-read' },
			{ roleId: 'role-admin', permissionId: 'perm-pendataan-write' },
			{ roleId: 'role-admin', permissionId: 'perm-role-write' },
			{ roleId: 'role-admin', permissionId: 'perm-data-write-scoped' },
			{ roleId: 'role-admin', permissionId: 'perm-user-write' },
			{ roleId: 'role-admin', permissionId: 'perm-nasyath-read' },
			{ roleId: 'role-piket-manager', permissionId: 'perm-piket-read' },
			{ roleId: 'role-piket-manager', permissionId: 'perm-piket-write' },
			{ roleId: 'role-admin', permissionId: 'perm-piket-read' },
			{ roleId: 'role-admin', permissionId: 'perm-piket-write' },
			// --- PENETAPAN IZIN BARU UNTUK BACKUP ---
			{ roleId: 'role-admin', permissionId: 'perm-backup-create' }
		];
		await db.insert(rolePermissionsTable).values(rolePermissions).onConflictDoNothing();
		console.log('Role permissions seeded.');

		// Bangun Hierarki Peran
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

// ... (Fungsi utilitas seperti assignRoleToUser tetap sama)
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
