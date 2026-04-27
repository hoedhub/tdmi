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

	// Rentang tanggal bulan yang dipilih
	const startDate = `${paramYear}-${String(paramMonth).padStart(2, '0')}-01`;
	const nextMonth = paramMonth === 12 ? 1 : paramMonth + 1;
	const nextYear = paramMonth === 12 ? paramYear + 1 : paramYear;
	const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

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
			status: pertanyaanAhbabTable.status,
			statusCatatan: pertanyaanAhbabTable.statusCatatan,
			statusUpdatedAt: pertanyaanAhbabTable.statusUpdatedAt,
			statusUpdatedBy: pertanyaanAhbabTable.statusUpdatedBy
		})
		.from(pertanyaanAhbabTable)
		.where(
			and(
				gte(pertanyaanAhbabTable.createdAt, startDate),
				lt(pertanyaanAhbabTable.createdAt, endDate),
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
