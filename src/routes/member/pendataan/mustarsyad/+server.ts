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
import { eq, sql, and, asc, like, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

/**
 * GET /member/pendataan/mustarsyad
 *
 * Mengembalikan data mursyad beserta SELURUH mustarsyad-nya (client-side sort/paginate).
 * Outer pagination tetap server-side.
 *
 * Query params:
 *   gender = 'pria' | 'wanita' | (kosong = semua)
 *   search = cari berdasarkan nama|alamat (propinsi, kokab, kec, deskel)
 *   page = halaman mursyad (default 1)
 *   pageSize = jumlah mursyad per halaman (default 10)
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	await requirePermission(locals, 'perm-pendataan-read');

	const genderFilter = url.searchParams.get('gender');
	const search = url.searchParams.get('search')?.trim() || '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
	const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '10')));

	// Build gender conditions for subqueries
	const genderWhereSub = genderFilter === 'pria'
		? sql`AND sub.gender = 1`
		: genderFilter === 'wanita'
			? sql`AND sub.gender = 0`
			: sql``;

	const genderWhereMursyid = genderFilter === 'pria'
		? sql`AND ${muridTable.gender} = 1`
		: genderFilter === 'wanita'
			? sql`AND ${muridTable.gender} = 0`
			: sql``;

	// Build search condition — same pattern as SuperTable alamat filter (proven working)
	const searchConditions: any[] = [];
	if (search) {
		const val = `%${search}%`;
		searchConditions.push(
			like(muridTable.nama, val),
			like(muridTable.alamat, val),
			like(deskelTable.deskel, val),
			like(kecamatanTable.kecamatan, val),
			like(kokabTable.kokab, val),
			like(propTable.propinsi, val)
		);
	}

	// Combined WHERE: mursyad must have mustarsyad + optional gender + optional search
	const baseCondition = sql`(
		SELECT COUNT(*) FROM murid AS sub
		WHERE sub.mursyid_id = ${muridTable.id}
		${genderWhereSub}
	) > 0 ${genderWhereMursyid}`;

	// Alias for self-join (mursyid info)
	const mursyidAlias = alias(muridTable, 'mursyid');
	const mursyidDeskel = alias(deskelTable, 'mursyid_deskel');
	const mursyidKec = alias(kecamatanTable, 'mursyid_kec');
	const mursyidKokab = alias(kokabTable, 'mursyid_kokab');
	const mursyidProp = alias(propTable, 'mursyid_prop');

	// Build WHERE clause — same joins needed for search LIKE
	const whereClause = searchConditions.length > 0
		? and(baseCondition, or(...searchConditions))
		: baseCondition;

	// Count total mursyid groups
	const countResult = await db
		.select({ count: sql<number>`CAST(COUNT(DISTINCT ${muridTable.id}) AS INTEGER)` })
		.from(muridTable)
		.leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
		.leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
		.leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
		.leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
		.where(whereClause)
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
		.leftJoin(deskelTable, eq(muridTable.deskelId, deskelTable.id))
		.leftJoin(kecamatanTable, eq(deskelTable.idKecamatan, kecamatanTable.id))
		.leftJoin(kokabTable, eq(kecamatanTable.idKokab, kokabTable.id))
		.leftJoin(propTable, eq(kokabTable.idProp, propTable.id))
		.leftJoin(mursyidAlias, eq(muridTable.mursyidId, mursyidAlias.id))
		.leftJoin(mursyidDeskel, eq(muridTable.deskelId, mursyidDeskel.id))
		.leftJoin(mursyidKec, eq(mursyidDeskel.idKecamatan, mursyidKec.id))
		.leftJoin(mursyidKokab, eq(mursyidKec.idKokab, mursyidKokab.id))
		.leftJoin(mursyidProp, eq(mursyidKokab.idProp, mursyidProp.id))
		.where(whereClause)
		.orderBy(asc(muridTable.nama))
		.limit(pageSize)
		.offset(offset)
		.all();

	// For each mursyid, fetch ALL mustarsyad (client-side sort/paginate)
	const result = [];
	for (const m of mursyids) {
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
			.orderBy(asc(muridTable.nama))
			.all();

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
