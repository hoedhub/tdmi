import { u as userHasPermission } from "../../../../chunks/accessControl.js";
const load = async ({ locals }) => {
  const { user } = locals;
  if (!user) {
    return {
      canCreateBackup: false
    };
  }
  const canCreateBackup = await userHasPermission(user.id, "perm-backup-create");
  return {
    canCreateBackup
  };
};
export {
  load
};
