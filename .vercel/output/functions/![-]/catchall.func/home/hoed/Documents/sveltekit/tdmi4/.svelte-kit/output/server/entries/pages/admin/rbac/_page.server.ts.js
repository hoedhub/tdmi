import { error, fail } from "@sveltejs/kit";
import { u as userHasPermission, b as getAllUsers, g as getAllRoles, c as getAllPermissions, d as getUserRoleMap, e as getRolePermissionMap, f as getRoleHierarchy, h as updateUserRoles, i as updateRolePermissions, j as deleteRole, k as updateRole, l as createRole } from "../../../../chunks/accessControl.js";
const load = async ({ locals }) => {
  try {
    if (!locals.user) {
      throw error(401, "Unauthorized");
    }
    const canAccess = await userHasPermission(locals.user.id, "perm-admin-access");
    if (!canAccess) {
      throw error(403, "Akses Ditolak. Anda tidak memiliki izin untuk mengelola RBAC.");
    }
    const [users, roles, permissions, userRoleMap, rolePermissionMap, roleHierarchy] = await Promise.all([
      getAllUsers(),
      getAllRoles(),
      getAllPermissions(),
      getUserRoleMap(),
      getRolePermissionMap(),
      getRoleHierarchy()
    ]);
    return {
      dbError: false,
      users,
      roles,
      permissions,
      userRoleMap,
      rolePermissionMap,
      roleHierarchy
    };
  } catch (e) {
    if (e && typeof e === "object" && "status" in e && typeof e.status === "number" && e.status >= 400 && e.status < 500) {
      throw e;
    }
    console.error("Database error in /admin/rbac load:", e);
    return {
      dbError: true,
      message: "Gagal memuat data RBAC: Tidak dapat terhubung ke server.",
      // Return empty arrays for data to prevent runtime errors on the client
      users: [],
      roles: [],
      permissions: [],
      userRoleMap: [],
      rolePermissionMap: [],
      roleHierarchy: []
    };
  }
};
const actions = {
  updateUserRoles: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, "Unauthorized");
    }
    const canWrite = await userHasPermission(locals.user.id, "perm-user-write");
    if (!canWrite) {
      return fail(403, {
        message: "Akses ditolak. Anda tidak memiliki izin untuk mengubah peran pengguna."
      });
    }
    const formData = await request.formData();
    const userId = formData.get("userId");
    const selectedRoles = formData.getAll("roles");
    if (!userId) {
      return fail(400, { message: "User ID tidak valid." });
    }
    try {
      await updateUserRoles(userId, selectedRoles);
      return { success: true, message: `Peran untuk pengguna ${userId} berhasil diperbarui.` };
    } catch (e) {
      console.error("Gagal memperbarui peran pengguna:", e);
      return fail(500, { message: "Gagal memperbarui peran di server." });
    }
  },
  createRole: async ({ request, locals }) => {
    if (!locals.user) throw error(401);
    const canWrite = await userHasPermission(locals.user.id, "perm-role-write");
    if (!canWrite) return fail(403, { message: "Akses ditolak." });
    const formData = await request.formData();
    const id = formData.get("id");
    const name = formData.get("name");
    const description = formData.get("description");
    const errors = {};
    if (!id || id.length < 3) errors.id = ["ID harus minimal 3 karakter"];
    if (id && !/^[a-z0-9-]+$/.test(id))
      errors.id = ["ID hanya boleh berisi huruf kecil, angka, dan tanda hubung."];
    if (!name || name.length < 3) errors.name = ["Nama harus minimal 3 karakter"];
    if (Object.keys(errors).length > 0) {
      return fail(400, { errors });
    }
    try {
      await createRole({ id, name, description });
      return { success: true, message: `Peran "${name}" berhasil dibuat.`, action: "createRole" };
    } catch (e) {
      return fail(500, { message: "Gagal membuat peran. ID mungkin sudah ada." });
    }
  },
  updateRole: async ({ request, locals }) => {
    if (!locals.user) throw error(401);
    const canWrite = await userHasPermission(locals.user.id, "perm-role-write");
    if (!canWrite) return fail(403, { message: "Akses ditolak." });
    const formData = await request.formData();
    const id = formData.get("id");
    const name = formData.get("name");
    const description = formData.get("description");
    if (!name || name.length < 3) {
      return fail(400, { errors: { name: ["Nama harus minimal 3 karakter"] } });
    }
    try {
      await updateRole(id, { name, description });
      return { success: true, message: `Peran "${name}" berhasil diperbarui.` };
    } catch (e) {
      return fail(500, { message: "Gagal memperbarui peran." });
    }
  },
  deleteRole: async ({ request, locals }) => {
    if (!locals.user) throw error(401);
    const canWrite = await userHasPermission(locals.user.id, "perm-role-write");
    if (!canWrite) return fail(403, { message: "Akses ditolak." });
    const formData = await request.formData();
    const roleId = formData.get("id");
    if (!roleId) {
      return fail(400, { message: "Role ID tidak valid." });
    }
    try {
      await deleteRole(roleId);
      return { success: true, message: `Peran ${roleId} berhasil dihapus.`, action: "deleteRole" };
    } catch (e) {
      console.error(`Gagal menghapus peran ${roleId}:`, e);
      return fail(500, { message: "Gagal menghapus peran di server." });
    }
  },
  updateRolePermissions: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, "Unauthorized");
    }
    const canWrite = await userHasPermission(locals.user.id, "perm-role-write");
    if (!canWrite) {
      return fail(403, {
        message: "Akses ditolak. Anda tidak memiliki izin untuk mengubah izin peran."
      });
    }
    const formData = await request.formData();
    const roleId = formData.get("roleId");
    const selectedPermissions = formData.getAll("permissions");
    if (!roleId) {
      return fail(400, { message: "Role ID tidak valid." });
    }
    try {
      await updateRolePermissions(roleId, selectedPermissions);
      return { success: true, message: `Izin untuk peran ${roleId} berhasil diperbarui.` };
    } catch (e) {
      console.error("Gagal memperbarui izin peran:", e);
      return fail(500, { message: "Gagal memperbarui izin di server." });
    }
  },
  updateUsersForRole: async ({ request, locals }) => {
    if (!locals.user) throw error(401);
    const canWrite = await userHasPermission(locals.user.id, "perm-user-write");
    if (!canWrite) return fail(403, { message: "Akses ditolak." });
    const formData = await request.formData();
    const roleId = formData.get("roleId");
    const userIds = formData.getAll("userIds");
    if (!roleId) {
      return fail(400, { message: "Role ID tidak valid." });
    }
    try {
      await updateUserRoles(roleId, userIds);
      return { success: true, message: `Keanggotaan peran ${roleId} berhasil diperbarui.` };
    } catch (e) {
      console.error(`Gagal memperbarui pengguna untuk peran ${roleId}:`, e);
      return fail(500, { message: "Gagal memperbarui keanggotaan peran." });
    }
  }
};
export {
  actions,
  load
};
