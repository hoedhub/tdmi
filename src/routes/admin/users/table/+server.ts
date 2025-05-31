import { db } from '$lib/drizzle';
import { usersTable, userRoles } from '$lib/drizzle/schema';
import { error, json } from '@sveltejs/kit';
import { asc, desc, eq, like, and, sql, type SQL } from 'drizzle-orm';
import type { RequestHandler } from './$types';

type UserRole = (typeof userRoles)[number];
type SortableColumns = 'username' | 'role' | 'active' | 'muridId' | 'created_at';

interface TableRequest {
    sort?: {
        key: SortableColumns;
        direction: 'asc' | 'desc';
    };
    filters?: {
        username?: string;
        role?: UserRole;
        active?: string;
        muridId?: string | number;
    };
    page?: number;
    pageSize?: number;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    if (locals.user?.role !== 'admin') {
        throw error(403, 'Forbidden');
    }

    const { sort, filters, page = 1, pageSize = 10 } = await request.json() as TableRequest;

    try {
        const baseSelect = {
            id: usersTable.id,
            username: usersTable.username,
            role: usersTable.role,
            active: usersTable.active,
            muridId: usersTable.muridId,
            created_at: usersTable.created_at
        } as const;

        // Build conditions array first
        const conditions: SQL[] = [];
        if (filters) {
            if (filters.username) {
                conditions.push(like(usersTable.username, `%${filters.username}%`));
            }

            if (filters.role && userRoles.includes(filters.role)) {
                const role: UserRole = filters.role;
                conditions.push(eq(usersTable.role, role));
            }

            if (filters.active !== undefined) {
                conditions.push(eq(usersTable.active, filters.active === 'Active'));
            }

            if (filters.muridId !== undefined) {
                conditions.push(
                    filters.muridId === 'N/A'
                        ? eq(usersTable.muridId, 0)
                        : eq(usersTable.muridId, Number(filters.muridId))
                );
            }
        }

        // Build sort expression
        const sortExpr = sort?.key
            ? sort.direction === 'asc'
                ? asc(usersTable[sort.key])
                : desc(usersTable[sort.key])
            : asc(usersTable.username);

        // Calculate pagination
        const offset = (page - 1) * pageSize;

        // Execute queries with a single query builder construction
        const [users, countResult] = await Promise.all([
            db.select(baseSelect)
                .from(usersTable)
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(sortExpr)
                .limit(pageSize)
                .offset(offset),
            db.select({
                count: sql<number>`count(*)`
            })
                .from(usersTable)
                .where(conditions.length > 0 ? and(...conditions) : undefined)
        ]);

        return json({
            users,
            totalItems: Number(countResult[0].count),
            currentPage: page
        });
    } catch (e) {
        console.error('Error fetching users:', e);
        throw error(500, 'Failed to load users');
    }
};
