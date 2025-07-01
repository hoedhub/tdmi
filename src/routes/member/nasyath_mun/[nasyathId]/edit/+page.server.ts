import { db } from '$lib/drizzle';
import { nasyathTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import { canUserAccessNasyath } from '$lib/server/nasyath';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.user) {
		throw redirect(302, `/login?redirectTo=${url.pathname}`);
	}

	const nasyathId = parseInt(params.nasyathId, 10);
	if (isNaN(nasyathId)) {
		throw error(400, 'Nasyath ID tidak valid');
	}

	const nasyathToEdit = await db.query.nasyathTable.findFirst({
		where: eq(nasyathTable.id, nasyathId)
	});

	if (!nasyathToEdit) {
		throw error(404, 'Data nasyath tidak ditemukan');
	}

	// Keamanan: Pastikan pengguna punya hak akses untuk mengedit data ini
	const hasAccess = await canUserAccessNasyath(locals.user.id, nasyathToEdit.muridId, 'write');
	if (!hasAccess) {
		throw error(403, 'Akses Ditolak');
	}

	return {
		nasyath: nasyathToEdit
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const nasyathId = parseInt(params.nasyathId, 10);
		if (isNaN(nasyathId)) {
			return fail(400, { message: 'Nasyath ID tidak valid.' });
		}

		const nasyathToEdit = await db.query.nasyathTable.findFirst({
			where: eq(nasyathTable.id, nasyathId)
		});

		if (!nasyathToEdit) {
			throw error(404, 'Data nasyath tidak ditemukan');
		}

		// Keamanan: Periksa kembali hak akses sebelum memodifikasi
		const hasAccess = await canUserAccessNasyath(locals.user.id, nasyathToEdit.muridId, 'write');
		if (!hasAccess) {
			return fail(403, { message: 'Akses Ditolak' });
		}

		const formData = await request.formData();
		const kegiatan = formData.get('kegiatan') as string;
		const tanggalMulai = formData.get('tanggalMulai') as string;
		const tanggalSelesai = formData.get('tanggalSelesai') as string;
		const durasi = formData.get('durasi') as string;
		const jarak = formData.get('jarak') as string;
		const tempat = formData.get('tempat') as string;
		const namaKontak = formData.get('namaKontak') as string;
		const teleponKontak = formData.get('teleponKontak') as string;
		const keterangan = formData.get('keterangan') as string;

		const formValues = {
			kegiatan,
			tanggalMulai,
			tanggalSelesai,
			durasi,
			jarak,
			tempat,
			namaKontak,
			teleponKontak,
			keterangan
		};

		if (!kegiatan || kegiatan.trim().length === 0) {
			return fail(400, { ...formValues, message: 'Nama kegiatan wajib diisi.' });
		}

		try {
			await db
				.update(nasyathTable)
				.set({
					kegiatan,
					tanggalMulai: tanggalMulai || null,
					tanggalSelesai: tanggalSelesai || null,
					durasi: durasi || null,
					jarak: jarak || null,
					tempat: tempat || null,
					namaKontak: namaKontak || null,
					teleponKontak: teleponKontak || null,
					keterangan: keterangan || null,
					updaterId: locals.user.id,
					updatedAt: new Date().toISOString()
				})
				.where(eq(nasyathTable.id, nasyathId));
		} catch (e) {
			console.error('Gagal memperbarui data nasyath:', e);
			return fail(500, { ...formValues, message: 'Gagal memperbarui data di server.' });
		}

		throw redirect(303, '/member/nasyath_mun');
	}
};
