/**
 * Custom Password Login API Route
 * 
 * Authenticates users with email/password using Auth0's Resource Owner Password Grant
 * 
 * IMPORTANT: You must enable the Password grant type in Auth0:
 * 1. Go to Applications → Your App → Advanced Settings → Grant Types
 * 2. Enable "Password"
 * 3. Save
 * 
 * Also set Default Directory in Tenant Settings to "Username-Password-Authentication"
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface Auth0TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface Auth0UserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    const audience = process.env.AUTH0_AUDIENCE;

    if (!auth0Domain || !clientId || !clientSecret) {
      console.error('Auth0 configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Attempting Auth0 login for:', email);
    console.log('Auth0 Domain:', auth0Domain);

    // Authenticate with Auth0 using Resource Owner Password Grant
    // Using password-realm grant type which doesn't require default directory
    const tokenResponse = await fetch(`${auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        username: email,
        password: password,
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience || `${auth0Domain}/api/v2/`,
        scope: 'openid profile email offline_access',
        realm: 'Username-Password-Authentication', // Your database connection name
      }),
    });

    const responseText = await tokenResponse.text();
    console.log('Auth0 response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText };
      }
      
      console.error('Auth0 token error:', errorData);
      
      if (errorData.error === 'invalid_grant') {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      if (errorData.error === 'unauthorized_client') {
        return NextResponse.json(
          { error: 'Password grant not enabled. Please enable it in Auth0 Dashboard → Applications → Advanced Settings → Grant Types' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.error_description || errorData.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    const tokens: Auth0TokenResponse = JSON.parse(responseText);
    console.log('Auth0 tokens received successfully');

    // Get user info from Auth0
    const userInfoResponse = await fetch(`${auth0Domain}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info');
      return NextResponse.json(
        { error: 'Failed to get user information' },
        { status: 500 }
      );
    }

    const userInfo: Auth0UserInfo = await userInfoResponse.json();
    console.log('User info received:', userInfo.email);

    // Check if user has admin role (check multiple locations)
    const userRoles = (userInfo['https://nested.money/roles'] as string[]) || [];
    const userRole = (userInfo['https://nested.money/role'] as string) || '';
    const appMetadata = (userInfo['https://nested.money/app_metadata'] as any) || {};
    
    const isAdmin = 
      userRoles.includes('ADMIN') || 
      userRoles.includes('admin') ||
      userRole.toUpperCase() === 'ADMIN' ||
      appMetadata?.role?.toUpperCase() === 'ADMIN' ||
      userInfo.email?.endsWith('@nested.money') ||
      // TEMPORARY: Allow all authenticated users - remove this once Auth0 Action is set up
      true;

    console.log('Admin check:', { userRoles, userRole, appMetadata, isAdmin });

    // Calculate token expiration
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    // Create session data
    const sessionData = {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      user: {
        sub: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name || userInfo.nickname || userInfo.email,
        picture: userInfo.picture,
        isAdmin,
      },
    };

    // Store session in cookie
    const cookieStore = await cookies();
    const sessionString = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    
    cookieStore.set('admin_session', sessionString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: sessionData.user,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
