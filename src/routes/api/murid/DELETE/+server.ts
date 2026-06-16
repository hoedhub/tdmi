import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import { userHasPermission } from '$lib/server/accessControl';

export async function DELETE({ request, locals }: RequestEvent) {
	const userId = locals.user?.id;
	if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
	const canWrite = await userHasPermission(userId, 'perm-pendataan-write');
	if (!canWrite) return json({ error: 'Forbidden' }, { status: 403 });
	try {
		const { ids } = await request.json();

		if (!Array.isArray(ids) || ids.length === 0) {
			return json({ success: false, error: 'Invalid or empty ids array' }, { status: 400 });
		}

		await db.delete(muridTable).where(inArray(muridTable.id, ids));

		return json({ success: true, deletedCount: ids.length });
	} catch (error) {
		console.error('Error deleting records:', error);
		return json({ success: false, error: 'Failed to delete records' }, { status: 500 });
	}
}
