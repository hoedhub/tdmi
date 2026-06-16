// src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import { error, type Handle } from '@sveltejs/kit';
import { reportError } from '$lib/server/errorReporter';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	try {
		const { session, user } = await lucia.validateSession(sessionId);
		if (session && session.fresh) {
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		event.locals.user = user;
		event.locals.session = session;
	} catch (e) {
		console.error('Database connection failed during session validation:', e);
		reportError({
			message: 'Database connection failed during session validation',
			stack: e instanceof Error ? e.stack : String(e)
		});
		throw error(503, 'Gagal memvalidasi sesi: Tidak dapat terhubung ke server.');
	}

	return resolve(event, {
		transformPageChunk: ({ html, done }) => {
			if (done) {
				const userId = event.locals.user?.id || 'default';
				const script = `
                    <script>
                        window.currentUserThemeId = '${userId}';
                        const savedTheme = localStorage.getItem(window.currentUserThemeId + '-theme');
                        if (savedTheme) {
                            document.documentElement.setAttribute('data-theme', savedTheme);
                        }
                    </script>
                `;
				return html.replace('</head>', `${script}</head>`);
			}
			return html;
		}
	});
};
