import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { chatId, message, parseMode = 'Markdown' } = await request.json()

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Chat ID and message are required' },
        { status: 400 }
      )
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Telegram bot is not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
        }),
      }
    )

    const data = await response.json()

    if (!data.ok) {
      return NextResponse.json(
        { error: data.description || 'Failed to send message' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, messageId: data.result.message_id })
  } catch (error) {
    console.error('Telegram send error:', error)
    return NextResponse.json(
      { error: 'Failed to send Telegram message' },
      { status: 500 }
    )
  }
}
