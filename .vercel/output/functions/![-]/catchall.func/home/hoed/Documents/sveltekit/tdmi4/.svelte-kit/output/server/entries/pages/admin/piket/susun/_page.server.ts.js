import { error } from "@sveltejs/kit";
import { u as userHasPermission, b as getAllUsers } from "../../../../../chunks/accessControl.js";
const load = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, "Tidak terautentikasi");
  }
  const canWrite = await userHasPermission(locals.user.id, "perm-piket-write");
  if (!canWrite) {
    throw error(403, "Akses ditolak: Anda tidak memiliki izin untuk menyusun jadwal piket.");
  }
  const users = await getAllUsers();
  return {
    users
  };
};
export {
  load
};
