import { db } from '$lib/drizzle'; // Sesuaikan path ke Drizzle client Anda
import {
    userRolesTable,
    rolePermissionsTable,
    rolesTable,
    roleHierarchyTable
} from '$lib/drizzle/schema'; // Gunakan skema RBAC baru
import { eq, inArray, sql } from 'drizzle-orm';

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
            const rolesToInsert = newRoleIds.map(roleId => ({ userId, roleId }));
            await tx.insert(userRolesTable).values(rolesToInsert);
        }
    });
}

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