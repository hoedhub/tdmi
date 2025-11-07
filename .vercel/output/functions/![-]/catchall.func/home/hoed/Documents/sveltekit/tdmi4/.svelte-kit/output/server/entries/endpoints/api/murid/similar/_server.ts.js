import { d as db, p as propTable, c as kokabTable, k as kecamatanTable, b as deskelTable, m as muridTable } from "../../../../../chunks/index.js";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import levenshtein from "tiny-levenshtein";
function calculateSimilarity(str1, str2) {
  const distance = levenshtein(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength > 0 ? 1 - distance / maxLength : 0;
}
async function GET({ url }) {
  const nameToSearch = url.searchParams.get("nama");
  if (!nameToSearch) {
    return json({ error: "Nama parameter is required" }, { status: 400 });
  }
  try {
    const allMurids = await db.select({
      id: muridTable.id,
      nama: muridTable.nama,
      alamat: muridTable.alamat,
      deskel: deskelTable.deskel,
      kecamatan: kecamatanTable.kecamatan,
      kokab: kokabTable.kokab,
      propinsi: propTable.propinsi
    }).from(muridTable).leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id)).leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id)).leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id)).leftJoin(propTable, eq(kokabTable.idProp, propTable.id));
    if (allMurids.length === 0) {
      return json([], { status: 200 });
    }
    const normalizedQuery = nameToSearch.toLowerCase();
    const similarMurids = allMurids.map((murid) => {
      const normalizedDbName = murid.nama.toLowerCase();
      const queryWords = normalizedQuery.split(" ").filter(Boolean);
      const dbWords = normalizedDbName.split(" ").filter(Boolean);
      let ratingA = 0;
      if (queryWords.length > 0 && dbWords.length > 0) {
        const wordScores = queryWords.map((queryWord) => {
          const scores = dbWords.map((dbWord) => calculateSimilarity(queryWord, dbWord));
          return Math.max(...scores);
        });
        ratingA = wordScores.reduce((sum, score) => sum + score, 0) / wordScores.length;
      }
      const queryNoSpace = normalizedQuery.replace(/\s/g, "");
      const dbNameNoSpace = normalizedDbName.replace(/\s/g, "");
      const ratingB = calculateSimilarity(queryNoSpace, dbNameNoSpace);
      let finalRating = Math.max(ratingA, ratingB);
      const isSubstring = normalizedDbName.includes(normalizedQuery);
      if (isSubstring && finalRating < 0.75) {
        finalRating = 0.75;
      }
      const alamatLengkap = [
        murid.alamat,
        murid.deskel,
        murid.kecamatan,
        murid.kokab,
        murid.propinsi
      ].filter(Boolean).join(", ");
      return {
        id: murid.id,
        nama: murid.nama,
        rating: finalRating,
        alamatLengkap: alamatLengkap || null
      };
    }).filter((murid) => murid.rating >= 0.75);
    similarMurids.sort((a, b) => b.rating - a.rating);
    return json(similarMurids, { status: 200 });
  } catch (error) {
    console.error("[API] Error finding similar murids:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export {
  GET
};
