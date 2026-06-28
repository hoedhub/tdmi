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
// DATA MASTER RBAC - SUMBER KEBENARAN (SOURCE OF TRUTH)
// =================================================================
// Array di bawah ini adalah satu-satunya sumber kebenaran untuk definisi
// role, permission, dan hierarki. Jika ada perubahan, edit di sini lalu
// jalankan `pnpm db:sync-rbac` untuk menyinkronkan ke database.
//
// PERINGATAN: Jangan mengubah data RBAC langsung di database tanpa
// memperbarui file ini, atau keduanya akan tidak sinkron.
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
	},
	{
		id: 'role-lajnah-ilqo',
		name: "Lajnah Ilqo' Ad Durus",
		description: "Lajnah yang mengelola pertanyaan Ayyu Su'aal kepada Maulana Syeikh"
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
	{ id: 'perm-nasyath-read', name: 'Read Nasyath', description: 'Allows reading nasyath data' },
	{
		id: 'perm-nasyath-write',
		name: 'Write Nasyath',
		description: 'Allows writing nasyath data'
	},
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
	},
	// --- IZIN UNTUK AYYU SU'AAL ---
	{
		id: 'perm-ayyu-sual-access',
		name: "Akses Ayyu Su'aal",
		description: "Bisa mengakses dan mengelola halaman pertanyaan Ayyu Su'aal"
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
	{ parent: 'role-admin', child: 'role-piket-admin' },
	{ parent: 'role-admin', child: 'role-lajnah-ilqo' },
	{ parent: 'role-naib', child: 'role-lajnah-ilqo' }
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
			{ roleId: 'role-admin', permissionId: 'perm-nasyath-write' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-nasyath-write' },
			{ roleId: 'role-nasyath', permissionId: 'perm-nasyath-write' },
			{ roleId: 'role-piket-manager', permissionId: 'perm-piket-read' },
			{ roleId: 'role-piket-manager', permissionId: 'perm-piket-write' },
			{ roleId: 'role-admin', permissionId: 'perm-piket-read' },
			{ roleId: 'role-admin', permissionId: 'perm-piket-write' },
			// --- PENETAPAN IZIN BARU UNTUK BACKUP ---
			{ roleId: 'role-admin', permissionId: 'perm-backup-create' },
			// --- PENETAPAN IZIN UNTUK AYYU SU'AAL ---
			{ roleId: 'role-lajnah-ilqo', permissionId: 'perm-ayyu-sual-access' },
			{ roleId: 'role-admin', permissionId: 'perm-ayyu-sual-access' },
			{ roleId: 'role-naib', permissionId: 'perm-ayyu-sual-access' },
			{ roleId: 'role-wakil-naib', permissionId: 'perm-ayyu-sual-access' }
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

/**
 * Sinkronisasi RBAC data ke database secara IDEMPOTEN (aman dijalankan berulang).
 * Berbeda dengan seedRbacData yang destruktif (hapus semua lalu insert ulang),
 * fungsi ini menggunakan upsert sehingga:
 * - Record baru akan di-insert
 * - Record yang sudah ada akan di-update (name, description)
 * - Record yang ada di DB tapi tidak di sini TIDAK dihapus (aman untuk data user_roles)
 *
 * Gunakan: `pnpm db:sync-rbac`
 */
export async function syncRbacToDb() {
	try {
		console.log('Starting RBAC sync (idempotent)...');

		// 1. Sync Roles (upsert)
		for (const role of rolesData) {
			await db
				.insert(rolesTable)
				.values(role)
				.onConflictDoUpdate({ target: rolesTable.id, set: { name: role.name, description: role.description } });
		}
		console.log(`Roles synced: ${rolesData.length} items`);

		// 2. Sync Permissions (upsert)
		for (const perm of permissionsData) {
			await db
				.insert(permissionsTable)
				.values(perm)
				.onConflictDoUpdate({ target: permissionsTable.id, set: { name: perm.name, description: perm.description } });
		}
		console.log(`Permissions synced: ${permissionsData.length} items`);

		// 3. Sync Role-Permission mappings (idempotent insert)
		const rolePermissions = buildRolePermissions();
		let rpInserted = 0;
		for (const rp of rolePermissions) {
			const result = await db.insert(rolePermissionsTable).values(rp).onConflictDoNothing();
			if (result.rowsAffected > 0) rpInserted++;
		}
		console.log(`Role-permissions synced: ${rpInserted} new, ${rolePermissions.length - rpInserted} existing`);

		// 4. Sync Role Hierarchy (idempotent insert)
		const hierarchy = roleHierarchyData.map((h) => ({
			parentRoleId: h.parent,
			childRoleId: h.child
		}));
		let rhInserted = 0;
		for (const rh of hierarchy) {
			const result = await db.insert(roleHierarchyTable).values(rh).onConflictDoNothing();
			if (result.rowsAffected > 0) rhInserted++;
		}
		console.log(`Role hierarchy synced: ${rhInserted} new, ${hierarchy.length - rhInserted} existing`);

		console.log('RBAC sync completed successfully.');
		return { success: true, message: 'RBAC data synced (idempotent).' };
	} catch (err) {
		console.error('Error syncing RBAC data:', err);
		return { success: false, message: 'Failed to sync RBAC data.', error: err };
	}
}

/**
 * Helper: build role-permission mappings from rolePermissionsData
 * (extracted so it can be reused by both seed and sync)
 */
function buildRolePermissions() {
	return [
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
		{ roleId: 'role-admin', permissionId: 'perm-nasyath-write' },
		{ roleId: 'role-wakil-naib', permissionId: 'perm-nasyath-write' },
		{ roleId: 'role-nasyath', permissionId: 'perm-nasyath-write' },
		{ roleId: 'role-piket-manager', permissionId: 'perm-piket-read' },
		{ roleId: 'role-piket-manager', permissionId: 'perm-piket-write' },
		{ roleId: 'role-admin', permissionId: 'perm-piket-read' },
		{ roleId: 'role-admin', permissionId: 'perm-piket-write' },
		{ roleId: 'role-admin', permissionId: 'perm-backup-create' },
		{ roleId: 'role-lajnah-ilqo', permissionId: 'perm-ayyu-sual-access' },
		{ roleId: 'role-admin', permissionId: 'perm-ayyu-sual-access' },
		{ roleId: 'role-naib', permissionId: 'perm-ayyu-sual-access' },
		{ roleId: 'role-wakil-naib', permissionId: 'perm-ayyu-sual-access' }
	];
}
