# lifeOS

**Self-hosted, open-source personal Life Operating System.**

Track, organize, understand, and improve your entire life from one integrated system. No subscriptions, no vendor lock-in, no fragmented apps. Your data stays on your hardware.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/eklavyagoyal/lifeos)](https://github.com/eklavyagoyal/lifeos/releases)

---

## Why lifeOS?

Most people juggle Todoist, Notion, Day One, Obsidian, Habitica, and half a dozen spreadsheets. Each app owns a slice of your life but none of them talk to each other, and all of them want a monthly subscription.

lifeOS replaces all of that with **one fast, private, self-hosted app** where everything connects — your tasks feed into your reviews, your habits power your streaks, your journal entries link to your goals, and your weekly review writes itself from real data.

**Your data is a single SQLite file.** Copy it, back it up, inspect it, own it.

## Features

| Module | What it does |
|--------|-------------|
| **Today** | Daily command center — tasks, habits, journal, and quick capture |
| **Inbox** | Universal capture — dump anything, triage later |
| **Tasks** | Priorities, due dates, projects, tags |
| **Habits** | Streaks, grace days, domain grouping |
| **Journal** | Markdown entries with mood & energy tracking |
| **Notes** | Markdown knowledge base with tags and full-text search |
| **Ideas** | Capture → develop → validate idea pipeline |
| **People** | Relationship tracking and interaction logging |
| **Learning** | Books, articles, courses — track what you're learning |
| **Projects** | Active project management with status tracking |
| **Goals** | Long-term goals with milestones and progress |
| **Health** | Sleep, mood, energy, symptoms, workouts |
| **Finance** | Simple expense and income tracking |
| **Reviews** | Auto-generated weekly/monthly reviews from real data |
| **Graph** | Visual connections between everything |
| **Timeline** | Chronological view across all activity |
| **Insights** | Analytics and patterns |
| **Search** | Full-text search across all content (SQLite FTS5) |
| **Gamification** | XP, streaks, domain levels — encouraging, never punishing |
| **Export** | JSON export + raw database download |

### Two Modes

- **Quick Mode** — 5-second interactions, minimal clicks, daily capture
- **Deep Mode** — Full pages, analytics, planning, reflection

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/eklavyagoyal/lifeos.git
cd lifeos
cp .env.example .env
# Edit .env — set AUTH_SECRET to a strong passphrase!

docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) and enter your passphrase.

### Local Development

**Prerequisites:** Node.js 20+ and pnpm.

```bash
git clone https://github.com/eklavyagoyal/lifeos.git
cd lifeos
cp .env.example .env
pnpm install

# Setup database
pnpm db:generate
pnpm db:migrate
pnpm db:seed  # Optional: loads demo data

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Self-Hosting

lifeOS runs on anything from a **Raspberry Pi** to a cloud VM. See the full [Self-Hosting Guide](docs/self-hosting.md) for:

- Docker and bare-metal deployment
- Raspberry Pi setup
- Remote access via Tailscale or Cloudflare Tunnel
- Reverse proxy configuration (Nginx, Caddy)
- Backup & restore procedures

### Backup

Your entire lifeOS is one SQLite file. Back it up however you back up files:

```bash
# Safe copy while the app is running
sqlite3 data/lifeos.db ".backup 'data/lifeos-backup.db'"
```

Or use the built-in export: **Settings → Export & Backup**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org) — App Router, Server Components, Server Actions |
| Language | TypeScript (strict) |
| Database | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) + [Drizzle ORM](https://orm.drizzle.team) |
| Search | SQLite FTS5 |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Editor | [TipTap](https://tiptap.dev) (Markdown) |
| Icons | [Lucide React](https://lucide.dev) |
| Auth | bcrypt passphrase + HMAC-SHA256 sessions |
| Deployment | Docker (standalone output, ~80 MB image) |

## Architecture

See [docs/architecture.md](docs/architecture.md) for full details.

**Key decisions:**
- **Single SQLite file** — one file to backup, no infrastructure
- **ULID primary keys** — time-sortable, globally unique
- **FTS5 search** — full-text search built into the database
- **Server Components** — fast initial render, minimal client JS
- **Server Actions** — type-safe mutations, no REST API to maintain
- **Service layer** — business logic isolated from UI, independently testable
- **Shared tag & relation system** — cross-domain connections power Graph and Search

## Data Ownership

Your data is yours. Full stop.

- **One file** — SQLite database is your entire life, portable and inspectable
- **JSON export** — structured export of all data from Settings
- **No cloud** — nothing leaves your machine
- **No telemetry** — zero tracking, zero analytics, zero external calls
- **No vendor lock-in** — MIT licensed, open source, standard formats

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

- [Report a Bug](https://github.com/eklavyagoyal/lifeos/issues/new?template=bug_report.md)
- [Request a Feature](https://github.com/eklavyagoyal/lifeos/issues/new?template=feature_request.md)

## Support the Project

If lifeOS is useful to you, consider [sponsoring the project](https://github.com/sponsors/eklavyagoyal). It helps fund continued development and keeps lifeOS free and open source.

[![Sponsor](https://img.shields.io/badge/sponsor-♥-ea4aaa.svg)](https://github.com/sponsors/eklavyagoyal)

## License

[MIT](LICENSE) — use it, modify it, self-host it, make it yours.
