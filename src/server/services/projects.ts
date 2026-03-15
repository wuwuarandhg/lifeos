import { db } from '../db';
import { projects, tasks } from '../db/schema';
import { eq, and, isNull, desc, asc } from 'drizzle-orm';
import { newId, now } from '@/lib/utils';
import type { ProjectStatus, ProjectHealth } from '@/lib/types';

export interface CreateProjectInput {
  title: string;
  summary?: string;
  body?: string;
  status?: ProjectStatus;
  health?: ProjectHealth;
  startDate?: string;
  targetDate?: string;
  reviewCadence?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
  progress?: number;
  endDate?: string;
}

/** Create a new project */
export function createProject(input: CreateProjectInput) {
  const id = newId();
  const timestamp = now();

  db.insert(projects).values({
    id,
    title: input.title,
    summary: input.summary ?? null,
    body: input.body ?? null,
    status: input.status ?? 'planning',
    health: input.health ?? null,
    startDate: input.startDate ?? null,
    targetDate: input.targetDate ?? null,
    endDate: null,
    progress: 0,
    reviewCadence: (input.reviewCadence as 'weekly' | 'biweekly' | 'monthly') ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }).run();

  return getProject(id);
}

/** Get a single project */
export function getProject(id: string) {
  return db.select().from(projects).where(eq(projects.id, id)).get();
}

/** Update a project */
export function updateProject(input: UpdateProjectInput) {
  const updates: Record<string, unknown> = { updatedAt: now() };

  if (input.title !== undefined) updates.title = input.title;
  if (input.summary !== undefined) updates.summary = input.summary;
  if (input.body !== undefined) updates.body = input.body;
  if (input.status !== undefined) {
    updates.status = input.status;
    // Auto-set endDate when completing
    if (input.status === 'completed' || input.status === 'cancelled') {
      updates.endDate = new Date().toISOString().split('T')[0];
    }
  }
  if (input.health !== undefined) updates.health = input.health;
  if (input.startDate !== undefined) updates.startDate = input.startDate;
  if (input.targetDate !== undefined) updates.targetDate = input.targetDate;
  if (input.endDate !== undefined) updates.endDate = input.endDate;
  if (input.progress !== undefined) updates.progress = Math.max(0, Math.min(100, input.progress));
  if (input.reviewCadence !== undefined) updates.reviewCadence = input.reviewCadence;

  db.update(projects).set(updates).where(eq(projects.id, input.id)).run();
  return getProject(input.id);
}

/** Get all active projects (not archived) */
export function getAllProjects() {
  return db
    .select()
    .from(projects)
    .where(isNull(projects.archivedAt))
    .orderBy(asc(projects.createdAt))
    .all();
}

/** Get projects grouped by status */
export function getProjectsByStatus(status: ProjectStatus) {
  return db
    .select()
    .from(projects)
    .where(and(isNull(projects.archivedAt), eq(projects.status, status)))
    .orderBy(desc(projects.updatedAt))
    .all();
}

/** Get tasks belonging to a project */
export function getProjectTasks(projectId: string) {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), isNull(tasks.archivedAt)))
    .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt))
    .all();
}

/** Recalculate project progress from task completion */
export function recalculateProjectProgress(projectId: string) {
  const projectTasks = getProjectTasks(projectId);
  if (projectTasks.length === 0) return;

  const doneTasks = projectTasks.filter(t => t.status === 'done').length;
  const progress = Math.round((doneTasks / projectTasks.length) * 100);

  db.update(projects)
    .set({ progress, updatedAt: now() })
    .where(eq(projects.id, projectId))
    .run();
}

/** Archive a project */
export function archiveProject(id: string) {
  db.update(projects)
    .set({ archivedAt: now(), updatedAt: now() })
    .where(eq(projects.id, id))
    .run();
}
