import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { verifyOAuthState, encrypt, hashForLogging } from '@/lib/crypto'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  : 'http://localhost:3000/api/auth/google/callback'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle errors from Google (user denied access, etc.)
  if (error) {
    console.warn(`Google OAuth error: ${error}`)
    return NextResponse.redirect(
      new URL(`/?error=google_auth_denied`, request.url)
    )
  }

  // Validate required parameters
  if (!code || !state) {
    console.warn('Google OAuth callback missing required parameters')
    return NextResponse.redirect(
      new URL('/?error=google_auth_invalid', request.url)
    )
  }

  // Verify CSRF state - this is critical for security
  const stateData = verifyOAuthState(state)
  if (!stateData) {
    console.warn('Google OAuth state verification failed - possible CSRF attack')
    return NextResponse.redirect(
      new URL('/?error=google_auth_expired', request.url)
    )
  }

  const { userId } = stateData

  // Verify configuration
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth not properly configured')
    return NextResponse.redirect(
      new URL('/?error=google_auth_config', request.url)
    )
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData.error)
      return NextResponse.redirect(
        new URL('/?error=google_auth_token', request.url)
      )
    }

    const tokens = await tokenResponse.json()

    // Validate we got the required tokens
    if (!tokens.access_token) {
      console.error('No access token received from Google')
      return NextResponse.redirect(
        new URL('/?error=google_auth_token', request.url)
      )
    }

    // Encrypt tokens before storing - NEVER store plain text tokens
    const encryptedAccessToken = encrypt(tokens.access_token)
    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null

    // Calculate token expiry
    const expiresAt = new Date(
      Date.now() + (tokens.expires_in || 3600) * 1000
    ).toISOString()

    // Store encrypted tokens in database
    const supabase = createRouteHandlerClient({ cookies })

    // Verify the user still exists and matches
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      console.warn('Session mismatch during OAuth callback')
      return NextResponse.redirect(
        new URL('/?error=google_auth_session', request.url)
      )
    }

    // Upsert integration record
    const { error: dbError } = await supabase
      .from('user_integrations')
      .upsert(
        {
          user_id: userId,
          provider: 'google_calendar',
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          expires_at: expiresAt,
          connected: true,
          settings: {
            syncInterviews: true,
            syncDeadlines: true,
          },
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,provider',
        }
      )

    if (dbError) {
      console.error('Failed to save integration:', dbError.message)
      return NextResponse.redirect(
        new URL('/?error=google_auth_save', request.url)
      )
    }

    // Log success (never log actual tokens, use hash for debugging)
    console.log(
      `Google Calendar connected for user ${hashForLogging(userId)}`
    )

    // Redirect back to app with success
    return NextResponse.redirect(
      new URL('/?google_connected=true', request.url)
    )
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.redirect(
      new URL('/?error=google_auth_failed', request.url)
    )
  }
}
