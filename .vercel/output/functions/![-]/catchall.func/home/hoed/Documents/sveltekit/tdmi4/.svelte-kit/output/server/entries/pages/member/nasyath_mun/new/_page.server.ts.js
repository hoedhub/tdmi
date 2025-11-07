import { d as db, u as usersTable, n as nasyathTable } from "../../../../../chunks/index.js";
import { eq } from "drizzle-orm";
import { redirect, error, fail } from "@sveltejs/kit";
const load = async ({ locals, url }) => {
  if (!locals.user) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, locals.user.id),
    columns: { muridId: true }
  });
  if (!user || !user.muridId) {
    throw error(403, "Akses Ditolak: Akun Anda tidak terhubung dengan data murid.");
  }
  return {};
};
const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, "Unauthorized");
    }
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, locals.user.id),
      columns: { muridId: true }
    });
    if (!user || !user.muridId) {
      return fail(403, { message: "Akses ditolak: Anda tidak terhubung dengan data murid." });
    }
    const formData = await request.formData();
    const kegiatan = formData.get("kegiatan");
    const tanggalMulai = formData.get("tanggalMulai");
    const tanggalSelesai = formData.get("tanggalSelesai");
    const durasi = formData.get("durasi");
    const jarak = formData.get("jarak");
    const tempat = formData.get("tempat");
    const namaKontak = formData.get("namaKontak");
    const teleponKontak = formData.get("teleponKontak");
    const keterangan = formData.get("keterangan");
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
      return fail(400, { ...formValues, message: "Nama kegiatan wajib diisi." });
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
      console.error("Gagal menyimpan data nasyath:", e);
      return fail(500, { ...formValues, message: "Gagal menyimpan data ke server." });
    }
    throw redirect(303, "/member/nasyath_mun");
  }
};
export {
  actions,
  load
};
