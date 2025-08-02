import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const muridId = parseInt(params.muridId);
	if (isNaN(muridId)) {
		throw error(400, 'Invalid Murid ID');
	}

	try {
		// Fetch the murid to get its deskelId for territory scope check
		const muridToDelete = await db
			.select({ deskelId: muridTable.deskelId })
			.from(muridTable)
			.where(eq(muridTable.id, muridId))
			.get();

		if (!muridToDelete) {
			throw error(404, 'Murid not found.');
		}

		// Check if the user has permission to write (delete) murid data
		// and if they are within the territory scope if applicable.
		const canWriteMurid = await userHasPermission(
			locals.user.id,
			'perm-pendataan-write',
			{ deskelId: muridToDelete.deskelId } // Pass deskelId for territory check
		);

		if (!canWriteMurid) {
			throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk menghapus data murid ini.');
		}

		// Perform the deletion
		const result = await db.delete(muridTable).where(eq(muridTable.id, muridId)).run();

		if (result.rowsAffected === 0) {
			throw error(404, 'Murid not found or already deleted.');
		}

		return json({ success: true, message: 'Murid berhasil dihapus.' });
	} catch (e) {
		console.error(`Error deleting murid ${muridId}:`, e);
		if (e instanceof Error && (e as any).status) {
			// Check if it's a SvelteKit error
			throw e;
		}
		throw error(500, 'Gagal menghapus murid karena kesalahan server.');
	}
};
