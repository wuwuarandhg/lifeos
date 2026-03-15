// ============================================================
// lifeOS — Shared TypeScript Types
// ============================================================

/** All domain object types in the system */
export type ItemType =
  | 'task'
  | 'habit'
  | 'journal'
  | 'note'
  | 'idea'
  | 'project'
  | 'goal'
  | 'metric'
  | 'entity'
  | 'event'
  | 'review'
  | 'inbox';

/** Global app mode */
export type AppMode = 'quick' | 'deep';

/** Task status */
export type TaskStatus = 'inbox' | 'todo' | 'in_progress' | 'done' | 'cancelled';

/** Task priority */
export type TaskPriority = 'p1' | 'p2' | 'p3' | 'p4';

/** Habit cadence */
export type HabitCadence = 'daily' | 'weekly' | 'custom';

/** Life domain categories — used for gamification and grouping */
export type LifeDomain =
  | 'health'
  | 'productivity'
  | 'learning'
  | 'relationships'
  | 'finance'
  | 'creativity'
  | 'reflection';

/** Project status */
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';

/** Project health */
export type ProjectHealth = 'on_track' | 'at_risk' | 'off_track';

/** Goal time horizon */
export type GoalTimeHorizon = 'quarterly' | 'yearly' | 'multi_year' | 'life';

/** Metric log types */
export type MetricType =
  | 'sleep'
  | 'mood'
  | 'energy'
  | 'workout'
  | 'symptom'
  | 'expense'
  | 'focus_session'
  | 'body_metric'
  | 'custom';

/** Entity types */
export type EntityType =
  | 'person'
  | 'book'
  | 'article'
  | 'course'
  | 'place'
  | 'symptom'
  | 'routine'
  | 'tool'
  | 'medication'
  | 'topic';

/** Relation types */
export type RelationType =
  | 'belongs_to'
  | 'mentions'
  | 'supports'
  | 'related_to'
  | 'blocks'
  | 'derived_from'
  | 'summarizes'
  | 'affects';

/** Review types */
export type ReviewType = 'daily' | 'weekly' | 'monthly' | 'yearly';

/** Navigation section definition */
export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

/** Quick capture parsed result */
export interface CaptureParseResult {
  suggestedType: ItemType;
  title: string;
  metadata: Record<string, unknown>;
  confidence: number;
}

// ============================================================
// Graph & Timeline Visualization Types
// ============================================================

/** A node in the graph explorer */
export interface GraphNode {
  id: string;
  type: ItemType;
  title: string;
  subtitle?: string;
  status?: string;
  date?: string;
  detailUrl: string;
  x: number;
  y: number;
}

/** An edge in the graph explorer */
export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  edgeType: 'relation' | 'structural' | 'tag';
}

/** Filter options for the graph */
export interface GraphFilters {
  types: ItemType[];
  tagId?: string;
  focalNodeType?: ItemType;
  focalNodeId?: string;
  maxNodes?: number;
  includeTagEdges?: boolean;
}

/** An item in the timeline feed */
export interface TimelineItem {
  id: string;
  type: ItemType;
  title: string;
  subtitle?: string;
  date: string;
  time?: string;
  icon: string;
  detailUrl: string;
  metadata?: Record<string, string | number>;
}

/** Filter options for the timeline */
export interface TimelineFilters {
  types?: ItemType[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
