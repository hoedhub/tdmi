import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import {
	muridTable,
	deskelTable,
	kecamatanTable,
	kokabTable,
	propTable,
	usersTable
} from '$lib/drizzle/schema';
import { userHasPermission } from '$lib/server/accessControl';
import { count, eq, like, sql, asc, desc, aliasedTable, and, or } from 'drizzle-orm';
import { getUserRoles } from '$lib/server/accessControlDB'; // Import getUserRoles
import { buildAdvancedFilter, type ColumnMapping } from '$lib/server/superTableFilters';

const mursyid = aliasedTable(muridTable, 'mursyid');
const baiat = aliasedTable(muridTable, 'baiat');
const wirid = aliasedTable(muridTable, 'wirid');

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
		const isLevel3User = userAssignedRoles.some((roleId) => roleId.endsWith('-propinsi'));

		let userPropinsiId: number | null = null;
		if (isLevel3User) {
			const userMurid = await db
				.select({ deskelId: muridTable.deskelId })
				.from(muridTable)
				.where(eq(muridTable.id, locals.user.muridId!))
				.get();

			if (userMurid?.deskelId) {
				const result = await db
					.select({ propinsiId: propTable.id })
					.from(deskelTable)
					.where(eq(deskelTable.id, userMurid.deskelId))
					.innerJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
					.innerJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
					.innerJoin(propTable, eq(kokabTable.idProp, propTable.id))
					.get();
				userPropinsiId = result?.propinsiId ?? null;
			}
		}

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
							conditions.push(eq(muridTable.marhalah, parseInt(value) as 1 | 2 | 3));
						}
						// Handle territory name filters
						else if (key === 'alamat' || key === 'mursyidName' || key === 'baiatName' || key === 'wiridName') {
							const searchVal = `%${value}%`;
							const cols = [];
							if (key === 'alamat') {
								cols.push(muridTable.alamat, deskelTable.deskel, kecamatanTable.kecamatan, kokabTable.kokab, propTable.propinsi);
							} else if (key === 'mursyidName') {
								cols.push(mursyid.nama);
							} else if (key === 'baiatName') {
								cols.push(baiat.nama);
							} else if (key === 'wiridName') {
								cols.push(wirid.nama);
							}
							
							const searchConditions = cols.map(c => sql`${c} LIKE ${searchVal}`);
							conditions.push(sql`(${sql.join(searchConditions, sql` OR `)})`);
						}
						// Handle general text search on specific muridTable columns
						else if (
							key === 'nama' ||
							key === 'namaArab' ||
							key === 'nomorTelepon' ||
							key === 'nik'
						) {
							conditions.push(like((muridTable as any)[key], `%${value}%`));
						}
						// Fallback for any other direct column name that might be passed
						else if (key in muridTable) {
							conditions.push(like((muridTable as any)[key], `%${value}%`));
						}
					}
				}
			}

			// Apply advanced filters if present
			if (filters.advanced) {
				const columnMapping: ColumnMapping = {
					nama: muridTable.nama,
					namaArab: muridTable.namaArab,
					gender: {
						column: muridTable.gender,
						transform: (v: string) => v === 'Pria' || v === 'true'
					},
					marhalah: {
						column: muridTable.marhalah,
						transform: (v: string) => parseInt(v)
					},
					mursyidName: mursyid.nama,
					baiatName: baiat.nama,
					wiridName: wirid.nama,
					nomorTelepon: muridTable.nomorTelepon,
					alamat: [muridTable.alamat, deskelTable.deskel, kecamatanTable.kecamatan, kokabTable.kokab, propTable.propinsi],
					aktif: {
						column: muridTable.aktif,
						transform: (v: string) => v === 'Aktif' || v === 'Ya' || v === 'true'
					},
					partisipasi: {
						column: muridTable.partisipasi,
						transform: (v: string) => v === 'Ya' || v === 'true'
					},
					qari: {
						column: muridTable.qari,
						transform: (v: string) => v === 'Ya' || v === 'true'
					},
					updatedAt: muridTable.updatedAt,
					tglLahir: muridTable.tglLahir
				};

				const advancedFilter = buildAdvancedFilter(filters.advanced, columnMapping);
				if (advancedFilter) {
					conditions.push(advancedFilter);
				}
			}
		}

		// Apply territory filter for Level 3 users
		if (isLevel3User && userPropinsiId !== null) {
			conditions.push(eq(propTable.id, userPropinsiId));
		}

		// Build the where clause
		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
		
		// Apply sorting
		const orderByClauses = [];
		if (sort && Array.isArray(sort) && sort.length > 0) {
			sort.forEach((sortConfig) => {
				let sortColumn;
				switch (sortConfig.key) {
					case 'alamat':
						sortColumn = muridTable.alamat;
						break;
					case 'mursyidName':
						sortColumn = mursyid.nama;
						break;
					case 'baiatName':
						sortColumn = baiat.nama;
						break;
					case 'wiridName':
						sortColumn = wirid.nama;
						break;
					default:
						sortColumn = (muridTable as any)[sortConfig.key];
						break;
				}

				if (sortColumn) {
					orderByClauses.push(sortConfig.direction === 'asc' ? asc(sortColumn) : desc(sortColumn));
				}
			});
		}

		// Apply default sort if no custom sort was successfully added
		if (orderByClauses.length === 0) {
			orderByClauses.push(asc(muridTable.nama));
		}

		// Count query — use a scalar subquery to avoid deep join chain type inference issues
		const totalItemsRaw = await db
			.select({ count: count() })
			.from(muridTable)
			.leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
			.leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
			.leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
			.leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
			.leftJoin(mursyid, eq(muridTable.mursyidId, mursyid.id))
			.leftJoin(baiat, eq(muridTable.baiatId, baiat.id))
			.leftJoin(wirid, eq(muridTable.wiridId, wirid.id))
			.where(whereClause)
			.all();

		const totalItems = (totalItemsRaw[0] as { count: number } | undefined)?.count || 0;

		type MuridRow = {
			murid: typeof muridTable.$inferSelect;
			deskel: typeof deskelTable.$inferSelect | null;
			kecamatan: typeof kecamatanTable.$inferSelect | null;
			kokab: typeof kokabTable.$inferSelect | null;
			prop: typeof propTable.$inferSelect | null;
			mursyidName: string | null;
			baiatName: string | null;
			wiridName: string | null;
			mursyidMarhalah: number | null;
			baiatMarhalah: number | null;
			wiridMarhalah: number | null;
		};

		const murid: MuridRow[] = await db
			.select({
				murid: muridTable,
				deskel: deskelTable,
				kecamatan: kecamatanTable,
				kokab: kokabTable,
				prop: propTable,
				mursyidName: mursyid.nama,
				baiatName: baiat.nama,
				wiridName: wirid.nama,
				mursyidMarhalah: mursyid.marhalah,
				baiatMarhalah: baiat.marhalah,
				wiridMarhalah: wirid.marhalah
			})
			.from(muridTable)
			.leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
			.leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
			.leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
			.leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
			.leftJoin(mursyid, eq(muridTable.mursyidId, mursyid.id))
			.leftJoin(baiat, eq(muridTable.baiatId, baiat.id))
			.leftJoin(wirid, eq(muridTable.wiridId, wirid.id))
			.where(whereClause)
			.orderBy(...orderByClauses)
			.limit(pageSize)
			.offset(offset)
			.all() as MuridRow[];

		// Apply pagination
		// const murid = await finalQuery.limit(pageSize).offset(offset).all();

		// Map the results to a flatter structure for the client
		const formattedMurid = murid.map((m) => ({
			...m.murid,
			deskelName: m.deskel?.deskel || null,
			kecamatanName: m.kecamatan?.kecamatan || null,
			kokabName: m.kokab?.kokab || null,
			propinsiName: m.prop?.propinsi || null,
			mursyidName: m.mursyidName || null,
			baiatName: m.baiatName || null,
			wiridName: m.wiridName || null,
			mursyidMarhalah: m.mursyidMarhalah || null,
			baiatMarhalah: m.baiatMarhalah || null,
			wiridMarhalah: m.wiridMarhalah || null
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
