import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { nasyathTable, usersTable, muridTable } from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { and, like, sql, asc, desc, eq } from 'drizzle-orm';
import ExcelJS from 'exceljs';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { sort, filters } = await request.json();

	try {
		// --- Data Fetching Logic ---
		const canReadAll = await userHasPermission(locals.user.id, 'perm-nasyath-read');
		const conditions = [];

		if (!canReadAll) {
			const user = await db.query.usersTable.findFirst({
				where: eq(usersTable.id, locals.user.id),
				columns: { muridId: true }
			});
			if (!user || !user.muridId) {
				return new Response('User not linked to murid data.', { status: 403 });
			}
			conditions.push(eq(nasyathTable.muridId, user.muridId));
		}

		if (filters) {
			if (filters.global) {
				const globalSearch = `%${filters.global}%`;
				conditions.push(
					sql`(${nasyathTable.kegiatan} LIKE ${globalSearch} OR ${nasyathTable.tempat} LIKE ${globalSearch})`
				);
			}
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

		// --- Sorting Logic ---
		const orderByClauses = [asc(muridTable.namaArab)]; // Always sort by Murid Name first
		if (sort && sort.key && sort.key in nasyathTable) {
			const sortColumn = (nasyathTable as any)[sort.key];
			orderByClauses.push(sort.direction === 'asc' ? asc(sortColumn) : desc(sortColumn));
		} else {
			orderByClauses.push(desc(nasyathTable.tanggalMulai)); // Default secondary sort
		}

		const dataToExport = await db
			.select({
				namaMurid: muridTable.namaArab,
				kegiatan: nasyathTable.kegiatan,
				tanggalMulai: nasyathTable.tanggalMulai,
				tanggalSelesai: nasyathTable.tanggalSelesai,
				durasi: nasyathTable.durasi,
				tempat: nasyathTable.tempat
			})
			.from(nasyathTable)
			.leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id))
			.where(whereClause)
			.orderBy(...orderByClauses)
			.all();

		// --- Excel Generation ---
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Nasyath MUN');

		// ** Set worksheet to RTL view **
		worksheet.views = [{ rightToLeft: true }];

		// Header
		const headers: Partial<ExcelJS.Column>[] = [
			{ header: 'النشاط', key: 'kegiatan', width: 40, style: { alignment: { horizontal: 'right' } } },
			{ header: 'تاريخ البدء', key: 'tanggalMulai', width: 15, style: { alignment: { horizontal: 'center' } } },
			{ header: 'تاريخ الانتهاء', key: 'tanggalSelesai', width: 15, style: { alignment: { horizontal: 'center' } } },
			{ header: 'المدة', key: 'durasi', width: 15, style: { alignment: { horizontal: 'center' } } },
			{ header: 'المكان', key: 'tempat', width: 30, style: { alignment: { horizontal: 'right' } } }
		];
		worksheet.columns = headers;

		// Style Header Row (overrides column style for just this row)
		worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
		worksheet.getRow(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF4472C4' }
		};
		worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

		// Group data by Murid
		let currentMurid: string | null = null;
		dataToExport.forEach((row) => {
			if (row.namaMurid !== currentMurid) {
				currentMurid = row.namaMurid;
				const groupRow = worksheet.addRow([currentMurid ?? 'Tanpa Nama']);
				worksheet.mergeCells(groupRow.number, 1, groupRow.number, headers.length);
				groupRow.font = { bold: true, color: { argb: 'FF000000' } };
				groupRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
				groupRow.alignment = { horizontal: 'right' }; // Align group header to the right
			}

			const dataRow = {
				...row,
				tanggalMulai: row.tanggalMulai ? new Date(row.tanggalMulai).toLocaleDateString('id-ID') : '-',
				tanggalSelesai: row.tanggalSelesai
					? new Date(row.tanggalSelesai).toLocaleDateString('id-ID')
					: '-'
			};
			worksheet.addRow(dataRow);
		});

		// Auto-fit columns
		worksheet.columns.forEach(column => {
			let maxColumnLength = 0;
			if (column.values) {
				column.values.forEach(value => {
					if (value) {
						const cellValue = typeof value === 'object' ? (value as any).toString() : value;
						maxColumnLength = Math.max(maxColumnLength, cellValue.length);
					}
				})
			}
			column.width = Math.max(15, Math.min(50, maxColumnLength + 2));
		});


		// --- Return file ---
		const buffer = await workbook.xlsx.writeBuffer();
		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'Content-Disposition': `attachment; filename="Nasyath_MUN_Export_${new Date().toISOString().split('T')[0]}.xlsx"`
			}
		});
	} catch (e) {
		console.error('Error exporting nasyath data:', e);
		throw error(500, 'Gagal mengekspor data karena kesalahan server.');
	}
};
