# Architecture

This document describes the technical architecture of lifeOS for contributors and anyone curious about how it works.

## Overview

lifeOS is a **Next.js 15** application using the **App Router** with **Server Components** and **Server Actions**. Data is stored in a local **SQLite** database via **Drizzle ORM**. The entire application runs as a single process — no external services, no background workers, no message queues.

```
┌─────────────────────────────────────────────┐
│  Browser                                     │
│  ┌─────────────────────────────────────────┐ │
│  │  React (Server Components + Islands)    │ │
│  └──────────────┬──────────────────────────┘ │
└─────────────────┼───────────────────────────┘
                  │ Server Actions / RSC
┌─────────────────┼───────────────────────────┐
│  Next.js Server │                            │
│  ┌──────────────┴──────────────────────────┐ │
│  │  Server Actions  (src/app/actions.ts)   │ │
│  │  ↓                                      │ │
│  │  Service Layer   (src/server/services/) │ │
│  │  ↓                                      │ │
│  │  Drizzle ORM     (src/server/db/)       │ │
│  │  ↓                                      │ │
│  │  SQLite (better-sqlite3, WAL mode)      │ │
│  └─────────────────────────────────────────┘ │
│  📁 data/lifeos.db                           │
└──────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Authenticated routes (layout with sidebar)
│   │   ├── today/          # Today dashboard
│   │   ├── tasks/          # Tasks list + [id] detail
│   │   ├── habits/         # Habits list + [id] detail
│   │   ├── journal/        # Journal list + [id] detail
│   │   ├── notes/          # Notes list + [id] detail
│   │   ├── ideas/          # Ideas list + [id] detail
│   │   ├── people/         # People list + [id] detail
│   │   ├── learning/       # Learning list + [id] detail
│   │   ├── projects/       # Projects list + [id] detail
│   │   ├── goals/          # Goals list + [id] detail
│   │   ├── inbox/          # Universal capture inbox
│   │   ├── health/         # Health logs (filtered metrics)
│   │   ├── finance/        # Finance logs (filtered metrics)
│   │   ├── metrics/        # Custom metrics + logging
│   │   ├── reviews/        # Weekly/monthly reviews
│   │   ├── graph/          # Entity relationship graph
│   │   ├── timeline/       # Chronological activity view
│   │   ├── insights/       # Analytics and patterns
│   │   ├── search/         # Full-text search
│   │   └── settings/       # Export, backup, system info
│   ├── api/                # API routes (health, export)
│   ├── login/              # Auth pages
│   ├── actions.ts          # All Server Actions
│   └── layout.tsx          # Root layout
├── components/
│   ├── capture/            # Quick capture widget
│   ├── detail/             # Shared detail page components
│   ├── habits/             # Habit-specific components
│   ├── ideas/              # Idea-specific components
│   ├── inbox/              # Inbox components
│   ├── journal/            # Journal components
│   ├── layout/             # Sidebar, navigation
│   ├── learning/           # Learning components
│   ├── metrics/            # Metric logging components
│   ├── notes/              # Note components
│   ├── people/             # People components
│   └── tasks/              # Task list components
├── lib/
│   ├── types.ts            # Shared TypeScript types
│   └── utils.ts            # Utility functions (cn, formatters)
├── server/
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema (21+ tables)
│   │   ├── index.ts        # Database connection (WAL mode)
│   │   └── migrate.ts      # Migration runner
│   └── services/           # Domain service layer
│       ├── tasks.ts         
│       ├── habits.ts        
│       ├── journal.ts       
│       ├── notes.ts         
│       ├── ideas.ts         
│       ├── entities.ts      # People, learning resources
│       ├── projects.ts      
│       ├── goals.ts         
│       ├── inbox.ts         
│       ├── metrics.ts       
│       ├── tags.ts          
│       ├── relations.ts     
│       ├── search.ts        # FTS5 full-text search
│       ├── reviews.ts       # Auto-generated reviews
│       ├── gamification.ts  # XP, streaks, levels
│       ├── aggregation.ts   # Cross-domain analytics
│       ├── insights.ts      
│       ├── graph.ts         
│       ├── graph-helpers.ts 
│       ├── timeline.ts      
│       ├── export.ts        
│       ├── system.ts        
│       └── auth.ts          
├── stores/
│   └── mode-store.tsx       # Quick/Deep mode toggle
└── middleware.ts            # Auth middleware (Edge)
```

## Key Design Decisions

### SQLite as the Only Database

- **One file = your entire life.** Easy to backup, move, and understand.
- WAL (Write-Ahead Logging) mode for concurrent reads during writes.
- FTS5 virtual tables for full-text search across all content.
- No need for PostgreSQL, Redis, or any other infrastructure.

### ULID Primary Keys

Every record uses a [ULID](https://github.com/ulid/spec) as its primary key:
- Time-sortable (naturally ordered by creation time)
- Globally unique (no collisions across tables)
- URL-safe (no special characters)

### Server Components by Default

Pages are Server Components that fetch data directly. Client Components (`"use client"`) are used only for:
- Interactive forms and editors
- Client-side state (mode toggle, UI state)
- Browser APIs (localStorage, etc.)

### Server Actions for All Mutations

All data mutations go through Server Actions in `src/app/actions.ts`. This provides:
- Type-safe function calls (no REST endpoints to maintain)
- Automatic `revalidatePath` for cache invalidation
- Centralized validation and error handling

### Service Layer Pattern

Business logic lives in `src/server/services/`, not in components or actions. Services:
- Are pure TypeScript functions (no React dependencies)
- Accept typed parameters and return typed results
- Handle all database queries via Drizzle ORM
- Are independently testable

### Shared Tag & Relation System

Tags and relations are decoupled from domain tables:
- `tags` table with a polymorphic `entity_type` + `entity_id` pattern
- `relations` table connects any two entities
- Enables cross-domain features like Graph Explorer and search

### Gamification

A lightweight XP system rewards consistent usage:
- XP awarded for creating entries, completing tasks, maintaining streaks
- Domain-specific levels (Productivity, Wellness, Knowledge, etc.)
- Designed to be encouraging, never punishing

## Database Schema

The schema (`src/server/db/schema.ts`) contains 21+ tables organized by domain:

| Domain | Tables |
|--------|--------|
| Tasks | `tasks` |
| Habits | `habits`, `habit_logs` |
| Journal | `journal_entries` |
| Notes | `notes` |
| Ideas | `ideas` |
| Entities | `entities` (people, books, articles, courses) |
| Projects | `projects` |
| Goals | `goals`, `milestones` |
| Inbox | `inbox_items` |
| Metrics | `metric_definitions`, `metric_logs` |
| Reviews | `reviews` |
| Cross-cutting | `tags`, `relations`, `xp_events`, `search_index` (FTS5) |

## Authentication

Single-user passphrase authentication:
1. User enters passphrase on `/login`
2. Server compares against bcrypt hash in `AUTH_SECRET` env var
3. On success, creates HMAC-SHA256 signed session token
4. Token stored in `httpOnly` cookie
5. Edge middleware (`src/middleware.ts`) validates token on every request

## Deployment

### Docker (Recommended)

The Dockerfile uses a multi-stage build:
1. **deps** — Install pnpm dependencies
2. **builder** — Build Next.js standalone output
3. **runner** — Minimal production image with standalone output only

Data persists in a Docker volume (`lifeos-data`) mounted at `/app/data`.

### Bare Metal

Standard Next.js deployment:
```bash
pnpm build
pnpm start
```

Database auto-creates at the path specified by `DATABASE_PATH`.
