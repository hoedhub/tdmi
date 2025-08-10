import { json, error } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { piketScheduleTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// PUT /api/piket-schedule/[id]
export const PUT: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) throw error(401);
	const canWrite = await userHasPermission(locals.user.id, 'perm-piket-write');
	if (!canWrite) throw error(403, 'Akses ditolak');

	const id = parseInt(params.id, 10);
	if (isNaN(id)) throw error(400, 'ID tidak valid');

	const body = await request.json();

	// Validasi sederhana
	if (!body.userId || !body.roleId || !body.startDate || !body.endDate) {
		throw error(400, 'Field userId, roleId, startDate, dan endDate wajib diisi');
	}

	const [updatedSchedule] = await db
		.update(piketScheduleTable)
		.set({
			userId: body.userId,
			roleId: body.roleId,
			startDate: body.startDate,
			endDate: body.endDate,
			groupId: body.groupId,
			description: body.description
		})
		.where(eq(piketScheduleTable.id, id))
		.returning();

	if (!updatedSchedule) {
		throw error(404, 'Jadwal tidak ditemukan');
	}

	return json(updatedSchedule);
};

// DELETE /api/piket-schedule/[id]
export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) throw error(401);
	const canWrite = await userHasPermission(locals.user.id, 'perm-piket-write');
	if (!canWrite) throw error(403, 'Akses ditolak');

	const id = parseInt(params.id, 10);
	if (isNaN(id)) throw error(400, 'ID tidak valid');

	const [deletedSchedule] = await db
		.delete(piketScheduleTable)
		.where(eq(piketScheduleTable.id, id))
		.returning();

	if (!deletedSchedule) {
		throw error(404, 'Jadwal tidak ditemukan');
	}

	return json({ message: 'Jadwal berhasil dihapus' });
};
