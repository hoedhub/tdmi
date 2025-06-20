import { json } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { deskelTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const kecamatanId = url.searchParams.get('kecamatanId');
	if (!kecamatanId) {
		return json({ error: 'Kecamatan ID is required' }, { status: 400 });
	}
	try {
		console.log('Fetching desa/kelurahan for kecamatanId:', kecamatanId);
		const deskel = await db
			.select()
			.from(deskelTable)
			.where(eq(deskelTable.idKecamatan, parseInt(kecamatanId)));
		// console.log('Fetched desa/kelurahan:', deskel);
		return json(deskel);
	} catch (error) {
		console.error('Error fetching desa/kelurahan:', error);
		return json(
			{
				error: 'Failed to fetch desa/kelurahan',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
