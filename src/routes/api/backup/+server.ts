import { createDatabaseDump } from '$lib/server/db-dump';
import { requirePermission } from '$lib/server/accessControl';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	// Auth + permission check in one line
	await requirePermission(locals, 'perm-backup-create');

	try {
		const dumpStream = createDatabaseDump();

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const filename = `backup-${timestamp}.sql`;

		return new Response(dumpStream, {
			status: 200,
			headers: {
				'Content-Type': 'application/sql',
				'Content-Disposition': `attachment; filename="${filename}"`
			}
		});
	} catch (e: any) {
		console.error('Backup failed:', e);
		throw error(500, `Backup failed: ${e.message}`);
	}
};
