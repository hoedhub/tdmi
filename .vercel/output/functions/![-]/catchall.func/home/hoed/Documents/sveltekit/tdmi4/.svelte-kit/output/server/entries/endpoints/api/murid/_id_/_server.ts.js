import { json } from "@sveltejs/kit";
import { m as muridTable, d as db, p as propTable, c as kokabTable, k as kecamatanTable, b as deskelTable } from "../../../../../chunks/index.js";
import { aliasedTable, eq } from "drizzle-orm";
function calculateAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = /* @__PURE__ */ new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || m === 0 && today.getDate() < birth.getDate()) {
    age--;
  }
  return age;
}
async function GET({ params }) {
  try {
    const muridId = Number(params.id);
    const muhrimAls = aliasedTable(muridTable, "muhrim");
    const mursyidAls = aliasedTable(muridTable, "mursyid");
    const baiatAls = aliasedTable(muridTable, "baiat");
    const result = await db.select({
      murid: muridTable,
      deskel: deskelTable.deskel,
      kecamatan: kecamatanTable.kecamatan,
      kokab: kokabTable.kokab,
      propinsi: propTable.propinsi,
      muhrim: {
        id: muhrimAls.id,
        nama: muhrimAls.nama
      },
      mursyid: {
        id: mursyidAls.id,
        nama: mursyidAls.nama
      },
      baiat: {
        id: baiatAls.id,
        nama: baiatAls.nama
      }
    }).from(muridTable).leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id)).leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id)).leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id)).leftJoin(propTable, eq(kokabTable.idProp, propTable.id)).leftJoin(muhrimAls, eq(muridTable.muhrimId, muhrimAls.id)).leftJoin(mursyidAls, eq(muridTable.mursyidId, mursyidAls.id)).leftJoin(baiatAls, eq(muridTable.baiatId, baiatAls.id)).where(eq(muridTable.id, muridId)).limit(1);
    const profiles = result;
    if (!profiles.length) {
      return json({ error: "Murid not found" }, { status: 404 });
    }
    const profile = profiles[0];
    const age = calculateAge(profile.murid.tglLahir);
    return json({
      success: true,
      data: {
        ...profile.murid,
        age,
        // foto is now derived from fotoPublicId on the client
        alamatLengkap: [profile.deskel, profile.kecamatan, profile.kokab, profile.propinsi].filter(Boolean).join(", "),
        muhrim: profile.muhrim,
        mursyid: profile.mursyid,
        baiat: profile.baiat
      }
    });
  } catch (error) {
    console.error("Error fetching murid profile:", error);
    return json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
export {
  GET
};
