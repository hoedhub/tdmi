import { error, json } from "@sveltejs/kit";
import { d as db, e as piketScheduleTable } from "../../../../../chunks/index.js";
import { u as userHasPermission } from "../../../../../chunks/accessControl.js";
import { eq } from "drizzle-orm";
const PUT = async ({ request, locals, params }) => {
  if (!locals.user) throw error(401);
  const canWrite = await userHasPermission(locals.user.id, "perm-piket-write");
  if (!canWrite) throw error(403, "Akses ditolak");
  const id = parseInt(params.id, 10);
  if (isNaN(id)) throw error(400, "ID tidak valid");
  const body = await request.json();
  const RUASA_ROLE_ID = "role-piket-admin";
  if (!body.userId || !body.startDate || !body.endDate) {
    throw error(400, "Field userId, startDate, dan endDate wajib diisi");
  }
  const [updatedSchedule] = await db.update(piketScheduleTable).set({
    userId: body.userId,
    roleId: RUASA_ROLE_ID,
    // <-- Menggunakan peran yang sudah ditetapkan
    startDate: body.startDate,
    endDate: body.endDate,
    groupId: body.groupId,
    description: body.description
  }).where(eq(piketScheduleTable.id, id)).returning();
  if (!updatedSchedule) {
    throw error(404, "Jadwal tidak ditemukan");
  }
  return json(updatedSchedule);
};
const DELETE = async ({ locals, params }) => {
  if (!locals.user) throw error(401);
  const canWrite = await userHasPermission(locals.user.id, "perm-piket-write");
  if (!canWrite) throw error(403, "Akses ditolak");
  const id = parseInt(params.id, 10);
  if (isNaN(id)) throw error(400, "ID tidak valid");
  const [deletedSchedule] = await db.delete(piketScheduleTable).where(eq(piketScheduleTable.id, id)).returning();
  if (!deletedSchedule) {
    throw error(404, "Jadwal tidak ditemukan");
  }
  return json({ message: "Jadwal berhasil dihapus" });
};
export {
  DELETE,
  PUT
};
