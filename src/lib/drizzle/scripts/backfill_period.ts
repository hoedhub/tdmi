// Script untuk mengisi data periode pada pertanyaan lama berdasarkan createdAt
import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: '.env' });

const client = createClient({
	url: process.env.TURSO_CONNECTION_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN
});

async function runBackfill() {
	console.log('Running backfill for pertanyaan_ahbab period...');
	try {
		const result = await client.execute(`SELECT id, created_at FROM pertanyaan_ahbab`);
		console.log(`Found ${result.rows.length} rows to check.`);
		
		let updatedCount = 0;
		for (const row of result.rows) {
			const id = row.id as number;
			const createdAtStr = row.created_at as string;
			const date = new Date(createdAtStr);
			
			let pMonth = date.getMonth() + 1;
			let pYear = date.getFullYear();
			
			// Jika tanggal > 28, masuk periode bulan berikutnya
			if (date.getDate() > 28) {
				pMonth++;
				if (pMonth > 12) {
					pMonth = 1;
					pYear++;
				}
			}
			
			await client.execute({
				sql: `UPDATE pertanyaan_ahbab SET periode_month = ?, periode_year = ? WHERE id = ?`,
				args: [pMonth, pYear, id]
			});
			updatedCount++;
		}
		
		console.log(`✅ Backfill completed successfully. Updated ${updatedCount} rows.`);
	} catch (err: any) {
		console.error('❌ Backfill failed:', err);
		process.exit(1);
	} finally {
		client.close();
	}
}

runBackfill();
