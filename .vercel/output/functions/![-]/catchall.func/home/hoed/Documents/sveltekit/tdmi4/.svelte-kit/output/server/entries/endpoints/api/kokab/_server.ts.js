import { json } from "@sveltejs/kit";
import { d as db, c as kokabTable } from "../../../../chunks/index.js";
import { eq } from "drizzle-orm";
async function GET({ url }) {
  const propinsiId = url.searchParams.get("propinsiId");
  if (!propinsiId) {
    return json({ error: "Propinsi ID is required" }, { status: 400 });
  }
  try {
    console.log("Fetching kokab for propinsiId:", propinsiId);
    const kokab = await db.select().from(kokabTable).where(eq(kokabTable.idProp, parseInt(propinsiId)));
    return json(kokab);
  } catch (error) {
    console.error(`Error fetching kokab for propinsiId: ${propinsiId}`, error);
    return json(
      {
        error: "Failed to fetch kota/kabupaten",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
export {
  GET
};
