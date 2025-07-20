import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/drizzle';
import { muridTable, deskelTable, kecamatanTable, kokabTable, propTable } from '$lib/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { userHasPermission } from '$lib/server/accessControl';
import { getPublicFileUrl, uploadFile, deleteFile } from '$lib/server/googleDrive';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const muridId = parseInt(params.muridId);
	if (isNaN(muridId)) {
		throw error(400, 'Murid ID tidak valid.');
	}

	const canAccessPendataan = await userHasPermission(locals.user.id, 'perm-pendataan-access');
	if (!canAccessPendataan) {
		throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk mengakses halaman Pendataan.');
	}

	const muridData = await db
		.select({
			id: muridTable.id,
			nama: muridTable.nama,
			namaArab: muridTable.namaArab,
			gender: muridTable.gender,
			deskelId: muridTable.deskelId,
			alamat: muridTable.alamat,
			nomorTelepon: muridTable.nomorTelepon,
			muhrimId: muridTable.muhrimId,
			mursyidId: muridTable.mursyidId,
			baiatId: muridTable.baiatId,
			wiridId: muridTable.wiridId,
			qari: muridTable.qari,
			marhalah: muridTable.marhalah,
			tglLahir: muridTable.tglLahir,
			aktif: muridTable.aktif,
			partisipasi: muridTable.partisipasi,
			nik: muridTable.nik,
			fotoDriveId: muridTable.fotoDriveId, // Ambil fotoDriveId
			deskel: deskelTable.deskel,
			kecamatan: kecamatanTable.kecamatan,
			kokab: kokabTable.kokab,
			propinsi: propTable.propinsi
		})
		.from(muridTable)
		.leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
		.leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
		.leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
		.leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
		.where(eq(muridTable.id, muridId))
		.get();

	if (!muridData) {
		throw error(404, 'Data murid tidak ditemukan.');
	}

	const canWriteMurid = await userHasPermission(locals.user.id, 'perm-pendataan-write', {
		deskelId: muridData.deskelId
	});

	let fotoUrl: string | null = null;
	if (muridData.fotoDriveId) {
		fotoUrl = getPublicFileUrl(muridData.fotoDriveId);
	}

	return {
		user: locals.user,
		murid: { ...muridData, fotoUrl },
		canWriteMurid
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const muridId = parseInt(params.muridId);
		if (isNaN(muridId)) {
			return fail(400, { message: 'Murid ID tidak valid.' });
		}

		const formData = await request.formData();
		const action = formData.get('action');

		const deskelId = parseInt(formData.get('deskelId')?.toString() || '0');

		const canWriteMurid = await userHasPermission(locals.user.id, 'perm-pendataan-write', {
			deskelId: deskelId
		});

		if (!canWriteMurid) {
			return fail(403, {
				message: 'Akses Ditolak. Anda tidak memiliki izin untuk mengubah data di wilayah ini.'
			});
		}

		const nama = formData.get('nama')?.toString();
		if (!nama) {
			return fail(400, { message: 'Nama wajib diisi.' });
		}

		try {
			const updatedValues: Record<string, any> = {
				updaterId: locals.user.id,
				updatedAt: sql`CURRENT_TIMESTAMP`,
				nama: nama,
				namaArab: formData.get('namaArab')?.toString() || null,
				gender: formData.get('gender')?.toString() === 'true',
				deskelId: deskelId,
				alamat: formData.get('alamat')?.toString() || null,
				nomorTelepon: formData.get('nomorTelepon')?.toString() || null,
				muhrimId: parseInt(formData.get('muhrimId')?.toString() || '0') || null,
				mursyidId: parseInt(formData.get('mursyidId')?.toString() || '0') || null,
				baiatId: parseInt(formData.get('baiatId')?.toString() || '0') || null,
				wiridId: parseInt(formData.get('wiridId')?.toString() || '0') || null,
				qari: formData.get('qari')?.toString() === 'true',
				marhalah: parseInt(formData.get('marhalah')?.toString() || '1') as 1 | 2 | 3,
				tglLahir: formData.get('tglLahir')?.toString() || null,
				aktif: formData.get('aktif')?.toString() === 'on',
				partisipasi: formData.get('partisipasi')?.toString() === 'on',
				nik: formData.get('nik')?.toString() || null
			};

			const fotoFile = formData.get('foto') as File | null;
			const removeFoto = formData.get('removeFoto')?.toString() === 'true';

			const oldMuridData = await db.select({ fotoDriveId: muridTable.fotoDriveId }).from(muridTable).where(eq(muridTable.id, muridId)).get();
			const oldFileId = oldMuridData?.fotoDriveId;

			if (removeFoto) {
				updatedValues.fotoDriveId = null;
				if (oldFileId) {
					await deleteFile(oldFileId);
				}
			} else if (fotoFile && fotoFile.size > 0) {
				const buffer = Buffer.from(await fotoFile.arrayBuffer());
				const newFileId = await uploadFile(buffer, fotoFile.type, fotoFile.name);
				updatedValues.fotoDriveId = newFileId;
				if (oldFileId) {
					await deleteFile(oldFileId);
				}
			}

			await db.update(muridTable).set(updatedValues).where(eq(muridTable.id, muridId));

			if (action === 'save-and-close') {
				return {
					success: true,
					message: 'Data murid berhasil diperbarui.',
					redirect: '/member/pendataan'
				};
			} else {
				// Default action is 'save', so we stay on the page
				return {
					success: true,
					message: 'Data murid berhasil diperbarui.'
				};
			}
		} catch (e: any) {
			console.error('Error updating murid:', e);
			if (e.message && e.message.includes('UNIQUE constraint failed: murid.nik')) {
				return fail(409, { message: 'NIK sudah terdaftar. Harap gunakan NIK yang berbeda.' });
			}
			return fail(500, { message: 'Gagal memperbarui data murid karena kesalahan server.' });
		}
	}
};