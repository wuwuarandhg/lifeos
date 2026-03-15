/**
 * lifeOS — Insights Service
 *
 * Computes rolling summaries and trends from existing domain data.
 * All queries use SQL aggregates for performance — no JS-side filtering of full tables.
 * Used by Today page insight cards and the /insights page.
 */

import { sqlite } from '../db';
import { todayISO, startOfWeek } from '@/lib/utils';

// ----------------------------------------------------------
// Types
// ----------------------------------------------------------

export interface WeeklyInsights {
  // Habits
  habitCompletions: number;
  habitPossible: number;
  habitRate: number; // 0-100
  bestStreak: { name: string; streak: number } | null;

  // Tasks
  tasksCompleted: number;
  tasksCreated: number;
  taskCompletionTrend: 'up' | 'down' | 'flat'; // vs prior week

  // Life Signals
  avgSleep: number | null;
  avgMood: number | null;
  avgEnergy: number | null;
  workoutCount: number;

  // Projects
  activeProjects: number;
  atRiskProjects: number;

  // Engagement
  journalEntries: number;
  weeklyXp: number;
  hasCurrentReview: boolean;
}

export interface MonthlyInsights {
  // Trends (30d)
  habitRate30d: number;
  tasksCompleted30d: number;
  avgSleep30d: number | null;
  avgMood30d: number | null;
  avgEnergy30d: number | null;
  workoutCount30d: number;
  journalEntries30d: number;
  journalAvgWords: number;

  // Cadence
  reviewCount: number;
  notesCreated: number;
  ideasCaptured: number;

  // Projects
  projectSummary: { title: string; status: string; health: string | null; progress: number }[];

  // Goals
  activeGoals: number;
  avgGoalProgress: number;

  // XP
  totalXp30d: number;
  xpByDomain: { domain: string; xp: number }[];

  // Streaks
  topStreaks: { name: string; streak: number }[];
}

export interface HabitHeatmapRow {
  name: string;
  habitId: string;
  days: { date: string; completed: boolean }[];
}

// ----------------------------------------------------------
// Date helpers
// ----------------------------------------------------------

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function weekAgoISO(): string { return daysAgoISO(7); }
function twoWeeksAgoISO(): string { return daysAgoISO(14); }
function monthAgoISO(): string { return daysAgoISO(30); }

// ----------------------------------------------------------
// Weekly Insights (7-day rolling)
// ----------------------------------------------------------

