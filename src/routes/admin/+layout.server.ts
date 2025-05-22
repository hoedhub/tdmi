import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    if (!locals.user) {
        // If not logged in, redirect to login, optionally pass current path to redirect back
        throw redirect(302, `/login?redirectTo=${url.pathname}`);
    }
    if (locals.user.role !== 'admin') {
        // If logged in but not an admin, show a forbidden error
        throw error(403, 'Forbidden: You do not have permission to access this page.');
    }
    return {
        // Pass the admin user data to admin layouts/pages if needed
        user: locals.user
    };
};