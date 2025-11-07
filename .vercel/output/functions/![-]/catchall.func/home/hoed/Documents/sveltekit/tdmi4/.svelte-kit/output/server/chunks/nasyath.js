import { d as db, u as usersTable } from "./index.js";
import { eq } from "drizzle-orm";
import { u as userHasPermission } from "./accessControl.js";
async function canUserAccessNasyath(userId, nasyathMuridId, accessType) {
  const requiredPermission = "perm-nasyath-write";
  const hasGlobalPermission = await userHasPermission(userId, requiredPermission);
  if (hasGlobalPermission) {
    return true;
  }
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: {
      muridId: true
    }
  });
  if (!user || !user.muridId) {
    return false;
  }
  return user.muridId === nasyathMuridId;
}
export {
  canUserAccessNasyath as c
};
