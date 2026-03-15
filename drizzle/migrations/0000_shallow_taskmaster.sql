CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`criteria` text,
	`unlocked_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_achievements_key` ON `achievements` (`key`);--> statement-breakpoint
CREATE TABLE `app_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`entity_type` text NOT NULL,
	`body` text,
	`metadata` text,
	`is_pinned` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_entities_type` ON `entities` (`entity_type`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`event_date` text NOT NULL,
	`event_end_date` text,
	`event_type` text DEFAULT 'life_event',
	`importance` integer DEFAULT 3,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_events_date` ON `events` (`event_date`);--> statement-breakpoint
CREATE INDEX `idx_events_type` ON `events` (`event_type`);--> statement-breakpoint
CREATE TABLE `gamification_profile` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`total_xp` integer DEFAULT 0,
	`level` integer DEFAULT 1,
	`health_xp` integer DEFAULT 0,
	`productivity_xp` integer DEFAULT 0,
	`learning_xp` integer DEFAULT 0,
	`relationships_xp` integer DEFAULT 0,
	`finance_xp` integer DEFAULT 0,
	`creativity_xp` integer DEFAULT 0,
	`reflection_xp` integer DEFAULT 0,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`body` text,
	`time_horizon` text,
	`start_date` text,
	`target_date` text,
	`outcome_metric` text,
	`status` text DEFAULT 'active' NOT NULL,
	`progress` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_goals_status` ON `goals` (`status`);--> statement-breakpoint
CREATE TABLE `habit_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`completed_date` text NOT NULL,
	`count` integer DEFAULT 1,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_habit_completions_date` ON `habit_completions` (`habit_id`,`completed_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_habit_completion_unique` ON `habit_completions` (`habit_id`,`completed_date`);--> statement-breakpoint
CREATE TABLE `habits` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`body` text,
	`cadence` text DEFAULT 'daily' NOT NULL,
	`schedule_rule` text,
	`target_count` integer DEFAULT 1,
	`current_streak` integer DEFAULT 0,
	`longest_streak` integer DEFAULT 0,
	`grace_days` integer DEFAULT 1,
	`domain` text,
	`difficulty` text DEFAULT 'medium',
	`scoring_weight` real DEFAULT 1,
	`is_paused` integer DEFAULT 0,
	`goal_id` text,
	`project_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_habits_active` ON `habits` (`archived_at`);--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`body` text,
	`stage` text DEFAULT 'seed',
	`theme` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_ideas_stage` ON `ideas` (`stage`);--> statement-breakpoint
CREATE TABLE `inbox_items` (
	`id` text PRIMARY KEY NOT NULL,
	`raw_text` text NOT NULL,
	`parsed_type` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`triaged_to_type` text,
	`triaged_to_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_inbox_status` ON `inbox_items` (`status`);--> statement-breakpoint
CREATE TABLE `item_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_item_tags_item` ON `item_tags` (`item_type`,`item_id`);--> statement-breakpoint
CREATE INDEX `idx_item_tags_tag` ON `item_tags` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_item_tags_unique` ON `item_tags` (`item_type`,`item_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`body` text,
	`entry_date` text NOT NULL,
	`entry_time` text,
	`entry_type` text DEFAULT 'freeform',
	`mood` integer,
	`energy` integer,
	`word_count` integer DEFAULT 0,
	`is_pinned` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_journal_date` ON `journal_entries` (`entry_date`);--> statement-breakpoint
CREATE INDEX `idx_journal_type` ON `journal_entries` (`entry_type`);--> statement-breakpoint
CREATE TABLE `metric_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`metric_type` text NOT NULL,
	`value_numeric` real,
	`value_text` text,
	`unit` text,
	`logged_at` integer NOT NULL,
	`logged_date` text NOT NULL,
	`note` text,
	`journal_id` text,
	`habit_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`journal_id`) REFERENCES `journal_entries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_metric_type_date` ON `metric_logs` (`metric_type`,`logged_date`);--> statement-breakpoint
CREATE INDEX `idx_metric_date` ON `metric_logs` (`logged_date`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`note_type` text DEFAULT 'note',
	`collection` text,
	`is_pinned` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_notes_type` ON `notes` (`note_type`);--> statement-breakpoint
CREATE INDEX `idx_notes_collection` ON `notes` (`collection`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`body` text,
	`status` text DEFAULT 'planning' NOT NULL,
	`health` text,
	`start_date` text,
	`target_date` text,
	`end_date` text,
	`progress` integer DEFAULT 0,
	`review_cadence` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_projects_status` ON `projects` (`status`);--> statement-breakpoint
CREATE TABLE `relations` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`relation_type` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_relations_source` ON `relations` (`source_type`,`source_id`);--> statement-breakpoint
CREATE INDEX `idx_relations_target` ON `relations` (`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `idx_relations_type` ON `relations` (`relation_type`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`review_type` text NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`body` text,
	`generated_at` integer,
	`stats_snapshot` text,
	`is_published` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_type` ON `reviews` (`review_type`);--> statement-breakpoint
CREATE INDEX `idx_reviews_period` ON `reviews` (`period_start`,`period_end`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tags_name` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` text,
	`due_date` text,
	`scheduled_date` text,
	`completed_at` integer,
	`recurrence_rule` text,
	`effort_estimate` text,
	`energy_required` text,
	`context` text,
	`project_id` text,
	`parent_task_id` text,
	`sort_order` real DEFAULT 0,
	`source` text DEFAULT 'manual',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_status` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_due_date` ON `tasks` (`due_date`);--> statement-breakpoint
CREATE INDEX `idx_tasks_project` ON `tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_scheduled` ON `tasks` (`scheduled_date`);--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`template_type` text NOT NULL,
	`content` text,
	`default_fields` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `xp_events` (
	`id` text PRIMARY KEY NOT NULL,
	`xp_amount` integer NOT NULL,
	`domain` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_xp_events_date` ON `xp_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_xp_events_domain` ON `xp_events` (`domain`);