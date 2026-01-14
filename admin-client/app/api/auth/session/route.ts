/**
 * Session API Route
 * 
 * Returns the current user session
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface SessionData {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    isAdmin: boolean;
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      const sessionData: SessionData = JSON.parse(
        Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
      );

      // Check if session has expired
      if (Date.now() > sessionData.expiresAt) {
        // Clear expired session
        cookieStore.delete('admin_session');
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        user: sessionData.user,
        accessToken: sessionData.accessToken,
      });

    } catch {
      // Invalid session data
      cookieStore.delete('admin_session');
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}
