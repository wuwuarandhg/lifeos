/**
 * lifeOS — Gamification Service
 *
 * XP recording, profile management, and level calculation.
 * Idempotent: same (sourceType, sourceId, reason) won't duplicate XP.
 * Anti-shame: no punishment for missed days, no XP reversal on undo.
 */

import { db } from '../db';
import { gamificationProfile, xpEvents } from '../db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { newId, now } from '@/lib/utils';
import { calculateLevel, XP_REWARDS } from '@/lib/constants';
import type { LifeDomain } from '@/lib/types';

// ============================================================
// Profile Management
// ============================================================

/** Get or create the singleton gamification profile */
export function getProfile() {
  let profile = db.select().from(gamificationProfile)
    .where(eq(gamificationProfile.id, 'default'))
    .get();

  if (!profile) {
    db.insert(gamificationProfile).values({
      id: 'default',
      totalXp: 0,
      level: 1,
      healthXp: 0,
      productivityXp: 0,
      learningXp: 0,
      relationshipsXp: 0,
      financeXp: 0,
      creativityXp: 0,
      reflectionXp: 0,
      updatedAt: now(),
    }).run();
    profile = db.select().from(gamificationProfile)
      .where(eq(gamificationProfile.id, 'default'))
      .get();
  }

  return profile!;
}

// ============================================================
// XP Award — Idempotent
// ============================================================

/**
 * Award XP for an action. Returns the XP event if newly created, null if duplicate.
 * Idempotency: checks (sourceType, sourceId, reason) uniqueness.
 */
export function awardXP(
  sourceType: string,
  sourceId: string,
  reason: string,
  domain: LifeDomain,
  amount: number,
): { xpEvent: typeof xpEvents.$inferSelect; leveledUp: boolean } | null {
  // Check for duplicate
  const existing = db.select().from(xpEvents)
    .where(
      and(
        eq(xpEvents.sourceType, sourceType),
        eq(xpEvents.sourceId, sourceId),
        eq(xpEvents.reason, reason),
      )
    )
    .get();

  if (existing) return null;

  // Create XP event
  const id = newId();
  const timestamp = now();
  db.insert(xpEvents).values({
    id,
    xpAmount: amount,
    domain,
    sourceType,
    sourceId,
    reason,
    createdAt: timestamp,
  }).run();

  // Update profile
  const profile = getProfile();
  const oldLevel = profile.level ?? 1;
  const newTotalXp = (profile.totalXp ?? 0) + amount;
  const newLevel = calculateLevel(newTotalXp);

  // Build domain update
  const domainField = `${domain}Xp` as keyof typeof profile;
  const domainUpdate: Record<string, number> = {};
  domainUpdate[`${domain}Xp`] = ((profile[domainField] as number) ?? 0) + amount;

  db.update(gamificationProfile)
    .set({
      totalXp: newTotalXp,
      level: newLevel,
      ...domainUpdate,
      updatedAt: timestamp,
    })
    .where(eq(gamificationProfile.id, 'default'))
    .run();

  const event = db.select().from(xpEvents).where(eq(xpEvents.id, id)).get()!;
  return { xpEvent: event, leveledUp: newLevel > oldLevel };
}

// ============================================================
// Query Helpers
// ============================================================

/** Get recent XP events for display */
export function getRecentXpEvents(limit = 10) {
  return db.select().from(xpEvents)
    .orderBy(desc(xpEvents.createdAt))
    .limit(limit)
    .all();
}

/** Get total XP earned in a date range */
export function getXpInRange(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00').getTime();
  const end = new Date(endDate + 'T23:59:59').getTime();

  const events = db.select().from(xpEvents)
    .where(
      and(
        gte(xpEvents.createdAt, start),
        lte(xpEvents.createdAt, end),
      )
    )
    .all();

  return events.reduce((sum, e) => sum + e.xpAmount, 0);
}

// ============================================================
// Convenience: Award XP for common actions
// ============================================================

export function awardTaskCompleteXP(taskId: string, priority?: string | null) {
  let amount = XP_REWARDS.TASK_COMPLETE_BASE;
  if (priority === 'p1') amount += XP_REWARDS.TASK_P1_BONUS;
  else if (priority === 'p2') amount += XP_REWARDS.TASK_P2_BONUS;

  return awardXP('task', taskId, 'complete', 'productivity', amount);
}

export function awardHabitCompleteXP(habitId: string, domain?: string | null, difficulty?: string | null) {
  let amount = XP_REWARDS.HABIT_COMPLETE;
  if (difficulty === 'hard') amount = Math.round(amount * XP_REWARDS.HABIT_HARD_MULTIPLIER);

  const xpDomain = (domain as LifeDomain) || 'productivity';
  return awardXP('habit', `${habitId}`, 'complete_today', xpDomain, amount);
}

export function awardJournalXP(entryId: string, wordCount: number) {
  let amount = XP_REWARDS.JOURNAL_ENTRY;
  if (wordCount > 200) amount += XP_REWARDS.JOURNAL_LONG_BONUS;

  return awardXP('journal', entryId, 'create', 'reflection', amount);
}

export function awardMetricLogXP(metricId: string, metricType: string) {
  const domain: LifeDomain = metricType === 'expense' ? 'finance' : 'health';
  return awardXP('metric', metricId, 'log', domain, 5);
}

export function awardReviewXP(reviewId: string) {
  return awardXP('review', reviewId, 'generate', 'reflection', XP_REWARDS.REVIEW_COMPLETE);
}

export function awardIdeaXP(ideaId: string) {
  return awardXP('idea', ideaId, 'capture', 'creativity', XP_REWARDS.IDEA_CAPTURE);
}

export function awardEntityXP(entityId: string, entityType: string) {
  const domain: LifeDomain = entityType === 'person' ? 'relationships' : 'learning';
  return awardXP('entity', entityId, 'create', domain, XP_REWARDS.NOTE_CREATE);
}
