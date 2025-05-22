import { Argon2id } from 'oslo/password';
import { db } from '$lib/drizzle';
import { usersTable, userRoles, muridTable } from '$lib/drizzle/schema';
import { eq, and, ne } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
    if (locals.user?.role !== 'admin') {
        throw error(403, 'Forbidden');
    }

    const userIdToEdit = params.userId;
    if (!userIdToEdit) {
        throw error(400, 'User ID is required');
    }

    const userToEdit = await db.select({ // Explicitly list columns, exclude passwordHash
        id: usersTable.id,
        username: usersTable.username,
        role: usersTable.role,
        active: usersTable.active,
        muridId: usersTable.muridId,
    }).from(usersTable).where(eq(usersTable.id, userIdToEdit)).limit(1)

    if (!userToEdit || userToEdit.length === 0) {
        throw error(404, 'User not found');
    }

    const allMurids = await db.select({
        id: muridTable.id,
        nama: muridTable.nama
    }).from(muridTable);

    return {
        userToEdit: userToEdit[0],
        availableRoles: userRoles,
        allMurids: allMurids // Pass the list of murids to the page
    };
};

export const actions: Actions = {
    default: async ({ request, locals, params }) => {
        if (locals.user?.role !== 'admin') {
            return fail(403, { message: 'Forbidden' });
        }

        const userIdToEdit = params.userId;
        const formData = await request.formData();

        const username = formData.get('username') as string;
        const password = formData.get('password') as string; // New password, optional
        const role = formData.get('role') as (typeof userRoles)[number];
        const active = formData.has('active');
        const muridIdStr = formData.get('muridId') as string;

        const originalUser = await db.select().from(usersTable).where(eq(usersTable.id, userIdToEdit));
        if (!originalUser) throw error(404, "User not found during update process.");

        let formState = { username, role, active, muridIdStr, message: '', userId: userIdToEdit };

        if (!username || username.length < 3 || username.length > 16) {
            return fail(400, { ...formState, message: 'Username must be 3-16 characters.' });
        }
        if (password && password.length < 6) { // Validate new password only if provided
            return fail(400, { ...formState, message: 'New password must be at least 6 characters.' });
        }
        if (!role || !userRoles.includes(role)) {
            return fail(400, { ...formState, message: 'Invalid role selected.' });
        }

        // Prevent admin from deactivating or changing their own role from admin
        if (userIdToEdit === locals.user.id) {
            if (role !== 'admin') {
                return fail(400, { ...formState, message: "Admins cannot change their own role from 'admin'." });
            }
            if (!active) {
                return fail(400, { ...formState, message: "Admins cannot deactivate their own account." });
            }
        }

        let muridId = parseInt(muridIdStr);
        if (isNaN(muridId) || muridIdStr.trim() === '') {
            muridId = originalUser[0].muridId; // Keep original if invalid or empty
        }

        try {
            // Check if username is being changed and if the new one is taken
            if (originalUser[0].username !== username) {
                const existingUserWithNewUsername = await db
                    .select()
                    .from(usersTable)
                    .where(
                        and(
                            eq(usersTable.username, username),
                            ne(usersTable.id, userIdToEdit)
                        )
                    )
                    .limit(1);
                if (existingUserWithNewUsername) {
                    return fail(400, { ...formState, message: 'New username already taken by another user.' });
                }
            }

            const updateValues: Partial<typeof usersTable.$inferInsert> = {
                username,
                role,
                active,
                muridId
            };

            if (password) { // If a new password was entered
                updateValues.passwordHash = await new Argon2id().hash(password);
            }

            await db.update(usersTable).set(updateValues).where(eq(usersTable.id, userIdToEdit));

        } catch (e: any) {
            console.error("Error updating user:", e);
            if (e.status && e.body) throw e;
            return fail(500, { ...formState, message: e.message || 'Failed to update user due to a server error.' });
        }

        throw redirect(303, '/admin/users'); // Redirect to user list
    }
};