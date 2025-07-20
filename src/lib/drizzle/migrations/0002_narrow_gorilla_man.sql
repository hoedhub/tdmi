CREATE TABLE `nasyath` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`murid_id` integer NOT NULL,
	`kegiatan` text NOT NULL,
	`tanggal_mulai` text,
	`tanggal_selesai` text,
	`durasi` text,
	`tempat` text,
	`jarak` text,
	`keterangan` text,
	`nama_kontak` text,
	`telepon_kontak` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updater_id` text NOT NULL,
	FOREIGN KEY (`murid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`updater_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `nasyath_murid_idx` ON `nasyath` (`murid_id`);--> statement-breakpoint
CREATE INDEX `nasyath_kegiatan_idx` ON `nasyath` (`kegiatan`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_murid` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updater_id` text NOT NULL,
	`nama` text NOT NULL,
	`nama_arab` text,
	`pria` integer DEFAULT true NOT NULL,
	`deskel_id` integer,
	`alamat` text,
	`nomor_telepon` text,
	`muhrim_id` integer,
	`mursyid_id` integer,
	`baiat_id` integer,
	`wirid_id` integer,
	`qari` integer DEFAULT true NOT NULL,
	`marhalah` integer DEFAULT 1 NOT NULL,
	`tgl_lahir` text,
	`aktif` integer DEFAULT true NOT NULL,
	`partisipasi` integer DEFAULT true NOT NULL,
	`nik` text(16),
	`foto_drive_id` text,
	FOREIGN KEY (`deskel_id`) REFERENCES `deskel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`muhrim_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`mursyid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`baiat_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`wirid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_murid`("id", "updated_at", "updater_id", "nama", "nama_arab", "pria", "deskel_id", "alamat", "nomor_telepon", "muhrim_id", "mursyid_id", "baiat_id", "wirid_id", "qari", "marhalah", "tgl_lahir", "aktif", "partisipasi", "nik", "foto_drive_id") SELECT "id", "updated_at", "updater_id", "nama", "nama_arab", "pria", "deskel_id", "alamat", "nomor_telepon", "muhrim_id", "mursyid_id", "baiat_id", "wirid_id", "qari", "marhalah", "tgl_lahir", "aktif", "partisipasi", "nik", "foto_drive_id" FROM `murid`;--> statement-breakpoint
DROP TABLE `murid`;--> statement-breakpoint
ALTER TABLE `__new_murid` RENAME TO `murid`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `murid_nik_unique` ON `murid` (`nik`);--> statement-breakpoint
CREATE INDEX `nama_idx` ON `murid` (`nama`);--> statement-breakpoint
CREATE INDEX `nama_arab_idx` ON `murid` (`nama_arab`);--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "user_id", "expires_at") SELECT "id", "user_id", "expires_at" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text(16) NOT NULL,
	`password_hash` text(255),
	`active` integer DEFAULT true,
	`murid_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`murid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "password_hash", "active", "murid_id", "created_at") SELECT "id", "username", "password_hash", "active", "murid_id", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `users` (`created_at`);--> statement-breakpoint
CREATE TABLE `__new_role_hierarchy` (
	`parent_role_id` text NOT NULL,
	`child_role_id` text NOT NULL,
	FOREIGN KEY (`parent_role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`child_role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_hierarchy`("parent_role_id", "child_role_id") SELECT "parent_role_id", "child_role_id" FROM `role_hierarchy`;--> statement-breakpoint
DROP TABLE `role_hierarchy`;--> statement-breakpoint
ALTER TABLE `__new_role_hierarchy` RENAME TO `role_hierarchy`;--> statement-breakpoint
CREATE INDEX `role_hierarchy_idx` ON `role_hierarchy` (`parent_role_id`,`child_role_id`);--> statement-breakpoint
CREATE TABLE `__new_role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_permissions`("role_id", "permission_id") SELECT "role_id", "permission_id" FROM `role_permissions`;--> statement-breakpoint
DROP TABLE `role_permissions`;--> statement-breakpoint
ALTER TABLE `__new_role_permissions` RENAME TO `role_permissions`;--> statement-breakpoint
CREATE INDEX `role_permission_idx` ON `role_permissions` (`role_id`,`permission_id`);--> statement-breakpoint
CREATE TABLE `__new_user_roles` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_roles`("user_id", "role_id") SELECT "user_id", "role_id" FROM `user_roles`;--> statement-breakpoint
DROP TABLE `user_roles`;--> statement-breakpoint
ALTER TABLE `__new_user_roles` RENAME TO `user_roles`;--> statement-breakpoint
CREATE INDEX `user_idx` ON `user_roles` (`user_id`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `user_roles` (`role_id`);