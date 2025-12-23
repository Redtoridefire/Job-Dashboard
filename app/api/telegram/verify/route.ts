import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { hashForLogging } from '@/lib/crypto'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// Rate limiting: Track verification attempts per user (in production, use Redis)
const verificationAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const record = verificationAttempts.get(userId)

  if (!record || now > record.resetAt) {
    verificationAttempts.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false
  }

  record.count++
  return true
}

// Validate chat ID format (Telegram chat IDs are integers, can be negative for groups)
function isValidChatId(chatId: string): boolean {
  // Must be a valid integer (positive or negative)
  const parsed = parseInt(chatId, 10)
  if (isNaN(parsed)) return false
  if (chatId !== parsed.toString()) return false
  // Reasonable bounds for chat IDs
  if (Math.abs(parsed) > 10000000000000) return false
  return true
}

export async function POST(request: NextRequest) {
  // Validate bot token is configured
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Telegram bot token not configured')
    return NextResponse.json(
      { error: 'Telegram integration is not available' },
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
      { error: 'Please sign in to connect Telegram' },
      { status: 401 }
    )
  }

  // Rate limiting check
  if (!checkRateLimit(session.user.id)) {
    console.warn(
      `Rate limit exceeded for Telegram verification: ${hashForLogging(session.user.id)}`
    )
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in 15 minutes.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { chatId } = body

    // Validate chat ID
    if (!chatId || typeof chatId !== 'string') {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    const trimmedChatId = chatId.trim()

    if (!isValidChatId(trimmedChatId)) {
      return NextResponse.json(
        { error: 'Invalid Chat ID format. Please enter a valid numeric Chat ID.' },
        { status: 400 }
      )
    }

    // Get bot info (cache this in production)
    const botInfoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    )
    const botInfo = await botInfoResponse.json()

    if (!botInfo.ok) {
      console.error('Failed to get bot info')
      return NextResponse.json(
        { error: 'Failed to verify bot configuration' },
        { status: 500 }
      )
    }

    // Send verification message
    const message = `✅ *Job Dashboard Connected!*

Your Telegram notifications are now set up\\.

You'll receive notifications about:
• Interview reminders
• Application deadlines
• Status changes

Manage your preferences in the Job Dashboard settings\\.`

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: trimmedChatId,
          text: message,
          parse_mode: 'MarkdownV2',
        }),
      }
    )

    const data = await response.json()

    if (!data.ok) {
      // Handle specific Telegram errors with user-friendly messages
      if (data.error_code === 400) {
        if (data.description?.includes('chat not found')) {
          return NextResponse.json(
            {
              error: `Chat not found. Please message @${botInfo.result.username} first, then try again.`,
            },
            { status: 400 }
          )
        }
      }
      if (data.error_code === 403) {
        return NextResponse.json(
          {
            error: `Bot was blocked. Please unblock @${botInfo.result.username} and try again.`,
          },
          { status: 403 }
        )
      }

      console.error('Telegram API error:', data.description)
      return NextResponse.json(
        { error: 'Failed to send verification message. Please check your Chat ID.' },
        { status: 400 }
      )
    }

    console.log(
      `Telegram connected for user ${hashForLogging(session.user.id)}`
    )

    return NextResponse.json({
      success: true,
      botUsername: botInfo.result.username,
    })
  } catch (error) {
    console.error('Telegram verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify Telegram connection' },
      { status: 500 }
    )
  }
}
