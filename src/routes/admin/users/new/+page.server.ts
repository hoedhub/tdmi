import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import { db } from '$lib/drizzle';
import { usersTable, userRoles } from '$lib/drizzle/schema'; // Import userRoles
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user?.role !== 'admin') {
        throw error(403, 'Forbidden');
    }
    return {
        availableRoles: userRoles // Pass roles for the dropdown in the Svelte component
    };
};

export const actions: Actions = {
    default: async ({ request, locals }) => {
        if (locals.user?.role !== 'admin') {
            return fail(403, { message: 'Forbidden' });
        }

        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const role = formData.get('role') as (typeof userRoles)[number];
        const active = formData.has('active'); // Checkbox value
        const muridIdStr = formData.get('muridId') as string;

        let formState = { username, role, active, muridIdStr, message: '' };

        if (!username || username.length < 3 || username.length > 16) {
            return fail(400, { ...formState, message: 'Username must be 3-16 characters.' });
        }
        if (!password || password.length < 6) {
            return fail(400, { ...formState, message: 'Password must be at least 6 characters.' });
        }
        if (!role || !userRoles.includes(role)) {
            return fail(400, { ...formState, message: 'Invalid role selected.' });
        }

        let muridId = parseInt(muridIdStr);
        if (isNaN(muridId) || muridIdStr.trim() === '') {
            muridId = 0; // Default from schema if not provided or invalid
        }

        try {
            const existingUser = await db.query.usersTable.findFirst({
                where: (table, { eq }) => eq(table.username, username)
            });
            if (existingUser) {
                return fail(400, { ...formState, message: 'Username already taken.' });
            }

            const userId = generateId(15); // Lucia's default user ID length
            const passwordHash = await new Argon2id().hash(password);

            await db.insert(usersTable).values({
                id: userId,
                username,
                passwordHash,
                role,
                active,
                muridId // Schema has default(0)
            });

        } catch (e: any) {
            console.error("Error creating user:", e);
            return fail(500, { ...formState, message: e.message || 'Failed to create user due to a server error.' });
        }

        throw redirect(303, '/admin/users'); // Redirect to user list on success
    }
};