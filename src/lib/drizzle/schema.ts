import { sql } from 'drizzle-orm';
import {
	sqliteTable,
	index,
	integer,
	text,
	blob,
	foreignKey,
	type AnySQLiteColumn
} from 'drizzle-orm/sqlite-core';

const userRoles = ['admin', 'mun', 'muf', 'tamu'] as const;
const marhalah = [1, 2, 3] as const;

export const sessionTable = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id),
	expiresAt: integer("expires_at").notNull()
});

type MuridTable = ReturnType<typeof createMuridTable>;
let muridTable: MuridTable;

function createMuridTable() {
	return sqliteTable(
		'murid',
		{
			id: integer('id').primaryKey(),
			updatedAt: text('updated_at')
				.notNull()
				.default(sql`CURRENT_TIMESTAMP`),
			updaterId: text('updater_id')
				.notNull()
				.references((): AnySQLiteColumn => usersTable.id),
			nama: text('nama').notNull(),
			namaArab: text('nama_arab'),
			gender: integer('pria', { mode: 'boolean' }).notNull().default(true),
			deskelId: integer('deskel_id'),
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
		(table) => ({
			namaIdx: index('nama_idx').on(table.nama),
			namaArabIdx: index('nama_arab_idx').on(table.namaArab)
		})
	);
}

muridTable = createMuridTable();
export { muridTable };

export const usersTable = sqliteTable(
	'users',
	{
		id: text('id').primaryKey(),
		username: text('username', { length: 16 }).notNull().unique(),
		passwordHash: text('password_hash', { length: 255 }),
		role: text('role', { enum: userRoles }).notNull().default('tamu'),
		active: integer('active', { mode: 'boolean' }),
		muridId: integer('murid_id')
			.notNull()
			.default(0)
			.references((): AnySQLiteColumn => muridTable.id),
		created_at: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => ({
		username_idx: index('username_idx').on(table.username),
		createdAt_idx: index('created_at_idx').on(table.created_at)
	})
);
export type SelectUser = typeof usersTable.$inferSelect;

export const propTable = sqliteTable('prop', {
	id: integer('id').primaryKey(),
	propinsi: text('propinsi').unique().notNull(),
},
	(table) => ({
		propIdx: index('prop_idx').on(table.propinsi)
	})
);

export const kokabTable = sqliteTable('kokab', {
	id: integer('id').primaryKey(),
	idProp: integer('id_prop').notNull().references((): AnySQLiteColumn => propTable.id),
	kokab: text('kokab').notNull()
},
	(table) => ({
		kokabIdx: index('kokab_idx').on(table.kokab)
	}));

export const kecamatanTable = sqliteTable('kecamatan', {
	id: integer('id').primaryKey(),
	idKokab: integer('id_kokab').notNull().references((): AnySQLiteColumn => kokabTable.id),
	kecamatan: text('kecamatan').notNull()
},
	(table) => ({
		kecamatanIdx: index('kecamatan_idx').on(table.kecamatan)
	}));

export const deskelTable = sqliteTable('deskel', {
	id: integer('id').primaryKey(),
	idKecamatan: integer('id_kecamatan').notNull().references((): AnySQLiteColumn => kecamatanTable.id),
	deskel: text('deskel').notNull()
});
