import { error, redirect } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import type { PageServerLoad } from './$types';
import { db } from '$lib/drizzle'; // Import db client
import { muridTable } from '$lib/drizzle/schema'; // Import muridTable
import { count } from 'drizzle-orm'; // Import count for total items

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

    // Initial load of murid data will be handled by the +server.ts endpoint
    // This load function primarily handles access control and passes permission flags.
    // The actual data will be fetched by the client-side SuperTable component.

    // We can still get the total count for initial pagination setup
    const [totalMuridCountResult] = await Promise.all([
        db.select({ totalCount: count() }).from(muridTable)
    ]);

    return {
        user: locals.user, // Pass user data to client
        canReadMurid,
        canWriteMurid,
        totalItems: totalMuridCountResult[0].totalCount,
        // No 'murid' data here, it will be fetched by the client via /table endpoint
    };
};
