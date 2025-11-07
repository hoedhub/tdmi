import { d as db, r as rolesTable, a as userRolesTable, u as usersTable, g as permissionsTable, h as rolePermissionsTable, i as roleHierarchyTable, e as piketScheduleTable, p as propTable, m as muridTable, b as deskelTable, k as kecamatanTable, c as kokabTable } from "./index.js";
import { eq, or, sql } from "drizzle-orm";
async function createRole(role) {
  return db.insert(rolesTable).values(role);
}
async function updateRole(roleId, updates) {
  return db.update(rolesTable).set(updates).where(eq(rolesTable.id, roleId));
}
async function deleteRole(roleId) {
  await db.transaction(async (tx) => {
    await tx.delete(userRolesTable).where(eq(userRolesTable.roleId, roleId));
    await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId));
    await tx.delete(roleHierarchyTable).where(
      or(eq(roleHierarchyTable.parentRoleId, roleId), eq(roleHierarchyTable.childRoleId, roleId))
    );
    await tx.delete(rolesTable).where(eq(rolesTable.id, roleId));
  });
}
async function getUserRoles(userId) {
  const roles = await db.select({ roleId: userRolesTable.roleId }).from(userRolesTable).where(eq(userRolesTable.userId, userId));
  return roles.map((r) => r.roleId);
}
async function updateUserRoles(userId, newRoleIds) {
  await db.transaction(async (tx) => {
    await tx.delete(userRolesTable).where(eq(userRolesTable.userId, userId));
    if (newRoleIds.length > 0) {
      const rolesToInsert = newRoleIds.map((roleId) => ({ userId, roleId }));
      await tx.insert(userRolesTable).values(rolesToInsert);
    }
  });
}
async function getRolePermissions(roleId) {
  const permissions = await db.select({ permissionId: rolePermissionsTable.permissionId }).from(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId));
  return permissions.map((p) => p.permissionId);
}
async function updateRolePermissions(roleId, newPermissionIds) {
  await db.transaction(async (tx) => {
    await tx.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId));
    if (newPermissionIds.length > 0) {
      const permissionsToInsert = newPermissionIds.map((permissionId) => ({
        roleId,
        permissionId
      }));
      await tx.insert(rolePermissionsTable).values(permissionsToInsert);
    }
  });
}
async function isSubRole(parentRoleId, childRoleId) {
  if (parentRoleId === childRoleId) return true;
  const query = sql`
        WITH RECURSIVE SubRoles (roleId) AS (
            SELECT child_role_id FROM role_hierarchy WHERE parent_role_id = ${parentRoleId}
            UNION ALL
            SELECT rh.child_role_id
            FROM role_hierarchy rh
            INNER JOIN SubRoles sr ON sr.roleId = rh.parent_role_id
        )
        SELECT 1 FROM SubRoles WHERE roleId = ${childRoleId}
        LIMIT 1;
    `;
  const result = await db.get(query);
  return !!result;
}
async function getAllRoles() {
  return db.select().from(rolesTable).orderBy(rolesTable.name);
}
async function getRoleHierarchy() {
  return db.select().from(roleHierarchyTable);
}
async function getAllUsers() {
  return db.select({
    id: usersTable.id,
    username: usersTable.username
  }).from(usersTable).orderBy(usersTable.username);
}
async function getAllPermissions() {
  return db.select().from(permissionsTable).orderBy(permissionsTable.name);
}
async function getUserRoleMap() {
  return db.select().from(userRolesTable);
}
async function getRolePermissionMap() {
  return db.select().from(rolePermissionsTable);
}
async function isWithinTerritoryScope(userId, resourceDeskelId) {
  const result = await db.select({
    userPropinsiId: propTable.id,
    // Subquery untuk mendapatkan propinsiId resource
    resourcePropinsiId: sql`(
                SELECT p.id FROM deskel d
                JOIN kecamatan k ON d.id_kecamatan = k.id
                JOIN kokab ko ON k.id_kokab = ko.id
                JOIN prop p ON ko.id_prop = p.id
                WHERE d.id = ${resourceDeskelId}
            )`
  }).from(usersTable).where(eq(usersTable.id, userId)).innerJoin(muridTable, eq(usersTable.muridId, muridTable.id)).innerJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id)).innerJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id)).innerJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id)).innerJoin(propTable, eq(kokabTable.idProp, propTable.id)).get();
  if (!result) {
    console.warn(
      `Could not determine territory for user ${userId} or resource ${resourceDeskelId}.`
    );
    return false;
  }
  return result.userPropinsiId === result.resourcePropinsiId;
}
async function userHasPermission(userId, permissionId, resource) {
  const staticRolesPromise = getUserRoles(userId);
  const piketRolesPromise = db.select({ roleId: piketScheduleTable.roleId }).from(piketScheduleTable).where(
    sql`${piketScheduleTable.userId} = ${userId} AND date('now') BETWEEN date(${piketScheduleTable.startDate}) AND date(${piketScheduleTable.endDate})`
  );
  const [staticRoles, piketRoles] = await Promise.all([staticRolesPromise, piketRolesPromise]);
  const effectiveRoles = [.../* @__PURE__ */ new Set([...staticRoles, ...piketRoles.map((r) => r.roleId)])];
  if (effectiveRoles.length === 0) {
    console.log(`User ${userId} has no effective roles.`);
    return false;
  }
  let hasBasePermission = false;
  for (const roleId of effectiveRoles) {
    const permissions = await getRolePermissions(roleId);
    if (permissions.includes(permissionId)) {
      hasBasePermission = true;
      break;
    }
  }
  if (!hasBasePermission) {
    return false;
  }
  const isLevel3User = effectiveRoles.some((roleId) => roleId.endsWith("-propinsi"));
  const requiresTerritoryCheck = resource?.deskelId != null;
  if (isLevel3User && requiresTerritoryCheck) {
    const withinScope = await isWithinTerritoryScope(userId, resource.deskelId);
    if (!withinScope) {
      console.log(
        `User ${userId} denied access to resource in deskelId ${resource.deskelId} (out of scope).`
      );
      return false;
    }
  }
  const isWritePermission = permissionId.includes("write");
  const hasTargetRole = resource?.targetRoleId != null;
  if (isWritePermission && hasTargetRole) {
    let canWriteSubRole = false;
    const checks = effectiveRoles.map(
      (userRoleId) => isSubRole(userRoleId, resource.targetRoleId)
    );
    const results = await Promise.all(checks);
    if (results.some((canWrite) => canWrite)) {
      canWriteSubRole = true;
    }
    if (!canWriteSubRole) {
      console.log(
        `User ${userId} denied write access on role ${resource.targetRoleId} (not a sub-role).`
      );
      return false;
    }
  }
  return true;
}
export {
  getUserRoles as a,
  getAllUsers as b,
  getAllPermissions as c,
  getUserRoleMap as d,
  getRolePermissionMap as e,
  getRoleHierarchy as f,
  getAllRoles as g,
  updateUserRoles as h,
  updateRolePermissions as i,
  deleteRole as j,
  updateRole as k,
  createRole as l,
  userHasPermission as u
};
