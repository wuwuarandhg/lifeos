/**
 * lifeOS — Seed / Demo Data
 *
 * Run with: pnpm db:seed
 *
 * Creates demo data for a fresh install so the app isn't empty.
 * This data is for demo/development purposes only.
 */

import { db } from '../src/server/db';
import { eq } from 'drizzle-orm';
import {
  tasks, habits, habitCompletions, journalEntries,
  notes, ideas, inboxItems, projects, goals,
  gamificationProfile, tags, itemTags, relations as relationsTable,
  metricLogs, reviews, xpEvents, events, entities,
} from '../src/server/db/schema';
import { ulid } from 'ulid';

const now = Date.now();
const today = new Date().toISOString().split('T')[0];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function tsAgo(hours: number): number {
  return now - hours * 60 * 60 * 1000;
}

console.log('🌱 Seeding lifeOS database...\n');

// ============================================================
// TASKS
// ============================================================
const taskData = [
  { title: 'Review weekly goals', status: 'todo', priority: 'p2', dueDate: today, scheduledDate: today },
  { title: 'Fix the leaky faucet', status: 'todo', priority: 'p3', dueDate: daysAgo(-2) },
  { title: 'Read chapter 5 of Deep Work', status: 'todo', priority: 'p3' },
  { title: 'Call dentist for appointment', status: 'todo', priority: 'p2', dueDate: daysAgo(-1) },
  { title: 'Write blog post draft', status: 'in_progress', priority: 'p2' },
  { title: 'Organize bookmarks', status: 'todo', priority: 'p4' },
  { title: 'Update resume', status: 'todo', priority: 'p3', dueDate: daysAgo(-7) },
  { title: 'Buy groceries for the week', status: 'done', priority: 'p2', dueDate: daysAgo(1) },
  { title: 'Send invoice for freelance work', status: 'done', priority: 'p1' },
  { title: 'Meditate for 10 minutes', status: 'done' },
];

for (const t of taskData) {
  db.insert(tasks).values({
    id: ulid(),
    title: t.title,
    status: t.status as 'todo' | 'in_progress' | 'done',
    priority: (t.priority as 'p1' | 'p2' | 'p3' | 'p4') ?? null,
    dueDate: t.dueDate ?? null,
    scheduledDate: t.scheduledDate ?? null,
    completedAt: t.status === 'done' ? tsAgo(4) : null,
    body: null,
    recurrenceRule: null,
    effortEstimate: null,
    energyRequired: null,
    context: null,
    projectId: null,
    parentTaskId: null,
    sortOrder: 0,
    source: 'manual',
    createdAt: tsAgo(48),
    updatedAt: now,
    archivedAt: null,
  }).run();
}
console.log(`  ✅ ${taskData.length} tasks`);

// ============================================================
// HABITS
// ============================================================
const habitData = [
  { name: 'Meditate', domain: 'reflection', difficulty: 'easy' },
  { name: 'Exercise 30min', domain: 'health', difficulty: 'medium' },
  { name: 'Read 30 pages', domain: 'learning', difficulty: 'medium' },
  { name: 'Journal', domain: 'reflection', difficulty: 'easy' },
  { name: 'No social media before noon', domain: 'productivity', difficulty: 'hard' },
  { name: 'Drink 8 glasses of water', domain: 'health', difficulty: 'easy' },
  { name: 'Practice coding', domain: 'learning', difficulty: 'medium' },
];

const habitIds: string[] = [];

for (const h of habitData) {
  const id = ulid();
  habitIds.push(id);
  db.insert(habits).values({
    id,
    name: h.name,
    description: null,
    body: null,
    cadence: 'daily',
    scheduleRule: null,
    targetCount: 1,
    currentStreak: Math.floor(Math.random() * 15),
    longestStreak: Math.floor(Math.random() * 30) + 5,
    graceDays: 1,
    domain: h.domain as 'health' | 'productivity' | 'learning' | 'reflection',
    difficulty: h.difficulty as 'easy' | 'medium' | 'hard',
    scoringWeight: 1.0,
    isPaused: 0,
    goalId: null,
    projectId: null,
    createdAt: tsAgo(720), // 30 days ago
    updatedAt: now,
    archivedAt: null,
  }).run();
}

// Add some completions for the past week
for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
  const date = daysAgo(dayOffset);
  for (const habitId of habitIds) {
    // ~70% completion rate
    if (Math.random() < 0.7) {
      db.insert(habitCompletions).values({
        id: ulid(),
        habitId,
        completedDate: date,
        count: 1,
        note: null,
        createdAt: tsAgo(dayOffset * 24),
      }).run();
    }
  }
}
console.log(`  ✅ ${habitData.length} habits with completions`);

