import "../../../../chunks/index.js";
import { error, fail } from "@sveltejs/kit";
import { u as userHasPermission, h as updateUserRoles } from "../../../../chunks/accessControl.js";
const load = async ({ locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");
  const canReadUsers = await userHasPermission(locals.user.id, "perm-user-read");
  if (!canReadUsers) {
    throw error(403, "Akses Ditolak. Anda tidak memiliki izin untuk melihat data pengguna.");
  }
  return {
    // Pass the current user for potential client-side checks (e.g., cannot delete self)
    user: locals.user,
    // Initial empty state, client will fetch the real data.
    users: [],
    totalItems: 0,
    allRoles: [],
    roleHierarchy: []
  };
};
const actions = {
  updateUserRoles: async ({ request, locals }) => {
    if (!locals.user) throw error(401, "Unauthorized");
    try {
      const canWriteUsers = await userHasPermission(locals.user.id, "perm-user-write");
      if (!canWriteUsers) {
        return fail(403, {
          message: "Akses Ditolak. Anda tidak memiliki izin untuk mengubah peran pengguna."
        });
      }
      const data = await request.formData();
      const userId = data.get("userId")?.toString();
      const selectedRoles = data.getAll("roles").map(String);
      if (!userId) {
        return fail(400, { message: "User ID dibutuhkan." });
      }
      await updateUserRoles(userId, selectedRoles);
      return { success: true, message: `Peran untuk pengguna ${userId} berhasil diperbarui.` };
    } catch (e) {
      console.error(`Error in updateUserRoles action for user ${locals.user.id}:`, e);
      if (e && typeof e === "object" && "status" in e) {
        return fail(e.status, e.body || { message: "Terjadi kesalahan yang tidak diketahui." });
      }
      return fail(503, {
        message: `Gagal memperbarui peran: Server tidak dapat dihubungi. Silakan coba lagi.`
      });
    }
  }
};
export {
  actions,
  load
};
