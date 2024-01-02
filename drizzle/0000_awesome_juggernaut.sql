CREATE TABLE `animes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`season` integer NOT NULL,
	`episode` integer NOT NULL,
	`maxEpisode` integer NOT NULL,
	`dayOfRelease` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`animeId` integer NOT NULL,
	`discordMessageId` text NOT NULL,
	`data` text NOT NULL,
	`isStale` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`animeId`) REFERENCES `animes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `animes_name_season_unique` ON `animes` (`name`,`season`);