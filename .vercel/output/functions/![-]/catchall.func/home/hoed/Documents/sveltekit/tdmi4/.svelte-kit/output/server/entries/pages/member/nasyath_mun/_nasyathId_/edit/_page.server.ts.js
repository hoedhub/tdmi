import { d as db, n as nasyathTable } from "../../../../../../chunks/index.js";
import { eq } from "drizzle-orm";
import { redirect, error, fail } from "@sveltejs/kit";
import { c as canUserAccessNasyath } from "../../../../../../chunks/nasyath.js";
const load = async ({ locals, params, url }) => {
  if (!locals.user) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }
  const nasyathId = parseInt(params.nasyathId, 10);
  if (isNaN(nasyathId)) {
    throw error(400, "Nasyath ID tidak valid");
  }
  const nasyathToEdit = await db.query.nasyathTable.findFirst({
    where: eq(nasyathTable.id, nasyathId)
  });
  if (!nasyathToEdit) {
    throw error(404, "Data nasyath tidak ditemukan");
  }
  const hasAccess = await canUserAccessNasyath(locals.user.id, nasyathToEdit.muridId);
  if (!hasAccess) {
    throw error(403, "Akses Ditolak");
  }
  return {
    nasyath: nasyathToEdit
  };
};
const actions = {
  default: async ({ request, locals, params }) => {
    if (!locals.user) {
      throw error(401, "Unauthorized");
    }
    const nasyathId = parseInt(params.nasyathId, 10);
    if (isNaN(nasyathId)) {
      return fail(400, { message: "Nasyath ID tidak valid." });
    }
    const nasyathToEdit = await db.query.nasyathTable.findFirst({
      where: eq(nasyathTable.id, nasyathId)
    });
    if (!nasyathToEdit) {
      throw error(404, "Data nasyath tidak ditemukan");
    }
    const hasAccess = await canUserAccessNasyath(locals.user.id, nasyathToEdit.muridId);
    if (!hasAccess) {
      return fail(403, { message: "Akses Ditolak" });
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
      await db.update(nasyathTable).set({
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
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq(nasyathTable.id, nasyathId));
    } catch (e) {
      console.error("Gagal memperbarui data nasyath:", e);
      return fail(500, { ...formValues, message: "Gagal memperbarui data di server." });
    }
    throw redirect(303, "/member/nasyath_mun");
  }
};
export {
  actions,
  load
};
