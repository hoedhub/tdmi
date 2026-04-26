import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { muridTable, nasyathTable } from '$lib/drizzle/schema';
import { count, desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		// 1. Fetch overall counts
		const [totalMuridRes] = await db.select({ value: count() }).from(muridTable);
		const [totalNasyathRes] = await db.select({ value: count() }).from(nasyathTable);

		// 2. Fetch counts by Marhalah
		const marhalahCounts = await db
			.select({
				marhalah: muridTable.marhalah,
				count: count()
			})
			.from(muridTable)
			.groupBy(muridTable.marhalah);

		// 3. Fetch counts by Gender
		const genderCounts = await db
			.select({
				gender: muridTable.gender,
				count: count()
			})
			.from(muridTable)
			.groupBy(muridTable.gender);

		// 4. Recently Added Murids
		const recentlyAdded = await db
			.select({ id: muridTable.id, nama: muridTable.nama, updatedAt: muridTable.updatedAt })
			.from(muridTable)
			.orderBy(desc(muridTable.id))
			.limit(5);

		// 5. Recently Updated Murids (excluding those in recentlyAdded if possible, but for dash let's just take top 5)
		const recentlyUpdated = await db
			.select({ id: muridTable.id, nama: muridTable.nama, updatedAt: muridTable.updatedAt })
			.from(muridTable)
			.orderBy(desc(muridTable.updatedAt))
			.limit(5);

		return {
			user: locals.user,
			stats: {
				totalMurid: totalMuridRes.value,
				totalNasyath: totalNasyathRes.value,
				marhalah: marhalahCounts,
				gender: genderCounts
			},
			recentlyAdded,
			recentlyUpdated
		};
	} catch (e) {
		console.error('Error loading dashboard data:', e);
		return {
			user: locals.user,
			stats: {
				totalMurid: 0,
				totalNasyath: 0,
				marhalah: [],
				gender: []
			},
			recentlyAdded: [],
			recentlyUpdated: []
		};
	}
};
