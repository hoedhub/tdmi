import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { requireAuth, requirePermission } from '$lib/server/accessControl';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);

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

		// Auth + permission + territory check in one line
		await requirePermission(locals, 'perm-pendataan-write', {
			deskelId: muridToDelete.deskelId
		});

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
