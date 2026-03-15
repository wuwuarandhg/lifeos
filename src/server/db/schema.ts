import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// ============================================================
// lifeOS Database Schema
// ============================================================
// Strategy: Separate domain tables + shared relation/tag layer
// IDs: ULID (time-sortable, globally unique)
// Timestamps: Unix milliseconds (integer)
// Dates: ISO 8601 strings (TEXT) for human-readable queries
// Booleans: INTEGER (0/1)
// ============================================================

// ----------------------------------------------------------
// TASKS
// ----------------------------------------------------------
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body'),
  status: text('status', { enum: ['inbox', 'todo', 'in_progress', 'done', 'cancelled'] }).notNull().default('todo'),
  priority: text('priority', { enum: ['p1', 'p2', 'p3', 'p4'] }),
  dueDate: text('due_date'),
  scheduledDate: text('scheduled_date'),
  completedAt: integer('completed_at'),
  recurrenceRule: text('recurrence_rule'),
  effortEstimate: text('effort_estimate', { enum: ['trivial', 'small', 'medium', 'large', 'huge'] }),
  energyRequired: text('energy_required', { enum: ['low', 'medium', 'high'] }),
  context: text('context'),
  projectId: text('project_id').references(() => projects.id),
  parentTaskId: text('parent_task_id'),
  sortOrder: real('sort_order').default(0),
  source: text('source', { enum: ['manual', 'inbox', 'recurrence', 'review'] }).default('manual'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at'),
}, (table) => [
  index('idx_tasks_status').on(table.status),
  index('idx_tasks_due_date').on(table.dueDate),
  index('idx_tasks_project').on(table.projectId),
  index('idx_tasks_scheduled').on(table.scheduledDate),
]);

// ----------------------------------------------------------
// HABITS
// ----------------------------------------------------------
export const habits = sqliteTable('habits', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  body: text('body'),
  cadence: text('cadence', { enum: ['daily', 'weekly', 'custom'] }).notNull().default('daily'),
  scheduleRule: text('schedule_rule'), // JSON: {"days": [1,3,5]} or null for daily
  targetCount: integer('target_count').default(1),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  graceDays: integer('grace_days').default(1),
  domain: text('domain', { enum: ['health', 'productivity', 'learning', 'relationships', 'finance', 'creativity', 'reflection'] }),
  difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }).default('medium'),
  scoringWeight: real('scoring_weight').default(1.0),
  isPaused: integer('is_paused').default(0),
  goalId: text('goal_id').references(() => goals.id),
  projectId: text('project_id').references(() => projects.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at'),
}, (table) => [
  index('idx_habits_active').on(table.archivedAt),
]);

// ----------------------------------------------------------
// HABIT COMPLETIONS
// ----------------------------------------------------------
export const habitCompletions = sqliteTable('habit_completions', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  completedDate: text('completed_date').notNull(), // ISO date
  count: integer('count').default(1),
  note: text('note'),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  index('idx_habit_completions_date').on(table.habitId, table.completedDate),
  uniqueIndex('idx_habit_completion_unique').on(table.habitId, table.completedDate),
]);

// ----------------------------------------------------------
// JOURNAL ENTRIES
// ----------------------------------------------------------
export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  title: text('title'),
  body: text('body'),
  entryDate: text('entry_date').notNull(), // ISO date
  entryTime: text('entry_time'), // HH:MM
  entryType: text('entry_type', { enum: ['daily', 'reflection', 'gratitude', 'freeform', 'evening_review'] }).default('freeform'),
  mood: integer('mood'), // 1-10
  energy: integer('energy'), // 1-10
  wordCount: integer('word_count').default(0),
  isPinned: integer('is_pinned').default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at'),
}, (table) => [
  index('idx_journal_date').on(table.entryDate),
  index('idx_journal_type').on(table.entryType),
]);

// ----------------------------------------------------------
// NOTES
// ----------------------------------------------------------
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body'),
  noteType: text('note_type', { enum: ['note', 'reference', 'meeting', 'snippet', 'evergreen'] }).default('note'),
  collection: text('collection'), // Optional folder-like grouping
  isPinned: integer('is_pinned').default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at'),
}, (table) => [
  index('idx_notes_type').on(table.noteType),
  index('idx_notes_collection').on(table.collection),
]);