// ============================================================
// JOURNAL ENTRIES
// ============================================================
const journalData = [
  {
    title: 'Morning Clarity',
    body: "Woke up feeling surprisingly rested today. Had a great meditation session — 15 minutes, felt very present. The morning light through the window was beautiful.\n\nToday I want to focus on deep work for at least 3 hours. The blog post draft needs attention.\n\n**Key insight:** I notice I'm most creative between 9-11am. I should protect that time.",
    entryDate: today,
    entryTime: '08:30',
    mood: 8,
    energy: 7,
    entryType: 'daily',
  },
  {
    title: 'Evening Reflection',
    body: "Good day overall. Managed to get 2.5 hours of deep work in. The blog post is 70% done.\n\nWorkout was tough but felt great after. Need to remember: the resistance I feel before working out never matches how good I feel after.\n\n**Gratitude:** Good coffee, productive morning, a friend reached out unexpectedly.",
    entryDate: daysAgo(1),
    entryTime: '21:15',
    mood: 7,
    energy: 5,
    entryType: 'evening_review',
  },
  {
    title: null,
    body: "Scattered day. Couldn't focus well. Slept poorly last night — probably the late coffee. Note to self: no caffeine after 2pm.\n\nStill managed to knock out some smaller tasks. Sometimes that's enough.",
    entryDate: daysAgo(2),
    entryTime: '20:00',
    mood: 5,
    energy: 4,
    entryType: 'freeform',
  },
  {
    title: 'Weekly Intention Setting',
    body: "## This week's focus\n\n1. Finish blog post and publish\n2. Complete 5 deep work sessions\n3. Start learning Rust basics\n4. Have dinner with Alex\n\n## Reflection on last week\n\nHabit consistency was around 70%. Could be better. The key blocker was poor sleep on Tuesday and Wednesday. Need to prioritize sleep hygiene.\n\n## One thing to improve\n\nStart tasks earlier in the day. I keep pushing hard tasks to the afternoon when my energy is lower.",
    entryDate: daysAgo(3),
    entryTime: '09:00',
    mood: 7,
    energy: 8,
    entryType: 'reflection',
  },
];

for (const j of journalData) {
  const wc = j.body.trim().split(/\s+/).filter(Boolean).length;
  db.insert(journalEntries).values({
    id: ulid(),
    title: j.title,
    body: j.body,
    entryDate: j.entryDate,
    entryTime: j.entryTime,
    entryType: j.entryType as 'daily' | 'reflection' | 'evening_review' | 'freeform',
    mood: j.mood ?? null,
    energy: j.energy ?? null,
    wordCount: wc,
    isPinned: 0,
    createdAt: tsAgo(72),
    updatedAt: now,
    archivedAt: null,
  }).run();
}
console.log(`  ✅ ${journalData.length} journal entries`);

// ============================================================
// NOTES
// ============================================================
const noteData = [
  {
    title: 'Productivity System Design',
    body: "# My Productivity System\n\nCore principles:\n1. **Capture everything** — don't trust memory\n2. **Process regularly** — inbox zero daily\n3. **Prioritize ruthlessly** — only 3 important tasks per day\n4. **Reflect weekly** — what worked, what didn't\n5. **Iterate the system** — no system is permanent\n\n## Tools\n- lifeOS for everything\n- Calendar for time-blocked events\n- Physical notebook for brainstorming\n\n## Anti-patterns to avoid\n- Over-planning instead of doing\n- Shiny object syndrome with new tools\n- Perfectionism as procrastination",
    noteType: 'evergreen',
  },
  {
    title: 'Sleep Optimization Notes',
    body: "## What works for sleep\n- No caffeine after 2pm\n- Screen off by 10pm\n- Cool room (65-68°F)\n- Magnesium before bed\n- Consistent wake time even on weekends\n\n## Observations\n- Sleep quality matters more than duration\n- Exercise helps, but not too close to bedtime\n- Alcohol destroys sleep quality even if you fall asleep faster\n\n## Tracking\nUsing lifeOS health logs to track sleep hours and quality.",
    noteType: 'reference',
  },
  {
    title: 'Meeting: Project Kickoff with Alex',
    body: "**Date:** Last Thursday\n**Attendees:** Me, Alex\n\n## Notes\n- Project scope: redesign the landing page\n- Timeline: 2 weeks\n- Alex handles copy, I handle design + dev\n- Need to sync again next Tuesday\n\n## Action items\n- [ ] Create wireframes by Monday\n- [ ] Share inspiration board\n- [ ] Set up project in task manager",
    noteType: 'meeting',
  },
  {
    title: 'Book Notes: Atomic Habits',
    body: "# Atomic Habits — James Clear\n\n## Key Takeaways\n\n1. **1% better every day** — small improvements compound\n2. **Identity-based habits** — don't say \"I want to run\", say \"I am a runner\"\n3. **4 Laws of Behavior Change:**\n   - Make it obvious\n   - Make it attractive\n   - Make it easy\n   - Make it satisfying\n4. **Environment design** — make good habits easy, bad habits hard\n5. **Habit stacking** — pair new habits with existing ones\n\n## Favorite quotes\n> \"You do not rise to the level of your goals. You fall to the level of your systems.\"\n\n## How I'm applying this\n- Habit tracking in lifeOS\n- Streak-based motivation\n- Environment: phone in another room during deep work",
    noteType: 'note',
  },
];

