import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle';
import { nasyathTable, muridTable } from '$lib/drizzle/schema';
import { sql, and, eq, gte, lte, desc, count } from 'drizzle-orm';
import { userHasPermission } from '$lib/server/accessControl';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const canReadAll = await userHasPermission(locals.user.id, 'perm-nasyath-read');
	const baseConditions = canReadAll ? [] : [eq(nasyathTable.muridId, locals.user.muridId || 0)];

	// --- Date Filter ---
	const startDateParam = url.searchParams.get('start');
	const endDateParam = url.searchParams.get('end');

	let queryStartDate: Date;
	let queryEndDate: Date;
	let kpiTitle = 'نشاط هذا الشهر';

	if (startDateParam && endDateParam) {
		queryStartDate = new Date(startDateParam);
		queryEndDate = new Date(endDateParam);
		queryEndDate.setHours(23, 59, 59, 999); // Include the whole end day
		kpiTitle = 'نشاط في النطاق المحدد';
	} else {
		// Default to current month
		queryStartDate = new Date();
		queryStartDate.setDate(1);
		queryStartDate.setHours(0, 0, 0, 0);
		queryEndDate = new Date(queryStartDate);
		queryEndDate.setMonth(queryEndDate.getMonth() + 1);
		queryEndDate.setDate(0); // Last day of current month
		queryEndDate.setHours(23, 59, 59, 999);
	}

	const dateConditions = [
		gte(nasyathTable.tanggalMulai, queryStartDate.toISOString()),
		lte(nasyathTable.tanggalMulai, queryEndDate.toISOString())
	];

	const allConditions = [...baseConditions, ...dateConditions];

	// --- KPI Queries ---
	const totalInRangeResult = await db
		.select({ count: count() })
		.from(nasyathTable)
		.where(and(...allConditions));
	const totalInRange = totalInRangeResult[0].count;

	const currentYear = new Date().getFullYear();
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
		.where(and(...allConditions))
		.groupBy(nasyathTable.kegiatan)
		.orderBy(desc(count()))
		.limit(1);
	const mostFrequentActivity = mostFrequentResult[0]?.kegiatan || 'N/A';

	// --- Chart Data Queries ---
	// For bar chart, if a filter is applied, group by month within that range.
	// If not, show the last 6 months.
	const chartDateConditions = startDateParam
		? dateConditions
		: [gte(nasyathTable.tanggalMulai, new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString())];

	const activitiesPerMonthResult = await db
		.select({
			month: sql<string>`strftime('%Y-%m', ${nasyathTable.tanggalMulai})`,
			count: count()
		})
		.from(nasyathTable)
		.where(and(...baseConditions, ...chartDateConditions))
		.groupBy(sql`strftime('%Y-%m', ${nasyathTable.tanggalMulai})`)
		.orderBy(sql`strftime('%Y-%m', ${nasyathTable.tanggalMulai})`);

	let mostActiveMembers: { murid: { nama: string | null } | null; activityCount: number }[] = [];
	if (canReadAll) {
		const results = await db
			.select({
				namaArab: muridTable.namaArab,
				activityCount: count(nasyathTable.id)
			})
			.from(nasyathTable)
			.leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id))
			.where(and(...allConditions))
			.groupBy(muridTable.namaArab)
			.orderBy(desc(sql`count(${nasyathTable.id})`))
			.limit(7);

		mostActiveMembers = results.map((result) => ({
			murid: result.namaArab ? { nama: result.namaArab } : null,
			activityCount: Number(result.activityCount)
		}));
	}

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
		.where(and(...allConditions))
		.orderBy(desc(nasyathTable.tanggalMulai))
		.limit(5);

	return {
		canReadAll,
		kpi: {
			totalThisMonth: totalInRange,
			totalThisYear,
			mostFrequentActivity,
			kpiTitle
		},
		charts: {
			activitiesPerMonth: activitiesPerMonthResult,
			mostActiveMembers: mostActiveMembers
		},
		recentActivities,
		isFiltered: !!(startDateParam && endDateParam)
	};
};