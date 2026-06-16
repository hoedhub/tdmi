import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { userHasPermission } from '$lib/server/accessControl';
import { db } from '$lib/drizzle';
import { muridTable, propTable } from '$lib/drizzle/schema';
import { uploadFile } from '$lib/server/cloudinary';
import { type InferInsertModel, eq, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/login?redirectTo=${url.pathname}`);
	}

	// Hanya cek izin akses dasar untuk memuat halaman.
	// Izin menulis akan dicek saat form disubmit.
	const canAccess = await userHasPermission(locals.user.id, 'perm-pendataan-access');
	if (!canAccess) {
		throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman Pendataan.');
	}

	const propinsiList = await db.select().from(propTable).orderBy(asc(propTable.propinsi)).all();

	return {
		propinsiList
	};
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

		// Cek izin menulis dengan batasan wilayah (territory scope)
		const canWriteMurid = await userHasPermission(locals.user.id, 'perm-pendataan-write', {
			deskelId: deskelId
		});

		if (!canWriteMurid) {
			return fail(403, {
				message: 'Akses Ditolak. Anda tidak memiliki izin untuk membuat data murid di wilayah ini.'
			});
		}

		try {
			const newMuridData: InferInsertModel<typeof muridTable> = {
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

			const [murid] = await db.insert(muridTable).values(newMuridData).returning();

			if (fotoFile && fotoFile.size > 0) {
				const buffer = Buffer.from(await fotoFile.arrayBuffer());
				const fileId = await uploadFile(buffer, murid.id);

				await db
					.update(muridTable)
					.set({ fotoPublicId: fileId })
					.where(eq(muridTable.id, murid.id));
			}

			if (action === 'save-and-add') {
				return {
					success: true,
					message: 'Murid baru berhasil ditambahkan.',
					action: 'add-again'
				};
			} else {
				return {
					success: true,
					message: 'Data murid berhasil disimpan.',
					redirect: '/member/pendataan'
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
