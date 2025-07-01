import { db } from '$lib/drizzle';
import { usersTable, nasyathTable } from '$lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, `/login?redirectTo=${url.pathname}`);
	}

	// Pastikan pengguna terhubung dengan data murid sebelum menampilkan form
	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, locals.user.id),
		columns: { muridId: true }
	});

	if (!user || !user.muridId) {
		throw error(403, 'Akses Ditolak: Akun Anda tidak terhubung dengan data murid.');
	}

	return {}; // Cukup kembalikan objek kosong, karena tidak ada data yang perlu di-load
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, locals.user.id),
			columns: { muridId: true }
		});

		if (!user || !user.muridId) {
			return fail(403, { message: 'Akses ditolak: Anda tidak terhubung dengan data murid.' });
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
			await db.insert(nasyathTable).values({
				muridId: user.muridId,
				updaterId: locals.user.id,
				kegiatan,
				tanggalMulai: tanggalMulai || null,
				tanggalSelesai: tanggalSelesai || null,
				durasi: durasi || null,
				jarak: jarak || null,
				tempat: tempat || null,
				namaKontak: namaKontak || null,
				teleponKontak: teleponKontak || null,
				keterangan: keterangan || null
			});
		} catch (e) {
			console.error('Gagal menyimpan data nasyath:', e);
			return fail(500, { ...formValues, message: 'Gagal menyimpan data ke server.' });
		}

		throw redirect(303, '/member/nasyath_mun');
	}
};
