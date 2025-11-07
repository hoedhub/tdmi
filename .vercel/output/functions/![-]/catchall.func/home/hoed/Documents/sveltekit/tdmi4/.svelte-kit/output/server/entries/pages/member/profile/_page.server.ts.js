import { Argon2id } from "oslo/password";
import { d as db, u as usersTable } from "../../../../chunks/index.js";
import { eq } from "drizzle-orm";
import { redirect, error, fail } from "@sveltejs/kit";
const load = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, "/login");
  }
  const userToEdit = await db.select({
    id: usersTable.id,
    username: usersTable.username
  }).from(usersTable).where(eq(usersTable.id, locals.user.id)).limit(1);
  if (!userToEdit || userToEdit.length === 0) {
    throw error(404, "User not found");
  }
  return {
    userToEdit: userToEdit[0]
  };
};
const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: "Unauthorized" });
    }
    const formData = await request.formData();
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");
    let formState = { message: "" };
    if (!currentPassword || !newPassword || !confirmPassword) {
      return fail(400, { ...formState, message: "All password fields are required." });
    }
    if (newPassword.length < 6) {
      return fail(400, { ...formState, message: "New password must be at least 6 characters." });
    }
    if (newPassword !== confirmPassword) {
      return fail(400, { ...formState, message: "New password and confirmation do not match." });
    }
    const user = await db.select().from(usersTable).where(eq(usersTable.id, locals.user.id)).limit(1);
    if (!user || user.length === 0) {
      return fail(404, { ...formState, message: "User not found." });
    }
    if (user[0].passwordHash === null) {
      return fail(500, { ...formState, message: "User password hash is missing." });
    }
    const validPassword = await new Argon2id().verify(user[0].passwordHash, currentPassword);
    if (!validPassword) {
      return fail(400, { ...formState, message: "Invalid current password." });
    }
    try {
      const hashedPassword = await new Argon2id().hash(newPassword);
      await db.update(usersTable).set({ passwordHash: hashedPassword }).where(eq(usersTable.id, locals.user.id));
    } catch (e) {
      console.error("Error updating password:", e);
      if (e.status && e.body) throw e;
      return fail(500, {
        ...formState,
        message: e.message || "Failed to update password due to a server error."
      });
    }
    return { success: true, message: "Password updated successfully!" };
  }
};
export {
  actions,
  load
};
