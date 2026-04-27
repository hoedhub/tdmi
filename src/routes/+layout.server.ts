// +layout.server.ts
import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { userHasPermission } from '$lib/server/accessControl';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const returnData: {
		user: typeof locals.user;
		canAccessAdmin?: boolean;
		canAccessPendataan?: boolean;
		canManagePiket?: boolean;
		canAccessAyyuSual?: boolean;
	} = {
		user: locals.user
	};

	const publicRoutes = ['/login', '/signup', '/tanya'];
	const authOnlyRoutes = ['/login', '/signup'];

	if (!locals.user) {
		if (!publicRoutes.includes(url.pathname)) {
			throw redirect(302, '/login');
		}
	} else {
		// If logged in, redirect away from login/signup/etc to member dashboard
		// But allow access to other public routes like /tanya
		if (authOnlyRoutes.includes(url.pathname) || url.pathname === '/') {
			throw redirect(303, '/member');
		}

		try {
			const [canAccessAdmin, canAccessPendataan, canManagePiket, canAccessAyyuSual] = await Promise.all([
				userHasPermission(locals.user.id, 'perm-admin-access'),
				userHasPermission(locals.user.id, 'perm-pendataan-access'),
				userHasPermission(locals.user.id, 'perm-piket-read'),
				userHasPermission(locals.user.id, 'perm-ayyu-sual-access')
			]);

			returnData.canAccessAdmin = canAccessAdmin;
			returnData.canAccessPendataan = canAccessPendataan;
			returnData.canManagePiket = canManagePiket;
			returnData.canAccessAyyuSual = canAccessAyyuSual;
		} catch (e) {
			console.error(`Database error in root layout load for user ${locals.user.id}:`, e);
			throw error(503, 'Gagal memuat data pengguna: Server tidak dapat dihubungi.');
		}
	}

	return returnData;
};
