import { NextResponse } from 'next/server';

/**
 * Public health check endpoint.
 * Used by Docker healthcheck and monitoring tools.
 * Does NOT require authentication.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'lifeOS',
    timestamp: new Date().toISOString(),
  });
}
