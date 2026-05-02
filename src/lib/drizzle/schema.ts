import { sql, relations } from 'drizzle-orm';
import {
	sqliteTable,
	index,
	integer,
	text,
	blob,
	primaryKey,
	type AnySQLiteColumn
} from 'drizzle-orm/sqlite-core';

// ==================================================================
// BAGIAN 1: TABEL DATA DASAR (TERITORI & MURID)
// ==================================================================

export const propTable = sqliteTable(
	'prop',
	{
		id: integer('id').primaryKey(),
		propinsi: text('propinsi').unique().notNull()
	},
	(table) => [
		// <-- DIPERBAIKI: Menggunakan array []
		index('prop_idx').on(table.propinsi)
	]
);

export const kokabTable = sqliteTable(
	'kokab',
	{
		id: integer('id').primaryKey(),
		idProp: integer('id_prop')
			.notNull()
			.references(() => propTable.id),
		kokab: text('kokab').notNull()
	},
	(table) => [
		// <-- DIPERBAIKI: Menggunakan array []
		index('kokab_idx').on(table.kokab)
	]
);

export const kecamatanTable = sqliteTable(
	'kecamatan',
	{
		id: integer('id').primaryKey(),
		idKokab: integer('id_kokab')
			.notNull()
			.references(() => kokabTable.id),
		kecamatan: text('kecamatan').notNull()
	},
	(table) => [
		// <-- DIPERBAIKI: Menggunakan array []
		index('kecamatan_idx').on(table.kecamatan)
	]
);

export const deskelTable = sqliteTable('deskel', {
	id: integer('id').primaryKey(),
	idKecamatan: integer('id_kecamatan')
		.notNull()
		.references(() => kecamatanTable.id),
	deskel: text('deskel').notNull()
});

const marhalah = [1, 2, 3] as const;

// Definisi muridTable harus ada sebelum usersTable
export const muridTable = sqliteTable(
	'murid',
	{
		id: integer('id').primaryKey(),
		updatedAt: text('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updaterId: text('updater_id').notNull(),
		nama: text('nama').notNull(),
		namaArab: text('nama_arab'),
		gender: integer('gender', { mode: 'boolean' }).notNull().default(true),
		deskelId: integer('deskel_id').references(() => deskelTable.id),
		alamat: text('alamat'),
		nomorTelepon: text('nomor_telepon'),
		muhrimId: integer('muhrim_id').references((): AnySQLiteColumn => muridTable.id, {
			onDelete: 'set null'
		}),
		mursyidId: integer('mursyid_id').references((): AnySQLiteColumn => muridTable.id, {
			onDelete: 'set null'
		}),
		baiatId: integer('baiat_id').references((): AnySQLiteColumn => muridTable.id, {
			onDelete: 'set null'
		}),
		wiridId: integer('wirid_id').references((): AnySQLiteColumn => muridTable.id, {
			onDelete: 'set null'
		}),
		qari: integer('qari', { mode: 'boolean' }).notNull().default(true),
		marhalah: integer('marhalah').$type<(typeof marhalah)[number]>().notNull().default(1),
		tglLahir: text('tgl_lahir'),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true),
		partisipasi: integer('partisipasi', { mode: 'boolean' }).notNull().default(true),
		nik: text('nik', { length: 16 }).unique(),
		fotoPublicId: text('foto_public_id')
	},
	(table) => [
		// <-- BENAR
		index('nama_idx').on(table.nama),
		index('nama_arab_idx').on(table.namaArab)
	]
);

// ==================================================================
// BAGIAN 2: TABEL PENGGUNA & SESI
// ==================================================================

export const usersTable = sqliteTable(
	'users',
	{
		id: text('id').primaryKey(),
		username: text('username', { length: 16 }).notNull().unique(),
		passwordHash: text('password_hash', { length: 255 }),
		active: integer('active', { mode: 'boolean' }).default(true),
		muridId: integer('murid_id').references(() => muridTable.id, { onDelete: 'set null' }),
		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		// <-- BENAR
		index('username_idx').on(table.username),
		index('created_at_idx').on(table.createdAt)
	]
);

