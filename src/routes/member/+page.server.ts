import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { muridTable, nasyathTable, piketScheduleTable } from '$lib/drizzle/schema';
import { count, desc, sql, and, gte, lte, eq, isNull, or } from 'drizzle-orm';
import { getUserRoles } from '$lib/server/accessControlDB';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const today = new Date();
	const todayISO = today.toISOString();
	const roles = await getUserRoles(locals.user.id);
	const isAdmin = roles.includes('admin'); // Sesuaikan dengan ID role admin Anda

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

		// 5. Data Integrity Monitor (Admin Only)
		let dataIntegrityIssues = 0;
		if (isAdmin) {
			const integrityRes = await db
				.select({ count: count() })
				.from(muridTable)
				.where(or(
					isNull(muridTable.alamat),
					isNull(muridTable.nomorTelepon),
					eq(muridTable.alamat, ''),
					eq(muridTable.nomorTelepon, '')
				));
			dataIntegrityIssues = integrityRes[0].count;
		}

		// 6. Recent Activities for current user
		const recentActivities = await db
			.select({ 
				id: nasyathTable.id, 
				kegiatan: nasyathTable.kegiatan, 
				tanggalMulai: nasyathTable.tanggalMulai 
			})
			.from(nasyathTable)
			.where(eq(nasyathTable.updaterId, locals.user.id))
			.orderBy(desc(nasyathTable.createdAt))
			.limit(5);

		// 7. Active Piket for current user
		const activePiket = await db
			.select()
			.from(piketScheduleTable)
			.where(and(
				eq(piketScheduleTable.userId, locals.user.id),
				lte(piketScheduleTable.startDate, todayISO),
				gte(piketScheduleTable.endDate, todayISO)
			));

		return {
			user: locals.user,
			isAdmin,
			stats: {
				totalMurid: totalMuridRes.value,
				totalNasyath: totalNasyathRes.value,
				marhalah: marhalahCounts,
				gender: genderCounts
			},
			recentlyAdded,
			dataIntegrityIssues,
			recentActivities,
			activePiket
		};
	} catch (e) {
		console.error('Error loading dashboard data:', e);
		return {
			user: locals.user,
			isAdmin: false,
			stats: {
				totalMurid: 0,
				totalNasyath: 0,
				marhalah: [],
				gender: []
			},
			recentlyAdded: [],
			dataIntegrityIssues: 0,
			recentActivities: [],
			activePiket: []
		};
	}
};
