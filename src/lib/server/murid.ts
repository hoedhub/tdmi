// src/lib/server/db/murid.ts
import { db } from '$lib/drizzle';
import { muridTable, deskelTable, kecamatanTable, kokabTable, propTable } from '$lib/drizzle/schema';
import { and, eq, SQL, sql, aliasedTable } from 'drizzle-orm';

export async function fetchMuridData(params: {
    page: number;
    pageSize: number;
    filterBy?: Array<{ column: string; keyword: string }>;
    sortBy?: Array<{ column: string; direction: 'asc' | 'desc' }>;
}) {
    const { page, pageSize, filterBy, sortBy } = params;
    const offset = (page - 1) * pageSize;

    // Build WHERE conditions
    let whereConditions: SQL | undefined;
    if (filterBy?.length) {
        const filterClauses = filterBy.map((filter) =>
            sql`${sql.identifier(filter.column)} LIKE ${'%' + filter.keyword + '%'}`
        );
        whereConditions = and(...filterClauses);
    }

    // Build ORDER BY conditions
    const orderBy = sortBy?.map((sort) =>
        sql`${sql.identifier(sort.column)} ${sql.raw(sort.direction.toUpperCase())}`
    ) || [];

    // Aliased tables for joins
    const deskelAls = aliasedTable(deskelTable, 'deskelAls');
    const kecamatanAls = aliasedTable(kecamatanTable, 'kecamatanAls');
    const kokabAls = aliasedTable(kokabTable, 'kokabAls');
    const propAls = aliasedTable(propTable, 'propAls');

    // Execute queries
    const [murids, counts] = await Promise.all([
        db.select({
            id: muridTable.id,
            "Updated At": muridTable.updatedAt,
            Nama: muridTable.nama,
            "Nama Arab": muridTable.namaArab,
            "Jenis Kelamin": muridTable.gender,
            Umur: sql<number>`
        (strftime('%Y', 'now') - strftime('%Y', ${muridTable.tglLahir})) - 
        CASE WHEN strftime('%m-%d', 'now') < strftime('%m-%d', ${muridTable.tglLahir}) THEN 1 ELSE 0 END
      `.as('umur'),
            Alamat: muridTable.alamat,
            "Desa/Kelurahan": deskelAls.deskel,
            Kecamatan: kecamatanAls.kecamatan,
            "Kota/Kabupaten": kokabAls.kokab,
            Propinsi: propAls.propinsi,
        })
            .from(muridTable)
            .where(whereConditions)
            .limit(pageSize)
            .offset(offset)
            .orderBy(...orderBy)
            .leftJoin(deskelAls, eq(muridTable.deskelId, deskelAls.id))
            .leftJoin(kecamatanAls, eq(deskelAls.idKecamatan, kecamatanAls.id))
            .leftJoin(kokabAls, eq(kecamatanAls.idKokab, kokabAls.id))
            .leftJoin(propAls, eq(kokabAls.idProp, propAls.id)),

        db.select({
            filtered: sql<number>`count(*)`.as('filtered'),
            total: sql<number>`count(*)`.as('total'),
        })
            .from(muridTable)
            .where(whereConditions),
    ]);

    return {
        murids,
        filteredTotal: counts[0]?.filtered || 0,
        total: counts[0]?.total || 0,
    };
}