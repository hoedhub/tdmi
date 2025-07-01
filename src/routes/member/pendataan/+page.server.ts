import { error, redirect } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login'); // Redirect to login if not authenticated
    }

    // Check permissions for the 'pendataan' page
    const [canAccessPendataan, canReadMurid, canWriteMurid] = await Promise.all([
        userHasPermission(locals.user.id, 'perm-pendataan-access'),
        userHasPermission(locals.user.id, 'perm-pendataan-read'),
        userHasPermission(locals.user.id, 'perm-pendataan-write')
    ]);

    if (!canAccessPendataan) {
        throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman Pendataan.');
    }

    if (!canReadMurid) {
        // If they can access the page but not read data, still deny access to prevent empty page
        throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk melihat data murid.');
    }

    // Data fetching is now handled on the client-side.
    // This function now only handles access control and passes permissions.
    return {
        user: locals.user,
        canReadMurid,
        canWriteMurid,
        // totalItems is no longer fetched here to prevent timeout
        totalItems: 0, // Start with 0, client will fetch the real count
        dbError: false // Initial state, client will handle DB errors
    };
};
