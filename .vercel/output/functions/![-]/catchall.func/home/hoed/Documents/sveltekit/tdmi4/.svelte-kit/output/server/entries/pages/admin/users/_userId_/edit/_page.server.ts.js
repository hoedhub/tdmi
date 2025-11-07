import { Argon2id } from "oslo/password";
import { d as db, u as usersTable, m as muridTable } from "../../../../../../chunks/index.js";
import { eq } from "drizzle-orm";
import { redirect, error, fail } from "@sveltejs/kit";
import { u as userHasPermission, g as getAllRoles, a as getUserRoles, f as getRoleHierarchy, h as updateUserRoles } from "../../../../../../chunks/accessControl.js";
const load = async ({ locals, params, url }) => {
  if (!locals.user) throw redirect(302, `/login?redirectTo=${url.pathname}`);
  const canWriteUsers = await userHasPermission(locals.user.id, "perm-user-write");
  if (!canWriteUsers) {
    throw error(403, "Akses Ditolak");
  }
  const userIdToEdit = params.userId;
  if (!userIdToEdit) {
    throw error(400, "User ID dibutuhkan");
  }
  const [userToEdit, allRoles, allMurids, assignedRoleIds, roleHierarchy] = await Promise.all([
    db.query.usersTable.findFirst({
      where: eq(usersTable.id, userIdToEdit),
      columns: { id: true, username: true, active: true, muridId: true }
    }),
    getAllRoles(),
    db.select({ id: muridTable.id, nama: muridTable.nama }).from(muridTable),
    getUserRoles(userIdToEdit),
    getRoleHierarchy()
  ]);
  if (!userToEdit) {
    throw error(404, "User tidak ditemukan");
  }
  return {
    userToEdit: { ...userToEdit, assignedRoles: assignedRoleIds },
    allAvailableRoles: allRoles,
    allMurids,
    roleHierarchy
  };
};
const actions = {
  default: async ({ request, locals, params }) => {
    if (!locals.user) throw error(401, "Unauthorized");
    const canWriteUsers = await userHasPermission(locals.user.id, "perm-user-write");
    if (!canWriteUsers) {
      return fail(403, { message: "Akses Ditolak" });
    }
    const userIdToEdit = params.userId;
    const formData = await request.formData();
    const password = formData.get("password");
    const active = formData.has("active");
    const muridIdStr = formData.get("muridId");
    const selectedRoles = formData.getAll("roles").map(String);
    const formState = {
      selectedRoles,
      active,
      muridIdStr,
      message: "",
      userId: userIdToEdit
    };
    if (!userIdToEdit) {
      throw error(404, "User ID tidak ditemukan.");
    }
    if (password && password.length < 6) {
      return fail(400, { ...formState, message: "Password baru minimal 6 karakter." });
    }
    if (userIdToEdit === locals.user.id) {
      const myRoles = await getUserRoles(locals.user.id);
      if (myRoles.includes("role-admin") && !selectedRoles.includes("role-admin")) {
        return fail(400, {
          ...formState,
          message: "Admin tidak bisa menghapus peran 'admin' dari akunnya sendiri."
        });
      }
      if (!active) {
        return fail(400, {
          ...formState,
          message: "Admin tidak bisa menonaktifkan akunnya sendiri."
        });
      }
    }
    let muridId = null;
    if (muridIdStr) {
      const parsedId = parseInt(muridIdStr, 10);
      if (isNaN(parsedId)) {
        return fail(400, { ...formState, message: "Murid ID tidak valid." });
      }
      muridId = parsedId;
    }
    try {
      const updateData = {
        active,
        muridId
      };
      if (password) {
        updateData.passwordHash = await new Argon2id().hash(password);
      }
      const updateUserTablePromise = db.update(usersTable).set(updateData).where(eq(usersTable.id, userIdToEdit));
      const updateUserRolesPromise = updateUserRoles(userIdToEdit, selectedRoles);
      await Promise.all([updateUserTablePromise, updateUserRolesPromise]);
    } catch (e) {
      console.error("Error updating user:", e);
      return fail(500, {
        ...formState,
        message: e.message || "Gagal memperbarui pengguna karena kesalahan server."
      });
    }
    throw redirect(303, "/admin/users");
  }
};
export {
  actions,
  load
};
