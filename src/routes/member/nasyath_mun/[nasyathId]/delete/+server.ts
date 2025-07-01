import { db } from '$lib/drizzle';
import { nasyathTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { canUserAccessNasyath } from '$lib/server/nasyath';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const nasyathId = parseInt(params.nasyathId, 10);
	if (isNaN(nasyathId)) {
		throw error(400, 'Nasyath ID tidak valid');
	}

	const nasyathToDelete = await db.query.nasyathTable.findFirst({
		where: eq(nasyathTable.id, nasyathId)
	});

	if (!nasyathToDelete) {
		// Tidak perlu throw error 404, cukup redirect jika data sudah tidak ada
		throw redirect(303, '/member/nasyath_mun');
	}

	// Keamanan: Pastikan pengguna punya hak akses untuk menghapus data ini
	const hasAccess = await canUserAccessNasyath(locals.user.id, nasyathToDelete.muridId, 'write');
	if (!hasAccess) {
		throw error(403, 'Akses Ditolak');
	}

	try {
		await db.delete(nasyathTable).where(eq(nasyathTable.id, nasyathId));
	} catch (e) {
		console.error('Gagal menghapus data nasyath:', e);
		throw error(500, 'Gagal menghapus data dari server.');
	}

	// Redirect kembali ke halaman daftar setelah berhasil
	throw redirect(303, '/member/nasyath_mun');
};
