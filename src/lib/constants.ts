/** App-wide constants */

export const APP_NAME = 'lifeOS';

export const PRIORITY_LABELS: Record<string, string> = {
  p1: 'Urgent',
  p2: 'High',
  p3: 'Medium',
  p4: 'Low',
};

export const PRIORITY_COLORS: Record<string, string> = {
  p1: 'text-red-600',
  p2: 'text-orange-500',
  p3: 'text-blue-500',
  p4: 'text-text-tertiary',
};

export const STATUS_LABELS: Record<string, string> = {
  inbox: 'Inbox',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const DOMAIN_LABELS: Record<string, string> = {
  health: 'Health',
  productivity: 'Productivity',
  learning: 'Learning',
  relationships: 'Relationships',
  finance: 'Finance',
  creativity: 'Creativity',
  reflection: 'Reflection',
};

export const DOMAIN_ICONS: Record<string, string> = {
  health: '❤️',
  productivity: '⚡',
  learning: '📚',
  relationships: '👥',
  finance: '💰',
  creativity: '🎨',
  reflection: '🪞',
};

export const MOOD_LABELS: Record<number, string> = {
  1: 'Terrible',
  2: 'Very Bad',
  3: 'Bad',
  4: 'Below Average',
  5: 'Neutral',
  6: 'Okay',
  7: 'Good',
  8: 'Great',
  9: 'Excellent',
  10: 'Perfect',
};

/** XP rewards per action */
export const XP_REWARDS = {
  TASK_COMPLETE_BASE: 10,
  TASK_P1_BONUS: 30,
  TASK_P2_BONUS: 15,
  TASK_LARGE_EFFORT_BONUS: 20,
  HABIT_COMPLETE: 15,
  HABIT_HARD_MULTIPLIER: 2.0,
  JOURNAL_ENTRY: 20,
  JOURNAL_LONG_BONUS: 10, // > 200 words
  REVIEW_COMPLETE: 50,
  IDEA_CAPTURE: 5,
  NOTE_CREATE: 5,
  STREAK_7: 50,
  STREAK_14: 100,
  STREAK_30: 200,
  STREAK_60: 400,
  STREAK_90: 600,
  STREAK_180: 1000,
  STREAK_365: 2000,
};

/** Level calculation: level = floor(sqrt(totalXP / 100)) + 1 */
export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

/** XP needed for next level */
export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

// ============================================================
// METRIC CONSTANTS
// ============================================================

export const METRIC_TYPE_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  mood: 'Mood',
  energy: 'Energy',
  workout: 'Workout',
  symptom: 'Symptom',
  expense: 'Expense',
  focus_session: 'Focus Session',
  body_metric: 'Body Metric',
  custom: 'Custom',
};

export const METRIC_TYPE_ICONS: Record<string, string> = {
  sleep: '🛌',
  mood: '😊',
  energy: '⚡',
  workout: '🏋️',
  symptom: '🩺',
  expense: '💸',
  focus_session: '🎯',
  body_metric: '📏',
  custom: '📊',
};

export const METRIC_TYPE_UNITS: Record<string, string> = {
  sleep: 'hours',
  mood: 'score',
  energy: 'score',
  workout: 'minutes',
  expense: '$',
  focus_session: 'minutes',
  body_metric: '',
  symptom: '',
  custom: '',
};

export const ENERGY_LABELS: Record<number, string> = {
  1: 'Exhausted',
  2: 'Very Low',
  3: 'Low',
  4: 'Below Average',
  5: 'Neutral',
  6: 'Decent',
  7: 'Good',
  8: 'High',
  9: 'Very High',
  10: 'Peak',
};

export const WORKOUT_TYPES = [
  'Run', 'Gym', 'Yoga', 'Walk', 'Cycling', 'Swimming', 'HIIT', 'Sports', 'Stretching', 'Other',
];

export const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other',
];