// ----------------------------------------------------------
// IDEAS
// ----------------------------------------------------------
export const ideas = sqliteTable('ideas', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary'),
  body: text('body'),
  stage: text('stage', { enum: ['seed', 'developing', 'mature', 'archived', 'implemented'] }).default('seed'),
  theme: text('theme'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at'),
}, (table) => [
  index('idx_ideas_stage').on(table.stage),
]);

// ----------------------------------------------------------
// PROJECTS
// ----------------------------------------------------------
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary'),
  body: text('body'),
  status: text('status', { enum: ['planning', 'active', 'paused', 'completed', 'cancelled'] }).notNull().default('planning'),
  health: text('health', { enum: ['on_track', 'at_risk', 'off_track'] }),
  startDate: text('start_date'),
  targetDate: text('target_date'),
  endDate: text('end_date'),
  progress: integer('progress').default(0), // 0-100
  reviewCadence: text('review_cadence', { enum: ['weekly', 'biweekly', 'monthly'] }),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at'),
}, (table) => [
  index('idx_projects_status').on(table.status),
]);

// ----------------------------------------------------------
// GOALS
// ----------------------------------------------------------
export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  body: text('body'),
  timeHorizon: text('time_horizon', { enum: ['quarterly', 'yearly', 'multi_year', 'life'] }),
  startDate: text('start_date'),
  targetDate: text('target_date'),
  outcomeMetric: text('outcome_metric'),
  status: text('status', { enum: ['active', 'achieved', 'abandoned', 'paused'] }).notNull().default('active'),
  progress: integer('progress').default(0), // 0-100
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at'),
}, (table) => [
  index('idx_goals_status').on(table.status),
]);

// ----------------------------------------------------------
// METRIC LOGS
// ----------------------------------------------------------
export const metricLogs = sqliteTable('metric_logs', {
  id: text('id').primaryKey(),
  metricType: text('metric_type', {
    enum: ['sleep', 'mood', 'energy', 'workout', 'symptom', 'expense', 'focus_session', 'body_metric', 'custom']
  }).notNull(),
  valueNumeric: real('value_numeric'),
  valueText: text('value_text'),
  unit: text('unit'),
  loggedAt: integer('logged_at').notNull(),
  loggedDate: text('logged_date').notNull(), // ISO date for grouping
  note: text('note'),
  journalId: text('journal_id').references(() => journalEntries.id),
  habitId: text('habit_id').references(() => habits.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  index('idx_metric_type_date').on(table.metricType, table.loggedDate),
  index('idx_metric_date').on(table.loggedDate),
]);

// ----------------------------------------------------------
// ENTITIES (People, Books, Topics, etc.)
// ----------------------------------------------------------
export const entities = sqliteTable('entities', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  entityType: text('entity_type', {
    enum: ['person', 'book', 'article', 'course', 'place', 'symptom', 'routine', 'tool', 'medication', 'topic']
  }).notNull(),
  body: text('body'),
  metadata: text('metadata'), // JSON blob for type-specific fields
  isPinned: integer('is_pinned').default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at'),
}, (table) => [
  index('idx_entities_type').on(table.entityType),
]);

// ----------------------------------------------------------
// EVENTS / TIMELINE
// ----------------------------------------------------------
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body'),
  eventDate: text('event_date').notNull(),
  eventEndDate: text('event_end_date'),
  eventType: text('event_type', {
    enum: ['life_event', 'milestone', 'trip', 'memory', 'achievement']
  }).default('life_event'),
  importance: integer('importance').default(3), // 1-5
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at'),
}, (table) => [
  index('idx_events_date').on(table.eventDate),
  index('idx_events_type').on(table.eventType),
]);

