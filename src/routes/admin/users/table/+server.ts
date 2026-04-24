import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { usersTable, userRolesTable, rolesTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { getAllRoles } from '$lib/server/accessControlDB';
import { countDistinct, asc, desc, like, eq, and, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { buildAdvancedFilter, type ColumnMapping } from '$lib/server/superTableFilters';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const canReadUsers = await userHasPermission(locals.user.id, 'perm-user-read');
	if (!canReadUsers) {
		throw error(403, 'Forbidden');
	}

	try {
		const { sort, filters, page, pageSize } = await request.json();
		const offset = (page - 1) * pageSize;

		const conditions: (SQL | undefined)[] = [];
		if (filters) {
			if (filters.global) {
				const globalValue = `%${filters.global}%`;
				conditions.push(
					or(like(usersTable.username, globalValue), like(rolesTable.name, globalValue))
				);
			}
			if (filters.columns) {
				if (filters.columns.username) {
					conditions.push(like(usersTable.username, `%${filters.columns.username}%`));
				}
				if (filters.columns.active && filters.columns.active !== 'All') {
					conditions.push(eq(usersTable.active, filters.columns.active === 'Active'));
				}
				if (filters.columns.assignedRoles) {
					conditions.push(like(rolesTable.name, `%${filters.columns.assignedRoles}%`));
				}
			}

			// Apply advanced filters if present
			if (filters.advanced) {
				const columnMapping: ColumnMapping = {
					username: usersTable.username,
					active: {
						column: usersTable.active,
						transform: (v: string) => v === 'Active' || v === 'true'
					},
					assignedRoles: rolesTable.name,
					createdAt: usersTable.createdAt
				};

				const advancedFilter = buildAdvancedFilter(filters.advanced, columnMapping);
				if (advancedFilter) {
					conditions.push(advancedFilter);
				}
			}
		}

		const finalWhereClause =
			conditions.length > 0 ? and(...conditions.filter((c) => c !== undefined)) : undefined;

		const orderByClauses = [];
		if (sort && Array.isArray(sort) && sort.length > 0) {
			sort.forEach((sortConfig) => {
				const direction = sortConfig.direction === 'asc' ? asc : desc;
				switch (sortConfig.key) {
					case 'username':
						orderByClauses.push(direction(usersTable.username));
						break;
					case 'active':
						orderByClauses.push(direction(usersTable.active));
						break;
					case 'createdAt':
						orderByClauses.push(direction(usersTable.createdAt));
						break;
				}
			});
		}
		if (orderByClauses.length === 0) {
			orderByClauses.push(desc(usersTable.createdAt));
		}

		const totalItemsQuery = db
			.select({ value: countDistinct(usersTable.id) })
			.from(usersTable)
			.leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
			.leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
			.where(finalWhereClause);

		const usersQuery = db
			.select({
				id: usersTable.id,
				username: usersTable.username,
				active: usersTable.active,
				muridId: usersTable.muridId,
				createdAt: usersTable.createdAt,
				assignedRoles: sql<string>`group_concat(${rolesTable.name})`.as('assigned_roles')
			})
			.from(usersTable)
			.leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
			.leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
			.where(finalWhereClause)
			.groupBy(usersTable.id)
			.orderBy(...orderByClauses)
			.limit(pageSize)
			.offset(offset);

		const [totalItemsResult, usersData, allRoles] = await Promise.all([
			totalItemsQuery.get(),
			usersQuery.all(),
			getAllRoles()
		]);

		const totalItems = totalItemsResult?.value ?? 0;

		const processedUsers = usersData.map((user) => ({
			...user,
			assignedRoles: user.assignedRoles ? user.assignedRoles.split(',') : []
		}));

		return json({
			users: processedUsers,
			totalItems: totalItems,
			currentPage: page,
			allRoles: allRoles
		});
	} catch (e) {
		console.error('Error fetching user table data:', e);
		throw error(500, 'Failed to fetch user data due to a server error.');
	}
};
