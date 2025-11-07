import { d as db, e as piketScheduleTable } from "../../../../../chunks/index.js";
import { u as userHasPermission } from "../../../../../chunks/accessControl.js";
import { error, json } from "@sveltejs/kit";
import { nanoid } from "nanoid";
const POST = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, "Tidak terautentikasi");
  }
  const canWrite = await userHasPermission(locals.user.id, "perm-piket-write");
  if (!canWrite) {
    throw error(403, "Akses ditolak");
  }
  const schedulesToCreate = await request.json();
  if (!Array.isArray(schedulesToCreate) || schedulesToCreate.length === 0) {
    throw error(400, "Request body harus berupa array jadwal yang tidak kosong.");
  }
  const RUASA_ROLE_ID = "role-piket-admin";
  const groupId = nanoid(10);
  const newSchedules = schedulesToCreate.map((s) => {
    if (!s.userId || !s.startDate || !s.endDate) {
      throw error(400, "Setiap jadwal harus memiliki userId, startDate, dan endDate.");
    }
    return {
      userId: s.userId,
      roleId: RUASA_ROLE_ID,
      startDate: s.startDate,
      endDate: s.endDate,
      groupId
    };
  });
  try {
    await db.transaction(async (tx) => {
      await tx.insert(piketScheduleTable).values(newSchedules);
    });
  } catch (e) {
    console.error("Gagal menyimpan jadwal putaran:", e);
    throw error(500, "Terjadi kesalahan pada server saat menyimpan jadwal.");
  }
  return json({ message: "Jadwal putaran berhasil disimpan.", groupId }, { status: 201 });
};
export {
  POST
};
