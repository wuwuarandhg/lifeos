/**
 * lifeOS — Reviews Service
 *
 * CRUD operations + weekly review generation from aggregated app data.
 * Reviews are generated once as drafts, then freely editable.
 */

import { db } from '../db';
import { reviews } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { newId, now } from '@/lib/utils';
import { buildWeeklySnapshot, type WeeklySnapshot } from './aggregation';
import type { ReviewType } from '@/lib/types';

// ============================================================
// CRUD
// ============================================================

export function getReview(id: string) {
  return db.select().from(reviews).where(eq(reviews.id, id)).get();
}

export function getAllReviews() {
  return db.select().from(reviews)
    .orderBy(desc(reviews.periodStart))
    .all();
}

export function getReviewsByType(type: ReviewType) {
  return db.select().from(reviews)
    .where(eq(reviews.reviewType, type))
    .orderBy(desc(reviews.periodStart))
    .all();
}

/** Find the canonical review for a given period */
export function getReviewForPeriod(type: ReviewType, periodStart: string, periodEnd: string) {
  return db.select().from(reviews)
    .where(
      and(
        eq(reviews.reviewType, type),
        eq(reviews.periodStart, periodStart),
        eq(reviews.periodEnd, periodEnd),
      )
    )
    .get();
}

export function updateReviewBody(id: string, body: string) {
  db.update(reviews)
    .set({ body, updatedAt: now() })
    .where(eq(reviews.id, id))
    .run();
  return getReview(id);
}

export function publishReview(id: string) {
  db.update(reviews)
    .set({ isPublished: 1, updatedAt: now() })
    .where(eq(reviews.id, id))
    .run();
  return getReview(id);
}

export function deleteReview(id: string) {
  db.delete(reviews).where(eq(reviews.id, id)).run();
}

// ============================================================
// Weekly Review Generation
// ============================================================

