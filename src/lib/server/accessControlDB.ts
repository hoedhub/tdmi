import { db } from '$lib/drizzle'; // Sesuaikan path ke Drizzle client Anda
import {
	userRolesTable,
	rolePermissionsTable,
	rolesTable,
	roleHierarchyTable,
	usersTable,
	permissionsTable
} from '$lib/drizzle/schema'; // Gunakan skema RBAC baru
import { eq, inArray, sql, or } from 'drizzle-orm';

// --- Role Management ---

/**
 * Membuat peran baru di database.
 * @param role - Objek berisi id, name, dan description.
 */
export async function createRole(role: { id: string; name: string; description?: string }) {
	return db.insert(rolesTable).values(role);
}

/**
 * Memperbarui data peran di database.
 * @param roleId - ID peran yang akan diupdate.
 * @param updates - Objek berisi name dan/atau description baru.
 */
export async function updateRole(roleId: string, updates: { name?: string; description?: string }) {
	return db.update(rolesTable).set(updates).where(eq(rolesTable.id, roleId));
}

/**
 * Menghapus peran dari database secara aman menggunakan transaksi.
 * Ini akan menghapus semua asosiasi sebelum menghapus peran itu sendiri.
 * @param roleId - ID peran yang akan dihapus.
 */
export async function deleteRole(roleId: string): Promise<void> {
	await db.transaction(async (tx) => {
		// 1. Hapus dari user_roles
		await tx.delete(userRolesTable).where(eq(userRolesTable.roleId, roleId));
		// 2. Hapus dari role_permissions
		await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId));
		// 3. Hapus dari role_hierarchy (baik sebagai parent maupun child)
		await tx
			.delete(roleHierarchyTable)
			.where(or(eq(roleHierarchyTable.parentRoleId, roleId), eq(roleHierarchyTable.childRoleId, roleId)));
		// 4. Hapus peran itu sendiri
		await tx.delete(rolesTable).where(eq(rolesTable.id, roleId));
	});
}

/**
 * Menetapkan pengguna mana saja yang memiliki peran tertentu.
 * Menghapus semua penetapan lama dan menggantinya dengan yang baru.
 * @param roleId - ID peran yang akan diupdate.
 * @param newUserIds - Array berisi ID pengguna yang baru.
 */
export async function updateUsersForRole(roleId: string, newUserIds: string[]): Promise<void> {
	await db.transaction(async (tx) => {
		// 1. Hapus semua penetapan pengguna lama untuk peran ini
		await tx.delete(userRolesTable).where(eq(userRolesTable.roleId, roleId));

		// 2. Jika ada pengguna baru, masukkan
		if (newUserIds.length > 0) {
			const usersToInsert = newUserIds.map((userId) => ({ userId, roleId }));
			await tx.insert(userRolesTable).values(usersToInsert);
		}
	});
}

// --- User & Role Association ---

/**
 * Mengambil semua ID peran yang dimiliki oleh pengguna tertentu dari database.
 * @param userId - ID pengguna.
 * @returns Promise<string[]> - Array berisi ID peran.
 */
export async function getUserRoles(userId: string): Promise<string[]> {
	const roles = await db
		.select({ roleId: userRolesTable.roleId })
		.from(userRolesTable)
		.where(eq(userRolesTable.userId, userId));
	return roles.map((r) => r.roleId);
}

/**
 * Memperbarui peran yang dimiliki pengguna di dalam database.
 * @param userId - ID pengguna yang akan diupdate.
 * @param newRoleIds - Array berisi ID peran yang baru.
 */
export async function updateUserRoles(userId: string, newRoleIds: string[]): Promise<void> {
	// Gunakan transaksi untuk memastikan operasi atomik (semua berhasil atau semua gagal)
	await db.transaction(async (tx) => {
		// 1. Hapus semua peran lama pengguna
		await tx.delete(userRolesTable).where(eq(userRolesTable.userId, userId));

		// 2. Jika ada peran baru, masukkan
		if (newRoleIds.length > 0) {
			const rolesToInsert = newRoleIds.map((roleId) => ({ userId, roleId }));
			await tx.insert(userRolesTable).values(rolesToInsert);
		}
	});
}

