import { getUserRoles, getRolePermissions, isSubRole } from './accessControlDB'; // <-- Menggunakan file baru
import { db } from '$lib/drizzle';
import {
	usersTable,
	muridTable,
	deskelTable,
	kecamatanTable,
	kokabTable,
	propTable
} from '$lib/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

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
 */
export async function userHasPermission(
	userId: string,
	permissionId: string,
	resource?: { deskelId?: number | null; targetRoleId?: string }
): Promise<boolean> {
	// 1. Dapatkan semua peran yang dimiliki pengguna dari DB
	const userAssignedRoles = await getUserRoles(userId);
	if (userAssignedRoles.length === 0) return false;

	// 2. Periksa apakah salah satu peran pengguna memberikan izin dasar
	let hasBasePermission = false;
	// Kita bisa optimalkan ini dengan satu query, tapi untuk keterbacaan, kita pisahkan dulu
	for (const roleId of userAssignedRoles) {
		const permissions = await getRolePermissions(roleId);
		if (permissions.includes(permissionId)) {
			hasBasePermission = true;
			break;
		}
	}
	// TODO: Optimalkan pencarian izin dengan satu query JOIN jika diperlukan.

	if (!hasBasePermission) {
		return false;
	}

	// 3. Terapkan batasan tambahan (Territory & Hierarchy)

	// Cek Teritori untuk pengguna "Level 3"
	const isLevel3User = userAssignedRoles.some((roleId) => roleId.endsWith('-propinsi'));
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
		const checks = userAssignedRoles.map((userRoleId) =>
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
