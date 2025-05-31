import { db } from '$lib/drizzle'; // Adjust path to your Drizzle client
import { usersTable } from '$lib/drizzle/schema';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    // This check is somewhat redundant due to the layout, but good for defense in depth
    if (locals.user?.role !== 'admin') {
        throw error(403, 'Forbidden');
    }

    try {
        // Get initial users with count
        const [users, [{ count }]] = await Promise.all([
            db.select({
                id: usersTable.id,
                username: usersTable.username,
                role: usersTable.role,
                active: usersTable.active,
                muridId: usersTable.muridId,
                createdAt: usersTable.created_at
            })
                .from(usersTable)
                .orderBy(usersTable.username)
                .limit(10), // Initial page size

            db.select({ count: sql`count(*)` }).from(usersTable)
        ]);

        return {
            users,
            totalItems: Number(count)
        };
    } catch (e) {
        console.error("Error fetching users:", e);
        throw error(500, "Failed to load users due to a server error.");
    }
};