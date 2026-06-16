import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { errorLogTable } from '$lib/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	try {
		const body = await request.json();
		if (body.resolved) {
			await db
				.update(errorLogTable)
				.set({
					resolved: true,
					resolvedAt: sql`CURRENT_TIMESTAMP`,
					resolvedBy: locals.user.id
				})
				.where(eq(errorLogTable.id, params.id));
		}
		return json({ ok: true });
	} catch (err) {
		console.error('Failed to update error log:', err);
		return json({ error: 'Failed to update' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	try {
		await db.delete(errorLogTable).where(eq(errorLogTable.id, params.id));
		return json({ ok: true });
	} catch (err) {
		console.error('Failed to delete error log:', err);
		return json({ error: 'Failed to delete' }, { status: 500 });
	}
};
