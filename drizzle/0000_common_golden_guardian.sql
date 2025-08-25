CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer NOT NULL,
	`is_completed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mau` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`country` text,
	`continent` text
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`table_name` text NOT NULL,
	`metric_name` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`table_name`, `metric_name`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text DEFAULT 'Anonymous' NOT NULL,
	`stars` integer NOT NULL,
	`description` text,
	`approved` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ratings_approved` ON `ratings` (`approved`);--> statement-breakpoint
CREATE TABLE `searches` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_board` text NOT NULL,
	`level` text NOT NULL,
	`feature` text NOT NULL,
	`website` text NOT NULL,
	`created_at` integer NOT NULL
);
