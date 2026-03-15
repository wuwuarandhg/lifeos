import { db } from '../db';
import { inboxItems } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { newId, now } from '@/lib/utils';
import type { ItemType, CaptureParseResult } from '@/lib/types';

/** Parse raw capture text into a suggested type */
export function parseCapture(text: string): CaptureParseResult {
  const lower = text.toLowerCase().trim();

  // Command prefix parsing
  const prefixes: [string[], ItemType, number][] = [
    [['task:', 'todo:', 'do:'], 'task', 0.9],
    [['idea:', 'idea -'], 'idea', 0.9],
    [['note:', 'note -'], 'note', 0.9],
    [['journal:', 'j:', 'reflect:'], 'journal', 0.9],
    [['mood', 'energy', 'sleep'], 'metric', 0.7],
    [['expense', 'spent', 'bought', 'paid'], 'metric', 0.7],
    [['symptom', 'headache', 'pain', 'sick'], 'metric', 0.7],
    [['workout', 'exercise', 'ran', 'gym'], 'metric', 0.7],
    [['book:', 'reading:', 'article:'], 'entity', 0.8],
    [['person:', 'people:'], 'entity', 0.8],
  ];

  for (const [patterns, type, confidence] of prefixes) {
    for (const pattern of patterns) {
      if (lower.startsWith(pattern)) {
        const title = text.slice(pattern.length).trim() || text;
        const metadata: Record<string, unknown> = {};

        // Extract mood/energy values
        if (type === 'metric') {
          const moodMatch = lower.match(/mood\s*(\d+)/);
          const energyMatch = lower.match(/energy\s*(\d+)/);
          const sleepMatch = lower.match(/sleep\s*([\d.]+)/);
          const expenseMatch = lower.match(/(?:expense|spent|paid)\s*([\d.]+)/);

          if (moodMatch) metadata.metricType = 'mood';
          if (energyMatch) metadata.metricType = 'energy';
          if (sleepMatch) metadata.metricType = 'sleep';
          if (expenseMatch) metadata.metricType = 'expense';
        }

        return { suggestedType: type, title, metadata, confidence };
      }
    }
  }

  // Default: if it looks like a task, suggest task; otherwise inbox
  if (lower.includes('buy') || lower.includes('call') || lower.includes('fix') || lower.includes('send')) {
    return { suggestedType: 'task', title: text, metadata: {}, confidence: 0.5 };
  }

  return { suggestedType: 'inbox', title: text, metadata: {}, confidence: 0.3 };
}

/** Capture an item to inbox */
export function captureToInbox(rawText: string) {
  const id = newId();
  const timestamp = now();
  const parsed = parseCapture(rawText);

  db.insert(inboxItems).values({
    id,
    rawText,
    parsedType: parsed.suggestedType,
    status: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp,
  }).run();

  return { id, parsed };
}

/** Get pending inbox items */
export function getPendingInboxItems() {
  return db
    .select()
    .from(inboxItems)
    .where(eq(inboxItems.status, 'pending'))
    .orderBy(desc(inboxItems.createdAt))
    .all();
}

/** Get inbox count */
export function getInboxCount(): number {
  const result = db
    .select()
    .from(inboxItems)
    .where(eq(inboxItems.status, 'pending'))
    .all();
  return result.length;
}

/** Triage an inbox item */
export function triageInboxItem(id: string, toType: string, toId: string) {
  db.update(inboxItems)
    .set({
      status: 'triaged',
      triagedToType: toType,
      triagedToId: toId,
      updatedAt: now(),
    })
    .where(eq(inboxItems.id, id))
    .run();
}

/** Dismiss an inbox item */
export function dismissInboxItem(id: string) {
  db.update(inboxItems)
    .set({ status: 'dismissed', updatedAt: now() })
    .where(eq(inboxItems.id, id))
    .run();
}
