import { db } from '../db';
import { tasks } from '../db/schema';
import { eq, and, isNull, desc, asc, lte, or } from 'drizzle-orm';
import { newId, now, todayISO } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '@/lib/types';

export interface CreateTaskInput {
  title: string;
  body?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  scheduledDate?: string;
  projectId?: string;
  parentTaskId?: string;
  effortEstimate?: string;
  energyRequired?: string;
  context?: string;
  source?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
}

/** Create a new task */
export function createTask(input: CreateTaskInput) {
  const id = newId();
  const timestamp = now();

  db.insert(tasks).values({
    id,
    title: input.title,
    body: input.body ?? null,
    status: input.status ?? 'todo',
    priority: input.priority ?? null,
    dueDate: input.dueDate ?? null,
    scheduledDate: input.scheduledDate ?? null,
    projectId: input.projectId ?? null,
    parentTaskId: input.parentTaskId ?? null,
    effortEstimate: input.effortEstimate ?? null,
    energyRequired: input.energyRequired ?? null,
    context: input.context ?? null,
    source: (input.source as 'manual' | 'inbox' | 'recurrence' | 'review') ?? 'manual',
    sortOrder: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  } as typeof tasks.$inferInsert).run();

  return getTask(id);
}

/** Get a single task by ID */
export function getTask(id: string) {
  return db.select().from(tasks).where(eq(tasks.id, id)).get();
}

/** Update a task */
export function updateTask(input: UpdateTaskInput) {
  const updates: Record<string, unknown> = { updatedAt: now() };

  if (input.title !== undefined) updates.title = input.title;
  if (input.body !== undefined) updates.body = input.body;
  if (input.status !== undefined) {
    updates.status = input.status;
    if (input.status === 'done') {
      updates.completedAt = now();
    } else {
      updates.completedAt = null;
    }
  }
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.dueDate !== undefined) updates.dueDate = input.dueDate;
  if (input.scheduledDate !== undefined) updates.scheduledDate = input.scheduledDate;
  if (input.projectId !== undefined) updates.projectId = input.projectId;
  if (input.effortEstimate !== undefined) updates.effortEstimate = input.effortEstimate;
  if (input.energyRequired !== undefined) updates.energyRequired = input.energyRequired;
  if (input.context !== undefined) updates.context = input.context;

  db.update(tasks).set(updates).where(eq(tasks.id, input.id)).run();
  return getTask(input.id);
}

/** Toggle task completion status */
export function toggleTask(id: string) {
  const task = getTask(id);
  if (!task) return null;

  const newStatus = task.status === 'done' ? 'todo' : 'done';
  return updateTask({ id, status: newStatus as TaskStatus });
}

/** Delete (archive) a task */
export function archiveTask(id: string) {
  db.update(tasks)
    .set({ archivedAt: now(), updatedAt: now() })
    .where(eq(tasks.id, id))
    .run();
}

/** Get tasks for today — due today, scheduled today, or overdue */
export function getTodayTasks() {
  const today = todayISO();
  return db
    .select()
    .from(tasks)
    .where(
      and(
        isNull(tasks.archivedAt),
        or(
          eq(tasks.status, 'todo'),
          eq(tasks.status, 'in_progress')
        ),
        or(
          eq(tasks.dueDate, today),
          eq(tasks.scheduledDate, today),
          lte(tasks.dueDate, today) // overdue
        )
      )
    )
    .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt))
    .all();
}

/** Get all active tasks (not archived, not done) */
export function getActiveTasks() {
  return db
    .select()
    .from(tasks)
    .where(
      and(
        isNull(tasks.archivedAt),
        or(
          eq(tasks.status, 'todo'),
          eq(tasks.status, 'in_progress'),
          eq(tasks.status, 'inbox')
        )
      )
    )
    .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt))
    .all();
}

/** Get all tasks with optional status filter */
export function getAllTasks(status?: TaskStatus) {
  if (status) {
    return db
      .select()
      .from(tasks)
      .where(and(isNull(tasks.archivedAt), eq(tasks.status, status)))
      .orderBy(desc(tasks.createdAt))
      .all();
  }
  return db
    .select()
    .from(tasks)
    .where(isNull(tasks.archivedAt))
    .orderBy(desc(tasks.createdAt))
    .all();
}

/** Get completed tasks */
export function getCompletedTasks(limit = 50) {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.status, 'done'))
    .orderBy(desc(tasks.completedAt))
    .limit(limit)
    .all();
}
