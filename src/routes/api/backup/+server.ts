import { createDatabaseDump } from '$lib/server/db-dump';
import { userHasPermission } from '$lib/server/accessControl';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	// 1. Pastikan pengguna sudah login
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// 2. Periksa izin untuk membuat backup
	const canCreateBackup = await userHasPermission(locals.user.id, 'perm-backup-create');
	if (!canCreateBackup) {
		throw error(403, 'Forbidden: You do not have permission to create backups.');
	}

	try {
		// 3. Lakukan dump database menggunakan utilitas baru
		const dumpStream = createDatabaseDump();

		// 4. Buat nama file dinamis dengan timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const filename = `backup-${timestamp}.sql`;

		// 5. Kirim stream sebagai response yang bisa diunduh
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
