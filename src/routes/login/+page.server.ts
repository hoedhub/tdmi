// src/routes/login/+page.server.ts
import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/drizzle';
import { usersTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		console.log('[LOGIN LOAD] User already has session, redirecting to /member');
		redirect(303, '/member');
	}
	console.log('[LOGIN LOAD] No session, showing login page.');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		console.log('[LOGIN ACTION] Action started.');
		const formData = await event.request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		if (!username || !password) {
			console.log('[LOGIN ACTION] Username or password missing.');
			return fail(400, { msg: 'Username and password are required.', username });
		}

		try {
			console.log(`[LOGIN ACTION] Attempting to find user: ${username}`);
			const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));

			if (!user) {
				console.log('[LOGIN ACTION] User not found.');
				return fail(400, { msg: 'Invalid username or password.', username });
			}
			console.log('[LOGIN ACTION] User found.');

			if (!user.passwordHash) {
				console.error(`[LOGIN ACTION] User ${username} does not have a password hash.`);
				return fail(500, { msg: 'Login configuration error.' });
			}

			console.log('[LOGIN ACTION] Verifying password.');
			const validPassword = await new Argon2id().verify(user.passwordHash, password);
			if (!validPassword) {
				console.log('[LOGIN ACTION] Invalid password.');
				return fail(400, { msg: 'Invalid username or password.', username });
			}
			console.log('[LOGIN ACTION] Password valid.');

			console.log('[LOGIN ACTION] Creating session.');
			const session = await lucia.createSession(user.id, {}); // Ensure user.id is correct type for Lucia
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
			console.log('[LOGIN ACTION] Session cookie set.');
		} catch (error) {
			console.error('[LOGIN ACTION] UNEXPECTED ERROR in try block:', error);
			// This catch is for UNEXPECTED errors (DB down, etc.)
			// It should NOT be catching a redirect if redirect() is outside this block
			return fail(500, { msg: 'An internal server error occurred during login.' });
		}

		// If we reach here, it means everything in the try block succeeded without returning fail()
		// AND no unexpected error occurred that was caught by the catch block.
		try {
			console.log('[LOGIN ACTION] !!! ATTEMPTING REDIRECT TO /member !!!');
			// redirect(303, "/member");
			const redirObject = redirect(303, '/member');
			console.log('[LOGIN ACTION] Created redirect object, now throwing it.', redirObject);
			throw redirObject;
			// This line below should NEVER be reached if redirect() works
			// console.error("[LOGIN ACTION] !!! ERROR: REDIRECT DID NOT THROW !!!");
			// As a fallback, though this indicates a deeper SvelteKit issue if redirect doesn't throw
			// return { success: true, message: "Login successful, redirect failed to throw." };

			// Code should NOT reach here. If it does, the problem is severe.
			// console.error("[LOGIN ACTION] Execution continued past redirect call.");
			// As a fallback, if redirect doesn't throw, the action will just "finish".
			// SvelteKit will then re-load the current page.
			// return fail(500, { msg: "Internal error: Redirect from action did not throw." }); // Or just let it finish.
		} catch (e: any) {
			// This catch is specifically to see if the redirect() call is throwing *something*
			console.log('[LOGIN ACTION] !!! REDIRECT THREW AN ERROR (this is expected) !!!', e);
			if (
				e &&
				typeof e.status === 'number' &&
				e.status >= 300 &&
				e.status <= 399 &&
				typeof e.location === 'string'
			) {
				console.log('[LOGIN ACTION] Redirect error looks like a SvelteKit redirect. Re-throwing.');
				throw e; // Re-throw the redirect error
			} else {
				console.error('[LOGIN ACTION] Redirect threw an unexpected error type:', e);
				throw e; // Re-throw anyway
			}
		}
	}
};
