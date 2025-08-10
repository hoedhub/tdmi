
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { json } from '@sveltejs/kit';
import levenshtein from 'tiny-levenshtein';

export async function GET({ url }) {
	const nameToSearch = url.searchParams.get('nama');
	console.log(`[API] Received request to find similar names for: "${nameToSearch}"`);

	if (!nameToSearch) {
		console.log('[API] Nama parameter is missing.');
		return json({ error: 'Nama parameter is required' }, { status: 400 });
	}

	try {
		const allMurids = await db.select({ id: muridTable.id, nama: muridTable.nama }).from(muridTable);

		if (allMurids.length === 0) {
			console.log('[API] No murids found in the database.');
			return json([], { status: 200 });
		}

		const similarMurids = allMurids
			.map((murid) => {
				const distance = levenshtein(nameToSearch, murid.nama);
				const maxLength = Math.max(nameToSearch.length, murid.nama.length);
				const similarity = maxLength > 0 ? 1 - distance / maxLength : 1;

				return {
					id: murid.id,
					nama: murid.nama,
					rating: similarity
				};
			})
			.filter((murid) => murid.rating >= 0.9);

		console.log(`[API] Found ${similarMurids.length} similar murids:`, similarMurids);

		similarMurids.sort((a, b) => b.rating - a.rating);

		return json(similarMurids, { status: 200 });
	} catch (error) {
		console.error('[API] Error finding similar murids:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
