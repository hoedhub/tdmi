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

export const propTable = sqliteTable('prop', {
	id: integer('id').primaryKey(),
	propinsi: text('propinsi').unique().notNull(),
}, (table) => ([ // <-- DIPERBAIKI: Menggunakan array []
	index('prop_idx').on(table.propinsi)
]));

export const kokabTable = sqliteTable('kokab', {
	id: integer('id').primaryKey(),
	idProp: integer('id_prop').notNull().references(() => propTable.id),
	kokab: text('kokab').notNull()
}, (table) => ([ // <-- DIPERBAIKI: Menggunakan array []
	index('kokab_idx').on(table.kokab)
]));

export const kecamatanTable = sqliteTable('kecamatan', {
	id: integer('id').primaryKey(),
	idKokab: integer('id_kokab').notNull().references(() => kokabTable.id),
	kecamatan: text('kecamatan').notNull()
}, (table) => ([ // <-- DIPERBAIKI: Menggunakan array []
	index('kecamatan_idx').on(table.kecamatan)
]));

export const deskelTable = sqliteTable('deskel', {
	id: integer('id').primaryKey(),
	idKecamatan: integer('id_kecamatan').notNull().references(() => kecamatanTable.id),
	deskel: text('deskel').notNull()
});

const marhalah = [1, 2, 3] as const;

// Definisi muridTable harus ada sebelum usersTable
export const muridTable = sqliteTable(
	'murid',
	{
		id: integer('id').primaryKey(),
		updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
		updaterId: text('updater_id').notNull(),
		nama: text('nama').notNull(),
		namaArab: text('nama_arab'),
		gender: integer('pria', { mode: 'boolean' }).notNull().default(true),
		deskelId: integer('deskel_id').references(() => deskelTable.id),
		alamat: text('alamat'),
		nomorTelepon: text('nomor_telepon'),
		muhrimId: integer('muhrim_id').references((): AnySQLiteColumn => muridTable.id, { onDelete: 'set null' }),
		mursyidId: integer('mursyid_id').references((): AnySQLiteColumn => muridTable.id, { onDelete: 'set null' }),
		baiatId: integer('baiat_id').references((): AnySQLiteColumn => muridTable.id, { onDelete: 'set null' }),
		wiridId: integer('wirid_id').references((): AnySQLiteColumn => muridTable.id, { onDelete: 'set null' }),
		qari: integer('qari', { mode: 'boolean' }).notNull().default(true),
		marhalah: integer('marhalah').$type<(typeof marhalah)[number]>().notNull().default(1),
		tglLahir: text('tgl_lahir'),
		aktif: integer('aktif', { mode: 'boolean' }).notNull().default(true),
		partisipasi: integer('partisipasi', { mode: 'boolean' }).notNull().default(true),
		nik: text('nik', { length: 16 }).unique(),
		foto: blob('foto')
	},
	(table) => ([ // <-- BENAR
		index('nama_idx').on(table.nama),
		index('nama_arab_idx').on(table.namaArab)
	])
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
		createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => ([ // <-- BENAR
		index('username_idx').on(table.username),
		index('created_at_idx').on(table.createdAt)
	])
);

export type SelectUser = typeof usersTable.$inferSelect;

export const sessionTable = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
	expiresAt: integer("expires_at").notNull()
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
export const userRolesTable = sqliteTable('user_roles', {
	userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
	roleId: text('role_id').notNull().references(() => rolesTable.id, { onDelete: 'cascade' }),
}, (table) => ({
	pk: primaryKey({ columns: [table.userId, table.roleId] })
}));

export const rolePermissionsTable = sqliteTable('role_permissions', {
	roleId: text('role_id').notNull().references(() => rolesTable.id, { onDelete: 'cascade' }),
	permissionId: text('permission_id').notNull().references(() => permissionsTable.id, { onDelete: 'cascade' }),
}, (table) => ({
	pk: primaryKey({ columns: [table.roleId, table.permissionId] })
}));

export const roleHierarchyTable = sqliteTable('role_hierarchy', {
	parentRoleId: text('parent_role_id').notNull().references(() => rolesTable.id, { onDelete: 'cascade' }),
	childRoleId: text('child_role_id').notNull().references(() => rolesTable.id, { onDelete: 'cascade' }),
}, (table) => ({
	pk: primaryKey({ columns: [table.parentRoleId, table.childRoleId] })
}));


// ==================================================================
// BAGIAN 4: RELATIONS (DEFINISIKAN SEMUA DI AKHIR)
// ==================================================================

// 4.1 Relasi untuk Tabel PENGHUBUNG (One-to-Many)
export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
	user: one(usersTable, { fields: [userRolesTable.userId], references: [usersTable.id] }),
	role: one(rolesTable, { fields: [userRolesTable.roleId], references: [rolesTable.id] })
}));

export const rolePermissionsRelations = relations(rolePermissionsTable, ({ one }) => ({
	role: one(rolesTable, { fields: [rolePermissionsTable.roleId], references: [rolesTable.id] }),
	permission: one(permissionsTable, { fields: [rolePermissionsTable.permissionId], references: [permissionsTable.id] })
}));

export const roleHierarchyRelations = relations(roleHierarchyTable, ({ one }) => ({
	parent: one(rolesTable, { fields: [roleHierarchyTable.parentRoleId], references: [rolesTable.id], relationName: 'parentRoles' }),
	child: one(rolesTable, { fields: [roleHierarchyTable.childRoleId], references: [rolesTable.id], relationName: 'childRoles' })
}));

// 4.2 Relasi untuk Tabel UTAMA (Many-to-Many & Lainnya)
export const usersRelations = relations(usersTable, ({ many }) => ({
	roles: many(rolesTable),
	sessions: many(sessionTable)
}));

export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
	roles: many(rolesTable)
}));

export const rolesRelations = relations(rolesTable, ({ many }) => ({
	users: many(usersTable),
	permissions: many(permissionsTable),
	children: many(roleHierarchyTable, { relationName: 'parentRoles' }),
	parents: many(roleHierarchyTable, { relationName: 'childRoles' })
}));