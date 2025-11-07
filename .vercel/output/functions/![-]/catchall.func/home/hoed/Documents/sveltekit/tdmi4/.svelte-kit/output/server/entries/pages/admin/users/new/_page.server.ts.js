import { Argon2id } from "oslo/password";
import { d as db, m as muridTable, u as usersTable } from "../../../../../chunks/index.js";
import { eq } from "drizzle-orm";
import { redirect, error, fail } from "@sveltejs/kit";
import { u as userHasPermission, g as getAllRoles, f as getRoleHierarchy, h as updateUserRoles } from "../../../../../chunks/accessControl.js";
import { generateId } from "lucia";
const load = async ({ locals }) => {
  if (!locals.user) throw redirect(302, `/login`);
  const canWriteUsers = await userHasPermission(locals.user.id, "perm-user-write");
  if (!canWriteUsers) {
    throw error(403, "Akses Ditolak");
  }
  const [allRoles, allMurids, roleHierarchy] = await Promise.all([
    getAllRoles(),
    db.select({ id: muridTable.id, nama: muridTable.nama }).from(muridTable),
    getRoleHierarchy()
  ]);
  return {
    allAvailableRoles: allRoles,
    allMurids,
    roleHierarchy
  };
};
const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw error(401, "Unauthorized");
    const canWriteUsers = await userHasPermission(locals.user.id, "perm-user-write");
    if (!canWriteUsers) {
      return fail(403, { message: "Akses Ditolak" });
    }
    const formData = await request.formData();
    const username = formData.get("username");
    const password = formData.get("password");
    const active = formData.has("active");
    const muridIdStr = formData.get("muridId");
    const selectedRoles = formData.getAll("roles").map(String);
    let formState = { username, selectedRoles, active, muridIdStr, message: "" };
    if (!username || username.length < 3) {
      return fail(400, { ...formState, message: "Username minimal 3 karakter." });
    }
    if (!password || password.length < 6) {
      return fail(400, { ...formState, message: "Password minimal 6 karakter." });
    }
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.username, username)
    });
    if (existingUser) {
      return fail(400, { ...formState, message: "Username sudah digunakan." });
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
      const userId = generateId(15);
      const passwordHash = await new Argon2id().hash(password);
      await db.insert(usersTable).values({
        id: userId,
        username,
        passwordHash,
        active,
        muridId
      });
      if (selectedRoles.length > 0) {
        await updateUserRoles(userId, selectedRoles);
      }
    } catch (e) {
      console.error("Error creating user:", e);
      return fail(500, { ...formState, message: e.message || "Gagal membuat pengguna." });
    }
    throw redirect(303, "/admin/users");
  }
};
export {
  actions,
  load
};
