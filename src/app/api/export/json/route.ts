import { NextResponse } from 'next/server';
import { exportFullJSON } from '@/server/services/export';
import { isAuthenticated } from '@/server/services/auth';

/**
 * Full JSON export endpoint.
 * Protected — requires valid session.
 * Returns a downloadable JSON file with all user data.
 */
export async function GET() {
  // Double-check auth (middleware should catch, but defense-in-depth)
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = exportFullJSON();
    const json = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lifeos-export-${timestamp}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Export] JSON export failed:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}
