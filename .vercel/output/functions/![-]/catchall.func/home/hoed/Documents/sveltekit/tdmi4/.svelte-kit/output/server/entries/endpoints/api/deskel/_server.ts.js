import { json } from "@sveltejs/kit";
import { d as db, b as deskelTable } from "../../../../chunks/index.js";
import { eq } from "drizzle-orm";
async function GET({ url }) {
  const kecamatanId = url.searchParams.get("kecamatanId");
  if (!kecamatanId) {
    return json({ error: "Kecamatan ID is required" }, { status: 400 });
  }
  try {
    console.log("Fetching desa/kelurahan for kecamatanId:", kecamatanId);
    const deskel = await db.select().from(deskelTable).where(eq(deskelTable.idKecamatan, parseInt(kecamatanId)));
    return json(deskel);
  } catch (error) {
    console.error(`Error fetching deskel for kecamatanId: ${kecamatanId}`, error);
    return json(
      {
        error: "Failed to fetch desa/kelurahan",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
export {
  GET
};
