import { redirect, error } from "@sveltejs/kit";
import { u as userHasPermission } from "../../../chunks/accessControl.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
const load = async ({ locals, url }) => {
  if (!locals.user) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }
  try {
    const canAccess = await userHasPermission(locals.user.id, "perm-admin-access");
    if (!canAccess) {
      throw error(403, "Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.");
    }
    const [canManagePiket, canCreateBackup] = await Promise.all([
      userHasPermission(locals.user.id, "perm-piket-read"),
      userHasPermission(locals.user.id, "perm-backup-create")
    ]);
    return {
      user: locals.user,
      canManagePiket,
      canCreateBackup
    };
  } catch (e) {
    if (e && typeof e === "object" && "status" in e && e.status === 403) {
      throw e;
    }
    console.error(`Database error in admin layout load for user ${locals.user.id}:`, e);
    throw error(503, "Gagal memuat data admin: Server tidak dapat dihubungi.");
  }
};
export {
  load
};
