// src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import { type Handle, redirect } from '@sveltejs/kit';

// Helper function to check if an error object looks like a SvelteKit redirect
function isSKRedirect(error: any): error is { status: number; location: string } {
	return (
		typeof error === 'object' &&
		error !== null &&
		typeof error.status === 'number' &&
		error.status >= 300 &&
		error.status <= 399 &&
		typeof error.location === 'string'
	);
}

export const handle: Handle = async ({ event, resolve }) => {
	const { url } = event;
	console.log(`[HOOKS ENTRY] Path: ${url.pathname}, Method: ${event.request.method}`);

	const publicPaths = ['/login', '/register'];
	const isPublicPath = publicPaths.some((path) => url.pathname.startsWith(path));
	const isApiPath = url.pathname.startsWith('/api');

	const sessionId = event.cookies.get(lucia.sessionCookieName);
	console.log(`[HOOKS] Initial sessionId from cookie: ${sessionId ? 'found' : 'not found'}`);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		if (!isPublicPath && !isApiPath) {
			console.log(
				`[HOOKS] No session ID, not public/api, redirecting from ${url.pathname} to /login`
			);
			redirect(302, '/login');
		}
	} else {
		console.log(`[HOOKS] Session ID found: ${sessionId}. Validating...`);
		try {
			const { session, user } = await lucia.validateSession(sessionId);
			if (session) {
				console.log(`[HOOKS] Session validated. Fresh: ${session.fresh}. User ID: ${user?.id}`);
				if (session.fresh) {
					const sessionCookie = lucia.createSessionCookie(session.id);
					event.cookies.set(sessionCookie.name, sessionCookie.value, {
						path: '.',
						...sessionCookie.attributes
					});
					console.log('[HOOKS] Fresh session, cookie refreshed.');
				}
			} else {
				console.log(
					'[HOOKS] Session NOT validated (validateSession returned no session). Clearing cookie.'
				);
				const sessionCookie = lucia.createBlankSessionCookie();
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
				if (!isPublicPath && !isApiPath) {
					console.log(
						`[HOOKS] Invalid session (after validation), not public/api, redirecting from ${url.pathname} to /login`
					);
					redirect(302, '/login');
				}
			}
			event.locals.user = user;
			event.locals.session = session;
		} catch (e) {
			console.error('[HOOKS] Error during lucia.validateSession:', e);
			event.locals.user = null;
			event.locals.session = null;
			const blankCookie = lucia.createBlankSessionCookie();
			event.cookies.set(blankCookie.name, blankCookie.value, {
				path: '.',
				...blankCookie.attributes
			});
			if (!isPublicPath && !isApiPath) {
				console.log(
					`[HOOKS] Error during session validation, not public/api, redirecting from ${url.pathname} to /login`
				);
				redirect(302, '/login');
			}
		}
	}

	// This check is crucial for redirecting already logged-in users from login/register
	if (event.locals.session && (url.pathname === '/login' || url.pathname === '/register')) {
		console.log(
			`[HOOKS] User HAS SESSION and is on login/register page. Redirecting from ${url.pathname} to /member.`
		);
		redirect(303, '/member'); // Or 303
	}

	console.log(
		`[HOOKS] Proceeding to resolve for ${url.pathname}. locals.session set: ${!!event.locals.session}`
	);
	try {
		const response = await resolve(event);
		console.log(`[HOOKS] Resolve completed for ${url.pathname}.`);
		return response;
	} catch (error: unknown) {
		if (isSKRedirect(error)) {
			console.log(
				`[HOOKS] Propagating redirect from resolve: ${error.status} to ${error.location} for ${url.pathname}`
			);
			throw error;
		}
		console.error(`[HOOKS] Error during resolve for ${url.pathname} (not a redirect):`, error);
		return new Response('An unexpected error occurred.', { status: 500 });
	}
};
