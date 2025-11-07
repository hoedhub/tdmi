import { error } from "@sveltejs/kit";
import { u as userHasPermission } from "../../../../chunks/accessControl.js";
const load = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }
  const hasAccess = userHasPermission(locals.user.id, "perm-nasyath-access");
  if (!hasAccess) {
    throw error(403, "Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman Nasyath.");
  }
  return {
    message: "Selamat datang di halaman Nasyath. Akses diberikan."
  };
};
export {
  load
};
