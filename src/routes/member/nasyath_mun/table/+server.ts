import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { nasyathTable, usersTable } from '$lib/drizzle/schema';
import { canUserAccessNasyath } from '$lib/server/nasyath';
import { count, eq, and, like, sql, asc, desc } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Dapatkan muridId yang terhubung dengan pengguna
	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.id, locals.user.id),
		columns: { muridId: true }
	});

	if (!user || !user.muridId) {
		// Jika pengguna tidak terhubung ke murid, kembalikan data kosong.
		return json({
			data: [],
			totalItems: 0,
			currentPage: 1,
			pageSize: 10
		});
	}

	const { sort, filters, page, pageSize } = await request.json();
	const offset = (page - 1) * pageSize;

	try {
		// --- Buat Kondisi Filter ---
		// Kondisi dasar: selalu filter berdasarkan muridId milik pengguna
		const baseCondition = eq(nasyathTable.muridId, user.muridId);
		const conditions = [baseCondition];

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

		const whereClause = and(...conditions);

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
