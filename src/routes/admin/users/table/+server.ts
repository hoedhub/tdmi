import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { usersTable, userRolesTable, rolesTable } from '$lib/drizzle/schema'; // Hapus impor rolesTable yang tidak terpakai
import { userHasPermission } from '$lib/server/accessControl';
import { count, asc, desc, like, eq, and, or } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';


type ProcessedUser = {
    id: string;
    username: string;
    active: boolean | null;
    muridId: number | null;
    createdAt: string;
    assignedRoles: string[];
};

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }
    const canReadUsers = await userHasPermission(locals.user.id, 'perm-user-read');
    if (!canReadUsers) {
        throw error(403, 'Forbidden');
    }

    try {
        const body = await request.json();
        const { sort, filters, page, pageSize } = body;

        // 1. Buat array untuk menampung semua kondisi WHERE
        const conditions: (SQL | undefined)[] = [];

        // 2. Iterasi melalui filter yang diterima dari frontend
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                // Lewati jika filter kosong atau 'All'
                if (!value || value === 'All') continue;

                switch (key) {
                    case 'global':
                        conditions.push(
                            or(
                                like(usersTable.username, `%${value}%`),
                                like(usersTable.active, `%${value}%`),
                                like(rolesTable.name, `%${value}%`)
                                // Anda bisa menambahkan kolom lain di sini, misal:
                                // like(muridTable.nama, `%${value}%`)
                            )
                        );
                        break;
                    case 'username':
                        conditions.push(like(usersTable.username, `%${value}%`));
                        break;
                    case 'active':
                        // Konversi string 'Active'/'Inactive' menjadi boolean
                        conditions.push(eq(usersTable.active, value === 'Active'));
                        break;
                    case 'assignedRoles':
                        // Filter berdasarkan nama peran dari tabel 'roles'
                        conditions.push(like(rolesTable.name, `%${value}%`));
                        break;
                    // 'global' filter bisa ditambahkan di sini jika perlu,
                    // tapi filter per kolom biasanya lebih disukai.
                }
            }
        }

        // 3. Gabungkan semua kondisi dengan 'AND'
        const finalWhereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Query untuk mengambil SEMUA baris yang cocok, termasuk duplikat karena peran
        const allMatchingRows = await db
            .select({
                id: usersTable.id,
                username: usersTable.username,
                active: usersTable.active,
                muridId: usersTable.muridId,
                createdAt: usersTable.createdAt,
                roleId: userRolesTable.roleId
            })
            .from(usersTable)
            .leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
            .leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .where(finalWhereClause);

        const usersMap = new Map<string, ProcessedUser>();

        for (const row of allMatchingRows) {
            if (!usersMap.has(row.id)) {
                usersMap.set(row.id, { id: row.id, username: row.username, active: row.active, muridId: row.muridId, createdAt: row.createdAt, assignedRoles: [] });
            }
            if (row.roleId) {
                usersMap.get(row.id)!.assignedRoles.push(row.roleId);
            }
        }

        const totalItems = usersMap.size;
        let usersForClient = Array.from(usersMap.values());

        // --- DIUBAH: Logika Sorting yang Type-Safe ---
        if (sort && sort.key) {
            // Definisikan kunci yang valid untuk sorting
            const sortableKeys: (keyof ProcessedUser)[] = ['username', 'active', 'muridId', 'createdAt'];

            // Lakukan type assertion untuk memberi tahu TS bahwa kita sudah memvalidasi kuncinya
            const sortKey = sort.key as keyof ProcessedUser;

            if (sortableKeys.includes(sortKey)) {
                usersForClient.sort((a, b) => {
                    const valA = a[sortKey];
                    const valB = b[sortKey];

                    // Tangani null agar tidak crash
                    if (valA === null) return 1;
                    if (valB === null) return -1;

                    if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
                    return 0;
                });
            }
        }

        const paginatedUsers = usersForClient.slice((page - 1) * pageSize, page * pageSize);
        // console.log('[API RESPONSE] Data yang dikirim:', JSON.stringify({
        //     users: usersForClient,
        //     totalItems: countResult[0].totalCount
        // }, null, 2));
        return json({
            users: paginatedUsers,
            totalItems: totalItems,
            currentPage: page,
        });

    } catch (e) {
        console.error("Error fetching table data:", e);
        // @ts-ignore
        throw error(500, e.message || 'Failed to fetch user data');
    }
};