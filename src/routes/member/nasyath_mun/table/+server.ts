import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { nasyathTable, usersTable, muridTable } from '$lib/drizzle/schema';
import { count, eq, and, like, sql, asc, desc, gte, lte, getTableColumns } from 'drizzle-orm';
import { userHasPermission } from '$lib/server/accessControl';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { sort, filters, page, pageSize, isCetak } = await request.json();
	const dateRange = filters?.dateRange;
	const offset = (page - 1) * pageSize;

	try {
		const canReadAll = true; // await userHasPermission(locals.user.id, 'perm-nasyath-read');

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
				allConditions.push(
					sql`(${like(nasyathTable.kegiatan, globalSearch)}) OR (${like(
						nasyathTable.tempat,
						globalSearch
					)}) OR (${like(nasyathTable.keterangan, globalSearch)}) OR (${like(
						muridTable.nama,
						globalSearch
					)})`
				);
			}
			if (filters.columns) {
				for (const key in filters.columns) {
					const value = filters.columns[key];
					if (value) {
						if (key === 'murid.nama') {
							allConditions.push(like(muridTable.nama, `%${value}%`));
						} else if (key in nasyathTable) {
							allConditions.push(like((nasyathTable as any)[key], `%${value}%`));
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

		const whereClause = allConditions.length > 0 ? and(...allConditions) : undefined;

		// --- Query untuk Menghitung Total Item (dengan join) ---
		const totalItemsQuery = db
			.select({ count: count() })
			.from(nasyathTable)
			.leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id))
			.where(whereClause);

		const totalItemsResult = await totalItemsQuery.get();
		const totalItems = totalItemsResult?.count || 0;

		// --- Query untuk Mengambil Data --- 
		const orderByClauses = [];
		if (sort && Array.isArray(sort) && sort.length > 0) {
			sort.forEach(sortConfig => {
				if (sortConfig.key === 'murid.nama') {
					orderByClauses.push(
						sortConfig.direction === 'asc' ? asc(muridTable.nama) : desc(muridTable.nama)
					);
				} else if (sortConfig.key in nasyathTable) {
					const sortColumn = (nasyathTable as any)[sortConfig.key];
					orderByClauses.push(sortConfig.direction === 'asc' ? asc(sortColumn) : desc(sortColumn));
				}
			});
		}

		if (orderByClauses.length === 0) {
			orderByClauses.push(desc(nasyathTable.tanggalMulai)); // Default sort
		}

		const query = db
			.select({
				...getTableColumns(nasyathTable),
				muridNama: muridTable.nama
			})
			.from(nasyathTable)
			.leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id))
			.where(whereClause)
			.orderBy(...orderByClauses)
			.limit(isCetak ? 9999 : pageSize)
			.offset(isCetak ? 0 : offset);

		const rawData = await query;

		// Transformasi data agar sesuai dengan ekspektasi frontend
		const data = rawData.map((item) => {
			const { muridNama, ...nasyathProps } = item;
			return {
				...nasyathProps,
				murid: {
					nama: muridNama
				}
			};
		});

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