for (const n of noteData) {
  db.insert(notes).values({
    id: ulid(),
    title: n.title,
    body: n.body,
    noteType: n.noteType as 'note' | 'reference' | 'meeting' | 'snippet' | 'evergreen',
    collection: null,
    isPinned: n.noteType === 'evergreen' ? 1 : 0,
    createdAt: tsAgo(120),
    updatedAt: now,
    archivedAt: null,
  }).run();
}
console.log(`  ✅ ${noteData.length} notes`);

// ============================================================
// IDEAS
// ============================================================
const ideaData = [
  { title: 'Weighted productivity score', summary: 'Calculate a daily score based on task difficulty, habit completion, and deep work hours', stage: 'developing' },
  { title: 'Morning routine optimizer', summary: 'Analyze which morning routines correlate with the best days', stage: 'seed' },
  { title: 'Automated weekly review email', summary: 'Email myself a digest every Sunday from lifeOS data', stage: 'seed' },
  { title: 'Mood-weather correlation tracker', summary: 'Cross-reference mood data with local weather API', stage: 'seed' },
];

for (const i of ideaData) {
  db.insert(ideas).values({
    id: ulid(),
    title: i.title,
    summary: i.summary,
    body: null,
    stage: i.stage as 'seed' | 'developing',
    theme: null,
    createdAt: tsAgo(200),
    updatedAt: now,
    archivedAt: null,
  }).run();
}
console.log(`  ✅ ${ideaData.length} ideas`);

// ============================================================
// INBOX ITEMS
// ============================================================
const inboxData = [
  'Buy magnesium supplements',
  'Look into Tailscale for remote access',
  'That podcast about stoicism was interesting',
];

for (const text of inboxData) {
  db.insert(inboxItems).values({
    id: ulid(),
    rawText: text,
    parsedType: null,
    status: 'pending',
    triagedToType: null,
    triagedToId: null,
    createdAt: tsAgo(12),
    updatedAt: now,
  }).run();
}
console.log(`  ✅ ${inboxData.length} inbox items`);

// ============================================================
// PROJECTS
// ============================================================
const projectData = [
  {
    title: 'Landing Page Redesign',
    summary: 'Complete redesign of the company landing page with new branding',
    status: 'active' as const,
    health: 'on_track' as const,
    startDate: daysAgo(14),
    targetDate: daysAgo(-14),
    progress: 40,
  },
  {
    title: 'Learn Rust',
    summary: 'Work through The Rust Programming Language book and build a CLI tool',
    status: 'active' as const,
    health: 'at_risk' as const,
    startDate: daysAgo(30),
    targetDate: daysAgo(-60),
    progress: 15,
  },
  {
    title: 'Home Office Setup',
    summary: 'Ergonomic desk, monitor, lighting, cable management',
    status: 'planning' as const,
    health: null,
    startDate: null,
    targetDate: daysAgo(-30),
    progress: 0,
  },
  {
    title: 'Blog Launch',
    summary: 'Write 5 articles, set up hosting, design site',
    status: 'completed' as const,
    health: null,
    startDate: daysAgo(60),
    targetDate: daysAgo(5),
    progress: 100,
  },
];

const projectIds: string[] = [];
for (const p of projectData) {
  const id = ulid();
  projectIds.push(id);
  db.insert(projects).values({
    id,
    title: p.title,
    summary: p.summary,
    body: null,
    status: p.status,
    health: p.health,
    startDate: p.startDate,
    targetDate: p.targetDate,
    endDate: p.status === 'completed' ? daysAgo(5) : null,
    progress: p.progress,
    reviewCadence: p.status === 'active' ? 'weekly' : null,
    createdAt: tsAgo(720),
    updatedAt: now,
    archivedAt: null,
  }).run();
}
console.log(`  ✅ ${projectData.length} projects`);

