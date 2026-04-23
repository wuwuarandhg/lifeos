const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'lifeos.db');
const migrationsFolder = path.join(process.cwd(), 'drizzle', 'migrations');
const dbDir = path.dirname(dbPath);

fs.mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('busy_timeout = 5000');

const db = drizzle(sqlite);

console.log(`[lifeOS] Running migrations for ${dbPath}`);
migrate(db, { migrationsFolder });
sqlite.close();
console.log('[lifeOS] Migrations complete.');
