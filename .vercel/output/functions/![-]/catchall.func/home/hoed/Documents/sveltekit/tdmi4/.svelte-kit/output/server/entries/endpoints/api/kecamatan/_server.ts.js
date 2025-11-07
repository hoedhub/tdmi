import { json } from "@sveltejs/kit";
import { d as db, k as kecamatanTable } from "../../../../chunks/index.js";
import { eq } from "drizzle-orm";
async function GET({ url }) {
  const kokabId = url.searchParams.get("kokabId");
  if (!kokabId) {
    return json({ error: "Kota/Kabupaten ID is required" }, { status: 400 });
  }
  try {
    console.log("Fetching kecamatan for kokabId:", kokabId);
    const kecamatan = await db.select().from(kecamatanTable).where(eq(kecamatanTable.idKokab, parseInt(kokabId)));
    return json(kecamatan);
  } catch (error) {
    console.error(`Error fetching kecamatan for kokabId: ${kokabId}`, error);
    return json(
      {
        error: "Failed to fetch kecamatan",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
export {
  GET
};
