import { redirect, error } from "@sveltejs/kit";
import { u as userHasPermission } from "../../chunks/accessControl.js";
const load = async ({ locals, url }) => {
  const returnData = {
    user: locals.user
  };
  const unauthenticatedRoutes = ["/login", "/signup"];
  if (!locals.user) {
    if (!unauthenticatedRoutes.includes(url.pathname)) {
      throw redirect(302, "/login");
    }
  } else {
    if (unauthenticatedRoutes.includes(url.pathname) || url.pathname === "/") {
      throw redirect(303, "/member");
    }
    try {
      const [canAccessAdmin, canAccessPendataan, canManagePiket] = await Promise.all([
        userHasPermission(locals.user.id, "perm-admin-access"),
        userHasPermission(locals.user.id, "perm-pendataan-access"),
        userHasPermission(locals.user.id, "perm-piket-read")
      ]);
      returnData.canAccessAdmin = canAccessAdmin;
      returnData.canAccessPendataan = canAccessPendataan;
      returnData.canManagePiket = canManagePiket;
    } catch (e) {
      console.error(`Database error in root layout load for user ${locals.user.id}:`, e);
      throw error(503, "Gagal memuat data pengguna: Server tidak dapat dihubungi.");
    }
  }
  return returnData;
};
export {
  load
};
