ALTER TABLE `murid` RENAME COLUMN "pria" TO "gender";--> statement-breakpoint
ALTER TABLE `murid` RENAME COLUMN "foto_drive_id" TO "foto_public_id";--> statement-breakpoint
CREATE TABLE `pertanyaan_ahbab` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text NOT NULL,
	`alamat` text NOT NULL,
	`email` text NOT NULL,
	`nama_mursyid` text NOT NULL,
	`pertanyaan` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pertanyaan_nama_idx` ON `pertanyaan_ahbab` (`nama`);--> statement-breakpoint
CREATE INDEX `pertanyaan_created_at_idx` ON `pertanyaan_ahbab` (`created_at`);--> statement-breakpoint
CREATE TABLE `piket_schedule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`group_id` text,
	`description` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `piket_user_idx` ON `piket_schedule` (`user_id`);--> statement-breakpoint
CREATE INDEX `piket_date_idx` ON `piket_schedule` (`start_date`,`end_date`);