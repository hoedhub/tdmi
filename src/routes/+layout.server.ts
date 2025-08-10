// +layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types'; // Import the type
import { userHasPermission } from '$lib/server/accessControl';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Add 'url'
	// console.log(`[Layout Load] Running for user: ${locals.user?.username} (ID: ${locals.user?.id})`);

	const returnData: {
		user: typeof locals.user;
		canAccessAdmin?: boolean;
		canAccessPendataan?: boolean;
		canManagePiket?: boolean; // <-- Tambahkan flag baru
	} = {
		user: locals.user
	};
	// Pages that don't require authentication
	const unauthenticatedRoutes = ['/login', '/signup']; // Add any other public routes

	if (!locals.user) {
		// If the user is not logged in AND they are trying to access a protected page
		if (!unauthenticatedRoutes.includes(url.pathname)) {
			throw redirect(302, '/login');
		}
	} else {
		const [canAccessAdmin, canAccessPendataan, canManagePiket] = await Promise.all([
			userHasPermission(locals.user.id, 'perm-admin-access'),
			userHasPermission(locals.user.id, 'perm-pendataan-access'), // Check for pendataan access
			userHasPermission(locals.user.id, 'perm-piket-read') // <-- Tambahkan pengecekan izin piket
		]);

		returnData.canAccessAdmin = canAccessAdmin;
		returnData.canAccessPendataan = canAccessPendataan; // Assign pendataan access
		returnData.canManagePiket = canManagePiket; // <-- Kirim flag ke UI

		if (unauthenticatedRoutes.includes(url.pathname) || url.pathname === '/') {
			throw redirect(303, '/member'); // Or your main authenticated route
		}
	}

	// return {
	//     user: locals.user
	// };

	return returnData;
};
