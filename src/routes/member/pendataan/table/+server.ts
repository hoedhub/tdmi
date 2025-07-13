import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { muridTable, deskelTable, kecamatanTable, kokabTable, propTable, usersTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { count, eq, like, sql, asc, desc } from 'drizzle-orm';
import { getUserRoles } from '$lib/server/accessControlDB'; // Import getUserRoles

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    // Check if the user has permission to read murid data
    const canReadMurid = await userHasPermission(locals.user.id, 'perm-pendataan-read');
    if (!canReadMurid) {
        throw error(403, 'Akses Ditolak. Anda tidak memiliki izin untuk melihat data murid.');
    }

    const { sort, filters, page, pageSize, excludeId } = await request.json();

    const offset = (page - 1) * pageSize;

    try {
        // Determine if the user has a territory-based role (e.g., role-nasyath-propinsi)
        // Use getUserRoles to get all roles assigned to the user
        const userAssignedRoles = await getUserRoles(locals.user.id);
        const isLevel3User = userAssignedRoles.some(roleId => roleId.endsWith('-propinsi'));

        let userPropinsiId: number | null = null;
        if (isLevel3User) {
            const userMurid = await db.select({ deskelId: muridTable.deskelId })
                .from(muridTable)
                .where(eq(muridTable.id, locals.user.muridId!))
                .get();

            if (userMurid?.deskelId) {
                const result = await db.select({ propinsiId: propTable.id })
                    .from(deskelTable)
                    .where(eq(deskelTable.id, userMurid.deskelId))
                    .innerJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
                    .innerJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
                    .innerJoin(propTable, eq(kokabTable.idProp, propTable.id))
                    .get();
                userPropinsiId = result?.propinsiId ?? null;
            }
        }

        // Build the base query with all necessary joins for selection
        const baseSelectQuery = db.select({
            murid: muridTable,
            deskel: deskelTable,
            kecamatan: kecamatanTable,
            kokab: kokabTable,
            prop: propTable,
        })
            .from(muridTable)
            .leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
            .leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
            .leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
            .leftJoin(propTable, eq(kokabTable.idProp, propTable.id));

        // Build the base query for counting (same joins)
        const baseCountQuery = db.select({ count: count() })
            .from(muridTable)
            .leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
            .leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
            .leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
            .leftJoin(propTable, eq(kokabTable.idProp, propTable.id));


        // Apply filters
        const conditions: any[] = [];
        if (excludeId) {
            conditions.push(sql`${muridTable.id} != ${excludeId}`);
        }
        if (filters) {
            if (filters.global) {
                const globalSearch = `%${filters.global}%`;
                conditions.push(
                    sql`(${muridTable.nama} LIKE ${globalSearch} OR ${muridTable.namaArab} LIKE ${globalSearch} OR ${muridTable.nomorTelepon} LIKE ${globalSearch})`
                );
            }
            if (filters.columns) {
                for (const key in filters.columns) {
                    const value = filters.columns[key];
                    if (value) {
                        // Handle boolean and specific value filters
                        if (key === 'aktif' || key === 'qari' || key === 'partisipasi') {
                            const boolValue = value === 'Aktif' || value === 'Ya' || value === true;
                            conditions.push(eq((muridTable as any)[key], boolValue));
                        } else if (key === 'gender') {
                            const boolValue = value === 'Pria' || value === true;
                            conditions.push(eq(muridTable.gender, boolValue));
                        } else if (key === 'marhalah') {
                            conditions.push(eq(muridTable.marhalah, parseInt(value) as (1 | 2 | 3)));
                        } 
                        // Handle territory name filters
                        else if (key === 'alamat') {
                            const searchVal = `%${value}%`;
                            conditions.push(
                                sql`(${muridTable.alamat} LIKE ${searchVal} OR ${deskelTable.deskel} LIKE ${searchVal} OR ${kecamatanTable.kecamatan} LIKE ${searchVal} OR ${kokabTable.kokab} LIKE ${searchVal} OR ${propTable.propinsi} LIKE ${searchVal})`
                            );
                        }
                        // Handle general text search on specific muridTable columns
                        else if (key === 'nama' || key === 'namaArab' || key === 'nomorTelepon' || key === 'nik') {
                            conditions.push(like((muridTable as any)[key], `%${value}%`));
                        }
                        // Fallback for any other direct column name that might be passed
                        else if (key in muridTable) {
                             conditions.push(like((muridTable as any)[key], `%${value}%`));
                        }
                    }
                }
            }
        }

        // Apply territory filter for Level 3 users
        if (isLevel3User && userPropinsiId !== null) {
            conditions.push(eq(propTable.id, userPropinsiId));
        }

        // Apply conditions to the main query
        let query = baseSelectQuery.$dynamic();
        let countQuery = baseCountQuery.$dynamic();

        if (conditions.length > 0) {
            const whereClause = sql.join(conditions, sql` AND `);
            query = query.where(whereClause);
            countQuery = countQuery.where(whereClause);
        }

        // Get total count before pagination
        const totalItemsResult = await countQuery.get();
        const totalItems = totalItemsResult?.count || 0;

        // Apply sorting
        const orderByClauses = [];
        if (sort && Array.isArray(sort) && sort.length > 0) {
            sort.forEach(sortConfig => {
                let sortColumn;
                switch (sortConfig.key) {
                    case 'alamat': sortColumn = muridTable.alamat; break;
                    default: sortColumn = (muridTable as any)[sortConfig.key]; break;
                }

                if (sortColumn) {
                    orderByClauses.push(sortConfig.direction === 'asc' ? asc(sortColumn) : desc(sortColumn));
                }
            });
        }

        // Apply default sort if no custom sort was successfully added
        if (orderByClauses.length === 0) {
            orderByClauses.push(asc(muridTable.id));
        }
        
        query = query.orderBy(...orderByClauses).limit(pageSize).offset(offset);

        // Apply sorting and pagination in a single chain
        const murid = await query.all();

        // Apply pagination
        // const murid = await finalQuery.limit(pageSize).offset(offset).all();

        // Map the results to a flatter structure for the client
        const formattedMurid = murid.map(m => ({
            ...m.murid,
            deskelName: m.deskel?.deskel || null,
            kecamatanName: m.kecamatan?.kecamatan || null,
            kokabName: m.kokab?.kokab || null,
            propinsiName: m.prop?.propinsi || null,
        }));

        return json({
            murid: formattedMurid,
            totalItems,
            currentPage: page,
            pageSize
        });

    } catch (e) {
        console.error('Error fetching murid data:', e);
        throw error(500, 'Gagal memuat data murid karena kesalahan server.');
    }
};
