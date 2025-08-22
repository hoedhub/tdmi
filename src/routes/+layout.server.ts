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
	} = {
		user: locals.user
	};

	const unauthenticatedRoutes = ['/login', '/signup'];

	if (!locals.user) {
		if (!unauthenticatedRoutes.includes(url.pathname)) {
			throw redirect(302, '/login');
		}
	} else {
		// This redirect logic must be outside the try...catch block.
		if (unauthenticatedRoutes.includes(url.pathname) || url.pathname === '/') {
			throw redirect(303, '/member');
		}

		try {
			const [canAccessAdmin, canAccessPendataan, canManagePiket] = await Promise.all([
				userHasPermission(locals.user.id, 'perm-admin-access'),
				userHasPermission(locals.user.id, 'perm-pendataan-access'),
				userHasPermission(locals.user.id, 'perm-piket-read')
			]);

			returnData.canAccessAdmin = canAccessAdmin;
			returnData.canAccessPendataan = canAccessPendataan;
			returnData.canManagePiket = canManagePiket;
		} catch (e) {
			console.error(`Database error in root layout load for user ${locals.user.id}:`, e);
			throw error(503, 'Gagal memuat data pengguna: Server tidak dapat dihubungi.');
		}
	}

	return returnData;
};
