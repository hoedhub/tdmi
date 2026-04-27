// Script untuk menjalankan migration terbaru secara manual
import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: '.env' });

const client = createClient({
	url: process.env.TURSO_CONNECTION_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN
});

async function runMigration() {
	console.log('Running manual migration 0004...');
	try {
		await client.executeMultiple(`
			ALTER TABLE pertanyaan_ahbab ADD COLUMN status text;
			ALTER TABLE pertanyaan_ahbab ADD COLUMN status_catatan text;
			ALTER TABLE pertanyaan_ahbab ADD COLUMN status_updated_at text;
			ALTER TABLE pertanyaan_ahbab ADD COLUMN status_updated_by text REFERENCES users(id);
		`);
		console.log('✅ Migration 0004 applied successfully.');
	} catch (err: any) {
		if (err?.message?.includes('duplicate column name')) {
			console.log('ℹ️  Columns already exist, skipping.');
		} else {
			console.error('❌ Migration failed:', err);
			process.exit(1);
		}
	} finally {
		client.close();
	}
}

runMigration();