// Link some tasks to projects (first project = Landing Page Redesign)
const allTasks = db.select().from(tasks).all();
if (allTasks.length >= 3) {
  for (let i = 0; i < 3; i++) {
    db.update(tasks)
      .set({ projectId: projectIds[0], updatedAt: now })
      .where(eq(tasks.id, allTasks[i].id))
      .run();
  }
}

// ============================================================
// GOALS
// ============================================================
const goalData = [
  {
    title: 'Get fit and healthy',
    description: 'Consistent exercise, better diet, good sleep hygiene',
    timeHorizon: 'yearly' as const,
    outcomeMetric: 'Exercise 4x/week, sleep 7+ hours',
    status: 'active' as const,
    progress: 35,
  },
  {
    title: 'Become a strong Rust developer',
    description: 'Learn Rust deeply enough to contribute to open-source projects',
    timeHorizon: 'yearly' as const,
    outcomeMetric: 'Complete 3 Rust projects and 1 open-source contribution',
    status: 'active' as const,
    progress: 10,
  },
  {
    title: 'Build a second income stream',
    description: 'Freelance or side project generating $1k/month',
    timeHorizon: 'multi_year' as const,
    outcomeMetric: '$1,000/month recurring revenue',
    status: 'active' as const,
    progress: 20,
  },
  {
    title: 'Read 30 books this year',
    description: 'Mix of technical, non-fiction, and fiction',
    timeHorizon: 'yearly' as const,
    outcomeMetric: '30 books completed',
    status: 'active' as const,
    progress: 25,
  },
];

const goalIds: string[] = [];
for (const g of goalData) {
  const id = ulid();
  goalIds.push(id);
  db.insert(goals).values({
    id,
    title: g.title,
    description: g.description,
    body: null,
    timeHorizon: g.timeHorizon,
    startDate: daysAgo(30),
    targetDate: daysAgo(-335),
    outcomeMetric: g.outcomeMetric,
    status: g.status,
    progress: g.progress,
    createdAt: tsAgo(720),
    updatedAt: now,
    archivedAt: null,
  }).run();
}
console.log(`  ✅ ${goalData.length} goals`);

// Link some habits to goals
// Meditate + Exercise → "Get fit and healthy"
// Read 30 pages + Practice coding → "Read 30 books" / "Become a strong Rust developer"
if (habitIds.length >= 7 && goalIds.length >= 4) {
  db.update(habits).set({ goalId: goalIds[0], updatedAt: now }).where(eq(habits.id, habitIds[0])).run(); // Meditate → Get fit
  db.update(habits).set({ goalId: goalIds[0], updatedAt: now }).where(eq(habits.id, habitIds[1])).run(); // Exercise → Get fit
  db.update(habits).set({ goalId: goalIds[3], updatedAt: now }).where(eq(habits.id, habitIds[2])).run(); // Read → Read 30 books
  db.update(habits).set({ goalId: goalIds[1], updatedAt: now }).where(eq(habits.id, habitIds[6])).run(); // Practice coding → Rust
}

// ============================================================
// TAGS
// ============================================================
const tagData = [
  { name: 'deep-work', color: '#4263eb' },
  { name: 'health', color: '#51cf66' },
  { name: 'learning', color: '#845ef7' },
  { name: 'finance', color: '#fcc419' },
  { name: 'routine', color: '#20c997' },
  { name: 'important', color: '#ff6b6b' },
];

const tagIds: string[] = [];
for (const t of tagData) {
  const id = ulid();
  tagIds.push(id);
  db.insert(tags).values({
    id,
    name: t.name,
    color: t.color,
    createdAt: now,
  }).onConflictDoNothing().run();
}
console.log(`  ✅ ${tagData.length} tags`);

// Add some tags to items
if (allTasks.length > 0 && tagIds.length >= 6) {
  // Tag first task with "important"
  db.insert(itemTags).values({ id: ulid(), itemType: 'task', itemId: allTasks[0].id, tagId: tagIds[5], createdAt: now }).run();
  // Tag first task with "deep-work"
  db.insert(itemTags).values({ id: ulid(), itemType: 'task', itemId: allTasks[0].id, tagId: tagIds[0], createdAt: now }).run();
  // Tag first project with "important"
  db.insert(itemTags).values({ id: ulid(), itemType: 'project', itemId: projectIds[0], tagId: tagIds[5], createdAt: now }).run();
  // Tag first goal with "health"
  db.insert(itemTags).values({ id: ulid(), itemType: 'goal', itemId: goalIds[0], tagId: tagIds[1], createdAt: now }).run();
}
console.log('  ✅ Item tags applied');

