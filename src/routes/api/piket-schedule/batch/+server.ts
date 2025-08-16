import { db } from '$lib/drizzle';
import { piketScheduleTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { nanoid } from 'nanoid';

// Endpoint untuk membuat beberapa jadwal piket sekaligus (batch)
export const POST: RequestHandler = async ({ request, locals }) => {
	// 1. Cek otentikasi dan otorisasi
	if (!locals.user) {
		throw error(401, 'Tidak terautentikasi');
	}
	const canWrite = await userHasPermission(locals.user.id, 'perm-piket-write');
	if (!canWrite) {
		throw error(403, 'Akses ditolak');
	}

	// 2. Ambil dan validasi body request
	const schedulesToCreate: Array<{
		userId: string;
		startDate: string;
		endDate: string;
	}> = await request.json();

	if (!Array.isArray(schedulesToCreate) || schedulesToCreate.length === 0) {
		throw error(400, 'Request body harus berupa array jadwal yang tidak kosong.');
	}

	// 3. Siapkan data untuk dimasukkan ke database
	const RUASA_ROLE_ID = 'role-piket-admin';
	const groupId = nanoid(10); // Buat ID unik untuk seluruh putaran ini

	const newSchedules = schedulesToCreate.map((s) => {
		// Validasi setiap item jadwal
		if (!s.userId || !s.startDate || !s.endDate) {
			throw error(400, 'Setiap jadwal harus memiliki userId, startDate, dan endDate.');
		}
		return {
			userId: s.userId,
			roleId: RUASA_ROLE_ID,
			startDate: s.startDate,
			endDate: s.endDate,
			groupId: groupId
		};
	});

	// 4. Gunakan transaksi untuk memastikan semua jadwal berhasil dibuat atau tidak sama sekali
	try {
		await db.transaction(async (tx) => {
			await tx.insert(piketScheduleTable).values(newSchedules);
		});
	} catch (e) {
		console.error('Gagal menyimpan jadwal putaran:', e);
		throw error(500, 'Terjadi kesalahan pada server saat menyimpan jadwal.');
	}

	// 5. Kembalikan respons sukses
	return json({ message: 'Jadwal putaran berhasil disimpan.', groupId }, { status: 201 });
};
