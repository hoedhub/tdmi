import { db } from '$lib/drizzle';
import { piketScheduleTable } from '$lib/drizzle/schema';
import { requirePermission } from '$lib/server/accessControl';
import { batchPiketScheduleSchema } from '$lib/schemas/api';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { nanoid } from 'nanoid';

// Endpoint untuk membuat beberapa jadwal piket sekaligus (batch)
export const POST: RequestHandler = async ({ request, locals }) => {
	// Auth + permission check
	await requirePermission(locals, 'perm-piket-write');

	// Validate input with zod
	const rawBody = await request.json();
	const parsed = batchPiketScheduleSchema.safeParse(rawBody);
	if (!parsed.success) {
		throw error(400, `Validasi gagal: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
	}
	const schedulesToCreate = parsed.data;

	// Siapkan data untuk dimasukkan ke database
	const RUASA_ROLE_ID = 'role-piket-admin';
	const groupId = nanoid(10);

	const newSchedules = schedulesToCreate.map((s) => ({
		userId: s.userId,
		roleId: RUASA_ROLE_ID,
		startDate: s.startDate,
		endDate: s.endDate,
		groupId: groupId
	}));

	// Gunakan transaksi untuk memastikan semua jadwal berhasil dibuat atau tidak sama sekali
	try {
		await db.transaction(async (tx) => {
			await tx.insert(piketScheduleTable).values(newSchedules);
		});
	} catch (e) {
		console.error('Gagal menyimpan jadwal putaran:', e);
		throw error(500, 'Terjadi kesalahan pada server saat menyimpan jadwal.');
	}

	return json({ message: 'Jadwal putaran berhasil disimpan.', groupId }, { status: 201 });
};
