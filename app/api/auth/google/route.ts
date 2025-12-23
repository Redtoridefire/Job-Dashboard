import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateOAuthState } from '@/lib/crypto'

// Google OAuth configuration - credentials stored securely in environment
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  : 'http://localhost:3000/api/auth/google/callback'

// Minimal scopes - only request what's needed
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events', // Read/write calendar events only
].join(' ')

export async function GET(request: NextRequest) {
  // Validate environment configuration
  if (!GOOGLE_CLIENT_ID) {
    console.error('Google OAuth not configured: missing GOOGLE_CLIENT_ID')
    return NextResponse.json(
      { error: 'Google Calendar integration is not available' },
      { status: 503 }
    )
  }

  if (!process.env.ENCRYPTION_SECRET) {
    console.error('Security configuration missing: ENCRYPTION_SECRET')
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }

  const supabase = createRouteHandlerClient({ cookies })

  // Verify user is authenticated
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()

  if (authError || !session) {
    return NextResponse.json(
      { error: 'Please sign in to connect your Google Calendar' },
      { status: 401 }
    )
  }

  try {
    // Generate cryptographically secure state with CSRF protection
    // State is encrypted and includes: userId, timestamp, nonce
    const state = generateOAuthState(session.user.id)

    // Build OAuth URL with security parameters
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', SCOPES)
    authUrl.searchParams.set('access_type', 'offline') // Get refresh token
    authUrl.searchParams.set('prompt', 'consent') // Always show consent for refresh token
    authUrl.searchParams.set('state', state) // CSRF protection

    return NextResponse.json({ url: authUrl.toString() })
  } catch (error) {
    console.error('Failed to generate OAuth URL:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google connection' },
      { status: 500 }
    )
  }
}
