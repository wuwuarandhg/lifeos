/**
 * lifeOS — Timeline Data Service
 *
 * Builds a chronological, day-grouped feed of notable domain events.
 * Uses a single UNION ALL SQL query for performance, then groups by day.
 */

import { sqlite } from '../db';
import type { ItemType, TimelineItem, TimelineFilters } from '@/lib/types';
import { getItemIcon, getDetailUrl, getTypeLabel } from './graph-helpers';
import { todayISO } from '@/lib/utils';

// ----------------------------------------------------------
// Default config
// ----------------------------------------------------------
const DEFAULT_LIMIT = 100;
const DEFAULT_DAYS_BACK = 90;

// ----------------------------------------------------------
// Main entry: get timeline feed
// ----------------------------------------------------------
export function getTimelineFeed(filters?: Partial<TimelineFilters>): {
  items: TimelineItem[];
  dayGroups: { date: string; items: TimelineItem[] }[];
  hasMore: boolean;
} {
  const limit = filters?.limit ?? DEFAULT_LIMIT;
  const offset = filters?.offset ?? 0;
  const allowedTypes = filters?.types ? new Set(filters.types) : null;

  // Date bounds
  const endDate = filters?.endDate ?? todayISO();
  let startDate = filters?.startDate;
  if (!startDate) {
    const d = new Date();
    d.setDate(d.getDate() - DEFAULT_DAYS_BACK);
    startDate = d.toISOString().split('T')[0];
  }

  // Build the UNION ALL query
  const parts: string[] = [];
  const params: (string | number)[] = [];

  // Journal entries
  if (!allowedTypes || allowedTypes.has('journal')) {
    parts.push(`
      SELECT id, 'journal' AS type, COALESCE(title, 'Journal — ' || entry_date) AS title,
        entry_type AS subtitle, entry_date AS date, entry_time AS time
      FROM journal_entries
      WHERE entry_date >= ? AND entry_date <= ? AND archived_at IS NULL
    `);
    params.push(startDate, endDate);
  }

  // Reviews
  if (!allowedTypes || allowedTypes.has('review')) {
    parts.push(`
      SELECT id, 'review' AS type,
        review_type || ' Review' AS title,
        period_start || ' → ' || period_end AS subtitle,
        period_end AS date, NULL AS time
      FROM reviews
      WHERE period_end >= ? AND period_end <= ?
    `);
    params.push(startDate, endDate);
  }

  // Completed tasks
  if (!allowedTypes || allowedTypes.has('task')) {
    parts.push(`
      SELECT id, 'task' AS type, 'Completed: ' || title AS title,
        priority AS subtitle,
        COALESCE(
          SUBSTR(DATETIME(completed_at / 1000, 'unixepoch'), 1, 10),
          due_date,
          SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10)
        ) AS date,
        NULL AS time
      FROM tasks
      WHERE status = 'done' AND archived_at IS NULL
        AND COALESCE(
          SUBSTR(DATETIME(completed_at / 1000, 'unixepoch'), 1, 10),
          due_date,
          SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10)
        ) >= ? AND COALESCE(
          SUBSTR(DATETIME(completed_at / 1000, 'unixepoch'), 1, 10),
          due_date,
          SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10)
        ) <= ?
    `);
    params.push(startDate, endDate);
  }

  // Projects (started or completed)
  if (!allowedTypes || allowedTypes.has('project')) {
    parts.push(`
      SELECT id, 'project' AS type,
        CASE
          WHEN status = 'completed' THEN 'Completed project: ' || title
          WHEN status = 'active' AND start_date IS NOT NULL THEN 'Started project: ' || title
          ELSE 'Project: ' || title
        END AS title,
        status AS subtitle,
        COALESCE(
          CASE WHEN status = 'completed' THEN end_date END,
          start_date,
          SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10)
        ) AS date,
        NULL AS time
      FROM projects
      WHERE archived_at IS NULL
        AND COALESCE(
          CASE WHEN status = 'completed' THEN end_date END,
          start_date,
          SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10)
        ) >= ? AND COALESCE(
          CASE WHEN status = 'completed' THEN end_date END,
          start_date,
          SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10)
        ) <= ?
    `);
    params.push(startDate, endDate);
  }

  // Goals (achieved)
  if (!allowedTypes || allowedTypes.has('goal')) {
    parts.push(`
      SELECT id, 'goal' AS type,
        CASE WHEN status = 'achieved' THEN 'Achieved: ' || title ELSE 'Goal: ' || title END AS title,
        time_horizon AS subtitle,
        COALESCE(start_date, SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10)) AS date,
        NULL AS time
      FROM goals
      WHERE archived_at IS NULL
        AND COALESCE(start_date, SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10)) >= ?
        AND COALESCE(start_date, SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10)) <= ?
    `);
    params.push(startDate, endDate);
  }

  // Notes
  if (!allowedTypes || allowedTypes.has('note')) {
    parts.push(`
      SELECT id, 'note' AS type, title AS title,
        note_type AS subtitle,
        SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) AS date,
        NULL AS time
      FROM notes
      WHERE archived_at IS NULL
        AND SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) >= ?
        AND SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) <= ?
    `);
    params.push(startDate, endDate);
  }

  // Ideas
  if (!allowedTypes || allowedTypes.has('idea')) {
    parts.push(`
      SELECT id, 'idea' AS type, 'New idea: ' || title AS title,
        stage AS subtitle,
        SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) AS date,
        NULL AS time
      FROM ideas
      WHERE archived_at IS NULL
        AND SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) >= ?
        AND SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) <= ?
    `);
    params.push(startDate, endDate);
  }

  // Events (life_event, milestone, trip, memory, achievement)
  if (!allowedTypes || allowedTypes.has('event')) {
    parts.push(`
      SELECT id, 'event' AS type, title AS title,
        event_type AS subtitle,
        event_date AS date, NULL AS time
      FROM events
      WHERE archived_at IS NULL
        AND event_date >= ? AND event_date <= ?
    `);
    params.push(startDate, endDate);
  }

  // Entities created
  if (!allowedTypes || allowedTypes.has('entity')) {
    parts.push(`
      SELECT id, 'entity' AS type,
        'Added ' || entity_type || ': ' || title AS title,
        entity_type AS subtitle,
        SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) AS date,
        NULL AS time
      FROM entities
      WHERE archived_at IS NULL
        AND SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) >= ?
        AND SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) <= ?
    `);
    params.push(startDate, endDate);
  }

  // Workouts (notable metrics)
  if (!allowedTypes || allowedTypes.has('metric')) {
    parts.push(`
      SELECT id, 'metric' AS type,
        CASE
          WHEN metric_type = 'workout' THEN 'Workout: ' || CAST(CAST(value_numeric AS INT) AS TEXT) || 'min ' || COALESCE(value_text, '')
          WHEN metric_type = 'sleep' THEN 'Sleep: ' || CAST(ROUND(value_numeric, 1) AS TEXT) || 'h'
          ELSE metric_type || ': ' || COALESCE(CAST(value_numeric AS TEXT), value_text, '')
        END AS title,
        metric_type AS subtitle,
        logged_date AS date, NULL AS time
      FROM metric_logs
      WHERE metric_type IN ('workout', 'sleep')
        AND logged_date >= ? AND logged_date <= ?
    `);
    params.push(startDate, endDate);
  }

  if (parts.length === 0) {
    return { items: [], dayGroups: [], hasMore: false };
  }

  // Execute the UNION ALL
  const sql = parts.join(' UNION ALL ') +
    ` ORDER BY date DESC, time DESC NULLS LAST LIMIT ? OFFSET ?`;
  params.push(limit + 1, offset); // +1 to detect "has more"

  const rows = sqlite.prepare(sql).all(...params) as Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string | null;
    date: string;
    time: string | null;
  }>;

  const hasMore = rows.length > limit;
  const trimmedRows = rows.slice(0, limit);

  // Map to TimelineItem
  const items: TimelineItem[] = trimmedRows.map(row => ({
    id: row.id,
    type: row.type as ItemType,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    date: row.date,
    time: row.time ?? undefined,
    icon: getItemIcon(row.type as ItemType),
    detailUrl: getDetailUrl(row.type as ItemType, row.id),
  }));

  // Group by day
  const dayMap = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const existing = dayMap.get(item.date) ?? [];
    existing.push(item);
    dayMap.set(item.date, existing);
  }

  const dayGroups = [...dayMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, dayItems]) => ({ date, items: dayItems }));

  return { items, dayGroups, hasMore };
}

// ----------------------------------------------------------
// Get timeline stats (for header)
// ----------------------------------------------------------
export function getTimelineStats() {
  const result = sqlite.prepare(`
    SELECT
      (SELECT COUNT(*) FROM journal_entries WHERE archived_at IS NULL) AS journals,
      (SELECT COUNT(*) FROM tasks WHERE status = 'done' AND archived_at IS NULL) AS completedTasks,
      (SELECT COUNT(*) FROM events WHERE archived_at IS NULL) AS events,
      (SELECT COUNT(*) FROM reviews) AS reviews,
      (SELECT COUNT(*) FROM notes WHERE archived_at IS NULL) AS notes,
      (SELECT COUNT(*) FROM ideas WHERE archived_at IS NULL) AS ideas,
      (SELECT MIN(entry_date) FROM journal_entries WHERE archived_at IS NULL) AS earliestDate
  `).get() as {
    journals: number; completedTasks: number; events: number;
    reviews: number; notes: number; ideas: number; earliestDate: string | null;
  };

  return result;
}
