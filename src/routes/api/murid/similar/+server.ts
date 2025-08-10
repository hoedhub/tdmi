
import { db } from '$lib/drizzle';
import { muridTable } from '$lib/drizzle/schema';
import { json } from '@sveltejs/kit';
import levenshtein from 'tiny-levenshtein';

function calculateSimilarity(str1: string, str2: string): number {
	const distance = levenshtein(str1, str2);
	const maxLength = Math.max(str1.length, str2.length);
	return maxLength > 0 ? 1 - distance / maxLength : 0;
}

export async function GET({ url }) {
	const nameToSearch = url.searchParams.get('nama');
	if (!nameToSearch) {
		return json({ error: 'Nama parameter is required' }, { status: 400 });
	}

	try {
		const allMurids = await db.select({ id: muridTable.id, nama: muridTable.nama }).from(muridTable);
		if (allMurids.length === 0) {
			return json([], { status: 200 });
		}

		const normalizedQuery = nameToSearch.toLowerCase();

		const similarMurids = allMurids
			.map((murid) => {
				const normalizedDbName = murid.nama.toLowerCase();

				// Metode A: Per Kata (Token-based)
				const queryWords = normalizedQuery.split(' ').filter(Boolean);
				const dbWords = normalizedDbName.split(' ').filter(Boolean);
				let ratingA = 0;
				if (queryWords.length > 0 && dbWords.length > 0) {
					const wordScores = queryWords.map((queryWord) => {
						const scores = dbWords.map((dbWord) => calculateSimilarity(queryWord, dbWord));
						return Math.max(...scores);
					});
					ratingA = wordScores.reduce((sum, score) => sum + score, 0) / wordScores.length;
				}

				// Metode B: Tanpa Spasi (Space-agnostic)
				const queryNoSpace = normalizedQuery.replace(/\s/g, '');
				const dbNameNoSpace = normalizedDbName.replace(/\s/g, '');
				const ratingB = calculateSimilarity(queryNoSpace, dbNameNoSpace);

				// Skor kemiripan utama adalah yang tertinggi dari A atau B
				let finalRating = Math.max(ratingA, ratingB);

				// Metode C: Pengecekan Substring
				const isSubstring = normalizedDbName.includes(normalizedQuery);

				// Jika ini adalah substring tapi skor kemiripannya rendah,
				// beri skor "cukup" agar tetap lolos filter.
				if (isSubstring && finalRating < 0.75) {
					finalRating = 0.75;
				}

				return {
					id: murid.id,
					nama: murid.nama,
					rating: finalRating
				};
			})
			.filter((murid) => murid.rating >= 0.75);

		similarMurids.sort((a, b) => b.rating - a.rating);

		return json(similarMurids, { status: 200 });
	} catch (error) {
		console.error('[API] Error finding similar murids:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
