import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

config({ path: '.env' }); // or .env.local

/**
 * Konfigurasi Client Turso.
 * 
 * CATATAN PENTING:
 * Kita tidak lagi menyertakan properti 'fetch' secara ekslpsit. 
 * Ini memungkinkan @libsql/client menggunakan protokol WebSockets (default untuk libsql://)
 * yang jauh lebih stabil daripada HTTP fetch konvensional karena mempertahankan
 * koneksi tetap terbuka (persistent), sehingga mengurangi kemungkinan Connect Timeout.
 */
export const client = createClient({
	url: process.env.TURSO_CONNECTION_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN
});

// Create the database instance
export const db = drizzle(client, { schema });
