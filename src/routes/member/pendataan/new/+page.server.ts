import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/drizzle';
import { muridTable, deskelTable, kecamatanTable, kokabTable, propTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const [canAccessPendataan, canWriteMurid] = await Promise.all([
        userHasPermission(locals.user.id, 'perm-pendataan-access'),
        userHasPermission(locals.user.id, 'perm-pendataan-write')
    ]);

    if (!canAccessPendataan || !canWriteMurid) {
        throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk membuat data murid baru.');
    }

    // Optionally load data needed for form (e.g., deskel, kecamatan, kokab, prop lists)
    // For simplicity, we'll assume these lists are fetched client-side or are not needed for initial form render.
    // If needed, you would fetch them here and return.
    const propinsiList = await db.select().from(propTable).all();
    const kokabList = await db.select().from(kokabTable).all();
    const kecamatanList = await db.select().from(kecamatanTable).all();
    const deskelList = await db.select().from(deskelTable).all();

    return {
        propinsiList,
        kokabList,
        kecamatanList,
        deskelList
    };
};

export const actions: Actions = {
    default: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const nama = formData.get('nama')?.toString();
        const namaArab = formData.get('namaArab')?.toString() || null;
        const gender = formData.get('gender')?.toString() === 'true';
        const deskelId = parseInt(formData.get('deskelId')?.toString() || '0');
        const alamat = formData.get('alamat')?.toString() || null;
        const nomorTelepon = formData.get('nomorTelepon')?.toString() || null;
        const muhrimId = parseInt(formData.get('muhrimId')?.toString() || '0') || null;
        const mursyidId = parseInt(formData.get('mursyidId')?.toString() || '0') || null;
        const baiatId = parseInt(formData.get('baiatId')?.toString() || '0') || null;
        const wiridId = parseInt(formData.get('wiridId')?.toString() || '0') || null;
        const qari = formData.get('qari')?.toString() === 'true';
        const marhalah = parseInt(formData.get('marhalah')?.toString() || '1') as (1 | 2 | 3);
        const tglLahir = formData.get('tglLahir')?.toString() || null;
        const aktif = formData.get('aktif')?.toString() === 'true';
        const partisipasi = formData.get('partisipasi')?.toString() === 'true';
        const nik = formData.get('nik')?.toString() || null;
        // foto handling is complex, will omit for now or assume base64 string
        const foto = null; // Placeholder for foto

        if (!nama || !deskelId) {
            return fail(400, { message: 'Nama dan Desa/Kelurahan wajib diisi.', nama, deskelId });
        }

        // Check permission with territory scope for the new murid's deskelId
        const canWriteMurid = await userHasPermission(
            locals.user.id,
            'perm-pendataan-write',
            { deskelId: deskelId }
        );

        if (!canWriteMurid) {
            return fail(403, { message: 'Akses Ditolak. Anda tidak memiliki izin untuk membuat data murid di wilayah ini.' });
        }

        try {
            const newMurid = {
                updaterId: locals.user.id, // Assuming updaterId is the current user's ID
                nama,
                namaArab,
                gender,
                deskelId,
                alamat,
                nomorTelepon,
                muhrimId: muhrimId === 0 ? null : muhrimId, // Convert 0 to null if no ID
                mursyidId: mursyidId === 0 ? null : mursyidId,
                baiatId: baiatId === 0 ? null : baiatId,
                wiridId: wiridId === 0 ? null : wiridId,
                qari,
                marhalah,
                tglLahir,
                aktif,
                partisipasi,
                nik,
                foto
            };

            await db.insert(muridTable).values(newMurid).run();

            return { success: true, message: 'Murid baru berhasil ditambahkan.' };
        } catch (e: any) {
            console.error('Error creating new murid:', e);
            if (e.message && e.message.includes('UNIQUE constraint failed: murid.nik')) {
                return fail(409, { message: 'NIK sudah terdaftar. Harap gunakan NIK yang berbeda.', nik });
            }
            return fail(500, { message: 'Gagal menambahkan murid baru karena kesalahan server.' });
        }
    }
};
