/**
 * lifeOS — System Service
 *
 * System metadata, app settings CRUD, runtime info.
 */

import { db } from '@/server/db';
import { appSettings } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { getDBPath } from './export';
import os from 'os';

// ============================================================
// App Settings
// ============================================================

export function getSetting(key: string): string | null {
  const row = db.select().from(appSettings).where(eq(appSettings.key, key)).get();
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const existing = db.select().from(appSettings).where(eq(appSettings.key, key)).get();
  if (existing) {
    db.update(appSettings)
      .set({ value, updatedAt: Date.now() })
      .where(eq(appSettings.key, key))
      .run();
  } else {
    db.insert(appSettings)
      .values({ key, value, updatedAt: Date.now() })
      .run();
  }
}

// ============================================================
// System Info
// ============================================================

export interface SystemInfo {
  appVersion: string;
  nodeVersion: string;
  platform: string;
  architecture: string;
  uptime: string;
  dbPath: string;
  dataDir: string;
  authConfigured: boolean;
  environment: string;
}

export function getSystemInfo(): SystemInfo {
  const dbPath = getDBPath();
  const dataDir = dbPath.replace(/\/[^/]+$/, '');

  const authSecret = process.env.AUTH_SECRET;
  const authConfigured = !!authSecret &&
    authSecret !== 'changeme' &&
    authSecret !== 'changeme-to-a-strong-passphrase' &&
    authSecret.length > 8;

  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const uptime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return {
    appVersion: '0.1.0',
    nodeVersion: process.version,
    platform: `${os.type()} ${os.release()}`,
    architecture: os.arch(),
    uptime,
    dbPath,
    dataDir,
    authConfigured,
    environment: process.env.NODE_ENV || 'development',
  };
}
