import { error } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // Asumsi `locals.user` sudah ada dari hooks.server.ts setelah login
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    // Gunakan service RBAC kita untuk memeriksa izin
    const hasAccess = userHasPermission(locals.user.id, 'perm-pendataan-access');

    if (!hasAccess) {
        // Jika tidak punya izin, lempar error 403 (Forbidden)
        throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman Pendataan.');
    }

    // Jika punya izin, lanjutkan dan muat data yang diperlukan untuk halaman ini
    return {
        message: 'Selamat datang di halaman Pendataan. Akses diberikan.'
        // Anda bisa memuat data murid, dll. di sini
    };
};