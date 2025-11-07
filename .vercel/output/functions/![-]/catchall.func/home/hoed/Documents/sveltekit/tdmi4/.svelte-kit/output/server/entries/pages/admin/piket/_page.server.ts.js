import { error } from "@sveltejs/kit";
import { u as userHasPermission, b as getAllUsers } from "../../../../chunks/accessControl.js";
const load = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, "Tidak terautentikasi");
  }
  try {
    const canWrite = await userHasPermission(locals.user.id, "perm-piket-write");
    const users = await getAllUsers();
    return {
      dbError: false,
      users,
      permissions: {
        canWrite
      }
    };
  } catch (e) {
    if (e && typeof e === "object" && "status" in e && typeof e.status === "number" && e.status >= 400 && e.status < 500) {
      throw e;
    }
    console.error("Database error in /admin/piket load:", e);
    return {
      dbError: true,
      message: "Gagal memuat data piket: Tidak dapat terhubung ke server.",
      users: [],
      permissions: {
        canWrite: false
      }
    };
  }
};
export {
  load
};
