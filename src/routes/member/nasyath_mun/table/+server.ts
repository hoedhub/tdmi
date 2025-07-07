import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { nasyathTable, usersTable, muridTable } from '$lib/drizzle/schema'; // Pastikan muridTable diimpor
import { count, eq, and, like, sql, asc, desc, gte, lte } from 'drizzle-orm'; // PERUBAHAN 1: Impor gte dan lte

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// PERUBAHAN 2: Ambil 'dateRange' dari request body
	const { sort, filters, page, pageSize, isCetak } = await request.json();
	const dateRange = filters?.dateRange;

	// ========= DEBUGGING POINT 1: Lihat apa yang diterima server =========
	// console.log('--- REQUEST BODY RECEIVED ---');
	// console.log({ dateRange });
	// ====================================================================
	const offset = (page - 1) * pageSize;

	try {
		const canReadAll = true; // Sesuai kebutuhan Anda

		const conditions = [];

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

		if (filters) {
			// Filter Global (sudah benar)
			if (filters.global) {
				const globalSearch = `%${filters.global}%`;
				// Tambahkan filter untuk nama murid juga
				const orConditions = [
					like(nasyathTable.kegiatan, globalSearch),
					like(nasyathTable.tempat, globalSearch),
					like(nasyathTable.keterangan, globalSearch)
				];
				// Jika ingin pencarian global mencakup nama murid (membutuhkan join)
				// Kita akan menangani ini dengan cara yang sedikit berbeda di bawah
				conditions.push(sql.join(orConditions, sql` OR `));
			}
			// Filter per Kolom (sudah benar)
			if (filters.columns) {
				for (const key in filters.columns) {
					const value = filters.columns[key];
					if (value && key in nasyathTable) {
						conditions.push(like((nasyathTable as any)[key], `%${value}%`));
					}
					// Jika ingin filter kolom 'nama', perlu penanganan khusus
				}
			}
		}

		// PERUBAHAN 3: Tambahkan logika untuk memproses filter tanggal
		if (dateRange && (dateRange.start || dateRange.end)) {
			// ========= DEBUGGING POINT 2: Pastikan blok ini dieksekusi =========
			// console.log('--- APPLYING DATE FILTER with values:', dateRange);
			// ===================================================================
			if (dateRange.start) {
				conditions.push(gte(nasyathTable.tanggalMulai, dateRange.start));
			}
			if (dateRange.end) {
				conditions.push(lte(nasyathTable.tanggalMulai, dateRange.end));
			}
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// ========= DEBUGGING POINT 3: Lihat kondisi WHERE akhir =========
		// console.log('--- Final number of conditions:', conditions.length);
		// ===============================================================

		// --- Query untuk Menghitung Total Item (tidak perlu join agar cepat) ---
		const totalItemsResult = await db
			.select({ count: count() })
			.from(nasyathTable)
			.where(whereClause)
			.get();
		const totalItems = totalItemsResult?.count || 0;

		// --- Query untuk Mengambil Data dengan Nama Murid (JOIN) ---
		const orderByClauses = [];
		if (sort && sort.key && sort.key in nasyathTable) {
			const sortColumn = (nasyathTable as any)[sort.key];
			orderByClauses.push(sort.direction === 'asc' ? asc(sortColumn) : desc(sortColumn));
		} else {
			orderByClauses.push(desc(nasyathTable.tanggalMulai)); // Default sort
		}

		const data = await db.query.nasyathTable.findMany({
			where: whereClause,
			orderBy: orderByClauses,
			limit: isCetak ? 9999 : pageSize,
			offset: isCetak ? 0 : offset,
			with: {
				murid: {
					columns: {
						nama: true
					}
				}
			}
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