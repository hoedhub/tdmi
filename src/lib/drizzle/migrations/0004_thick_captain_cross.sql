ALTER TABLE `pertanyaan_ahbab` ADD `status` text;--> statement-breakpoint
ALTER TABLE `pertanyaan_ahbab` ADD `status_catatan` text;--> statement-breakpoint
ALTER TABLE `pertanyaan_ahbab` ADD `status_updated_at` text;--> statement-breakpoint
ALTER TABLE `pertanyaan_ahbab` ADD `status_updated_by` text REFERENCES users(id);