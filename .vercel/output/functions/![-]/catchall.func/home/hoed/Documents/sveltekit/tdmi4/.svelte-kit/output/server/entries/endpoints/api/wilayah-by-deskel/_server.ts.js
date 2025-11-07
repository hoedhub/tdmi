import { d as db, p as propTable, c as kokabTable, k as kecamatanTable, b as deskelTable } from "../../../../chunks/index.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
async function GET({ url }) {
  const deskelId = Number(url.searchParams.get("deskelId"));
  if (!deskelId || isNaN(deskelId)) {
    return json({ error: "deskelId tidak valid" }, { status: 400 });
  }
  try {
    const result = await db.select({
      deskel: deskelTable,
      kecamatan: kecamatanTable,
      kokab: kokabTable,
      propinsi: propTable
    }).from(deskelTable).where(eq(deskelTable.id, deskelId)).innerJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id)).innerJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id)).innerJoin(propTable, eq(kokabTable.idProp, propTable.id));
    if (result.length === 0) {
      return json({ error: "Wilayah tidak ditemukan" }, { status: 404 });
    }
    const [kokabList, kecamatanList, deskelList] = await Promise.all([
      db.select().from(kokabTable).where(eq(kokabTable.idProp, result[0].propinsi.id)),
      db.select().from(kecamatanTable).where(eq(kecamatanTable.idKokab, result[0].kokab.id)),
      db.select().from(deskelTable).where(eq(deskelTable.idKecamatan, result[0].kecamatan.id))
    ]);
    return json({
      selectedPropinsi: result[0].propinsi,
      selectedKokab: result[0].kokab,
      selectedKecamatan: result[0].kecamatan,
      // List untuk mengisi dropdown
      kokabList,
      kecamatanList,
      deskelList
    });
  } catch (e) {
    console.error("Error fetching wilayah by deskel:", e);
    return json({ error: "Gagal mengambil data wilayah" }, { status: 500 });
  }
}
export {
  GET
};