// ----------------------------------------------------------
// REVIEWS
// ----------------------------------------------------------
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  reviewType: text('review_type', { enum: ['daily', 'weekly', 'monthly', 'yearly'] }).notNull(),
  periodStart: text('period_start').notNull(),
  periodEnd: text('period_end').notNull(),
  body: text('body'),
  generatedAt: integer('generated_at'),
  statsSnapshot: text('stats_snapshot'), // JSON blob
  isPublished: integer('is_published').default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  index('idx_reviews_type').on(table.reviewType),
  index('idx_reviews_period').on(table.periodStart, table.periodEnd),
]);

// ----------------------------------------------------------
// TEMPLATES
// ----------------------------------------------------------
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  templateType: text('template_type', {
    enum: ['journal', 'note', 'review', 'project', 'task']
  }).notNull(),
  content: text('content'), // Markdown template
  defaultFields: text('default_fields'), // JSON
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ----------------------------------------------------------
// INBOX ITEMS
// ----------------------------------------------------------
export const inboxItems = sqliteTable('inbox_items', {
  id: text('id').primaryKey(),
  rawText: text('raw_text').notNull(),
  parsedType: text('parsed_type'),
  status: text('status', { enum: ['pending', 'triaged', 'dismissed'] }).notNull().default('pending'),
  triagedToType: text('triaged_to_type'),
  triagedToId: text('triaged_to_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  index('idx_inbox_status').on(table.status),
]);

// ----------------------------------------------------------
// RELATIONS (shared cross-domain layer)
// ----------------------------------------------------------
export const relations = sqliteTable('relations', {
  id: text('id').primaryKey(),
  sourceType: text('source_type').notNull(),
  sourceId: text('source_id').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  relationType: text('relation_type', {
    enum: ['belongs_to', 'mentions', 'supports', 'related_to', 'blocks', 'derived_from', 'summarizes', 'affects']
  }).notNull(),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at').notNull(),
}, (table) => [
  index('idx_relations_source').on(table.sourceType, table.sourceId),
  index('idx_relations_target').on(table.targetType, table.targetId),
  index('idx_relations_type').on(table.relationType),
]);

// ----------------------------------------------------------
// TAGS
// ----------------------------------------------------------
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_tags_name').on(table.name),
]);

// ----------------------------------------------------------
// ITEM TAGS (junction table)
// ----------------------------------------------------------
export const itemTags = sqliteTable('item_tags', {
  id: text('id').primaryKey(),
  itemType: text('item_type').notNull(),
  itemId: text('item_id').notNull(),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  index('idx_item_tags_item').on(table.itemType, table.itemId),
  index('idx_item_tags_tag').on(table.tagId),
  uniqueIndex('idx_item_tags_unique').on(table.itemType, table.itemId, table.tagId),
]);

// ----------------------------------------------------------
// GAMIFICATION PROFILE (single row)
// ----------------------------------------------------------
export const gamificationProfile = sqliteTable('gamification_profile', {
  id: text('id').primaryKey().default('default'),
  totalXp: integer('total_xp').default(0),
  level: integer('level').default(1),
  healthXp: integer('health_xp').default(0),
  productivityXp: integer('productivity_xp').default(0),
  learningXp: integer('learning_xp').default(0),
  relationshipsXp: integer('relationships_xp').default(0),
  financeXp: integer('finance_xp').default(0),
  creativityXp: integer('creativity_xp').default(0),
  reflectionXp: integer('reflection_xp').default(0),
  updatedAt: integer('updated_at').notNull(),
});

// ----------------------------------------------------------
// XP EVENTS
// ----------------------------------------------------------
export const xpEvents = sqliteTable('xp_events', {
  id: text('id').primaryKey(),
  xpAmount: integer('xp_amount').notNull(),
  domain: text('domain').notNull(),
  sourceType: text('source_type').notNull(),
  sourceId: text('source_id').notNull(),
  reason: text('reason').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  index('idx_xp_events_date').on(table.createdAt),
  index('idx_xp_events_domain').on(table.domain),
]);

// ----------------------------------------------------------
// ACHIEVEMENTS
// ----------------------------------------------------------
export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  criteria: text('criteria'), // JSON
  unlockedAt: integer('unlocked_at'),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_achievements_key').on(table.key),
]);

// ----------------------------------------------------------
// APP SETTINGS (key-value)
// ----------------------------------------------------------
export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
