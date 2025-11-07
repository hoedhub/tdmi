import { json } from "@sveltejs/kit";
import { d as db, p as propTable, c as kokabTable, k as kecamatanTable, b as deskelTable, m as muridTable } from "../../../../../chunks/index.js";
import { eq, like } from "drizzle-orm";
import { u as userHasPermission } from "../../../../../chunks/accessControl.js";
const GET = async ({ url, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const nama = url.searchParams.get("nama");
  if (!nama || nama.trim().length < 2) {
    return json({ murids: [] });
  }
  const canRead = await userHasPermission(locals.user.id, "perm-pendataan-access");
  if (!canRead) {
    return json({ error: "Access denied" }, { status: 403 });
  }
  try {
    const murids = await db.select({
      id: muridTable.id,
      nama: muridTable.nama,
      namaArab: muridTable.namaArab,
      gender: muridTable.gender,
      tglLahir: muridTable.tglLahir,
      alamat: muridTable.alamat,
      deskel: deskelTable.deskel,
      kecamatan: kecamatanTable.kecamatan,
      kokab: kokabTable.kokab,
      propinsi: propTable.propinsi
    }).from(muridTable).leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id)).leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id)).leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id)).leftJoin(propTable, eq(kokabTable.idProp, propTable.id)).where(like(muridTable.nama, `%${nama.trim()}%`)).limit(10);
    return json({ murids });
  } catch (error) {
    console.error("Error searching murids:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
export {
  GET
};
