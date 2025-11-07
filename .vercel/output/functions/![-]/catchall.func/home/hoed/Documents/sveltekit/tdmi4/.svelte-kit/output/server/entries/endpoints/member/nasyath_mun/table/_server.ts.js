import { error, json } from "@sveltejs/kit";
import { d as db, u as usersTable, n as nasyathTable, m as muridTable } from "../../../../../chunks/index.js";
import { eq, like, or, gte, lte, and, count, asc, desc, getTableColumns } from "drizzle-orm";
import { u as userHasPermission } from "../../../../../chunks/accessControl.js";
const POST = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }
  const { sort, filters, page, pageSize, isCetak } = await request.json();
  const dateRange = filters?.dateRange;
  const offset = (page - 1) * pageSize;
  try {
    const canReadAll = await userHasPermission(locals.user.id, "perm-nasyath-read");
    const allConditions = [];
    if (!canReadAll) {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, locals.user.id),
        columns: { muridId: true }
      });
      if (!user || !user.muridId) {
        return json({ data: [], totalItems: 0, currentPage: 1, pageSize });
      }
      allConditions.push(eq(nasyathTable.muridId, user.muridId));
    }
    if (filters) {
      if (filters.global) {
        const globalSearch = `%${filters.global}%`;
        const globalFilterConditions = [
          like(nasyathTable.kegiatan, globalSearch),
          like(nasyathTable.tempat, globalSearch),
          like(nasyathTable.keterangan, globalSearch)
        ];
        if (canReadAll) {
          globalFilterConditions.push(like(muridTable.namaArab, globalSearch));
        }
        allConditions.push(or(...globalFilterConditions));
      }
      if (filters.columns) {
        for (const key in filters.columns) {
          const value = filters.columns[key];
          if (value) {
            if (key === "murid.nama") {
              allConditions.push(like(muridTable.namaArab, `%${value}%`));
            } else if (key in nasyathTable) {
              allConditions.push(like(nasyathTable[key], `%${value}%`));
            }
          }
        }
      }
    }
    if (dateRange && (dateRange.start || dateRange.end)) {
      if (dateRange.start) {
        allConditions.push(gte(nasyathTable.tanggalMulai, dateRange.start));
      }
      if (dateRange.end) {
        allConditions.push(lte(nasyathTable.tanggalMulai, dateRange.end));
      }
    }
    const whereClause = allConditions.length > 0 ? and(...allConditions) : void 0;
    const totalItemsQuery = db.select({ count: count() }).from(nasyathTable).leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id)).where(whereClause);
    const totalItemsResult = await totalItemsQuery.get();
    const totalItems = totalItemsResult?.count || 0;
    const orderByClauses = [];
    if (sort && Array.isArray(sort) && sort.length > 0) {
      sort.forEach((sortConfig) => {
        if (sortConfig.key === "murid.nama") {
          orderByClauses.push(
            sortConfig.direction === "asc" ? asc(muridTable.namaArab) : desc(muridTable.namaArab)
          );
        } else if (sortConfig.key in nasyathTable) {
          const sortColumn = nasyathTable[sortConfig.key];
          orderByClauses.push(sortConfig.direction === "asc" ? asc(sortColumn) : desc(sortColumn));
        }
      });
    }
    if (orderByClauses.length === 0) {
      orderByClauses.push(asc(nasyathTable.tanggalMulai));
    }
    const query = db.select({
      ...getTableColumns(nasyathTable),
      murid: {
        nama: muridTable.namaArab
      }
    }).from(nasyathTable).leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id)).where(whereClause).orderBy(...orderByClauses).limit(isCetak ? 9999 : pageSize).offset(isCetak ? 0 : offset);
    const data = await query.all();
    return json({
      data,
      totalItems,
      currentPage: page,
      pageSize
    });
  } catch (e) {
    console.error("Error fetching nasyath data:", e);
    throw error(500, "Gagal memuat data nasyath karena kesalahan server.");
  }
};
export {
  POST
};
