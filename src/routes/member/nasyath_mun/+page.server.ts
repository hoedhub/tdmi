import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { nasyathTable, muridTable } from '$lib/drizzle/schema';
import { sql, and, eq, gte, lte, desc, count } from 'drizzle-orm';
import { userHasPermission } from '$lib/server/accessControl';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Logika `canReadAll` menentukan apakah dashboard bersifat global atau personal
	const canReadAll = await userHasPermission(locals.user.id, 'perm-nasyath-read');
	const currentYear = new Date().getFullYear();

	// Jika bukan admin, filter berdasarkan muridId dari user yang login
	const baseConditions = canReadAll
		? []
		: [eq(nasyathTable.muridId, locals.user.muridId || 0)];

	// --- KPI Queries ---
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);
	const endOfMonth = new Date(startOfMonth);
	endOfMonth.setMonth(endOfMonth.getMonth() + 1);

	const totalThisMonthResult = await db
		.select({ count: count() })
		.from(nasyathTable)
		.where(
			and(
				...baseConditions,
				gte(nasyathTable.tanggalMulai, startOfMonth.toISOString()),
				lte(nasyathTable.tanggalMulai, endOfMonth.toISOString())
			)
		);
	const totalThisMonth = totalThisMonthResult[0].count;

	const startOfYear = new Date(currentYear, 0, 1);
	const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
	const totalThisYearResult = await db
		.select({ count: count() })
		.from(nasyathTable)
		.where(
			and(
				...baseConditions,
				gte(nasyathTable.tanggalMulai, startOfYear.toISOString()),
				lte(nasyathTable.tanggalMulai, endOfYear.toISOString())
			)
		);
	const totalThisYear = totalThisYearResult[0].count;

	const mostFrequentResult = await db
		.select({ kegiatan: nasyathTable.kegiatan, count: count() })
		.from(nasyathTable)
		.where(and(...baseConditions))
		.groupBy(nasyathTable.kegiatan)
		.orderBy(desc(count()))
		.limit(1);
	const mostFrequentActivity = mostFrequentResult[0]?.kegiatan || 'N/A';

	// --- Chart Data Queries ---
	const sixMonthsAgo = new Date();
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
	const activitiesPerMonthResult = await db
		.select({
			month: sql<string>`strftime('%Y-%m', ${nasyathTable.tanggalMulai})`,
			count: count()
		})
		.from(nasyathTable)
		.where(
			and(...baseConditions, gte(nasyathTable.tanggalMulai, sixMonthsAgo.toISOString()))
		)
		.groupBy(sql`strftime('%Y-%m', ${nasyathTable.tanggalMulai})`)
		.orderBy(sql`strftime('%Y-%m', ${nasyathTable.tanggalMulai})`);

	// --- **QUERY BARU UNTUK PIE CHART** ---
	// Menghitung anggota teraktif. Hanya relevan untuk admin.
	let mostActiveMembers: { murid: { nama: string | null } | null; activityCount: number }[] = [];
	if (canReadAll) {
		const results = await db
			.select({
				namaArab: muridTable.namaArab,
				activityCount: count(nasyathTable.id)
			})
			.from(nasyathTable)
			.leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id))
			.groupBy(muridTable.namaArab)
			.orderBy(desc(sql`count(${nasyathTable.id})`))
			.limit(7);

		mostActiveMembers = results.map(result => ({
			murid: result.namaArab ? { nama: result.namaArab } : null,
			activityCount: Number(result.activityCount)
		}));
	}

	// --- Table Data Query ---
	const recentActivities = await db
		.select({
			id: nasyathTable.id,
			kegiatan: nasyathTable.kegiatan,
			tanggalMulai: nasyathTable.tanggalMulai,
			tempat: nasyathTable.tempat,
			muridNama: muridTable.namaArab
		})
		.from(nasyathTable)
		.leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id))
		.where(and(...baseConditions))
		.orderBy(desc(nasyathTable.tanggalMulai))
		.limit(5);

	return {
		canReadAll,
		kpi: {
			totalThisMonth,
			totalThisYear,
			mostFrequentActivity
		},
		charts: {
			activitiesPerMonth: activitiesPerMonthResult,
			mostActiveMembers: mostActiveMembers // Kirim data baru ke frontend
		},
		recentActivities
	};
};
