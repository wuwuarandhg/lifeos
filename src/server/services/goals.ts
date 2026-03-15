import { db } from '../db';
import { goals, habits } from '../db/schema';
import { eq, and, isNull, desc, asc } from 'drizzle-orm';
import { newId, now } from '@/lib/utils';
import type { GoalTimeHorizon } from '@/lib/types';

export interface CreateGoalInput {
  title: string;
  description?: string;
  body?: string;
  timeHorizon?: GoalTimeHorizon;
  startDate?: string;
  targetDate?: string;
  outcomeMetric?: string;
  status?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  id: string;
  progress?: number;
}

/** Create a new goal */
export function createGoal(input: CreateGoalInput) {
  const id = newId();
  const timestamp = now();

  db.insert(goals).values({
    id,
    title: input.title,
    description: input.description ?? null,
    body: input.body ?? null,
    timeHorizon: input.timeHorizon ?? 'quarterly',
    startDate: input.startDate ?? null,
    targetDate: input.targetDate ?? null,
    outcomeMetric: input.outcomeMetric ?? null,
    status: (input.status as 'active' | 'achieved' | 'abandoned' | 'paused') ?? 'active',
    progress: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  }).run();

  return getGoal(id);
}

/** Get a single goal */
export function getGoal(id: string) {
  return db.select().from(goals).where(eq(goals.id, id)).get();
}

/** Update a goal */
export function updateGoal(input: UpdateGoalInput) {
  const updates: Record<string, unknown> = { updatedAt: now() };

  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.body !== undefined) updates.body = input.body;
  if (input.timeHorizon !== undefined) updates.timeHorizon = input.timeHorizon;
  if (input.startDate !== undefined) updates.startDate = input.startDate;
  if (input.targetDate !== undefined) updates.targetDate = input.targetDate;
  if (input.outcomeMetric !== undefined) updates.outcomeMetric = input.outcomeMetric;
  if (input.status !== undefined) updates.status = input.status;
  if (input.progress !== undefined) updates.progress = Math.max(0, Math.min(100, input.progress));

  db.update(goals).set(updates).where(eq(goals.id, input.id)).run();
  return getGoal(input.id);
}

/** Get all goals (not archived) */
export function getAllGoals() {
  return db
    .select()
    .from(goals)
    .where(isNull(goals.archivedAt))
    .orderBy(asc(goals.createdAt))
    .all();
}

/** Get goals by time horizon */
export function getGoalsByHorizon(horizon: GoalTimeHorizon) {
  return db
    .select()
    .from(goals)
    .where(and(isNull(goals.archivedAt), eq(goals.timeHorizon, horizon)))
    .orderBy(desc(goals.updatedAt))
    .all();
}

/** Get habits linked to a goal */
export function getGoalHabits(goalId: string) {
  return db
    .select()
    .from(habits)
    .where(and(eq(habits.goalId, goalId), isNull(habits.archivedAt)))
    .orderBy(asc(habits.createdAt))
    .all();
}

/** Archive a goal */
export function archiveGoal(id: string) {
  db.update(goals)
    .set({ archivedAt: now(), updatedAt: now() })
    .where(eq(goals.id, id))
    .run();
}