export function getWeeklyInsights(): WeeklyInsights {
  const today = todayISO();
  const weekAgo = weekAgoISO();
  const twoWeeksAgo = twoWeeksAgoISO();

  // Habit completions this week
  const habitStats = sqlite.prepare(`
    SELECT
      COUNT(*) AS completions,
      (SELECT COUNT(*) FROM habits WHERE archived_at IS NULL AND is_paused = 0) AS active_habits
    FROM habit_completions
    WHERE completed_date >= ? AND completed_date <= ?
  `).get(weekAgo, today) as { completions: number; active_habits: number };

  const habitPossible = habitStats.active_habits * 7;
  const habitRate = habitPossible > 0
    ? Math.round((habitStats.completions / habitPossible) * 100)
    : 0;

  // Best current streak
  const bestStreak = sqlite.prepare(`
    SELECT name, current_streak AS streak
    FROM habits
    WHERE archived_at IS NULL AND is_paused = 0 AND current_streak > 0
    ORDER BY current_streak DESC
    LIMIT 1
  `).get() as { name: string; streak: number } | undefined;

  // Tasks completed this week + prior week for trend
  const tasksThisWeek = sqlite.prepare(`
    SELECT COUNT(*) AS cnt FROM tasks
    WHERE status = 'done' AND archived_at IS NULL
      AND SUBSTR(DATETIME(completed_at / 1000, 'unixepoch'), 1, 10) >= ?
      AND SUBSTR(DATETIME(completed_at / 1000, 'unixepoch'), 1, 10) <= ?
  `).get(weekAgo, today) as { cnt: number };

  const tasksPriorWeek = sqlite.prepare(`
    SELECT COUNT(*) AS cnt FROM tasks
    WHERE status = 'done' AND archived_at IS NULL
      AND SUBSTR(DATETIME(completed_at / 1000, 'unixepoch'), 1, 10) >= ?
      AND SUBSTR(DATETIME(completed_at / 1000, 'unixepoch'), 1, 10) < ?
  `).get(twoWeeksAgo, weekAgo) as { cnt: number };

  const tasksCreated = sqlite.prepare(`
    SELECT COUNT(*) AS cnt FROM tasks
    WHERE archived_at IS NULL
      AND SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) >= ?
  `).get(weekAgo) as { cnt: number };

  let taskCompletionTrend: 'up' | 'down' | 'flat' = 'flat';
  if (tasksThisWeek.cnt > tasksPriorWeek.cnt) taskCompletionTrend = 'up';
  else if (tasksThisWeek.cnt < tasksPriorWeek.cnt) taskCompletionTrend = 'down';

  // Life signals (7d averages)
  const signals = sqlite.prepare(`
    SELECT
      AVG(CASE WHEN metric_type = 'sleep' THEN value_numeric END) AS avg_sleep,
      AVG(CASE WHEN metric_type = 'mood' THEN value_numeric END) AS avg_mood,
      AVG(CASE WHEN metric_type = 'energy' THEN value_numeric END) AS avg_energy,
      COUNT(CASE WHEN metric_type = 'workout' THEN 1 END) AS workout_count
    FROM metric_logs
    WHERE logged_date >= ? AND logged_date <= ?
  `).get(weekAgo, today) as {
    avg_sleep: number | null; avg_mood: number | null;
    avg_energy: number | null; workout_count: number;
  };

  // Active projects
  const projectStats = sqlite.prepare(`
    SELECT
      COUNT(*) AS active,
      COUNT(CASE WHEN health = 'at_risk' OR health = 'off_track' THEN 1 END) AS at_risk
    FROM projects
    WHERE status = 'active' AND archived_at IS NULL
  `).get() as { active: number; at_risk: number };

  // Journal entries this week
  const journalCount = sqlite.prepare(`
    SELECT COUNT(*) AS cnt FROM journal_entries
    WHERE entry_date >= ? AND entry_date <= ? AND archived_at IS NULL
  `).get(weekAgo, today) as { cnt: number };

  // XP this week
  const weekStart = new Date(weekAgo + 'T00:00:00').getTime();
  const weekEnd = new Date(today + 'T23:59:59').getTime();
  const xpResult = sqlite.prepare(`
    SELECT COALESCE(SUM(xp_amount), 0) AS total
    FROM xp_events
    WHERE created_at >= ? AND created_at <= ?
  `).get(weekStart, weekEnd) as { total: number };

  // Current week review
  const ws = startOfWeek(new Date());
  const hasReview = sqlite.prepare(`
    SELECT COUNT(*) AS cnt FROM reviews
    WHERE review_type = 'weekly' AND period_start = ?
  `).get(ws) as { cnt: number };

  return {
    habitCompletions: habitStats.completions,
    habitPossible,
    habitRate,
    bestStreak: bestStreak ?? null,
    tasksCompleted: tasksThisWeek.cnt,
    tasksCreated: tasksCreated.cnt,
    taskCompletionTrend,
    avgSleep: signals.avg_sleep ? Math.round(signals.avg_sleep * 10) / 10 : null,
    avgMood: signals.avg_mood ? Math.round(signals.avg_mood * 10) / 10 : null,
    avgEnergy: signals.avg_energy ? Math.round(signals.avg_energy * 10) / 10 : null,
    workoutCount: signals.workout_count,
    activeProjects: projectStats.active,
    atRiskProjects: projectStats.at_risk,
    journalEntries: journalCount.cnt,
    weeklyXp: xpResult.total,
    hasCurrentReview: hasReview.cnt > 0,
  };
}

// ----------------------------------------------------------
// Monthly Insights (30-day rolling)
// ----------------------------------------------------------

