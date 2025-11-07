import { json } from "@sveltejs/kit";
import { d as db, m as muridTable } from "../../../../../chunks/index.js";
import { inArray } from "drizzle-orm";
async function DELETE({ request }) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return json({ success: false, error: "Invalid or empty ids array" }, { status: 400 });
    }
    await db.delete(muridTable).where(inArray(muridTable.id, ids));
    return json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error("Error deleting records:", error);
    return json({ success: false, error: "Failed to delete records" }, { status: 500 });
  }
}
export {
  DELETE
};
