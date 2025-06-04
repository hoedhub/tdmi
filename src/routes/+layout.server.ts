// +layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types'; // Import the type

export const load: LayoutServerLoad = async ({ locals, url }) => { // Add 'url'
    // Pages that don't require authentication
    const unauthenticatedRoutes = ['/login', '/signup']; // Add any other public routes

    if (!locals.user) {
        // If the user is not logged in AND they are trying to access a protected page
        if (!unauthenticatedRoutes.includes(url.pathname)) {
            throw redirect(302, '/login');
        }
    } else {
        // Optional: If the user IS logged in and tries to access /login or /signup,
        // you might want to redirect them to a dashboard or home page.
        // console.log('[LOAD] User is logged in:', locals.user);
        if (unauthenticatedRoutes.includes(url.pathname) || url.pathname === '/') {
            // console.log('[LOAD] Redirecting logged-in user to /member');
            throw redirect(303, '/member'); // Or your main authenticated route
        }
    }

    return {
        user: locals.user
    };
};
