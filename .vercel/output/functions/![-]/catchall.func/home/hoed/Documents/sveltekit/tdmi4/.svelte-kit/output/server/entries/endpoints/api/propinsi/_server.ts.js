import { json, error } from "@sveltejs/kit";
import { d as db, p as propTable } from "../../../../chunks/index.js";
async function GET() {
  try {
    const propinsi = await db.select().from(propTable);
    return json(propinsi);
  } catch (e) {
    console.error("Gagal mengambil data propinsi:", e);
    throw error(503, "Tidak dapat terhubung ke database untuk mengambil data propinsi.");
  }
}
export {
  GET
};
