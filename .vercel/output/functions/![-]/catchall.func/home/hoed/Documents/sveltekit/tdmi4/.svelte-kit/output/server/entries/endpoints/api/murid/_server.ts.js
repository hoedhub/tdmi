import { json } from "@sveltejs/kit";
import { b as deskelTable, k as kecamatanTable, c as kokabTable, p as propTable, d as db, m as muridTable } from "../../../../chunks/index.js";
import { sql, and, aliasedTable, eq, inArray } from "drizzle-orm";
async function fetchMuridData(params) {
  const { page, pageSize, filterBy, sortBy } = params;
  const offset = (page - 1) * pageSize;
  let whereConditions;
  if (filterBy?.length) {
    const filterClauses = filterBy.map(
      (filter) => sql`${sql.identifier(filter.column)} LIKE ${"%" + filter.keyword + "%"}`
    );
    whereConditions = and(...filterClauses);
  }
  const orderBy = sortBy?.map(
    (sort) => sql`${sql.identifier(sort.column)} ${sql.raw(sort.direction.toUpperCase())}`
  ) || [];
  const deskelAls = aliasedTable(deskelTable, "deskelAls");
  const kecamatanAls = aliasedTable(kecamatanTable, "kecamatanAls");
  const kokabAls = aliasedTable(kokabTable, "kokabAls");
  const propAls = aliasedTable(propTable, "propAls");
  const [murids, counts] = await Promise.all([
    db.select({
      id: muridTable.id,
      "Updated At": muridTable.updatedAt,
      Nama: muridTable.nama,
      "Nama Arab": muridTable.namaArab,
      "Jenis Kelamin": muridTable.gender,
      Umur: sql`
        (strftime('%Y', 'now') - strftime('%Y', ${muridTable.tglLahir})) - 
        CASE WHEN strftime('%m-%d', 'now') < strftime('%m-%d', ${muridTable.tglLahir}) THEN 1 ELSE 0 END
      `.as("umur"),
      Alamat: muridTable.alamat,
      "Desa/Kelurahan": deskelAls.deskel,
      Kecamatan: kecamatanAls.kecamatan,
      "Kota/Kabupaten": kokabAls.kokab,
      Propinsi: propAls.propinsi
    }).from(muridTable).where(whereConditions).limit(pageSize).offset(offset).orderBy(...orderBy).leftJoin(deskelAls, eq(muridTable.deskelId, deskelAls.id)).leftJoin(kecamatanAls, eq(deskelAls.idKecamatan, kecamatanAls.id)).leftJoin(kokabAls, eq(kecamatanAls.idKokab, kokabAls.id)).leftJoin(propAls, eq(kokabAls.idProp, propAls.id)),
    db.select({
      filtered: sql`count(*)`.as("filtered"),
      total: sql`count(*)`.as("total")
    }).from(muridTable).where(whereConditions)
  ]);
  return {
    murids,
    filteredTotal: counts[0]?.filtered || 0,
    total: counts[0]?.total || 0
  };
}
const GET = async ({ url }) => {
  try {
    const queryParams = url.searchParams;
    const pageSize = Number(queryParams.get("pageSize")) || 50;
    const page = Number(queryParams.get("page")) || 1;
    const filterBy = queryParams.get("filterBy") ? JSON.parse(queryParams.get("filterBy") || "[]") : void 0;
    const sortBy = queryParams.get("sortBy") ? JSON.parse(queryParams.get("sortBy") || "[]") : void 0;
    const result = await fetchMuridData({
      page,
      pageSize,
      filterBy,
      sortBy
    });
    return json({
      murid: result.murids,
      filteredTotalCount: result.filteredTotal,
      totalCount: result.total,
      pageSize,
      currentPage: page
    });
  } catch (err) {
    console.error("Error in GET function:", err);
    console.error("Error details:", err instanceof Error ? err.stack : String(err));
    return json(
      {
        error: `An error occurred while fetching data: ${err instanceof Error ? err.message : String(err)}`
      },
      { status: 500 }
    );
  }
};
const POST = async ({ request, locals }) => {
  try {
    const muridData = await request.json();
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "User not authenticated" }, { status: 401 });
    }
    const enrichedMuridData = {
      ...muridData,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      updaterId: userId
    };
    const result = await db.insert(muridTable).values(enrichedMuridData).returning();
    return json(result[0]);
  } catch (err) {
    console.error("Error in POST function:", err);
    console.error("Error details:", err instanceof Error ? err.stack : String(err));
    return json(
      {
        error: `An error occurred while adding new murid: ${err instanceof Error ? err.message : String(err)}`
      },
      { status: 500 }
    );
  }
};
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
  DELETE,
  GET,
  POST
};