export type SelectUser = typeof usersTable.$inferSelect;

export const sessionTable = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull()
});

// ==================================================================
// BAGIAN 3: TABEL RBAC (ROLE-BASED ACCESS CONTROL)
// ==================================================================

export const rolesTable = sqliteTable('roles', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description')
});

export const permissionsTable = sqliteTable('permissions', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description')
});

// Tabel Penghubung
export const userRolesTable = sqliteTable(
	'user_roles',
	{
		userId: text('user_id')
			.notNull()
			.references(() => usersTable.id, { onDelete: 'cascade' }),
		roleId: text('role_id')
			.notNull()
			.references(() => rolesTable.id, { onDelete: 'cascade' })
	},
	(table) => [index('user_idx').on(table.userId), index('role_idx').on(table.roleId)]
);

export const rolePermissionsTable = sqliteTable(
	'role_permissions',
	{
		roleId: text('role_id')
			.notNull()
			.references(() => rolesTable.id, { onDelete: 'cascade' }),
		permissionId: text('permission_id')
			.notNull()
			.references(() => permissionsTable.id, { onDelete: 'cascade' })
	},
	(table) => [index('role_permission_idx').on(table.roleId, table.permissionId)]
);

export const roleHierarchyTable = sqliteTable(
	'role_hierarchy',
	{
		parentRoleId: text('parent_role_id')
			.notNull()
			.references(() => rolesTable.id, { onDelete: 'cascade' }),
		childRoleId: text('child_role_id')
			.notNull()
			.references(() => rolesTable.id, { onDelete: 'cascade' })
	},
	(table) => [index('role_hierarchy_idx').on(table.parentRoleId, table.childRoleId)]
);

// ==================================================================
// BAGIAN 4: TABEL NASYATH (KEGIATAN)
// ==================================================================
export const nasyathTable = sqliteTable(
	'nasyath',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		muridId: integer('murid_id')
			.notNull()
			.references(() => muridTable.id, { onDelete: 'cascade' }),
		kegiatan: text('kegiatan').notNull(),
		tanggalMulai: text('tanggal_mulai'),
		tanggalSelesai: text('tanggal_selesai'),
		durasi: text('durasi'),
		tempat: text('tempat'),
		jarak: text('jarak'),
		keterangan: text('keterangan'),
		namaKontak: text('nama_kontak'),
		teleponKontak: text('telepon_kontak'),
		createdAt: text('created_at')
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: text('updated_at')
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updaterId: text('updater_id')
			.notNull()
			.references(() => usersTable.id, { onDelete: 'no action' })
	},
	(table) => [
		index('nasyath_murid_idx').on(table.muridId),
		index('nasyath_kegiatan_idx').on(table.kegiatan)
	]
);

// ==================================================================
// BAGIAN 5: TABEL PIKET (JADWAL TUGAS)
// ==================================================================
export const piketScheduleTable = sqliteTable(
	'piket_schedule',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: text('user_id')
			.notNull()
			.references(() => usersTable.id, { onDelete: 'cascade' }),
		roleId: text('role_id')
			.notNull()
			.references(() => rolesTable.id, { onDelete: 'cascade' }),
		startDate: text('start_date').notNull(), // Format 'YYYY-MM-DD'
		endDate: text('end_date').notNull(), // Format 'YYYY-MM-DD'
		groupId: text('group_id'), // Misal: "Kelompok 1", "Kelompok 2"
		description: text('description')
	},
	(table) => [
		index('piket_user_idx').on(table.userId),
		index('piket_date_idx').on(table.startDate, table.endDate)
	]
);

// ==================================================================
// BAGIAN 6: TABEL PERTANYAAN (PUBLIC FORM)
// ==================================================================
export type PertanyaanStatus = 'hijau' | 'kuning' | 'merah';

