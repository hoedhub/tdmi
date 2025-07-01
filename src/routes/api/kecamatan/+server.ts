import { json } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { kecamatanTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET({ url }: { url: URL }) {
	const kokabId = url.searchParams.get('kokabId');
	if (!kokabId) {
		return json({ error: 'Kota/Kabupaten ID is required' }, { status: 400 });
	}
	try {
		console.log('Fetching kecamatan for kokabId:', kokabId);
		const kecamatan = await db
			.select()
			.from(kecamatanTable)
			.where(eq(kecamatanTable.idKokab, parseInt(kokabId)));
		// console.log('Fetched kecamatan:', kecamatan);
		return json(kecamatan);
	} catch (error) {
		console.error(`Error fetching kecamatan for kokabId: ${kokabId}`, error);
		return json(
			{
				error: 'Failed to fetch kecamatan',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