// ============================================================
// RELATIONS
// ============================================================
if (projectIds.length >= 2 && goalIds.length >= 3) {
  // Learn Rust project → Become a strong Rust developer goal
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'project',
    sourceId: projectIds[1],
    targetType: 'goal',
    targetId: goalIds[1],
    relationType: 'supports',
    metadata: null,
    createdAt: now,
  }).run();

  // Blog Launch project → Build a second income stream goal
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'project',
    sourceId: projectIds[3],
    targetType: 'goal',
    targetId: goalIds[2],
    relationType: 'supports',
    metadata: null,
    createdAt: now,
  }).run();

  // Landing Page Redesign → Build a second income stream goal
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'project',
    sourceId: projectIds[0],
    targetType: 'goal',
    targetId: goalIds[2],
    relationType: 'supports',
    metadata: null,
    createdAt: now,
  }).run();

  // Home Office Setup → Productivity goal (reuse fitness goal as proxy)
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'project',
    sourceId: projectIds[2],
    targetType: 'goal',
    targetId: goalIds[0],
    relationType: 'related_to',
    metadata: null,
    createdAt: now,
  }).run();
}

// Cross-domain relations using notes and journal
const allNotesForRel = db.select().from(notes).all();
const allJournalForRel = db.select().from(journalEntries).all();

if (allNotesForRel.length >= 4 && goalIds.length >= 4) {
  // Book Notes: Atomic Habits → Get fit and healthy goal
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'note',
    sourceId: allNotesForRel[3].id,
    targetType: 'goal',
    targetId: goalIds[0],
    relationType: 'supports',
    metadata: null,
    createdAt: now,
  }).run();

  // Productivity System Design note → Read 30 books goal
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'note',
    sourceId: allNotesForRel[0].id,
    targetType: 'goal',
    targetId: goalIds[3],
    relationType: 'related_to',
    metadata: null,
    createdAt: now,
  }).run();

  // Sleep Optimization note → Get fit and healthy goal
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'note',
    sourceId: allNotesForRel[1].id,
    targetType: 'goal',
    targetId: goalIds[0],
    relationType: 'supports',
    metadata: null,
    createdAt: now,
  }).run();

  // Meeting note → Landing Page Redesign project
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'note',
    sourceId: allNotesForRel[2].id,
    targetType: 'project',
    targetId: projectIds[0],
    relationType: 'belongs_to',
    metadata: null,
    createdAt: now,
  }).run();
}

// Journal → project relation
if (allJournalForRel.length >= 1 && projectIds.length >= 1) {
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'journal',
    sourceId: allJournalForRel[0].id,
    targetType: 'project',
    targetId: projectIds[1],
    relationType: 'mentions',
    metadata: null,
    createdAt: now,
  }).run();
}

// Idea → goal relations
const allIdeasForRel = db.select().from(ideas).all();
if (allIdeasForRel.length >= 2 && goalIds.length >= 1) {
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'idea',
    sourceId: allIdeasForRel[0].id,
    targetType: 'goal',
    targetId: goalIds[0],
    relationType: 'derived_from',
    metadata: null,
    createdAt: now,
  }).run();
}

console.log('  ✅ Relations (expanded)');

// ============================================================
// EVENTS (life events, milestones, trips, memories)
// ============================================================

const eventData = [
  {
    title: 'Started learning Rust',
    body: 'Decided to commit to learning Rust this year. Bought The Rust Programming Language book.',
    eventDate: daysAgo(30),
    eventType: 'milestone' as const,
    importance: 4,
  },
  {
    title: 'Weekend trip to the mountains',
    body: 'Great hiking trip with friends. Disconnected from tech for 2 days. Really refreshing.',
    eventDate: daysAgo(14),
    eventType: 'trip' as const,
    importance: 5,
  },
  {
    title: 'Published first blog post',
    body: 'Finally hit publish on my first article. Nerve-wracking but exciting.',
    eventDate: daysAgo(5),
    eventType: 'achievement' as const,
    importance: 5,
  },
  {
    title: 'Coffee chat with Sarah about career',
    body: 'Great conversation about long-term career paths. She suggested looking into developer advocacy.',
    eventDate: daysAgo(8),
    eventType: 'memory' as const,
    importance: 3,
  },
  {
    title: 'Signed up for local gym',
    body: 'New gym membership. Goal: 4x per week.',
    eventDate: daysAgo(21),
    eventType: 'life_event' as const,
    importance: 3,
  },
];