export const pertanyaanAhbabTable = sqliteTable(
	'pertanyaan_ahbab',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		nama: text('nama').notNull(),
		alamat: text('alamat').notNull(),
		email: text('email').notNull(),
		namaMursyid: text('nama_mursyid').notNull(),
		pertanyaan: text('pertanyaan').notNull(),
		createdAt: text('created_at')
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		periodeMonth: integer('periode_month'),
		periodeYear: integer('periode_year'),
		// Kolom untuk sistem labeling Ayyu Su'aal
		status: text('status').$type<PertanyaanStatus>(),
		statusCatatan: text('status_catatan'),
		statusUpdatedAt: text('status_updated_at'),
		statusUpdatedBy: text('status_updated_by')
			.references(() => usersTable.id, { onDelete: 'set null' })
	},
	(table) => [
		index('pertanyaan_nama_idx').on(table.nama),
		index('pertanyaan_created_at_idx').on(table.createdAt)
	]
);

// ==================================================================
// BAGIAN 7: RELATIONS (DEFINISIKAN SEMUA DI AKHIR)
// ==================================================================

// 6.1 Relasi untuk Tabel PENGHUBUNG (One-to-Many)
export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
	user: one(usersTable, { fields: [userRolesTable.userId], references: [usersTable.id] }),
	role: one(rolesTable, { fields: [userRolesTable.roleId], references: [rolesTable.id] })
}));

export const rolePermissionsRelations = relations(rolePermissionsTable, ({ one }) => ({
	role: one(rolesTable, { fields: [rolePermissionsTable.roleId], references: [rolesTable.id] }),
	permission: one(permissionsTable, {
		fields: [rolePermissionsTable.permissionId],
		references: [permissionsTable.id]
	})
}));

export const roleHierarchyRelations = relations(roleHierarchyTable, ({ one }) => ({
	parent: one(rolesTable, {
		fields: [roleHierarchyTable.parentRoleId],
		references: [rolesTable.id],
		relationName: 'parentRoles'
	}),
	child: one(rolesTable, {
		fields: [roleHierarchyTable.childRoleId],
		references: [rolesTable.id],
		relationName: 'childRoles'
	})
}));

// 6.2 Relasi untuk Tabel UTAMA (Many-to-Many & Lainnya)
export const usersRelations = relations(usersTable, ({ many, one }) => ({
	roles: many(rolesTable),
	sessions: many(sessionTable),
	piketSchedules: many(piketScheduleTable), // <-- Relasi baru
	murid: one(muridTable, {
		fields: [usersTable.muridId],
		references: [muridTable.id]
	})
}));

export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
	roles: many(rolesTable)
}));

export const rolesRelations = relations(rolesTable, ({ many }) => ({
	users: many(usersTable),
	permissions: many(permissionsTable),
	piketSchedules: many(piketScheduleTable), // <-- Relasi baru
	children: many(roleHierarchyTable, { relationName: 'parentRoles' }),
	parents: many(roleHierarchyTable, { relationName: 'childRoles' })
}));

// 6.3 Relasi untuk Tabel Nasyath
export const nasyathRelations = relations(nasyathTable, ({ one }) => ({
	murid: one(muridTable, {
		fields: [nasyathTable.muridId],
		references: [muridTable.id]
	}),
	updater: one(usersTable, {
		fields: [nasyathTable.updaterId],
		references: [usersTable.id]
	})
}));

// 6.4 Relasi untuk Tabel Murid
export const muridRelations = relations(muridTable, ({ many }) => ({
	nasyath: many(nasyathTable)
}));

// 6.5 Relasi untuk Tabel Piket
export const piketScheduleRelations = relations(piketScheduleTable, ({ one }) => ({
	user: one(usersTable, { fields: [piketScheduleTable.userId], references: [usersTable.id] }),
	role: one(rolesTable, { fields: [piketScheduleTable.roleId], references: [rolesTable.id] })
}));