// --- Role & Permission Association ---

/**
 * Mengambil semua ID izin yang dimiliki oleh peran tertentu dari database.
 * @param roleId - ID peran.
 * @returns Promise<string[]> - Array berisi ID izin.
 */
export async function getRolePermissions(roleId: string): Promise<string[]> {
	const permissions = await db
		.select({ permissionId: rolePermissionsTable.permissionId })
		.from(rolePermissionsTable)
		.where(eq(rolePermissionsTable.roleId, roleId));
	return permissions.map((p) => p.permissionId);
}

/**
 * Memperbarui izin yang dimiliki oleh sebuah peran di dalam database.
 * @param roleId - ID peran yang akan diupdate.
 * @param newPermissionIds - Array berisi ID izin yang baru.
 */
export async function updateRolePermissions(
	roleId: string,
	newPermissionIds: string[]
): Promise<void> {
	await db.transaction(async (tx) => {
		// 1. Hapus semua izin lama peran tersebut
		await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId));

		// 2. Jika ada izin baru, masukkan
		if (newPermissionIds.length > 0) {
			const permissionsToInsert = newPermissionIds.map((permissionId) => ({
				roleId,
				permissionId
			}));
			await tx.insert(rolePermissionsTable).values(permissionsToInsert);
		}
	});
}

// --- Hierarchy & Scoping ---

/**
 * Memeriksa apakah childRoleId adalah turunan (sub-role) dari parentRoleId menggunakan database.
 * Ini menggunakan Recursive Common Table Expression (CTE) untuk efisiensi.
 * @param parentRoleId - ID peran induk.
 * @param childRoleId - ID peran anak yang diperiksa.
 * @returns Promise<boolean> - true jika merupakan sub-role.
 */
export async function isSubRole(parentRoleId: string, childRoleId: string): Promise<boolean> {
	if (parentRoleId === childRoleId) return true;

	// Drizzle ORM belum memiliki builder før recursive CTE, jadi kita gunakan sql.raw
	// Ini jauh lebih efisien daripada rekursi di sisi aplikasi.
	const query = sql`
        WITH RECURSIVE SubRoles (roleId) AS (
            SELECT child_role_id FROM role_hierarchy WHERE parent_role_id = ${parentRoleId}
            UNION ALL
            SELECT rh.child_role_id
            FROM role_hierarchy rh
            INNER JOIN SubRoles sr ON sr.roleId = rh.parent_role_id
        )
        SELECT 1 FROM SubRoles WHERE roleId = ${childRoleId}
        LIMIT 1;
    `;

	const result = await db.get<{ '1': number }>(query);
	return !!result; // Mengembalikan true jika query menemukan baris, false jika tidak
}

// --- Data Fetching for UI ---

/**
 * Mengambil semua peran yang ada dari database.
 * @returns Promise<Array<{ id: string; name: string; description: string | null }>>
 */
export async function getAllRoles() {
	return db.select().from(rolesTable).orderBy(rolesTable.name);
}

/**
 * Mengambil seluruh data hierarki peran dari database.
 * @returns Promise<Array<{ parentRoleId: string; childRoleId: string }>>
 */
export async function getRoleHierarchy() {
	return db.select().from(roleHierarchyTable);
}

/**
 * Mengambil semua pengguna dari database.
 */
export async function getAllUsers() {
	return db
		.select({
			id: usersTable.id,
			username: usersTable.username
		})
		.from(usersTable)
		.orderBy(usersTable.username);
}

/**
 * Mengambil semua izin yang ada dari database.
 */
export async function getAllPermissions() {
	return db.select().from(permissionsTable).orderBy(permissionsTable.name);
}

/**
 * Mengambil seluruh peta user-role dari database.
 */
export async function getUserRoleMap() {
	return db.select().from(userRolesTable);
}

/**
 * Mengambil seluruh peta role-permission dari database.
 */
export async function getRolePermissionMap() {
	return db.select().from(rolePermissionsTable);
}
