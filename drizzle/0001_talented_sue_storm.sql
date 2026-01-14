CREATE TABLE `activities` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`activity_type` varchar(50) NOT NULL,
	`activity_text` text,
	`related_entity_type` varchar(50),
	`related_entity_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_comments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`activity_id` int NOT NULL,
	`user_id` int NOT NULL,
	`comment` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_likes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`activity_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `albums` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`cover_photo` text,
	`created_by_id` int,
	`event_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `albums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_participants` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`conversation_id` int NOT NULL,
	`user_id` int NOT NULL,
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	`last_read_at` timestamp,
	CONSTRAINT `conversation_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` text,
	`is_group_chat` boolean DEFAULT false,
	`created_by_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_attendees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`member_id` int NOT NULL,
	`rsvp_status` varchar(20) DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_attendees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`event_type` varchar(50) NOT NULL,
	`event_date` timestamp NOT NULL,
	`end_date` timestamp,
	`location` text,
	`created_by_id` int,
	`cover_photo` text,
	`is_recurring` boolean DEFAULT false,
	`recurring_pattern` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_members` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`first_name` text NOT NULL,
	`last_name` text,
	`nickname` text,
	`gender` varchar(20),
	`date_of_birth` date,
	`date_of_death` date,
	`profile_photo` text,
	`bio` text,
	`location` text,
	`phone` varchar(50),
	`email` varchar(255),
	`social_media` json,
	`generation` int DEFAULT 1,
	`is_born_into_family` boolean DEFAULT true,
	`is_alive` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marriages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`spouse1_id` int NOT NULL,
	`spouse2_id` int NOT NULL,
	`marriage_date` date,
	`divorce_date` date,
	`status` varchar(20) DEFAULT 'married',
	`hide_ex_spouse` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marriages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_reactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`message_id` int NOT NULL,
	`user_id` int NOT NULL,
	`reaction_type` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`conversation_id` int NOT NULL,
	`sender_id` int NOT NULL,
	`message_text` text,
	`message_type` varchar(20) DEFAULT 'text',
	`media_url` text,
	`reply_to_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`notification_type` varchar(50) NOT NULL,
	`notification_text` text NOT NULL,
	`related_entity_type` varchar(50),
	`related_entity_id` int,
	`is_read` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photo_comments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`photo_id` int NOT NULL,
	`user_id` int NOT NULL,
	`comment` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photo_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photo_reactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`photo_id` int NOT NULL,
	`user_id` int NOT NULL,
	`reaction_type` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photo_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photo_tags` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`photo_id` int NOT NULL,
	`member_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photo_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`album_id` int NOT NULL,
	`photo_url` text NOT NULL,
	`caption` text,
	`uploaded_by_id` int,
	`taken_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`member_id` int NOT NULL,
	`related_member_id` int NOT NULL,
	`relationship_type` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relationships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(20) NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` ADD `profile_photo` text;--> statement-breakpoint
ALTER TABLE `activities` ADD CONSTRAINT `activities_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_comments` ADD CONSTRAINT `activity_comments_activity_id_activities_id_fk` FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_comments` ADD CONSTRAINT `activity_comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_likes` ADD CONSTRAINT `activity_likes_activity_id_activities_id_fk` FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_likes` ADD CONSTRAINT `activity_likes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `albums` ADD CONSTRAINT `albums_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `albums` ADD CONSTRAINT `albums_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversation_participants` ADD CONSTRAINT `conversation_participants_conversation_id_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversation_participants` ADD CONSTRAINT `conversation_participants_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_attendees` ADD CONSTRAINT `event_attendees_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_attendees` ADD CONSTRAINT `event_attendees_member_id_family_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `family_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `family_members` ADD CONSTRAINT `family_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marriages` ADD CONSTRAINT `marriages_spouse1_id_family_members_id_fk` FOREIGN KEY (`spouse1_id`) REFERENCES `family_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marriages` ADD CONSTRAINT `marriages_spouse2_id_family_members_id_fk` FOREIGN KEY (`spouse2_id`) REFERENCES `family_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message_reactions` ADD CONSTRAINT `message_reactions_message_id_messages_id_fk` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `message_reactions` ADD CONSTRAINT `message_reactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photo_comments` ADD CONSTRAINT `photo_comments_photo_id_photos_id_fk` FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photo_comments` ADD CONSTRAINT `photo_comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photo_reactions` ADD CONSTRAINT `photo_reactions_photo_id_photos_id_fk` FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photo_reactions` ADD CONSTRAINT `photo_reactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photo_tags` ADD CONSTRAINT `photo_tags_photo_id_photos_id_fk` FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photo_tags` ADD CONSTRAINT `photo_tags_member_id_family_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `family_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_album_id_albums_id_fk` FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_uploaded_by_id_users_id_fk` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `relationships` ADD CONSTRAINT `relationships_member_id_family_members_id_fk` FOREIGN KEY (`member_id`) REFERENCES `family_members`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `relationships` ADD CONSTRAINT `relationships_related_member_id_family_members_id_fk` FOREIGN KEY (`related_member_id`) REFERENCES `family_members`(`id`) ON DELETE cascade ON UPDATE no action;