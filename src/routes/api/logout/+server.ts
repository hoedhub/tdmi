import { lucia } from '$lib/server/auth';
import { json, error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}

	try {
		await lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return json({ success: true });
	} catch (e) {
		console.error('Gagal melakukan logout:', e);
		throw error(500, 'Terjadi kesalahan saat mencoba logout. Silakan coba lagi.');
	}
};
