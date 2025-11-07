import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import _fetch from "fetch-retry";
const propTable = sqliteTable(
  "prop",
  {
    id: integer("id").primaryKey(),
    propinsi: text("propinsi").unique().notNull()
  },
  (table) => [
    // <-- DIPERBAIKI: Menggunakan array []
    index("prop_idx").on(table.propinsi)
  ]
);
const kokabTable = sqliteTable(
  "kokab",
  {
    id: integer("id").primaryKey(),
    idProp: integer("id_prop").notNull().references(() => propTable.id),
    kokab: text("kokab").notNull()
  },
  (table) => [
    // <-- DIPERBAIKI: Menggunakan array []
    index("kokab_idx").on(table.kokab)
  ]
);
const kecamatanTable = sqliteTable(
  "kecamatan",
  {
    id: integer("id").primaryKey(),
    idKokab: integer("id_kokab").notNull().references(() => kokabTable.id),
    kecamatan: text("kecamatan").notNull()
  },
  (table) => [
    // <-- DIPERBAIKI: Menggunakan array []
    index("kecamatan_idx").on(table.kecamatan)
  ]
);
const deskelTable = sqliteTable("deskel", {
  id: integer("id").primaryKey(),
  idKecamatan: integer("id_kecamatan").notNull().references(() => kecamatanTable.id),
  deskel: text("deskel").notNull()
});
const muridTable = sqliteTable(
  "murid",
  {
    id: integer("id").primaryKey(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updaterId: text("updater_id").notNull(),
    nama: text("nama").notNull(),
    namaArab: text("nama_arab"),
    gender: integer("gender", { mode: "boolean" }).notNull().default(true),
    deskelId: integer("deskel_id").references(() => deskelTable.id),
    alamat: text("alamat"),
    nomorTelepon: text("nomor_telepon"),
    muhrimId: integer("muhrim_id").references(() => muridTable.id, {
      onDelete: "set null"
    }),
    mursyidId: integer("mursyid_id").references(() => muridTable.id, {
      onDelete: "set null"
    }),
    baiatId: integer("baiat_id").references(() => muridTable.id, {
      onDelete: "set null"
    }),
    wiridId: integer("wirid_id").references(() => muridTable.id, {
      onDelete: "set null"
    }),
    qari: integer("qari", { mode: "boolean" }).notNull().default(true),
    marhalah: integer("marhalah").$type().notNull().default(1),
    tglLahir: text("tgl_lahir"),
    aktif: integer("aktif", { mode: "boolean" }).notNull().default(true),
    partisipasi: integer("partisipasi", { mode: "boolean" }).notNull().default(true),
    nik: text("nik", { length: 16 }).unique(),
    fotoPublicId: text("foto_public_id")
  },
  (table) => [
    // <-- BENAR
    index("nama_idx").on(table.nama),
    index("nama_arab_idx").on(table.namaArab)
  ]
);
const usersTable = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    username: text("username", { length: 16 }).notNull().unique(),
    passwordHash: text("password_hash", { length: 255 }),
    active: integer("active", { mode: "boolean" }).default(true),
    muridId: integer("murid_id").references(() => muridTable.id, { onDelete: "set null" }),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    // <-- BENAR
    index("username_idx").on(table.username),
    index("created_at_idx").on(table.createdAt)
  ]
);
const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull()
});
const rolesTable = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description")
});
const permissionsTable = sqliteTable("permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description")
});
const userRolesTable = sqliteTable(
  "user_roles",
  {
    userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    roleId: text("role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" })
  },
  (table) => [index("user_idx").on(table.userId), index("role_idx").on(table.roleId)]
);
const rolePermissionsTable = sqliteTable(
  "role_permissions",
  {
    roleId: text("role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" }),
    permissionId: text("permission_id").notNull().references(() => permissionsTable.id, { onDelete: "cascade" })
  },
  (table) => [index("role_permission_idx").on(table.roleId, table.permissionId)]
);
const roleHierarchyTable = sqliteTable(
  "role_hierarchy",
  {
    parentRoleId: text("parent_role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" }),
    childRoleId: text("child_role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" })
  },
  (table) => [index("role_hierarchy_idx").on(table.parentRoleId, table.childRoleId)]
);
const nasyathTable = sqliteTable(
  "nasyath",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    muridId: integer("murid_id").notNull().references(() => muridTable.id, { onDelete: "cascade" }),
    kegiatan: text("kegiatan").notNull(),
    tanggalMulai: text("tanggal_mulai"),
    tanggalSelesai: text("tanggal_selesai"),
    durasi: text("durasi"),
    tempat: text("tempat"),
    jarak: text("jarak"),
    keterangan: text("keterangan"),
    namaKontak: text("nama_kontak"),
    teleponKontak: text("telepon_kontak"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updaterId: text("updater_id").notNull().references(() => usersTable.id, { onDelete: "no action" })
  },
  (table) => [
    index("nasyath_murid_idx").on(table.muridId),
    index("nasyath_kegiatan_idx").on(table.kegiatan)
  ]
);
const piketScheduleTable = sqliteTable(
  "piket_schedule",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    roleId: text("role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" }),
    startDate: text("start_date").notNull(),
    // Format 'YYYY-MM-DD'
    endDate: text("end_date").notNull(),
    // Format 'YYYY-MM-DD'
    groupId: text("group_id"),
    // Misal: "Kelompok 1", "Kelompok 2"
    description: text("description")
  },
  (table) => [
    index("piket_user_idx").on(table.userId),
    index("piket_date_idx").on(table.startDate, table.endDate)
  ]
);
const userRolesRelations = relations(userRolesTable, ({ one }) => ({
  user: one(usersTable, { fields: [userRolesTable.userId], references: [usersTable.id] }),
  role: one(rolesTable, { fields: [userRolesTable.roleId], references: [rolesTable.id] })
}));
const rolePermissionsRelations = relations(rolePermissionsTable, ({ one }) => ({
  role: one(rolesTable, { fields: [rolePermissionsTable.roleId], references: [rolesTable.id] }),
  permission: one(permissionsTable, {
    fields: [rolePermissionsTable.permissionId],
    references: [permissionsTable.id]
  })
}));
const roleHierarchyRelations = relations(roleHierarchyTable, ({ one }) => ({
  parent: one(rolesTable, {
    fields: [roleHierarchyTable.parentRoleId],
    references: [rolesTable.id],
    relationName: "parentRoles"
  }),
  child: one(rolesTable, {
    fields: [roleHierarchyTable.childRoleId],
    references: [rolesTable.id],
    relationName: "childRoles"
  })
}));
const usersRelations = relations(usersTable, ({ many, one }) => ({
  roles: many(rolesTable),
  sessions: many(sessionTable),
  piketSchedules: many(piketScheduleTable),
  // <-- Relasi baru
  murid: one(muridTable, {
    fields: [usersTable.muridId],
    references: [muridTable.id]
  })
}));
const permissionsRelations = relations(permissionsTable, ({ many }) => ({
  roles: many(rolesTable)
}));
const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
  permissions: many(permissionsTable),
  piketSchedules: many(piketScheduleTable),
  // <-- Relasi baru
  children: many(roleHierarchyTable, { relationName: "parentRoles" }),
  parents: many(roleHierarchyTable, { relationName: "childRoles" })
}));
const nasyathRelations = relations(nasyathTable, ({ one }) => ({
  murid: one(muridTable, {
    fields: [nasyathTable.muridId],
    references: [muridTable.id]
  }),
  updater: one(usersTable, {
    fields: [nasyathTable.updaterId],
    references: [usersTable.id]
  })
}));
const muridRelations = relations(muridTable, ({ many }) => ({
  nasyath: many(nasyathTable)
}));
const piketScheduleRelations = relations(piketScheduleTable, ({ one }) => ({
  user: one(usersTable, { fields: [piketScheduleTable.userId], references: [usersTable.id] }),
  role: one(rolesTable, { fields: [piketScheduleTable.roleId], references: [rolesTable.id] })
}));
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  deskelTable,
  kecamatanTable,
  kokabTable,
  muridRelations,
  muridTable,
  nasyathRelations,
  nasyathTable,
  permissionsRelations,
  permissionsTable,
  piketScheduleRelations,
  piketScheduleTable,
  propTable,
  roleHierarchyRelations,
  roleHierarchyTable,
  rolePermissionsRelations,
  rolePermissionsTable,
  rolesRelations,
  rolesTable,
  sessionTable,
  userRolesRelations,
  userRolesTable,
  usersRelations,
  usersTable
}, Symbol.toStringTag, { value: "Module" }));
config({ path: ".env" });
const fetchWithRetry = _fetch(global.fetch, {
  retries: 3,
  // Retry 3 times
  retryDelay: function(attempt) {
    return Math.pow(2, attempt) * 1e3;
  },
  retryOn: [500, 503, 504]
  // Retry on server errors and timeouts
});
const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  fetch: fetchWithRetry
});
const db = drizzle(client, { schema });
export {
  userRolesTable as a,
  deskelTable as b,
  kokabTable as c,
  db as d,
  piketScheduleTable as e,
  client as f,
  permissionsTable as g,
  rolePermissionsTable as h,
  roleHierarchyTable as i,
  kecamatanTable as k,
  muridTable as m,
  nasyathTable as n,
  propTable as p,
  rolesTable as r,
  sessionTable as s,
  usersTable as u
};
