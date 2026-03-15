import { sqlite } from '../db';
import { db } from '../db';
import { tasks, habits, journalEntries, notes, ideas, projects, goals, entities } from '../db/schema';
import { isNull } from 'drizzle-orm';
import type { ItemType } from '@/lib/types';

// ============================================================
// FTS5 Search Index — Single virtual table for all searchable types
// ============================================================

/** Create the FTS5 virtual table if it doesn't exist */
export function ensureSearchIndex() {
  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      item_id,
      item_type,
      title,
      body,
      content='',
      contentless_delete=1,
      tokenize='porter unicode61'
    );
  `);
}

/** Full rebuild of the search index — clears and re-populates from all source tables */
export function rebuildSearchIndex() {
  ensureSearchIndex();

  // Clear existing index
  sqlite.exec(`DELETE FROM search_index;`);

  const insertStmt = sqlite.prepare(
    `INSERT INTO search_index(item_id, item_type, title, body) VALUES (?, ?, ?, ?)`
  );

  const runInsert = sqlite.transaction(() => {
    // Tasks
    const allTasks = db.select().from(tasks).where(isNull(tasks.archivedAt)).all();
    for (const t of allTasks) {
      insertStmt.run(t.id, 'task', t.title, t.body || '');
    }

    // Habits
    const allHabits = db.select().from(habits).where(isNull(habits.archivedAt)).all();
    for (const h of allHabits) {
      insertStmt.run(h.id, 'habit', h.name, [h.description, h.body].filter(Boolean).join(' '));
    }

    // Journal entries
    const allJournal = db.select().from(journalEntries).where(isNull(journalEntries.archivedAt)).all();
    for (const j of allJournal) {
      insertStmt.run(j.id, 'journal', j.title || j.entryDate, j.body || '');
    }

    // Notes
    const allNotes = db.select().from(notes).where(isNull(notes.archivedAt)).all();
    for (const n of allNotes) {
      insertStmt.run(n.id, 'note', n.title, n.body || '');
    }

    // Ideas
    const allIdeas = db.select().from(ideas).where(isNull(ideas.archivedAt)).all();
    for (const i of allIdeas) {
      insertStmt.run(i.id, 'idea', i.title, [i.summary, i.body].filter(Boolean).join(' '));
    }

    // Projects
    const allProjects = db.select().from(projects).where(isNull(projects.archivedAt)).all();
    for (const p of allProjects) {
      insertStmt.run(p.id, 'project', p.title, [p.summary, p.body].filter(Boolean).join(' '));
    }

    // Goals
    const allGoals = db.select().from(goals).where(isNull(goals.archivedAt)).all();
    for (const g of allGoals) {
      insertStmt.run(g.id, 'goal', g.title, [g.description, g.body].filter(Boolean).join(' '));
    }

    // Entities (people, books, courses, etc.)
    const allEntities = db.select().from(entities).where(isNull(entities.archivedAt)).all();
    for (const e of allEntities) {
      insertStmt.run(e.id, 'entity', e.title, [e.entityType, e.body].filter(Boolean).join(' '));
    }
  });

  runInsert();
}

// ============================================================
// Search Query
// ============================================================

export interface SearchResult {
  itemId: string;
  itemType: ItemType;
  title: string;
  snippet: string;
  rank: number;
}

/** Search across all indexed content. Returns ranked results. */
export function searchItems(query: string, typeFilter?: ItemType, limit = 50): SearchResult[] {
  if (!query.trim()) return [];

  ensureSearchIndex();

  // Escape FTS5 special characters and add prefix matching
  const sanitized = query
    .replace(/['"(){}[\]^~*:]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => `"${word}"*`)
    .join(' ');

  if (!sanitized) return [];

  let sql = `
    SELECT
      item_id,
      item_type,
      title,
      snippet(search_index, 3, '<mark>', '</mark>', '...', 48) as snippet,
      rank
    FROM search_index
    WHERE search_index MATCH ?
  `;

  const params: (string | number)[] = [sanitized];

  if (typeFilter) {
    sql += ` AND item_type = ?`;
    params.push(typeFilter);
  }

  sql += ` ORDER BY rank LIMIT ?`;
  params.push(limit);

  try {
    const rows = sqlite.prepare(sql).all(...params) as Array<{
      item_id: string;
      item_type: string;
      title: string;
      snippet: string;
      rank: number;
    }>;

    return rows.map(row => ({
      itemId: row.item_id,
      itemType: row.item_type as ItemType,
      title: row.title,
      snippet: row.snippet || '',
      rank: row.rank,
    }));
  } catch {
    // If FTS5 query fails (e.g., empty index), return empty
    return [];
  }
}

/** Ensure index exists and rebuild on first call. Called at app startup. */
export function initializeSearch() {
  ensureSearchIndex();
  rebuildSearchIndex();
}
