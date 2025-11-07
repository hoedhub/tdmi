import { error, json } from "@sveltejs/kit";
import { d as db, m as muridTable } from "../../../../../../chunks/index.js";
import { u as userHasPermission } from "../../../../../../chunks/accessControl.js";
import { eq } from "drizzle-orm";
const POST = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }
  const muridId = parseInt(params.muridId);
  if (isNaN(muridId)) {
    throw error(400, "Invalid Murid ID");
  }
  try {
    const muridToDelete = await db.select({ deskelId: muridTable.deskelId }).from(muridTable).where(eq(muridTable.id, muridId)).get();
    if (!muridToDelete) {
      throw error(404, "Murid not found.");
    }
    const canWriteMurid = await userHasPermission(
      locals.user.id,
      "perm-pendataan-write",
      { deskelId: muridToDelete.deskelId }
      // Pass deskelId for territory check
    );
    if (!canWriteMurid) {
      throw error(403, "Akses Ditolak. Anda tidak memiliki izin untuk menghapus data murid ini.");
    }
    const result = await db.delete(muridTable).where(eq(muridTable.id, muridId)).run();
    if (result.rowsAffected === 0) {
      throw error(404, "Murid not found or already deleted.");
    }
    return json({ success: true, message: "Murid berhasil dihapus." });
  } catch (e) {
    console.error(`Error deleting murid ${muridId}:`, e);
    if (e instanceof Error && e.status) {
      throw e;
    }
    throw error(500, "Gagal menghapus murid karena kesalahan server.");
  }
};
export {
  POST
};