export function getMonthlyInsights(): MonthlyInsights {
  const today = todayISO();
  const monthAgo = monthAgoISO();

  // Habit rate (30d)
  const habitStats30 = sqlite.prepare(`
    SELECT
      COUNT(*) AS completions,
      (SELECT COUNT(*) FROM habits WHERE archived_at IS NULL AND is_paused = 0) AS active
    FROM habit_completions
    WHERE completed_date >= ? AND completed_date <= ?
  `).get(monthAgo, today) as { completions: number; active: number };
  const habitPossible30 = habitStats30.active * 30;
  const habitRate30d = habitPossible30 > 0
    ? Math.round((habitStats30.completions / habitPossible30) * 100) : 0;

  // Tasks (30d)
  const tasks30 = sqlite.prepare(`
    SELECT COUNT(*) AS cnt FROM tasks
    WHERE status = 'done' AND archived_at IS NULL
      AND SUBSTR(DATETIME(completed_at / 1000, 'unixepoch'), 1, 10) >= ?
  `).get(monthAgo) as { cnt: number };

  // Metrics (30d)
  const signals30 = sqlite.prepare(`
    SELECT
      AVG(CASE WHEN metric_type = 'sleep' THEN value_numeric END) AS avg_sleep,
      AVG(CASE WHEN metric_type = 'mood' THEN value_numeric END) AS avg_mood,
      AVG(CASE WHEN metric_type = 'energy' THEN value_numeric END) AS avg_energy,
      COUNT(CASE WHEN metric_type = 'workout' THEN 1 END) AS workout_count
    FROM metric_logs
    WHERE logged_date >= ? AND logged_date <= ?
  `).get(monthAgo, today) as {
    avg_sleep: number | null; avg_mood: number | null;
    avg_energy: number | null; workout_count: number;
  };

  // Journal (30d)
  const journal30 = sqlite.prepare(`
    SELECT COUNT(*) AS cnt, COALESCE(AVG(word_count), 0) AS avg_words
    FROM journal_entries
    WHERE entry_date >= ? AND entry_date <= ? AND archived_at IS NULL
  `).get(monthAgo, today) as { cnt: number; avg_words: number };

  // Cadence
  const reviews30 = sqlite.prepare(`
    SELECT COUNT(*) AS cnt FROM reviews WHERE period_end >= ?
  `).get(monthAgo) as { cnt: number };

  const notes30 = sqlite.prepare(`
    SELECT COUNT(*) AS cnt FROM notes
    WHERE archived_at IS NULL
      AND SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) >= ?
  `).get(monthAgo) as { cnt: number };

  const ideas30 = sqlite.prepare(`
    SELECT COUNT(*) AS cnt FROM ideas
    WHERE archived_at IS NULL
      AND SUBSTR(DATETIME(created_at / 1000, 'unixepoch'), 1, 10) >= ?
  `).get(monthAgo) as { cnt: number };

  // Projects
  const projectRows = sqlite.prepare(`
    SELECT title, status, health, progress FROM projects
    WHERE status IN ('active', 'planning') AND archived_at IS NULL
    ORDER BY
      CASE WHEN status = 'active' THEN 0 ELSE 1 END,
      progress DESC
  `).all() as { title: string; status: string; health: string | null; progress: number }[];

  // Goals
  const goalStats = sqlite.prepare(`
    SELECT COUNT(*) AS active, COALESCE(AVG(progress), 0) AS avg_progress
    FROM goals WHERE status = 'active' AND archived_at IS NULL
  `).get() as { active: number; avg_progress: number };

  // XP (30d)
  const monthStart = new Date(monthAgo + 'T00:00:00').getTime();
  const todayEnd = new Date(today + 'T23:59:59').getTime();

  const xp30 = sqlite.prepare(`
    SELECT COALESCE(SUM(xp_amount), 0) AS total FROM xp_events
    WHERE created_at >= ? AND created_at <= ?
  `).get(monthStart, todayEnd) as { total: number };

  const xpByDomain = sqlite.prepare(`
    SELECT domain, SUM(xp_amount) AS xp FROM xp_events
    WHERE created_at >= ? AND created_at <= ?
    GROUP BY domain ORDER BY xp DESC
  `).all(monthStart, todayEnd) as { domain: string; xp: number }[];

  // Streaks
  const topStreaks = sqlite.prepare(`
    SELECT name, current_streak AS streak FROM habits
    WHERE archived_at IS NULL AND is_paused = 0 AND current_streak > 0
    ORDER BY current_streak DESC LIMIT 5
  `).all() as { name: string; streak: number }[];

  return {
    habitRate30d,
    tasksCompleted30d: tasks30.cnt,
    avgSleep30d: signals30.avg_sleep ? Math.round(signals30.avg_sleep * 10) / 10 : null,
    avgMood30d: signals30.avg_mood ? Math.round(signals30.avg_mood * 10) / 10 : null,
    avgEnergy30d: signals30.avg_energy ? Math.round(signals30.avg_energy * 10) / 10 : null,
    workoutCount30d: signals30.workout_count,
    journalEntries30d: journal30.cnt,
    journalAvgWords: Math.round(journal30.avg_words),
    reviewCount: reviews30.cnt,
    notesCreated: notes30.cnt,
    ideasCaptured: ideas30.cnt,
    projectSummary: projectRows,
    activeGoals: goalStats.active,
    avgGoalProgress: Math.round(goalStats.avg_progress),
    totalXp30d: xp30.total,
    xpByDomain,
    topStreaks,
  };
}

// ----------------------------------------------------------
// Habit Heatmap (last N days per active habit)
// ----------------------------------------------------------

export function getHabitHeatmap(days: number = 14): HabitHeatmapRow[] {
  const today = todayISO();
  const startDate = daysAgoISO(days - 1);

  // Get active habits
  const habits = sqlite.prepare(`
    SELECT id, name FROM habits
    WHERE archived_at IS NULL AND is_paused = 0
    ORDER BY name
  `).all() as { id: string; name: string }[];

  // Get all completions in range
  const completions = sqlite.prepare(`
    SELECT habit_id, completed_date FROM habit_completions
    WHERE completed_date >= ? AND completed_date <= ?
  `).all(startDate, today) as { habit_id: string; completed_date: string }[];

  // Build a set for fast lookup
  const completionSet = new Set(
    completions.map(c => `${c.habit_id}:${c.completed_date}`)
  );

  // Generate date range
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(daysAgoISO(i));
  }

  return habits.map(h => ({
    name: h.name,
    habitId: h.id,
    days: dates.map(date => ({
      date,
      completed: completionSet.has(`${h.id}:${date}`),
    })),
  }));
}

// ----------------------------------------------------------
// First-run detection
// ----------------------------------------------------------

export function isFirstRun(): boolean {
  const result = sqlite.prepare(`
    SELECT
      (SELECT COUNT(*) FROM tasks) +
      (SELECT COUNT(*) FROM habits) +
      (SELECT COUNT(*) FROM journal_entries) +
      (SELECT COUNT(*) FROM notes) AS total
  `).get() as { total: number };

  return result.total === 0;
}
