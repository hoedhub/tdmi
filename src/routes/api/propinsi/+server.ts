import { json, error } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { propTable } from '$lib/drizzle/schema';

export async function GET() {
	try {
		const propinsi = await db.select().from(propTable);
		return json(propinsi);
	} catch (e) {
		console.error('Gagal mengambil data propinsi:', e);
		throw error(503, 'Tidak dapat terhubung ke database untuk mengambil data propinsi.');
	}
}
