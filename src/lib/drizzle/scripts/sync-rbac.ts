// src/lib/drizzle/scripts/sync-rbac.ts
import { syncRbacToDb } from '../../server/accessControlData';

async function main() {
	console.log('Starting RBAC sync process...');
	try {
		const result = await syncRbacToDb();
		if (result.success) {
			console.log('Sync completed successfully.');
		} else {
			console.error('Sync failed:', result.message);
			if (result.error) {
				console.error('Details:', result.error);
			}
			process.exit(1);
		}
	} catch (err) {
		console.error('An unexpected error occurred during RBAC sync:', err);
		process.exit(1);
	}
}

main();