for (const ev of eventData) {
  db.insert(events).values({
    id: ulid(),
    title: ev.title,
    body: ev.body,
    eventDate: ev.eventDate,
    eventEndDate: null,
    eventType: ev.eventType,
    importance: ev.importance,
    createdAt: tsAgo(ev.importance * 24),
    updatedAt: now,
    archivedAt: null,
  }).run();
}
console.log(`  ✅ ${eventData.length} events`);

// ============================================================
// ENTITIES (people, books, places)
// ============================================================
const entityData = [
  {
    title: 'Alex',
    entityType: 'person' as const,
    body: 'Collaborator on the landing page redesign project. Great with copywriting.',
  },
  {
    title: 'Sarah',
    entityType: 'person' as const,
    body: 'Mentor figure. Works in developer advocacy. Good career advice.',
  },
  {
    title: 'Atomic Habits',
    entityType: 'book' as const,
    body: 'James Clear. Key book on habit formation. Read and taking notes.',
  },
  {
    title: 'Deep Work',
    entityType: 'book' as const,
    body: 'Cal Newport. Focus and productivity without distraction.',
  },
  {
    title: 'Local Coffee Shop',
    entityType: 'place' as const,
    body: 'Best place for deep work outside home. Quiet mornings, good WiFi.',
  },
];

const entityIds: string[] = [];
for (const ent of entityData) {
  const id = ulid();
  entityIds.push(id);
  db.insert(entities).values({
    id,
    title: ent.title,
    entityType: ent.entityType,
    body: ent.body,
    metadata: null,
    isPinned: 0,
    createdAt: tsAgo(200),
    updatedAt: now,
    archivedAt: null,
  }).run();
}
console.log(`  ✅ ${entityData.length} entities`);

// Entity → project/note relations
if (entityIds.length >= 2 && projectIds.length >= 1 && allNotesForRel.length >= 3) {
  // Alex → Landing Page Redesign
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'entity',
    sourceId: entityIds[0],
    targetType: 'project',
    targetId: projectIds[0],
    relationType: 'related_to',
    metadata: null,
    createdAt: now,
  }).run();

  // Atomic Habits book → Book Notes note
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'entity',
    sourceId: entityIds[2],
    targetType: 'note',
    targetId: allNotesForRel[3].id,
    relationType: 'related_to',
    metadata: null,
    createdAt: now,
  }).run();

  // Sarah → Meeting note
  db.insert(relationsTable).values({
    id: ulid(),
    sourceType: 'entity',
    sourceId: entityIds[1],
    targetType: 'note',
    targetId: allNotesForRel[2].id,
    relationType: 'mentions',
    metadata: null,
    createdAt: now,
  }).run();
}
console.log('  ✅ Entity relations');

// ============================================================
// METRIC LOGS
// ============================================================
const sleepQualities = ['great', 'good', 'fair', 'poor'];
const workoutTypes = ['run', 'gym', 'yoga', 'walk', 'cycling'];
const expenseCategories = ['food', 'transport', 'shopping', 'entertainment', 'health'];

for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
  const date = daysAgo(dayOffset);
  const ts = tsAgo(dayOffset * 24 + 8); // morning-ish

  // Sleep (5.5 - 9 hours)
  db.insert(metricLogs).values({
    id: ulid(),
    metricType: 'sleep',
    valueNumeric: parseFloat((5.5 + Math.random() * 3.5).toFixed(1)),
    valueText: sleepQualities[Math.floor(Math.random() * sleepQualities.length)],
    unit: 'hours',
    loggedAt: ts,
    loggedDate: date,
    note: dayOffset === 0 ? 'Woke up feeling rested' : null,
    journalId: null,
    habitId: null,
    createdAt: ts,
    updatedAt: ts,
  }).run();

  // Mood (4-9)
  db.insert(metricLogs).values({
    id: ulid(),
    metricType: 'mood',
    valueNumeric: Math.floor(4 + Math.random() * 6),
    valueText: null,
    unit: 'score',
    loggedAt: ts + 1000,
    loggedDate: date,
    note: null,
    journalId: null,
    habitId: null,
    createdAt: ts + 1000,
    updatedAt: ts + 1000,
  }).run();

  // Energy (3-9)
  db.insert(metricLogs).values({
    id: ulid(),
    metricType: 'energy',
    valueNumeric: Math.floor(3 + Math.random() * 7),
    valueText: null,
    unit: 'score',
    loggedAt: ts + 2000,
    loggedDate: date,
    note: null,
    journalId: null,
    habitId: null,
    createdAt: ts + 2000,
    updatedAt: ts + 2000,
  }).run();

  // Workout (~60% of days)
  if (Math.random() < 0.6) {
    const workoutType = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
    db.insert(metricLogs).values({
      id: ulid(),
      metricType: 'workout',
      valueNumeric: Math.floor(20 + Math.random() * 50), // 20-70 minutes
      valueText: workoutType,
      unit: 'minutes',
      loggedAt: ts + 3600000, // 1 hour later
      loggedDate: date,
      note: workoutType === 'gym' ? 'Upper body day' : null,
      journalId: null,
      habitId: null,
      createdAt: ts + 3600000,
      updatedAt: ts + 3600000,
    }).run();
  }

  // Expense (~80% of days, 1-2 per day)
  const expenseCount = Math.random() < 0.8 ? (Math.random() < 0.5 ? 2 : 1) : 0;
  for (let e = 0; e < expenseCount; e++) {
    const cat = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    db.insert(metricLogs).values({
      id: ulid(),
      metricType: 'expense',
      valueNumeric: parseFloat((3 + Math.random() * 47).toFixed(2)), // $3 - $50
      valueText: cat,
      unit: '$',
      loggedAt: ts + 7200000 + e * 3600000,
      loggedDate: date,
      note: cat === 'food' ? 'Lunch' : null,
      journalId: null,
      habitId: null,
      createdAt: ts + 7200000 + e * 3600000,
      updatedAt: ts + 7200000 + e * 3600000,
    }).run();
  }
}
console.log('  ✅ Metric logs (7 days of sleep, mood, energy, workouts, expenses)');

