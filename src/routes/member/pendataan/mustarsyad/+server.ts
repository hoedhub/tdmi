import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/drizzle';
import {
	muridTable,
	deskelTable,
	kecamatanTable,
	kokabTable,
	propTable
} from '$lib/drizzle/schema';
import { requirePermission } from '$lib/server/accessControl';
import { eq, sql, and, asc, desc, like, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

/**
 * GET /member/pendataan/mustarsyad
 *
 * Mengembalikan data mursyad beserta mustarsyad-nya.
 *
 * Query params:
 *   gender = 'pria' | 'wanita' | (kosong = semua)
 *   search = cari berdasarkan nama|alamat (propinsi, kokab, kec, deskel)
 *   page = halaman mursyad (default 1)
 *   pageSize = jumlah mursyad per halaman (default 10)
 *   mustarsyadPage = halaman mustarsyad per mursyad (default 1)
 *   mustarsyadPageSize = jumlah mustarsyad per mursyad (default 5)
 *   mustarsyadSort = kolom sort mustarsyad, format "column:dir" (e.g. "nama:asc")
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	await requirePermission(locals, 'perm-pendataan-read');

	const genderFilter = url.searchParams.get('gender');
	const search = url.searchParams.get('search')?.trim() || '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
	const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '10')));
	const mustarsyadPage = Math.max(1, parseInt(url.searchParams.get('mustarsyadPage') || '1'));
	const mustarsyadPageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get('mustarsyadPageSize') || '5')));
	const mustarsyadSortRaw = url.searchParams.get('mustarsyadSort') || 'nama:asc';

	// Parse mustarsyad sort
	const [sortCol, sortDir] = mustarsyadSortRaw.split(':');
	const allowedSortCols = ['nama', 'nomorTelepon', 'alamatLengkap', 'umur', 'qari', 'marhalah', 'hasMustarsyad', 'aktif', 'partisipasi'];
	const safeSortCol = allowedSortCols.includes(sortCol) ? sortCol : 'nama';
	const safeSortDir = sortDir === 'desc' ? 'desc' : 'asc';

	// Build gender conditions for subqueries
	const genderWhereSub = genderFilter === 'pria'
		? sql`AND sub.gender = 1`
		: genderFilter === 'wanita'
			? sql`AND sub.gender = 0`
			: sql``;

	const genderWhereMursyid = genderFilter === 'pria'
		? sql`${muridTable.gender} = 1`
		: genderFilter === 'wanita'
			? sql`${muridTable.gender} = 0`
			: undefined;

	// Build search condition
	const searchCondition = search
		? sql`AND (
			${muridTable.nama} LIKE ${'%' + search + '%'}
			OR ${muridTable.alamat} LIKE ${'%' + search + '%'}
			OR EXISTS (
				SELECT 1 FROM deskel AS sd
				JOIN kecamatan AS sk ON sd.id_kecamatan = sk.id
				JOIN kokab AS skk ON sk.id_kokab = skk.id
				JOIN propinsi AS sp ON skk.id_prop = sp.id
				WHERE sd.id = ${muridTable.deskelId}
				AND (
					sd.deskel LIKE ${'%' + search + '%'}
					OR sk.kecamatan LIKE ${'%' + search + '%'}
					OR skk.kokab LIKE ${'%' + search + '%'}
					OR sp.propinsi LIKE ${'%' + search + '%'}
				)
			)
		)`
		: sql``;

	// Alias for self-join
	const mursyidAlias = alias(muridTable, 'mursyid');
	const mursyidDeskel = alias(deskelTable, 'mursyid_deskel');
	const mursyidKec = alias(kecamatanTable, 'mursyid_kec');
	const mursyidKokab = alias(kokabTable, 'mursyid_kokab');
	const mursyidProp = alias(propTable, 'mursyid_prop');

	// Count total mursyid groups
	const countResult = await db
		.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
		.from(muridTable)
		.where(
			sql`(
				SELECT COUNT(*) FROM murid AS sub
				WHERE sub.mursyid_id = ${muridTable.id}
				${genderWhereSub}
			) > 0
			${genderWhereMursyid ? sql`AND ${genderWhereMursyid}` : sql``}
			${searchCondition}`
		)
		.get();

	const totalItems = countResult?.count ?? 0;
	const totalPages = Math.ceil(totalItems / pageSize);

	// Get mursyid groups with pagination
	const offset = (page - 1) * pageSize;
	const mursyids = await db
		.select({
			id: muridTable.id,
			nama: muridTable.nama,
			nomorTelepon: muridTable.nomorTelepon,
			gender: muridTable.gender,
			marhalah: muridTable.marhalah,
			alamat: muridTable.alamat,
			mursyidId: muridTable.mursyidId,
			mursyidNama: mursyidAlias.nama,
			mursyidTelepon: mursyidAlias.nomorTelepon,
			mursyidMarhalah: mursyidAlias.marhalah,
			mursyidDeskelName: mursyidDeskel.deskel,
			mursyidKecName: mursyidKec.kecamatan,
			mursyidKokabName: mursyidKokab.kokab,
			mursyidPropName: mursyidProp.propinsi,
			mustarsyadCount: sql<number>`(
				SELECT CAST(COUNT(*) AS INTEGER) FROM murid AS sub
				WHERE sub.mursyid_id = ${muridTable.id}
				${genderWhereSub}
			)`.as('mustarsyad_count')
		})
		.from(muridTable)
		.leftJoin(mursyidAlias, eq(muridTable.mursyidId, mursyidAlias.id))
		.leftJoin(mursyidDeskel, eq(muridTable.deskelId, mursyidDeskel.id))
		.leftJoin(mursyidKec, eq(mursyidDeskel.idKecamatan, mursyidKec.id))
		.leftJoin(mursyidKokab, eq(mursyidKec.idKokab, mursyidKokab.id))
		.leftJoin(mursyidProp, eq(mursyidKokab.idProp, mursyidProp.id))
		.where(
			sql`(
				SELECT COUNT(*) FROM murid AS sub
				WHERE sub.mursyid_id = ${muridTable.id}
				${genderWhereSub}
			) > 0
			${genderWhereMursyid ? sql`AND ${genderWhereMursyid}` : sql``}
			${searchCondition}`
		)
		.orderBy(asc(muridTable.nama))
		.limit(pageSize)
		.offset(offset)
		.all();

	// For each mursyid, fetch mustarsyad list with pagination and sorting
	const result = [];
	for (const m of mursyids) {
		const mustarsyadOffset = (mustarsyadPage - 1) * mustarsyadPageSize;

		// Build sort for inner query
		const sortColumnMap: Record<string, any> = {
			nama: muridTable.nama,
			nomorTelepon: muridTable.nomorTelepon,
			umur: muridTable.tglLahir,
			qari: muridTable.qari,
			marhalah: muridTable.marhalah,
			hasMustarsyad: muridTable.id, // approximate - will sort by id
			aktif: muridTable.aktif,
			partisipasi: muridTable.partisipasi,
			alamatLengkap: muridTable.alamat
		};
		const sortExpr = sortColumnMap[safeSortCol] || muridTable.nama;
		const orderByFn = safeSortDir === 'desc' ? desc : asc;

		const mustarsyadList = await db
			.select({
				id: muridTable.id,
				nama: muridTable.nama,
				nomorTelepon: muridTable.nomorTelepon,
				gender: muridTable.gender,
				tglLahir: muridTable.tglLahir,
				qari: muridTable.qari,
				marhalah: muridTable.marhalah,
				aktif: muridTable.aktif,
				partisipasi: muridTable.partisipasi,
				mursyidId: muridTable.mursyidId,
				alamat: muridTable.alamat,
				deskelName: deskelTable.deskel,
				kecamatanName: kecamatanTable.kecamatan,
				kokabName: kokabTable.kokab,
				propinsiName: propTable.propinsi,
				hasMustarsyad: sql<number>`(
					SELECT CAST(COUNT(*) AS INTEGER) FROM murid AS sub
					WHERE sub.mursyid_id = ${muridTable.id}
				)`.as('has_mustarsyad')
			})
			.from(muridTable)
			.leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
			.leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
			.leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
			.leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
			.where(
				and(
					eq(muridTable.mursyidId, m.id),
					genderFilter === 'pria'
						? sql`${muridTable.gender} = 1`
						: genderFilter === 'wanita'
							? sql`${muridTable.gender} = 0`
							: undefined
				)
			)
			.orderBy(orderByFn(sortExpr))
			.limit(mustarsyadPageSize)
			.offset(mustarsyadOffset)
			.all();

		// Format mursyid alamat
		const mursyidAlamatLengkap = [m.alamat, m.mursyidDeskelName, m.mursyidKecName, m.mursyidKokabName, m.mursyidPropName]
			.filter(Boolean)
			.join(', ');

		result.push({
			...m,
			mursyidAlamatLengkap,
			mustarsyad: mustarsyadList.map((ms) => ({
				...ms,
				umur: ms.tglLahir ? calculateAge(ms.tglLahir) : null,
				alamatLengkap: formatAlamat(ms)
			}))
		});
	}

	return json({
		data: result,
		pagination: {
			page,
			pageSize,
			totalItems,
			totalPages
		}
	});
};

function calculateAge(tglLahir: string | null): number | null {
	if (!tglLahir) return null;
	const birthDate = new Date(tglLahir);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}

function formatAlamat(row: {
	alamat?: string | null;
	deskelName?: string | null;
	kecamatanName?: string | null;
	kokabName?: string | null;
	propinsiName?: string | null;
}): string {
	return [row.alamat, row.deskelName, row.kecamatanName, row.kokabName, row.propinsiName]
		.filter(Boolean)
		.join(', ');
}
