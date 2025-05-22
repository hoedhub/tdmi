import { lucia } from '$lib/server/auth'; // Adjust path
import { db } from '$lib/drizzle';      // Adjust path
import { usersTable, sessionTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params }) => {
    if (locals.user?.role !== 'admin') {
        throw error(403, 'Forbidden');
    }

    const userIdToDelete = params.userId;

    if (!userIdToDelete) {
        throw error(400, 'User ID is required.');
    }

    // Prevent admin from deleting themselves
    if (userIdToDelete === locals.user.id) {
        throw error(400, 'Admins cannot delete their own account through this interface.');
    }

    try {
        // Invalidate all sessions for the user being deleted
        await lucia.invalidateUserSessions(userIdToDelete);

        // Drizzle/SQLite doesn't automatically cascade deletes from usersTable to sessionTable
        // unless `onDelete: 'cascade'` is specified in the foreign key definition in sessionTable.
        // Since it's not, we manually delete sessions, or rely on Lucia's session management.
        // `invalidateUserSessions` handles marking sessions as invalid.
        // For complete cleanup:
        await db.delete(sessionTable).where(eq(sessionTable.userId, userIdToDelete));

        // Delete the user
        const deleteResult = await db.delete(usersTable).where(eq(usersTable.id, userIdToDelete)).returning({ id: usersTable.id });

        if (deleteResult.length === 0) {
            throw error(404, 'User not found or already deleted.');
        }

        return json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error("Error deleting user:", e);
        if (e.status && e.body) throw e; // Re-throw SvelteKit errors
        throw error(500, e.message || 'An unexpected error occurred while deleting the user.');
    }
};