import { db } from '$lib/drizzle';
import { nasyathTable, usersTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { and, like, sql, asc, desc, eq } from 'drizzle-orm';

// Nama fungsi diubah agar lebih umum
export async function fetchAllNasyathData(userId: string, filters: any, sort: any) {
	// RBAC Check
	const canReadAll = await userHasPermission(userId, 'perm-nasyath-read');

	const conditions = [];

	// Enforce ownership if user cannot read all
	if (!canReadAll) {
		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userId),
			columns: { muridId: true }
		});
		if (!user || !user.muridId) {
			return []; // Return empty if no ownership can be established
		}
		conditions.push(eq(nasyathTable.muridId, user.muridId));
	}

	// Global Filter
	if (filters && filters.global) {
		const globalSearch = `%${filters.global}%`;
		conditions.push(
			sql`(${nasyathTable.kegiatan} LIKE ${globalSearch} OR ${nasyathTable.tempat} LIKE ${globalSearch} OR ${nasyathTable.keterangan} LIKE ${globalSearch})`
		);
	}

	// Column Filters (if any)
	if (filters && filters.columns) {
		for (const key in filters.columns) {
			const value = filters.columns[key];
			if (value && key in nasyathTable) {
				conditions.push(like((nasyathTable as any)[key], `%${value}%`));
			}
		}
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Order By Clause
	const orderByClauses = [];
	if (sort && sort.key && sort.key in nasyathTable) {
		const sortColumn = (nasyathTable as any)[sort.key];
		orderByClauses.push(sort.direction === 'asc' ? asc(sortColumn) : desc(sortColumn));
	} else {
		orderByClauses.push(desc(nasyathTable.tanggalMulai)); // Default sort
	}

	// Final Query - No pagination
	return await db
		.select()
		.from(nasyathTable)
		.where(whereClause)
		.orderBy(...orderByClauses)
		.all();
}
