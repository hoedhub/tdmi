import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/drizzle';
import { muridTable, deskelTable, kecamatanTable, kokabTable, propTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const muridId = parseInt(params.muridId);
    if (isNaN(muridId)) {
        throw error(400, 'Invalid Murid ID');
    }

    const [canAccessPendataan, canReadMurid, canWriteMurid] = await Promise.all([
        userHasPermission(locals.user.id, 'perm-pendataan-access'),
        userHasPermission(locals.user.id, 'perm-pendataan-read'),
        userHasPermission(locals.user.id, 'perm-pendataan-write')
    ]);

    if (!canAccessPendataan || !canReadMurid) {
        throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk melihat data murid ini.');
    }

    try {
        const muridData = await db.select()
            .from(muridTable)
            .where(eq(muridTable.id, muridId))
            .leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
            .leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
            .leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
            .leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
            .get();

        if (!muridData) {
            throw error(404, 'Murid tidak ditemukan.');
        }

        // Perform territory scope check for reading the specific murid data
        const withinScope = await userHasPermission(
            locals.user.id,
            'perm-pendataan-read', // Re-check read permission with resource context
            { deskelId: muridData.murid.deskelId }
        );

        if (!withinScope) {
            throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk melihat data murid di wilayah ini.');
        }

        // Flatten the joined data for easier access in the Svelte component
        const formattedMurid = {
            ...muridData.murid,
            deskelName: muridData.deskel?.deskel || null,
            kecamatanName: muridData.kecamatan?.kecamatan || null,
            kokabName: muridData.kokab?.kokab || null,
            propinsiName: muridData.prop?.propinsi || null,
            // Add IDs for dropdown re-selection
            selectedPropinsiId: muridData.prop?.id || null,
            selectedKokabId: muridData.kokab?.id || null,
            selectedKecamatanId: muridData.kecamatan?.id || null,
            selectedDeskelId: muridData.deskel?.id || null,
        };

        const propinsiList = await db.select().from(propTable).all();
        const kokabList = await db.select().from(kokabTable).all();
        const kecamatanList = await db.select().from(kecamatanTable).all();
        const deskelList = await db.select().from(deskelTable).all();

        return {
            murid: formattedMurid,
            canWriteMurid, // Pass write permission flag to the client
            propinsiList,
            kokabList,
            kecamatanList,
            deskelList
        };

    } catch (e) {
        console.error(`Error loading murid ${muridId}:`, e);
        if (e instanceof Error && (e as any).status) {
            throw e;
        }
        throw error(500, 'Gagal memuat data murid karena kesalahan server.');
    }
};

export const actions: Actions = {
    default: async ({ request, params, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const muridId = parseInt(params.muridId);
        if (isNaN(muridId)) {
            return fail(400, { message: 'Invalid Murid ID.' });
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
        const aktif = formData.get('aktif')?.toString() === 'on';
        const partisipasi = formData.get('partisipasi')?.toString() === 'on';
        const nik = formData.get('nik')?.toString() || null;
        const foto = null; // Placeholder for foto

        if (!nama || !deskelId) {
            return fail(400, { message: 'Nama dan Desa/Kelurahan wajib diisi.', nama, deskelId });
        }

        // Check permission with territory scope for the updated murid's deskelId
        const canWriteMurid = await userHasPermission(
            locals.user.id,
            'perm-pendataan-write',
            { deskelId: deskelId }
        );

        if (!canWriteMurid) {
            return fail(403, { message: 'Akses Ditolak. Anda tidak memiliki izin untuk mengubah data murid di wilayah ini.' });
        }

        try {
            const updatedMurid = {
                updaterId: locals.user.id, // Assuming updaterId is the current user's ID
                nama,
                namaArab,
                gender,
                deskelId,
                alamat,
                nomorTelepon,
                muhrimId: muhrimId === 0 ? null : muhrimId,
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

            const result = await db.update(muridTable)
                .set(updatedMurid)
                .where(eq(muridTable.id, muridId))
                .run();

            if (result.rowsAffected === 0) {
                return fail(404, { message: 'Murid tidak ditemukan atau tidak ada perubahan.' });
            }

            return { success: true, message: 'Data murid berhasil diperbarui.' };
        } catch (e: any) {
            console.error(`Error updating murid ${muridId}:`, e);
            if (e.message && e.message.includes('UNIQUE constraint failed: murid.nik')) {
                return fail(409, { message: 'NIK sudah terdaftar. Harap gunakan NIK yang berbeda.', nik });
            }
            return fail(500, { message: 'Gagal memperbarui data murid karena kesalahan server.' });
        }
    }
};
