import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { nasyathTable, usersTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl'; // Import the permission checker
import { count, eq, and, like, sql, asc, desc } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { sort, filters, page, pageSize } = await request.json();
	const offset = (page - 1) * pageSize;

	try {
		// --- RBAC Check: Determine if user can see all data ---
		const canReadAll = await userHasPermission(locals.user.id, 'perm-nasyath-read');

		// --- Buat Kondisi Filter ---
		const conditions = [];

		// If the user CANNOT read all, enforce ownership constraint.
		if (!canReadAll) {
			const user = await db.query.usersTable.findFirst({
				where: eq(usersTable.id, locals.user.id),
				columns: { muridId: true }
			});

			// If not an admin and not linked to a murid, they see nothing.
			if (!user || !user.muridId) {
				return json({ data: [], totalItems: 0, currentPage: 1, pageSize });
			}
			conditions.push(eq(nasyathTable.muridId, user.muridId));
		}
		// If canReadAll is true, the conditions array remains empty, so no muridId filter is applied.

		if (filters) {
			// Filter Global
			if (filters.global) {
				const globalSearch = `%${filters.global}%`;
				conditions.push(
					sql`(${nasyathTable.kegiatan} LIKE ${globalSearch} OR ${nasyathTable.tempat} LIKE ${globalSearch} OR ${nasyathTable.keterangan} LIKE ${globalSearch})`
				);
			}
			// Filter per Kolom
			if (filters.columns) {
				for (const key in filters.columns) {
					const value = filters.columns[key];
					if (value && key in nasyathTable) {
						conditions.push(like((nasyathTable as any)[key], `%${value}%`));
					}
				}
			}
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// --- Query untuk Menghitung Total Item ---
		const totalItemsResult = await db
			.select({ count: count() })
			.from(nasyathTable)
			.where(whereClause)
			.get();
		const totalItems = totalItemsResult?.count || 0;

		// --- Query untuk Mengambil Data ---
		const orderByClauses = [];
		if (sort && sort.key && sort.key in nasyathTable) {
			const sortColumn = (nasyathTable as any)[sort.key];
			orderByClauses.push(sort.direction === 'asc' ? asc(sortColumn) : desc(sortColumn));
		} else {
			orderByClauses.push(desc(nasyathTable.tanggalMulai)); // Default sort
		}

		const data = await db
			.select()
			.from(nasyathTable)
			.where(whereClause)
			.orderBy(...orderByClauses)
			.limit(pageSize)
			.offset(offset)
			.all();

		return json({
			data,
			totalItems,
			currentPage: page,
			pageSize
		});
	} catch (e) {
		console.error('Error fetching nasyath data:', e);
		throw error(500, 'Gagal memuat data nasyath karena kesalahan server.');
	}
};
