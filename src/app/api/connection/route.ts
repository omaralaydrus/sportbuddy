import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ configured: ['SANDBOX_CLIENT_ID', 'SANDBOX_CLIENT_SECRET', 'SANDBOX_USERNAME', 'SANDBOX_PASSWORD'].every(name => !!process.env[name]), mapsConfigured: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }, { headers: { 'Cache-Control': 'no-store' } });
}
