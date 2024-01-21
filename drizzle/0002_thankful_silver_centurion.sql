ALTER TABLE messages ADD `discordMessageIds` text NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `discordMessageId`;