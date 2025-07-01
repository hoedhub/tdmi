import { db } from '$lib/drizzle';
import { usersTable, nasyathTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { userHasPermission } from './accessControl';

/**
 * Memeriksa apakah seorang pengguna memiliki izin untuk mengakses (membaca atau menulis)
 * data nasyath tertentu.
 *
 * Akses diberikan jika:
 * 1. Pengguna memiliki izin global melalui perannya (misal, 'perm-nasyath-read' atau 'perm-nasyath-write').
 * 2. Pengguna terhubung dengan data murid yang sama dengan data nasyath yang dituju (ownership).
 *
 * @param userId - ID pengguna yang meminta akses.
 * @param nasyathMuridId - ID murid yang terkait dengan data nasyath.
 * @param accessType - Tipe akses yang dibutuhkan ('read' atau 'write').
 * @returns {Promise<boolean>} - True jika akses diizinkan, false jika ditolak.
 */
export async function canUserAccessNasyath(
	userId: string,
	nasyathMuridId: number,
	accessType: 'read' | 'write'
): Promise<boolean> {
	// 1. Periksa izin global berbasis peran (RBAC)
	const requiredPermission =
		accessType === 'write' ? 'perm-nasyath-write' : 'perm-nasyath-read';
	const hasGlobalPermission = await userHasPermission(userId, requiredPermission);

	if (hasGlobalPermission) {
		return true; // Admin atau peran lain dengan izin global bisa akses.
	}

	// 2. Periksa izin berbasis kepemilikan (Ownership)
	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, userId),
		columns: {
			muridId: true
		}
	});

	// Jika pengguna tidak ditemukan atau tidak terhubung dengan data murid,
	// maka ia tidak bisa memiliki nasyath.
	if (!user || !user.muridId) {
		return false;
	}

	// Bandingkan muridId milik pengguna dengan muridId pada data nasyath.
	return user.muridId === nasyathMuridId;
}
