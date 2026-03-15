import { db } from '../db';
import { metricLogs } from '../db/schema';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import { newId, now, todayISO } from '@/lib/utils';
import type { MetricType } from '@/lib/types';

// ============================================================
// Input Types
// ============================================================

export interface CreateMetricInput {
  metricType: MetricType;
  valueNumeric?: number;
  valueText?: string;
  unit?: string;
  loggedDate?: string;
  note?: string;
  journalId?: string;
  habitId?: string;
}

export interface UpdateMetricInput extends Partial<CreateMetricInput> {
  id: string;
}

// ============================================================
// CRUD Operations
// ============================================================

/** Create a new metric log */
export function createMetric(input: CreateMetricInput) {
  const id = newId();
  const timestamp = now();
  const loggedDate = input.loggedDate || todayISO();

  db.insert(metricLogs).values({
    id,
    metricType: input.metricType,
    valueNumeric: input.valueNumeric ?? null,
    valueText: input.valueText ?? null,
    unit: input.unit ?? null,
    loggedAt: timestamp,
    loggedDate,
    note: input.note ?? null,
    journalId: input.journalId ?? null,
    habitId: input.habitId ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }).run();

  return getMetric(id);
}

/** Get a single metric by ID */
export function getMetric(id: string) {
  return db.select().from(metricLogs).where(eq(metricLogs.id, id)).get();
}

/** Update a metric */
export function updateMetric(input: UpdateMetricInput) {
  const updates: Record<string, unknown> = { updatedAt: now() };

  if (input.metricType !== undefined) updates.metricType = input.metricType;
  if (input.valueNumeric !== undefined) updates.valueNumeric = input.valueNumeric;
  if (input.valueText !== undefined) updates.valueText = input.valueText;
  if (input.unit !== undefined) updates.unit = input.unit;
  if (input.loggedDate !== undefined) updates.loggedDate = input.loggedDate;
  if (input.note !== undefined) updates.note = input.note;

  db.update(metricLogs).set(updates).where(eq(metricLogs.id, input.id)).run();
  return getMetric(input.id);
}

/** Delete a metric log */
export function deleteMetric(id: string) {
  db.delete(metricLogs).where(eq(metricLogs.id, id)).run();
}

// ============================================================
// Query Operations
// ============================================================

/** Get all metrics, optionally filtered by type, ordered by date desc */
export function getAllMetrics(metricType?: MetricType) {
  if (metricType) {
    return db
      .select()
      .from(metricLogs)
      .where(eq(metricLogs.metricType, metricType))
      .orderBy(desc(metricLogs.loggedDate), desc(metricLogs.createdAt))
      .all();
  }
  return db
    .select()
    .from(metricLogs)
    .orderBy(desc(metricLogs.loggedDate), desc(metricLogs.createdAt))
    .all();
}

/** Get metrics for a specific date */
export function getMetricsByDate(date: string) {
  return db
    .select()
    .from(metricLogs)
    .where(eq(metricLogs.loggedDate, date))
    .orderBy(asc(metricLogs.createdAt))
    .all();
}

/** Get today's metrics */
export function getTodayMetrics() {
  return getMetricsByDate(todayISO());
}

/** Get metrics for a specific type on a specific date */
export function getMetricByTypeAndDate(metricType: MetricType, date: string) {
  return db
    .select()
    .from(metricLogs)
    .where(
      and(
        eq(metricLogs.metricType, metricType),
        eq(metricLogs.loggedDate, date)
      )
    )
    .get();
}

/** Get recent metrics, limited count */
export function getRecentMetrics(limit = 20) {
  return db
    .select()
    .from(metricLogs)
    .orderBy(desc(metricLogs.loggedDate), desc(metricLogs.createdAt))
    .limit(limit)
    .all();
}

/** Get metrics by multiple types (for Health/Finance filter views) */
export function getMetricsByTypes(types: MetricType[]) {
  return db
    .select()
    .from(metricLogs)
    .where(inArray(metricLogs.metricType, types))
    .orderBy(desc(metricLogs.loggedDate), desc(metricLogs.createdAt))
    .all();
}
