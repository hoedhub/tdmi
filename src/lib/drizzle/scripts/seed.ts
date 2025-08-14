// src/lib/drizzle/scripts/seed.ts
import { seedRbacData } from '../../server/accessControlData';
import { db } from '..'; // Impor db untuk memastikan koneksi ditutup

async function main() {
	console.log('Starting database seeding process...');
	try {
		const result = await seedRbacData();
		if (result.success) {
			console.log('Seeding completed successfully.');
		} else {
			console.error('Seeding failed:', result.message);
			if (result.error) {
				console.error('Details:', result.error);
			}
			process.exit(1); // Keluar dengan kode error
		}
	} catch (error) {
		console.error('An unexpected error occurred during seeding:', error);
		process.exit(1);
	} finally {
		console.log('Seeding process finished.');
		// Tidak perlu menutup koneksi secara eksplisit untuk Turso/libSQL HTTP
	}
}

main();