// ============================================================
// SEARCH INDEX
// ============================================================
try {
  // Import sqlite directly for FTS5
  const { sqlite } = require('../src/server/db');
  
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
  
  sqlite.exec(`DELETE FROM search_index;`);
  
  const insertFts = sqlite.prepare(
    `INSERT INTO search_index(item_id, item_type, title, body) VALUES (?, ?, ?, ?)`
  );
  
  const allTasksForSearch = db.select().from(tasks).all();
  for (const t of allTasksForSearch) {
    insertFts.run(t.id, 'task', t.title, t.body || '');
  }
  
  const allHabitsForSearch = db.select().from(habits).all();
  for (const h of allHabitsForSearch) {
    insertFts.run(h.id, 'habit', h.name, [h.description, h.body].filter(Boolean).join(' '));
  }
  
  const allJournalForSearch = db.select().from(journalEntries).all();
  for (const j of allJournalForSearch) {
    insertFts.run(j.id, 'journal', j.title || j.entryDate, j.body || '');
  }
  
  const allNotesForSearch = db.select().from(notes).all();
  for (const n of allNotesForSearch) {
    insertFts.run(n.id, 'note', n.title, n.body || '');
  }
  
  const allIdeasForSearch = db.select().from(ideas).all();
  for (const i of allIdeasForSearch) {
    insertFts.run(i.id, 'idea', i.title, [i.summary, i.body].filter(Boolean).join(' '));
  }
  
  const allProjectsForSearch = db.select().from(projects).all();
  for (const p of allProjectsForSearch) {
    insertFts.run(p.id, 'project', p.title, [p.summary, p.body].filter(Boolean).join(' '));
  }
  
  const allGoalsForSearch = db.select().from(goals).all();
  for (const g of allGoalsForSearch) {
    insertFts.run(g.id, 'goal', g.title, [g.description, g.body].filter(Boolean).join(' '));
  }

  const allEventsForSearch = db.select().from(events).all();
  for (const ev of allEventsForSearch) {
    insertFts.run(ev.id, 'event', ev.title, ev.body || '');
  }

  const allEntitiesForSearch = db.select().from(entities).all();
  for (const ent of allEntitiesForSearch) {
    insertFts.run(ent.id, 'entity', ent.title, ent.body || '');
  }
  
  console.log('  ✅ Search index (FTS5)');
} catch (err) {
  console.log('  ⚠️  Search index skipped (FTS5 may not be available):', (err as Error).message);
}


// ============================================================
// GAMIFICATION PROFILE
// ============================================================
db.insert(gamificationProfile).values({
  id: 'default',
  totalXp: 850,
  level: 3,
  healthXp: 200,
  productivityXp: 300,
  learningXp: 150,
  relationshipsXp: 50,
  financeXp: 30,
  creativityXp: 70,
  reflectionXp: 50,
  updatedAt: now,
}).run();
console.log('  ✅ Gamification profile');

