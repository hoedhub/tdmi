import { db } from '$lib/drizzle';
import { muridTable, usersTable, nasyathTable, errorLogTable } from '$lib/drizzle/schema';
import { count, eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const now = new Date();
	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - now.getDay());
	startOfWeek.setHours(0, 0, 0, 0);
	const startOfWeekStr = startOfWeek.toISOString().slice(0, 19).replace('T', ' ');

	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfMonthStr = startOfMonth.toISOString().slice(0, 19).replace('T', ' ');

	const [
		muridTotal,
		muridActive,
		muridByGender,
		muridByMarhalah,
		muridNewThisWeek,
		muridNoFoto,
		muridNoWilayah,
		userTotal,
		userActive,
		nasyathTotal,
		nasyathThisMonth,
		errorUnresolved,
		recentMurid
	] = await Promise.all([
		db.select({ value: count() }).from(muridTable).then(r => r[0]?.value ?? 0),
		db.select({ value: count() }).from(muridTable).where(eq(muridTable.aktif, true)).then(r => r[0]?.value ?? 0),
		db.select({ gender: muridTable.gender, value: count() }).from(muridTable).groupBy(muridTable.gender),
		db.select({ marhalah: muridTable.marhalah, value: count() }).from(muridTable).groupBy(muridTable.marhalah),
		db.select({ value: count() }).from(muridTable).where(sql`updated_at >= ${startOfWeekStr}`).then(r => r[0]?.value ?? 0),
		db.select({ value: count() }).from(muridTable).where(sql`${muridTable.fotoPublicId} IS NULL`).then(r => r[0]?.value ?? 0),
		db.select({ value: count() }).from(muridTable).where(sql`${muridTable.deskelId} IS NULL`).then(r => r[0]?.value ?? 0),
		db.select({ value: count() }).from(usersTable).then(r => r[0]?.value ?? 0),
		db.select({ value: count() }).from(usersTable).where(eq(usersTable.active, true)).then(r => r[0]?.value ?? 0),
		db.select({ value: count() }).from(nasyathTable).then(r => r[0]?.value ?? 0),
		db.select({ value: count() }).from(nasyathTable).where(sql`created_at >= ${startOfMonthStr}`).then(r => r[0]?.value ?? 0),
		db.select({ value: count() }).from(errorLogTable).where(eq(errorLogTable.resolved, false)).then(r => r[0]?.value ?? 0),
		db.select({
			id: muridTable.id,
			nama: muridTable.nama,
			gender: muridTable.gender,
			marhalah: muridTable.marhalah,
			aktif: muridTable.aktif,
			updatedAt: muridTable.updatedAt
		})
			.from(muridTable)
			.orderBy(sql`updated_at DESC`)
			.limit(10)
	]);

	const genderDist = Object.fromEntries(muridByGender.map(r => [r.gender ? 'laki' : 'perempuan', r.value]));
	const marhalahDist = Object.fromEntries(muridByMarhalah.map(r => [r.marhalah, r.value]));
	const muridInactive = muridTotal - muridActive;

	return {
		muridTotal,
		muridActive,
		muridInactive,
		muridNewThisWeek,
		muridNoFoto,
		muridNoWilayah,
		genderDist,
		marhalahDist,
		userTotal,
		userActive,
		nasyathTotal,
		nasyathThisMonth,
		errorUnresolved,
		recentMurid
	};
};
