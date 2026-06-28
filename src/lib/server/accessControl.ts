import { getUserRoles, getRolesPermissions, isSubRole } from './accessControlDB'; // <-- Menggunakan file baru
import { db } from '$lib/drizzle';
import {
	usersTable,
	muridTable,
	deskelTable,
	kecamatanTable,
	kokabTable,
	propTable,
	piketScheduleTable
} from '$lib/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

/**
 * Helper function untuk mendapatkan ID Propinsi dari deskelId.
 * Ini dirancang untuk dapat digunakan kembali.
 */
const getPropinsiIdFromDeskel = async (deskelId: number): Promise<number | null> => {
	const result = await db
		.select({ propinsiId: propTable.id })
		.from(deskelTable)
		.where(eq(deskelTable.id, deskelId))
		.innerJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
		.innerJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
		.innerJoin(propTable, eq(kokabTable.idProp, propTable.id))
		.get();
	return result?.propinsiId ?? null;
};

/**
 * Versi OPTIMIZED dari isWithinTerritoryScope.
 * Menggabungkan beberapa query menjadi satu untuk performa yang lebih baik.
 */
async function isWithinTerritoryScope(userId: string, resourceDeskelId: number): Promise<boolean> {
	// Query tunggal untuk mendapatkan propinsiId user DAN resource sekaligus
	const result = await db
		.select({
			userPropinsiId: propTable.id,
			// Subquery untuk mendapatkan propinsiId resource
			resourcePropinsiId: sql<number>`(
                SELECT p.id FROM deskel d
                JOIN kecamatan k ON d.id_kecamatan = k.id
                JOIN kokab ko ON k.id_kokab = ko.id
                JOIN prop p ON ko.id_prop = p.id
                WHERE d.id = ${resourceDeskelId}
            )`
		})
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.innerJoin(muridTable, eq(usersTable.muridId, muridTable.id))
		.innerJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
		.innerJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
		.innerJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
		.innerJoin(propTable, eq(kokabTable.idProp, propTable.id))
		.get();

	if (!result) {
		console.warn(
			`Could not determine territory for user ${userId} or resource ${resourceDeskelId}.`
		);
		return false;
	}

	return result.userPropinsiId === result.resourcePropinsiId;
}

/**
 * Versi FINAL: Memeriksa izin pengguna dengan semua logika berbasis database.
 * Termasuk pengecekan jadwal piket dinamis.
 */
export async function userHasPermission(
	userId: string,
	permissionId: string,
	resource?: { deskelId?: number | null; targetRoleId?: string }
): Promise<boolean> {
	// 1. Dapatkan peran statis dan peran piket dinamis secara paralel
	const staticRolesPromise = getUserRoles(userId);
	const piketRolesPromise = db
		.select({ roleId: piketScheduleTable.roleId })
		.from(piketScheduleTable)
		.where(
			sql`${piketScheduleTable.userId} = ${userId} AND date('now') BETWEEN date(${piketScheduleTable.startDate}) AND date(${piketScheduleTable.endDate})`
		);

	const [staticRoles, piketRoles] = await Promise.all([staticRolesPromise, piketRolesPromise]);

	// 2. Gabungkan menjadi peran efektif, hapus duplikat
	const effectiveRoles = [...new Set([...staticRoles, ...piketRoles.map((r) => r.roleId)])];

	if (effectiveRoles.length === 0) {
		console.log(`User ${userId} has no effective roles.`);
		return false;
	}

	// 3. Periksa apakah salah satu peran efektif memberikan izin dasar
	const permissions = await getRolesPermissions(effectiveRoles);
	const hasBasePermission = permissions.includes(permissionId);

	if (!hasBasePermission) {
		return false;
	}

	// 4. Terapkan batasan tambahan (Territory & Hierarchy)

	// Cek Teritori untuk pengguna "Level 3"
	const isLevel3User = effectiveRoles.some((roleId) => roleId.endsWith('-propinsi'));
	const requiresTerritoryCheck = resource?.deskelId != null;

	if (isLevel3User && requiresTerritoryCheck) {
		const withinScope = await isWithinTerritoryScope(userId, resource.deskelId!);
		if (!withinScope) {
			console.log(
				`User ${userId} denied access to resource in deskelId ${resource.deskelId} (out of scope).`
			);
			return false;
		}
	}

	// Cek Hierarki untuk izin "write"
	const isWritePermission = permissionId.includes('write');
	const hasTargetRole = resource?.targetRoleId != null;

	if (isWritePermission && hasTargetRole) {
		let canWriteSubRole = false;
		// Lakukan pengecekan secara paralel untuk efisiensi
		const checks = effectiveRoles.map((userRoleId) =>
			isSubRole(userRoleId, resource.targetRoleId!)
		);
		const results = await Promise.all(checks);

		if (results.some((canWrite) => canWrite)) {
			canWriteSubRole = true;
		}

		if (!canWriteSubRole) {
			console.log(
				`User ${userId} denied write access on role ${resource.targetRoleId} (not a sub-role).`
			);
			return false;
		}
	}

	return true; // Semua pengecekan berhasil
}

/**
 * Helper yang memastikan user sudah login. Throw 401 kalau belum.
 * Return user object kalau sudah login.
 */
export function requireAuth(locals: App.Locals) {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	return locals.user;
}

/**
 * Helper yang memastikan user punya permission tertentu.
 * Otomatis cek auth dulu, lalu cek permission. Throw 401/403 kalau gagal.
 *
 * @param locals - SvelteKit locals (berisi user & session)
 * @param permissionId - ID permission, misalnya 'perm-pendataan-write'
 * @param resource - Opsional, untuk territory/hierarchy check
 * @returns user object (sudah pasti authenticated & authorized)
 *
 * @example
 * // Sebelum (5 baris):
 * if (!locals.user) throw error(401, 'Unauthorized');
 * const canBackup = await userHasPermission(locals.user.id, 'perm-backup-create');
 * if (!canBackup) throw error(403, 'Forbidden');
 *
 * // Sesudah (1 baris):
 * const user = await requirePermission(locals, 'perm-backup-create');
 */
export async function requirePermission(
	locals: App.Locals,
	permissionId: string,
	resource?: { deskelId?: number | null; targetRoleId?: string }
) {
	const user = requireAuth(locals);

	const hasPermission = await userHasPermission(user.id, permissionId, resource);
	if (!hasPermission) {
		throw error(403, 'Forbidden: insufficient permissions.');
	}

	return user;
}
