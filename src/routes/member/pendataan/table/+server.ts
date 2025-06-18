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

    const { sort, filters, page, pageSize } = await request.json();

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
                        if (key === 'aktif' || key === 'qari' || key === 'gender' || key === 'partisipasi') {
                            conditions.push(eq((muridTable as any)[key], value === 'Aktif' || value === 'Ya' || value === true));
                        } else if (key === 'marhalah') {
                            conditions.push(eq(muridTable.marhalah, parseInt(value) as (1 | 2 | 3)));
                        } else if (key === 'deskelId') {
                            conditions.push(eq(muridTable.deskelId, parseInt(value)));
                        } else if (key === 'propinsiName') { // Use propinsiName for filter key
                            conditions.push(eq(propTable.propinsi, value));
                        } else if (key === 'kokabName') { // Use kokabName for filter key
                            conditions.push(eq(kokabTable.kokab, value));
                        } else if (key === 'kecamatanName') { // Use kecamatanName for filter key
                            conditions.push(eq(kecamatanTable.kecamatan, value));
                        } else {
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
        let queryWithConditions = conditions.length > 0
            ? baseSelectQuery.where(sql.join(conditions, sql` AND `))
            : baseSelectQuery;

        // Get total count before pagination
        const totalItemsResult = await (conditions.length > 0
            ? baseCountQuery.where(sql.join(conditions, sql` AND `))
            : baseCountQuery
        ).get();
        const totalItems = totalItemsResult?.count || 0;

        // Apply sorting
        const orderByClauses = [];
        if (sort && sort.key) {
            // Map client-side sort keys to database columns
            let sortColumn;
            switch (sort.key) {
                case 'deskelName': sortColumn = deskelTable.deskel; break;
                case 'kecamatanName': sortColumn = kecamatanTable.kecamatan; break;
                case 'kokabName': sortColumn = kokabTable.kokab; break;
                case 'propinsiName': sortColumn = propTable.propinsi; break;
                default: sortColumn = (muridTable as any)[sort.key]; break;
            }

            if (sortColumn) {
                orderByClauses.push(sort.direction === 'asc' ? asc(sortColumn) : desc(sortColumn));
            }
        }

        // Apply default sort if no custom sort was successfully added
        if (orderByClauses.length === 0) {
            orderByClauses.push(asc(muridTable.id));
        }

        // Apply sorting and pagination in a single chain
        const murid = await queryWithConditions
            .orderBy(...orderByClauses)
            .limit(pageSize)
            .offset(offset)
            .all();

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
