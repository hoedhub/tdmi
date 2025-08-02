import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import { nasyathTable, usersTable, muridTable } from '$lib/drizzle/schema';
import { and, asc, desc, eq, gte, lte, like, or, getTableColumns } from 'drizzle-orm';
import { userHasPermission } from '$lib/server/accessControl';
import ExcelJS from 'exceljs';
import { toHindi } from '$lib/utils/toHindi';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { sort, filters } = await request.json();
	const dateRange = filters?.dateRange;

	try {
		const canReadAll = await userHasPermission(locals.user.id, 'perm-nasyath-read');

		const allConditions = [];

		if (!canReadAll) {
			const user = await db.query.usersTable.findFirst({
				where: eq(usersTable.id, locals.user.id),
				columns: { muridId: true }
			});

			if (!user || !user.muridId) {
				return new Response('User not linked to murid data.', { status: 403 });
			}
			allConditions.push(eq(nasyathTable.muridId, user.muridId));
		}

		if (filters) {
			if (filters.global) {
				const globalSearch = `%${filters.global}%`;
				const globalFilterConditions = [
					like(nasyathTable.kegiatan, globalSearch),
					like(nasyathTable.tempat, globalSearch),
					like(nasyathTable.keterangan, globalSearch)
				];
				if (canReadAll) {
					globalFilterConditions.push(like(muridTable.namaArab, globalSearch));
				}
				allConditions.push(or(...globalFilterConditions));
			}
			if (filters.columns) {
				for (const key in filters.columns) {
					const value = filters.columns[key];
					if (value) {
						if (key === 'murid.nama') {
							allConditions.push(like(muridTable.namaArab, `%${value}%`));
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

		const orderByClauses = [];
		if (sort && Array.isArray(sort) && sort.length > 0) {
			sort.forEach((sortConfig) => {
				if (sortConfig.key === 'murid.nama') {
					orderByClauses.push(
						sortConfig.direction === 'asc' ? asc(muridTable.namaArab) : desc(muridTable.namaArab)
					);
				} else if (sortConfig.key in nasyathTable) {
					const sortColumn = (nasyathTable as any)[sortConfig.key];
					orderByClauses.push(sortConfig.direction === 'asc' ? asc(sortColumn) : desc(sortColumn));
				}
			});
		}

		if (orderByClauses.length === 0) {
			orderByClauses.push(asc(nasyathTable.tanggalMulai));
		}

		const dataToExport = await db
			.select({
				...getTableColumns(nasyathTable),
				murid: {
					nama: muridTable.namaArab
				}
			})
			.from(nasyathTable)
			.leftJoin(muridTable, eq(nasyathTable.muridId, muridTable.id))
			.where(whereClause)
			.orderBy(...orderByClauses)
			.all();

		// --- Excel Generation ---
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Nasyath MUN');

		worksheet.views = [{ rightToLeft: true }];

		const headers: Partial<ExcelJS.Column>[] = [
			{
				header: 'النشاط',
				key: 'kegiatan',
				width: 40,
				style: { alignment: { horizontal: 'right' } }
			},
			{
				header: 'تاريخ البدء',
				key: 'tanggalMulai',
				width: 15,
				style: { alignment: { horizontal: 'center' } }
			},
			{
				header: 'تاريخ الانتهاء',
				key: 'tanggalSelesai',
				width: 15,
				style: { alignment: { horizontal: 'center' } }
			},
			{ header: 'المدة', key: 'durasi', width: 15, style: { alignment: { horizontal: 'center' } } },
			{ header: 'المكان', key: 'tempat', width: 30, style: { alignment: { horizontal: 'right' } } }
		];
		worksheet.columns = headers;

		worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
		worksheet.getRow(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF4472C4' }
		};
		worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

		let currentMurid: string | null = null;
		dataToExport.forEach((row) => {
			const namaMurid = row.murid?.nama ?? null;
			if (namaMurid !== currentMurid) {
				currentMurid = namaMurid;
				const groupRow = worksheet.addRow([currentMurid ?? 'Tanpa Nama']);
				worksheet.mergeCells(groupRow.number, 1, groupRow.number, headers.length);
				groupRow.font = { bold: true, color: { argb: 'FF000000' } };
				groupRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
				groupRow.alignment = { horizontal: 'right' };
			}

			const dataRow = {
				kegiatan: row.kegiatan,
				tanggalMulai: row.tanggalMulai
					? toHindi(new Date(row.tanggalMulai).toLocaleDateString('id-ID'))
					: '-',
				tanggalSelesai: row.tanggalSelesai
					? toHindi(new Date(row.tanggalSelesai).toLocaleDateString('id-ID'))
					: '-',
				durasi: toHindi(row.durasi),
				tempat: row.tempat
			};
			worksheet.addRow(dataRow);
		});

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
