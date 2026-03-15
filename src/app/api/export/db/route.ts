import { NextResponse } from 'next/server';
import { createDBBackup } from '@/server/services/export';
import { isAuthenticated } from '@/server/services/auth';
import fs from 'fs';

/**
 * Raw SQLite database backup download.
 * Protected — requires valid session.
 * Creates a consistent backup using SQLite's backup API, then streams it.
 */
export async function GET() {
  // Double-check auth
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let backupPath: string | null = null;

  try {
    backupPath = createDBBackup();
    const fileBuffer = fs.readFileSync(backupPath);
    const timestamp = new Date().toISOString().split('T')[0];

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-sqlite3',
        'Content-Disposition': `attachment; filename="lifeos-backup-${timestamp}.db"`,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Export] DB backup failed:', error);
    return NextResponse.json(
      { error: 'Backup failed' },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    if (backupPath) {
      try { fs.unlinkSync(backupPath); } catch { /* ignore */ }
    }
  }
}
