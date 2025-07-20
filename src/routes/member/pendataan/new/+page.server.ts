import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { userHasPermission } from '$lib/server/accessControl';
import { db } from '$lib/drizzle';
import { muridTable, propTable } from '$lib/drizzle/schema';
import { uploadFile } from '$lib/server/googleDrive';
import { type InferInsertModel } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	console.log('Memasuki fungsi load untuk /member/pendataan/new');
	try {
		if (!locals.user) {
			console.log('Pengguna tidak login, mengalihkan ke /login');
			throw redirect(302, '/login');
		}
		console.log(`Pengguna terautentikasi: ${locals.user.id}`);

		console.log('Memeriksa izin akses...');
		const [canAccessPendataan, canWriteMurid] = await Promise.all([
			userHasPermission(locals.user.id, 'perm-pendataan-access'),
			userHasPermission(locals.user.id, 'perm-pendataan-write')
		]);
		console.log(`Izin akses: canAccessPendataan=${canAccessPendataan}, canWriteMurid=${canWriteMurid}`);

		if (!canAccessPendataan || !canWriteMurid) {
			console.log('Akses ditolak karena izin tidak memadai.');
			throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk membuat data murid baru.');
		}

		console.log('Mengambil daftar provinsi dari database...');
		const propinsiList = await db.select().from(propTable).all();
		console.log(`Berhasil mengambil ${propinsiList.length} provinsi.`);

		return {
			propinsiList
		};
	} catch (e: any) {
		// Log error yang lebih detail ke konsol Vercel
		console.error('Terjadi error kritis di fungsi load:', e);

		// Tampilkan halaman error 500 yang lebih informatif (hanya jika dalam mode debug)
		// Di production, Anda mungkin hanya ingin melempar error umum.
		throw error(
			500,
			`Terjadi kesalahan internal di server. Silakan periksa log Vercel. Pesan Error: ${e.message}`
		);
	}
};

export const actions: Actions = {
    default: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const action = formData.get('action');

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
        const marhalah = parseInt(formData.get('marhalah')?.toString() || '1') as 1 | 2 | 3;
        const tglLahir = formData.get('tglLahir')?.toString() || null;
        const aktif = formData.get('aktif')?.toString() === 'on';
        const partisipasi = formData.get('partisipasi')?.toString() === 'on';
        const nik = formData.get('nik')?.toString() || null;

        const fotoFile = formData.get('foto') as File | null;

        if (!nama || !deskelId) {
            return fail(400, { message: 'Nama dan Desa/Kelurahan wajib diisi.', nama, deskelId });
        }

        const canWriteMurid = await userHasPermission(locals.user.id, 'perm-pendataan-write', {
            deskelId: deskelId
        });

        if (!canWriteMurid) {
            return fail(403, {
                message:
                    'Akses Ditolak. Anda tidak memiliki izin untuk membuat data murid di wilayah ini.'
            });
        }

        try {
            const newMurid: InferInsertModel<typeof muridTable> = {
                updaterId: locals.user.id,
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
                nik
            };

            if (fotoFile && fotoFile.size > 0) {
				const buffer = Buffer.from(await fotoFile.arrayBuffer());
				const fileId = await uploadFile(buffer, fotoFile.type, fotoFile.name);
				newMurid.fotoDriveId = fileId;
			}

            const [murid] = await db.insert(muridTable).values(newMurid).returning();

            if (action === 'save-and-add') {
                return {
                    success: true,
                    message: 'Murid baru berhasil ditambahkan.',
                    action: 'add-again',
                    murid
                };
            } else {
                return {
                    success: true,
                    message: 'Data murid berhasil disimpan.',
                    redirect: '/member/pendataan',
                    murid
                };
            }
        } catch (e: any) {
            console.error('Error creating new murid:', e);
            if (e.message && e.message.includes('UNIQUE constraint failed: murid.nik')) {
                return fail(409, { message: 'NIK sudah terdaftar. Harap gunakan NIK yang berbeda.', nik });
            }
            return fail(500, { message: 'Gagal menambahkan murid baru karena kesalahan server.' });
        }
    }
};