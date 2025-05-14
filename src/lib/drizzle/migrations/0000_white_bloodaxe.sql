CREATE TABLE `deskel` (
	`id` integer PRIMARY KEY NOT NULL,
	`id_kecamatan` integer NOT NULL,
	`deskel` text NOT NULL,
	FOREIGN KEY (`id_kecamatan`) REFERENCES `kecamatan`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kecamatan` (
	`id` integer PRIMARY KEY NOT NULL,
	`id_kokab` integer NOT NULL,
	`kecamatan` text NOT NULL,
	FOREIGN KEY (`id_kokab`) REFERENCES `kokab`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kokab` (
	`id` integer PRIMARY KEY NOT NULL,
	`id_prop` integer NOT NULL,
	`kokab` text NOT NULL,
	FOREIGN KEY (`id_prop`) REFERENCES `prop`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `murid` (
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
	`foto` blob,
	FOREIGN KEY (`updater_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`muhrim_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`mursyid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`baiat_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`wirid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `prop` (
	`id` integer PRIMARY KEY NOT NULL,
	`propinsi` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text(16) NOT NULL,
	`password_hash` text(255),
	`role` text DEFAULT 'tamu' NOT NULL,
	`active` integer,
	`murid_id` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`murid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `kecamatan_idx` ON `kecamatan` (`kecamatan`);--> statement-breakpoint
CREATE INDEX `kokab_idx` ON `kokab` (`kokab`);--> statement-breakpoint
CREATE UNIQUE INDEX `murid_nik_unique` ON `murid` (`nik`);--> statement-breakpoint
CREATE INDEX `nama_idx` ON `murid` (`nama`);--> statement-breakpoint
CREATE INDEX `nama_arab_idx` ON `murid` (`nama_arab`);--> statement-breakpoint
CREATE UNIQUE INDEX `prop_propinsi_unique` ON `prop` (`propinsi`);--> statement-breakpoint
CREATE INDEX `prop_idx` ON `prop` (`propinsi`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `users` (`created_at`);