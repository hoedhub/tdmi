import { redirect } from "@sveltejs/kit";
import { n as nasyathTable, d as db, m as muridTable } from "../../../../chunks/index.js";
import { eq, gte, lte, count, and, desc, sql } from "drizzle-orm";
import { u as userHasPermission } from "../../../../chunks/accessControl.js";
const load = async ({ locals, url }) => {
  if (!locals.user) {
    throw redirect(302, "/login");
  }
  try {
    const canReadAll = await userHasPermission(locals.user.id, "perm-nasyath-read");
    const baseConditions = canReadAll ? [] : [eq(nasyathTable.muridId, locals.user.muridId || 0)];
    const startDateParam = url.searchParams.get("start");
    const endDateParam = url.searchParams.get("end");
    let queryStartDate;
    let queryEndDate;
    let kpiTitle = "نشاط هذا الشهر";
    if (startDateParam && endDateParam) {
      queryStartDate = new Date(startDateParam);
      queryEndDate = new Date(endDateParam);
      queryEndDate.setHours(23, 59, 59, 999);
      kpiTitle = "نشاط في النطاق المحدد";
    } else {
      queryStartDate = /* @__PURE__ */ new Date();
      queryStartDate.setDate(1);
      queryStartDate.setHours(0, 0, 0, 0);
      queryEndDate = new Date(queryStartDate);
      queryEndDate.setMonth(queryEndDate.getMonth() + 1);
      queryEndDate.setDate(0);
      queryEndDate.setHours(23, 59, 59, 999);
    }
    const dateConditions = [
      gte(nasyathTable.tanggalMulai, queryStartDate.toISOString()),
      lte(nasyathTable.tanggalMulai, queryEndDate.toISOString())
    ];
    const allConditions = [...baseConditions, ...dateConditions];
    const totalInRangeResult = await db.select({ count: count() }).from(nasyathTable).where(and(...allConditions));
    const totalInRange = totalInRangeResult[0].count;
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    const totalThisYearResult = await db.select({ count: count() }).from(nasyathTable).where(
      and(
        ...baseConditions,
        gte(nasyathTable.tanggalMulai, startOfYear.toISOString()),
        lte(nasyathTable.tanggalMulai, endOfYear.toISOString())
      )
    );
    const totalThisYear = totalThisYearResult[0].count;
    const mostFrequentResult = await db.select({ kegiatan: nasyathTable.kegiatan, count: count() }).from(nasyathTable).where(and(...allConditions)).groupBy(nasyathTable.kegiatan).orderBy(desc(count())).limit(1);
    const mostFrequentActivity = mostFrequentResult[0]?.kegiatan || "N/A";
    const chartDateConditions = startDateParam ? dateConditions : [
      gte(
        nasyathTable.tanggalMulai,
        new Date((/* @__PURE__ */ new Date()).setMonth((/* @__PURE__ */ new Date()).getMonth() - 6)).toISOString()
      )
    ];
    const activitiesPerMonthResult = await db.select({
      month: sql`strftime('%Y-%m', ${nasyathTable.tanggalMulai})`,
      count: count()
    }).from(nasyathTable).where(and(...baseConditions, ...chartDateConditions)).groupBy(sql`strftime('%Y-%m', ${nasyathTable.tanggalMulai})`).orderBy(sql`strftime('%Y-%m', ${nasyathTable.tanggalMulai})`);
    let mostActiveMembers = [];
    if (canReadAll) {
      const results = await db.select({
        namaArab: muridTable.namaArab,
        activityCount: count(nasyathTable.id)
      }).from(nasyathTable).leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id)).where(and(...allConditions)).groupBy(muridTable.namaArab).orderBy(desc(sql`count(${nasyathTable.id})`)).limit(7);
      mostActiveMembers = results.map((result) => ({
        murid: result.namaArab ? { nama: result.namaArab } : null,
        activityCount: Number(result.activityCount)
      }));
    }
    const recentActivities = await db.select({
      id: nasyathTable.id,
      kegiatan: nasyathTable.kegiatan,
      tanggalMulai: nasyathTable.tanggalMulai,
      tempat: nasyathTable.tempat,
      muridNama: muridTable.namaArab
    }).from(nasyathTable).leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id)).where(and(...allConditions)).orderBy(desc(nasyathTable.tanggalMulai)).limit(5);
    return {
      dbError: false,
      canReadAll,
      kpi: {
        totalThisMonth: totalInRange,
        totalThisYear,
        mostFrequentActivity,
        kpiTitle
      },
      charts: {
        activitiesPerMonth: activitiesPerMonthResult,
        mostActiveMembers
      },
      recentActivities,
      isFiltered: !!(startDateParam && endDateParam)
    };
  } catch (e) {
    console.error("Database error in /member/nasyath_mun load:", e);
    return {
      dbError: true,
      message: "Gagal memuat data dashboard: Tidak dapat terhubung ke server.",
      canReadAll: false,
      kpi: { totalThisMonth: 0, totalThisYear: 0, mostFrequentActivity: "N/A", kpiTitle: "" },
      charts: { activitiesPerMonth: [], mostActiveMembers: [] },
      recentActivities: [],
      isFiltered: false
    };
  }
};
export {
  load
};