/** Render a WeeklySnapshot into readable markdown */
function renderWeeklyMarkdown(snapshot: WeeklySnapshot): string {
  const lines: string[] = [];

  lines.push(`## Week of ${formatPeriod(snapshot.periodStart)} — ${formatPeriod(snapshot.periodEnd)}`);
  lines.push('');

  // Wins
  if (snapshot.wins.length > 0) {
    lines.push('### 🏆 Wins');
    for (const w of snapshot.wins) lines.push(`- ${w}`);
    lines.push('');
  }

  // Blockers
  if (snapshot.blockers.length > 0) {
    lines.push('### 🚧 Blockers');
    for (const b of snapshot.blockers) lines.push(`- ${b}`);
    lines.push('');
  }

  // Tasks
  lines.push('### ✅ Tasks');
  lines.push(`- **${snapshot.tasks.completed}** completed, **${snapshot.tasks.created}** created`);
  if (snapshot.tasks.overdue > 0) {
    lines.push(`- ${snapshot.tasks.overdue} overdue`);
  }
  if (snapshot.tasks.completedTitles.length > 0) {
    lines.push('- Completed:');
    for (const t of snapshot.tasks.completedTitles.slice(0, 5)) {
      lines.push(`  - ${t}`);
    }
  }
  lines.push('');

  // Habits
  lines.push('### 🔁 Habits');
  lines.push(`- Overall completion: **${snapshot.habits.completionRate}%** (${snapshot.habits.totalCompletions}/${snapshot.habits.possibleCompletions})`);
  if (snapshot.habits.bestStreaks.length > 0) {
    for (const s of snapshot.habits.bestStreaks) {
      lines.push(`- 🔥 ${s.name}: ${s.streak}-day streak`);
    }
  }
  for (const h of snapshot.habits.byHabit) {
    lines.push(`- ${h.name}: ${h.completions}/${h.possible} (${h.rate}%)`);
  }
  lines.push('');

  // Metrics
  lines.push('### 📊 Life Signals');
  if (snapshot.metrics.sleepAvg !== null) {
    const trendIcon = snapshot.metrics.moodTrend === 'up' ? '↑' : snapshot.metrics.moodTrend === 'down' ? '↓' : '';
    lines.push(`- Sleep: avg **${snapshot.metrics.sleepAvg}h** (${snapshot.metrics.sleepCount} logs)`);
  }
  if (snapshot.metrics.moodAvg !== null) {
    const trendIcon = snapshot.metrics.moodTrend === 'up' ? ' ↑' : snapshot.metrics.moodTrend === 'down' ? ' ↓' : '';
    lines.push(`- Mood: avg **${snapshot.metrics.moodAvg}/10**${trendIcon} (${snapshot.metrics.moodCount} logs)`);
  }
  if (snapshot.metrics.energyAvg !== null) {
    const trendIcon = snapshot.metrics.energyTrend === 'up' ? ' ↑' : snapshot.metrics.energyTrend === 'down' ? ' ↓' : '';
    lines.push(`- Energy: avg **${snapshot.metrics.energyAvg}/10**${trendIcon} (${snapshot.metrics.energyCount} logs)`);
  }
  if (snapshot.metrics.workoutCount > 0) {
    lines.push(`- Workouts: **${snapshot.metrics.workoutCount}** (${snapshot.metrics.workoutMinutes} min total)`);
  }
  if (snapshot.metrics.expenseCount > 0) {
    lines.push(`- Expenses: **$${snapshot.metrics.expenseTotal.toFixed(2)}** across ${snapshot.metrics.expenseCount} entries`);
  }
  lines.push('');

  // Journal
  if (snapshot.journal.entryCount > 0) {
    lines.push('### 📝 Journal');
    lines.push(`- ${snapshot.journal.entryCount} entries, ${snapshot.journal.totalWords} words`);
    if (snapshot.journal.highlights.length > 0) {
      lines.push('- Highlights:');
      for (const h of snapshot.journal.highlights) {
        const label = h.title || h.date;
        lines.push(`  - **${label}**: ${h.snippet}`);
      }
    }
    lines.push('');
  }

  // Projects
  if (snapshot.projects.progressed.length > 0) {
    lines.push('### 📁 Projects');
    for (const p of snapshot.projects.progressed) {
      const health = p.health ? ` (${p.health.replace('_', ' ')})` : '';
      lines.push(`- **${p.title}**: ${p.status}${health} — ${p.progress ?? 0}% complete`);
    }
    lines.push('');
  }

  // Goals
  if (snapshot.goals.activeCount > 0) {
    lines.push('### 🎯 Goals');
    for (const g of snapshot.goals.goals) {
      lines.push(`- ${g.title}: ${g.progress ?? 0}%`);
    }
    lines.push('');
  }

  // Ideas
  if (snapshot.ideas.capturedCount > 0) {
    lines.push('### 💡 Ideas Captured');
    for (const t of snapshot.ideas.titles) {
      lines.push(`- ${t}`);
    }
    lines.push('');
  }

  // Focus
  if (snapshot.focusAreas.length > 0) {
    lines.push('### 🔮 Next Week Focus');
    for (const f of snapshot.focusAreas) lines.push(`- ${f}`);
    lines.push('');
  }

  // Editable section
  lines.push('### ✏️ Personal Notes');
  lines.push('');
  lines.push('_Add your own reflections here..._');
  lines.push('');

  return lines.join('\n');
}

function formatPeriod(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Generate a weekly review for the week starting at `weekStart` (ISO Monday).
 * Returns existing review if one already exists for this period.
 * Returns { review, isNew } to indicate whether it was freshly generated.
 */
export function generateWeeklyReview(weekStart: string) {
  // Calculate week end (Sunday)
  const startDate = new Date(weekStart + 'T00:00:00');
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  const weekEnd = endDate.toISOString().split('T')[0];

  // Check for existing review
  const existing = getReviewForPeriod('weekly', weekStart, weekEnd);
  if (existing) {
    return { review: existing, isNew: false };
  }

  // Build snapshot and markdown
  const snapshot = buildWeeklySnapshot(weekStart, weekEnd);
  const body = renderWeeklyMarkdown(snapshot);
  const timestamp = now();

  const id = newId();
  db.insert(reviews).values({
    id,
    reviewType: 'weekly',
    periodStart: weekStart,
    periodEnd: weekEnd,
    body,
    generatedAt: timestamp,
    statsSnapshot: JSON.stringify(snapshot),
    isPublished: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  }).run();

  return { review: getReview(id)!, isNew: true };
}

/**
 * Regenerate the markdown body for an existing review.
 * Overwrites body and updates generatedAt. Use with caution after edits.
 */
export function regenerateReview(id: string) {
  const review = getReview(id);
  if (!review) return null;

  const snapshot = buildWeeklySnapshot(review.periodStart, review.periodEnd);
  const body = renderWeeklyMarkdown(snapshot);
  const timestamp = now();

  db.update(reviews)
    .set({
      body,
      statsSnapshot: JSON.stringify(snapshot),
      generatedAt: timestamp,
      updatedAt: timestamp,
    })
    .where(eq(reviews.id, id))
    .run();

  return getReview(id);
}
