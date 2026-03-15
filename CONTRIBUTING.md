# Contributing to lifeOS

Thank you for your interest in contributing to lifeOS! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 20+ (check `.nvmrc` for the pinned version)
- pnpm (recommended) or npm

### Getting Started

```bash
git clone https://github.com/eklavyagoyal/lifeos.git
cd lifeos
cp .env.example .env
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed  # Optional: loads demo data
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/              # Next.js App Router pages & layouts
│   ├── (app)/        # Authenticated app routes
│   └── login/        # Auth pages
├── components/       # Reusable React components
│   ├── detail/       # Entity detail page components
│   └── ui/           # Base UI primitives
├── lib/              # Shared utilities (cn, formatters, etc.)
└── server/           # Server-side code
    ├── db/           # Drizzle schema, migrations, connection
    ├── services/     # Domain service layer (tasks, habits, etc.)
    └── actions/      # Next.js Server Actions
```

See [docs/architecture.md](docs/architecture.md) for detailed design decisions.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/eklavyagoyal/lifeos/issues) first
2. Open a new issue using the **Bug Report** template
3. Include steps to reproduce, expected behavior, and actual behavior

### Suggesting Features

1. Check [existing issues](https://github.com/eklavyagoyal/lifeos/issues) for similar ideas
2. Open a new issue using the **Feature Request** template
3. Describe the use case and why it would benefit lifeOS users

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run the linter: `pnpm lint`
5. Run tests: `pnpm test`
6. Commit with a clear message (see below)
7. Push and open a Pull Request

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add weekly review PDF export
fix: correct habit streak calculation after grace days
docs: update self-hosting guide for Raspberry Pi
chore: bump drizzle-orm to 0.39
```

Prefixes: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`.

## Code Guidelines

- **TypeScript** — All code must be typed. No `any` unless absolutely necessary.
- **Server Components** — Default to Server Components; use `"use client"` only when needed.
- **Server Actions** — All mutations go through Server Actions in `src/server/actions/`.
- **Services** — Business logic lives in `src/server/services/`, not in components.
- **SQL** — Use Drizzle ORM for all database access. No raw SQL outside of FTS5 queries.
- **Styling** — Tailwind CSS utility classes. Use the design system tokens (see `tailwind.config.ts`).
- **No external services** — lifeOS is fully self-contained. Don't add dependencies on external APIs.

## Architecture Principles

1. **Privacy first** — No telemetry, no external calls, no tracking
2. **Single-user** — Designed for personal use, not multi-tenant
3. **One file = your life** — SQLite database is the single source of truth
4. **Fast by default** — Server Components, minimal client JS, edge-ready
5. **Self-hostable** — Must work in Docker on a Raspberry Pi

## Need Help?

- Open a [Discussion](https://github.com/eklavyagoyal/lifeos/discussions) for questions
- Check [docs/architecture.md](docs/architecture.md) for design context
- Review the codebase — it's intentionally readable

Thank you for helping make lifeOS better! 🚀
