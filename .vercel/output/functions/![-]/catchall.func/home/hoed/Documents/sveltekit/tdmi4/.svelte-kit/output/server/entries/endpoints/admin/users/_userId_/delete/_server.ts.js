import { l as lucia } from "../../../../../../chunks/auth.js";
import { d as db, s as sessionTable, u as usersTable } from "../../../../../../chunks/index.js";
import { eq } from "drizzle-orm";
import { error, json } from "@sveltejs/kit";
import { u as userHasPermission } from "../../../../../../chunks/accessControl.js";
const POST = async ({ locals, params }) => {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }
  const canDelete = await userHasPermission(locals.user.id, "perm-user-write");
  if (!canDelete) {
    throw error(403, "Forbidden: You do not have permission to delete users.");
  }
  const userIdToDelete = params.userId;
  if (!userIdToDelete) {
    throw error(400, "User ID is required.");
  }
  if (userIdToDelete === locals.user.id) {
    throw error(400, "Admins cannot delete their own account through this interface.");
  }
  try {
    await lucia.invalidateUserSessions(userIdToDelete);
    await db.delete(sessionTable).where(eq(sessionTable.userId, userIdToDelete));
    const deleteResult = await db.delete(usersTable).where(eq(usersTable.id, userIdToDelete)).returning({ id: usersTable.id });
    if (deleteResult.length === 0) {
      throw error(404, "User not found or already deleted.");
    }
    return json({ message: "User deleted successfully" }, { status: 200 });
  } catch (e) {
    console.error("Error deleting user:", e);
    if (e.status && e.body) throw e;
    throw error(500, e.message || "An unexpected error occurred while deleting the user.");
  }
};
export {
  POST
};
