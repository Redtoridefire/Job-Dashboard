import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { hashForLogging } from '@/lib/crypto'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// Maximum message length (Telegram limit is 4096)
const MAX_MESSAGE_LENGTH = 4000

// Sanitize message to prevent injection
function sanitizeMessage(message: string): string {
  // Trim and limit length
  return message.trim().slice(0, MAX_MESSAGE_LENGTH)
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
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { chatId, message, parseMode = 'Markdown' } = body

    // Validate inputs
    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Chat ID and message are required' },
        { status: 400 }
      )
    }

    if (typeof chatId !== 'string' || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input types' },
        { status: 400 }
      )
    }

    // Validate parse mode
    const validParseModes = ['Markdown', 'MarkdownV2', 'HTML']
    if (!validParseModes.includes(parseMode)) {
      return NextResponse.json(
        { error: 'Invalid parse mode' },
        { status: 400 }
      )
    }

    // Verify the user owns this chat ID (check their integration)
    const { data: integration } = await supabase
      .from('user_integrations')
      .select('settings')
      .eq('user_id', session.user.id)
      .eq('provider', 'telegram')
      .eq('connected', true)
      .single()

    if (!integration || integration.settings?.chatId !== chatId.trim()) {
      console.warn(
        `Unauthorized Telegram send attempt by ${hashForLogging(session.user.id)}`
      )
      return NextResponse.json(
        { error: 'You can only send messages to your connected Telegram account' },
        { status: 403 }
      )
    }

    // Sanitize and send message
    const sanitizedMessage = sanitizeMessage(message)

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: sanitizedMessage,
          parse_mode: parseMode,
        }),
      }
    )

    const data = await response.json()

    if (!data.ok) {
      console.error('Telegram send error:', data.description)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data.result.message_id,
    })
  } catch (error) {
    console.error('Telegram send error:', error)
    return NextResponse.json(
      { error: 'Failed to send Telegram message' },
      { status: 500 }
    )
  }
}
