import { NextRequest, NextResponse } from 'next/server';

// In-memory store for the latest critical message (for demo; replace with a more robust solution for production)
let latestCriticalMessage: any = null;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    latestCriticalMessage = data;
    // Optionally, you could broadcast this to a websocket or similar for real-time updates
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

// For polling: allow GET to fetch the latest critical message
export async function GET() {
  if (latestCriticalMessage) {
    return NextResponse.json({ message: latestCriticalMessage });
  } else {
    return NextResponse.json({ message: null });
  }
} 