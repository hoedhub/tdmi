import { error, json } from "@sveltejs/kit";
import { u as usersTable, r as rolesTable, d as db, a as userRolesTable } from "../../../../../chunks/index.js";
import { u as userHasPermission, g as getAllRoles } from "../../../../../chunks/accessControl.js";
import { or, like, eq, and, asc, desc, countDistinct, sql } from "drizzle-orm";
const POST = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }
  const canReadUsers = await userHasPermission(locals.user.id, "perm-user-read");
  if (!canReadUsers) {
    throw error(403, "Forbidden");
  }
  try {
    const { sort, filters, page, pageSize } = await request.json();
    const offset = (page - 1) * pageSize;
    const conditions = [];
    if (filters) {
      if (filters.global) {
        const globalValue = `%${filters.global}%`;
        conditions.push(
          or(like(usersTable.username, globalValue), like(rolesTable.name, globalValue))
        );
      }
      if (filters.username) {
        conditions.push(like(usersTable.username, `%${filters.username}%`));
      }
      if (filters.active && filters.active !== "All") {
        conditions.push(eq(usersTable.active, filters.active === "Active"));
      }
      if (filters.assignedRoles) {
        conditions.push(like(rolesTable.name, `%${filters.assignedRoles}%`));
      }
    }
    const finalWhereClause = conditions.length > 0 ? and(...conditions.filter((c) => c !== void 0)) : void 0;
    const orderByClauses = [];
    if (sort && Array.isArray(sort) && sort.length > 0) {
      sort.forEach((sortConfig) => {
        const direction = sortConfig.direction === "asc" ? asc : desc;
        switch (sortConfig.key) {
          case "username":
            orderByClauses.push(direction(usersTable.username));
            break;
          case "active":
            orderByClauses.push(direction(usersTable.active));
            break;
          case "createdAt":
            orderByClauses.push(direction(usersTable.createdAt));
            break;
        }
      });
    }
    if (orderByClauses.length === 0) {
      orderByClauses.push(desc(usersTable.createdAt));
    }
    const totalItemsQuery = db.select({ value: countDistinct(usersTable.id) }).from(usersTable).leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId)).leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id)).where(finalWhereClause);
    const usersQuery = db.select({
      id: usersTable.id,
      username: usersTable.username,
      active: usersTable.active,
      muridId: usersTable.muridId,
      createdAt: usersTable.createdAt,
      assignedRoles: sql`group_concat(${rolesTable.name})`.as("assigned_roles")
    }).from(usersTable).leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId)).leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id)).where(finalWhereClause).groupBy(usersTable.id).orderBy(...orderByClauses).limit(pageSize).offset(offset);
    const [totalItemsResult, usersData, allRoles] = await Promise.all([
      totalItemsQuery.get(),
      usersQuery.all(),
      getAllRoles()
    ]);
    const totalItems = totalItemsResult?.value ?? 0;
    const processedUsers = usersData.map((user) => ({
      ...user,
      assignedRoles: user.assignedRoles ? user.assignedRoles.split(",") : []
    }));
    return json({
      users: processedUsers,
      totalItems,
      currentPage: page,
      allRoles
    });
  } catch (e) {
    console.error("Error fetching user table data:", e);
    throw error(500, "Failed to fetch user data due to a server error.");
  }
};
export {
  POST
};
