import { json, error } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { piketScheduleTable, usersTable, rolesTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET /api/piket-schedule
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401);
	const canRead = await userHasPermission(locals.user.id, 'perm-piket-read');
	if (!canRead) throw error(403, 'Akses ditolak');

	const schedules = await db
		.select({
			id: piketScheduleTable.id,
			startDate: piketScheduleTable.startDate,
			endDate: piketScheduleTable.endDate,
			groupId: piketScheduleTable.groupId,
			description: piketScheduleTable.description,
			userId: piketScheduleTable.userId,
			username: usersTable.username,
			roleId: piketScheduleTable.roleId,
			roleName: rolesTable.name
		})
		.from(piketScheduleTable)
		.leftJoin(usersTable, eq(piketScheduleTable.userId, usersTable.id))
		.leftJoin(rolesTable, eq(piketScheduleTable.roleId, rolesTable.id))
		.orderBy(piketScheduleTable.startDate);

	return json(schedules);
};

// POST /api/piket-schedule
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401);
	const canWrite = await userHasPermission(locals.user.id, 'perm-piket-write');
	if (!canWrite) throw error(403, 'Akses ditolak');

	const body = await request.json();
	const RUASA_ROLE_ID = 'role-piket-admin'; // <-- Peran ditetapkan di sini

	// Validasi sederhana
	if (!body.userId || !body.startDate || !body.endDate) {
		throw error(400, 'Field userId, startDate, dan endDate wajib diisi');
	}

	const [newSchedule] = await db
		.insert(piketScheduleTable)
		.values({
			userId: body.userId,
			roleId: RUASA_ROLE_ID, // <-- Menggunakan peran yang sudah ditetapkan
			startDate: body.startDate,
			endDate: body.endDate,
			groupId: body.groupId,
			description: body.description
		})
		.returning();

	return json(newSchedule, { status: 201 });
};
