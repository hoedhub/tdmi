import { json } from "@sveltejs/kit";
import { d as db, m as muridTable } from "../../../../../chunks/index.js";
import { inArray, eq } from "drizzle-orm";
import { g as getPublicFileUrl, u as uploadFile } from "../../../../../chunks/cloudinary.js";
const POST = async ({ request }) => {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return json({});
    }
    const fotos = await db.select({
      id: muridTable.id,
      fotoPublicId: muridTable.fotoPublicId
    }).from(muridTable).where(inArray(muridTable.id, ids));
    const fotosMap = fotos.reduce(
      (acc, { id, fotoPublicId }) => {
        if (fotoPublicId) {
          acc[id] = getPublicFileUrl(fotoPublicId);
        } else {
          acc[id] = null;
        }
        return acc;
      },
      {}
    );
    return json(fotosMap);
  } catch (error) {
    console.error("Error fetching fotos:", error);
    return json({}, { status: 500 });
  }
};
const PATCH = async ({ request }) => {
  try {
    const formData = await request.formData();
    const id = formData.get("id");
    const foto = formData.get("foto");
    if (!id || !foto) {
      return json({ message: "ID and foto are required" }, { status: 400 });
    }
    const muridId = Number(id);
    const fotoBuffer = Buffer.from(await foto.arrayBuffer());
    const newFileId = await uploadFile(fotoBuffer, muridId);
    await db.update(muridTable).set({ fotoPublicId: newFileId }).where(eq(muridTable.id, muridId));
    return json({
      message: "Foto updated successfully",
      fileId: newFileId,
      url: getPublicFileUrl(newFileId)
    });
  } catch (error) {
    console.error("Error updating foto:", error);
    return json({ message: "Error updating foto" }, { status: 500 });
  }
};
export {
  PATCH,
  POST
};
