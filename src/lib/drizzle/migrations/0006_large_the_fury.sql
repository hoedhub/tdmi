CREATE TABLE `error_log` (
	`id` text PRIMARY KEY NOT NULL,
	`level` text DEFAULT 'error' NOT NULL,
	`source` text NOT NULL,
	`message` text NOT NULL,
	`stack` text,
	`url` text,
	`user_id` text,
	`user_agent` text,
	`metadata` text,
	`resolved` integer DEFAULT false NOT NULL,
	`resolved_at` text,
	`resolved_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `error_log_level_idx` ON `error_log` (`level`);--> statement-breakpoint
CREATE INDEX `error_log_source_idx` ON `error_log` (`source`);--> statement-breakpoint
CREATE INDEX `error_log_resolved_idx` ON `error_log` (`resolved`);--> statement-breakpoint
CREATE INDEX `error_log_created_at_idx` ON `error_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `error_log_user_idx` ON `error_log` (`user_id`);