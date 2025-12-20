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
    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Telegram bot is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Get bot info to return username
    const botInfoResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    )
    const botInfo = await botInfoResponse.json()

    // Send a verification message to the chat
    const message = `✅ *Job Dashboard Connected!*

Your Telegram notifications are now set up.

You'll receive notifications about:
• Interview reminders
• Application deadlines
• Status changes

Manage your notification preferences in the Job Dashboard settings.`

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
          parse_mode: 'Markdown',
        }),
      }
    )

    const data = await response.json()

    if (!data.ok) {
      // Handle specific Telegram errors
      if (data.error_code === 400 && data.description?.includes('chat not found')) {
        return NextResponse.json(
          { error: 'Chat ID not found. Please make sure you started a conversation with our bot first.' },
          { status: 400 }
        )
      }
      if (data.error_code === 403) {
        return NextResponse.json(
          { error: 'Bot was blocked by the user. Please unblock the bot and try again.' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: data.description || 'Failed to send verification message' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      botUsername: botInfo.ok ? botInfo.result.username : 'JobDashboardBot',
    })
  } catch (error) {
    console.error('Telegram verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify Telegram connection' },
      { status: 500 }
    )
  }
}