// ============================================================
// XP EVENTS
// ============================================================
const xpEventData = [
  { domain: 'productivity', sourceType: 'task', reason: 'task_complete', xpAmount: 10, hoursAgo: 4 },
  { domain: 'productivity', sourceType: 'task', reason: 'task_complete', xpAmount: 40, hoursAgo: 24 },
  { domain: 'health', sourceType: 'habit', reason: 'habit_complete', xpAmount: 15, hoursAgo: 5 },
  { domain: 'health', sourceType: 'habit', reason: 'habit_complete', xpAmount: 15, hoursAgo: 28 },
  { domain: 'health', sourceType: 'habit', reason: 'habit_complete', xpAmount: 30, hoursAgo: 52 },
  { domain: 'reflection', sourceType: 'journal', reason: 'journal_entry', xpAmount: 20, hoursAgo: 6 },
  { domain: 'reflection', sourceType: 'journal', reason: 'journal_entry', xpAmount: 30, hoursAgo: 30 },
  { domain: 'health', sourceType: 'metric', reason: 'metric_log', xpAmount: 5, hoursAgo: 7 },
  { domain: 'health', sourceType: 'metric', reason: 'metric_log', xpAmount: 5, hoursAgo: 8 },
  { domain: 'health', sourceType: 'metric', reason: 'metric_log', xpAmount: 5, hoursAgo: 32 },
  { domain: 'productivity', sourceType: 'task', reason: 'task_complete', xpAmount: 10, hoursAgo: 48 },
  { domain: 'learning', sourceType: 'idea', reason: 'idea_capture', xpAmount: 5, hoursAgo: 12 },
  { domain: 'reflection', sourceType: 'review', reason: 'review_complete', xpAmount: 50, hoursAgo: 170 },
];

for (const xp of xpEventData) {
  db.insert(xpEvents).values({
    id: ulid(),
    domain: xp.domain,
    sourceType: xp.sourceType,
    sourceId: ulid(), // dummy source ids for seed
    reason: xp.reason,
    xpAmount: xp.xpAmount,
    createdAt: tsAgo(xp.hoursAgo),
  }).run();
}
console.log(`  ✅ ${xpEventData.length} XP events`);

// ============================================================
// DEMO WEEKLY REVIEW (previous week)
// ============================================================
const prevWeekStart = daysAgo(7 + new Date().getDay() - 1); // previous Monday
const prevWeekEnd = daysAgo(new Date().getDay()); // previous Sunday
const demoSnapshot = JSON.stringify({
  tasks: { completed: 8, total: 12, completionRate: 0.67 },
  habits: { totalCompletions: 18, possibleCompletions: 28, overallRate: 0.64, bestStreakHabit: 'Morning Meditation', bestStreakValue: 5 },
  metrics: { avgMood: 6.8, avgEnergy: 6.2, avgSleep: 7.1, totalWorkoutMinutes: 120 },
  journal: { entryCount: 4, avgWordCount: 180, moodTrend: 'stable' },
  projects: { active: 2, completedTasks: 5 },
  goals: { active: 3, avgProgress: 35 },
  ideas: { captured: 3 },
  wins: ['Completed 8 tasks including a P1', 'Morning meditation 5-day streak', 'Averaged 7+ hours sleep'],
  blockers: ['2 overdue tasks carried over', 'Energy dipped mid-week'],
  focusAreas: ['Clear overdue tasks', 'Maintain sleep schedule', 'Journal more consistently'],
});

const demoReviewBody = `## 🏆 Wins
- Completed 8 tasks including a P1
- Morning meditation 5-day streak
- Averaged 7+ hours sleep

## ⚠️ Watch
- 2 overdue tasks carried over
- Energy dipped mid-week

## 📊 Tasks
- Completed: 8 / 12 (67%)

## 🔁 Habits
- Completions: 18 / 28 (64%)
- Best streak: Morning Meditation (5 days)

## 🩺 Life Signals
- Avg Mood: 6.8 · Avg Energy: 6.2 · Avg Sleep: 7.1h
- Workout: 120 min total

## 📓 Journal
- 4 entries · avg 180 words
- Mood trend: stable

## 🎯 Next Week Focus
- Clear overdue tasks
- Maintain sleep schedule
- Journal more consistently

## ✏️ Personal Notes
_Add your own reflections here…_
`;

db.insert(reviews).values({
  id: ulid(),
  reviewType: 'weekly',
  periodStart: prevWeekStart,
  periodEnd: prevWeekEnd,
  body: demoReviewBody,
  generatedAt: tsAgo(170),
  statsSnapshot: demoSnapshot,
  isPublished: 1,
  createdAt: tsAgo(170),
  updatedAt: tsAgo(170),
}).run();
console.log('  ✅ Demo weekly review');

console.log('\n✨ Seed complete! lifeOS is ready to use.\n');
