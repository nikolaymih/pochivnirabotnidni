import { NextResponse } from 'next/server';

/**
 * Health check endpoint for network verification
 *
 * Used by useNetworkState hook to verify actual connectivity.
 * Minimal response to avoid unnecessary data transfer.
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

/**
 * HEAD method for lightweight connectivity checks
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
