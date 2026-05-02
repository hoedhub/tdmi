import { db } from '$lib/drizzle';
import { pertanyaanAhbabTable, usersTable } from '$lib/drizzle/schema';
import { fail, redirect } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(302, '/login');

	const canAccess = await userHasPermission(locals.user.id, 'perm-ayyu-sual-access');
	if (!canAccess) throw redirect(302, '/member');

	// Ambil parameter filter bulan & tahun dari URL
	const now = new Date();
	const paramYear = parseInt(url.searchParams.get('year') ?? String(now.getFullYear()));
	const paramMonth = parseInt(url.searchParams.get('month') ?? String(now.getMonth() + 1));
	const paramStatus = url.searchParams.get('status') ?? 'semua';

	// Query pertanyaan dengan filter
	let query = db
		.select({
			id: pertanyaanAhbabTable.id,
			nama: pertanyaanAhbabTable.nama,
			alamat: pertanyaanAhbabTable.alamat,
			email: pertanyaanAhbabTable.email,
			namaMursyid: pertanyaanAhbabTable.namaMursyid,
			pertanyaan: pertanyaanAhbabTable.pertanyaan,
			createdAt: pertanyaanAhbabTable.createdAt,
			periodeMonth: pertanyaanAhbabTable.periodeMonth,
			periodeYear: pertanyaanAhbabTable.periodeYear,
			status: pertanyaanAhbabTable.status,
			statusCatatan: pertanyaanAhbabTable.statusCatatan,
			statusUpdatedAt: pertanyaanAhbabTable.statusUpdatedAt,
			statusUpdatedBy: pertanyaanAhbabTable.statusUpdatedBy
		})
		.from(pertanyaanAhbabTable)
		.where(
			and(
				eq(pertanyaanAhbabTable.periodeMonth, paramMonth),
				eq(pertanyaanAhbabTable.periodeYear, paramYear),
				paramStatus !== 'semua'
					? paramStatus === 'belum'
						? sql`${pertanyaanAhbabTable.status} IS NULL`
						: eq(pertanyaanAhbabTable.status, paramStatus as 'hijau' | 'kuning' | 'merah')
					: undefined
			)
		)
		.orderBy(pertanyaanAhbabTable.createdAt);

	const pertanyaan = await query;

	// Hitung hari tersisa menuju deadline (tgl 28)
	const today = now.getDate();
	const currentMonth = now.getMonth() + 1;
	const currentYear = now.getFullYear();
	const deadlineDay = 28;
	const isCurrentMonth = paramMonth === currentMonth && paramYear === currentYear;
	const daysUntilDeadline = isCurrentMonth ? deadlineDay - today : null;

	return {
		pertanyaan,
		filterYear: paramYear,
		filterMonth: paramMonth,
		filterStatus: paramStatus,
		daysUntilDeadline,
		isCurrentMonth
	};
};

export const actions: Actions = {
	movePeriod: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');

		const canAccess = await userHasPermission(locals.user.id, 'perm-ayyu-sual-access');
		if (!canAccess) return fail(403, { msg: 'Akses ditolak.' });

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);
		const targetMonth = parseInt(formData.get('targetMonth') as string);
		const targetYear = parseInt(formData.get('targetYear') as string);

		if (!id || isNaN(id) || !targetMonth || !targetYear || isNaN(targetMonth) || isNaN(targetYear)) {
			return fail(400, { msg: 'Input tidak valid.' });
		}

		await db
			.update(pertanyaanAhbabTable)
			.set({
				periodeMonth: targetMonth,
				periodeYear: targetYear,
				statusUpdatedAt: new Date().toISOString(),
				statusUpdatedBy: locals.user.id
			})
			.where(eq(pertanyaanAhbabTable.id, id));

		return { success: true };
	},

	updateStatus: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');

		const canAccess = await userHasPermission(locals.user.id, 'perm-ayyu-sual-access');
		if (!canAccess) return fail(403, { msg: 'Akses ditolak.' });

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);
		const status = formData.get('status') as string | null;
		const catatan = (formData.get('catatan') as string) || null;

		if (!id || isNaN(id)) return fail(400, { msg: 'ID tidak valid.' });
		if (status && !['hijau', 'kuning', 'merah'].includes(status)) {
			return fail(400, { msg: 'Status tidak valid.' });
		}

		await db
			.update(pertanyaanAhbabTable)
			.set({
				status: (status as 'hijau' | 'kuning' | 'merah') || null,
				statusCatatan: catatan,
				statusUpdatedAt: new Date().toISOString(),
				statusUpdatedBy: locals.user.id
			})
			.where(eq(pertanyaanAhbabTable.id, id));

		return { success: true };
	}
};
