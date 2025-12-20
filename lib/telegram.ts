'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

interface TelegramMessage {
  chat_id: string
  text: string
  parse_mode?: 'Markdown' | 'HTML'
  disable_web_page_preview?: boolean
}

async function sendTelegramMessage(params: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured')
    return false
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          parse_mode: params.parse_mode || 'Markdown',
        }),
      }
    )

    const data = await response.json()
    return data.ok === true
  } catch (error) {
    console.error('Failed to send Telegram message:', error)
    return false
  }
}

export async function sendInterviewReminder(
  userId: string,
  options: {
    company: string
    role: string
    interviewType: string
    dateTime: string
    interviewerNames?: string[]
    meetingLink?: string
    notes?: string
  }
): Promise<boolean> {
  const supabase = createRouteHandlerClient({ cookies })

  // Get user's Telegram integration
  const { data: integration } = await supabase
    .from('user_integrations')
    .select('settings')
    .eq('user_id', userId)
    .eq('provider', 'telegram')
    .eq('connected', true)
    .single()

  if (!integration?.settings?.chatId || !integration.settings.notifications?.interviews) {
    return false
  }

  const { company, role, interviewType, dateTime, interviewerNames, meetingLink, notes } = options
  const date = new Date(dateTime)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  let message = `📅 *Interview Reminder*

*${company}* - ${role}

🕐 *When:* ${formattedDate} at ${formattedTime}
📋 *Type:* ${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}`

  if (interviewerNames && interviewerNames.length > 0) {
    message += `\n👤 *Interviewer(s):* ${interviewerNames.join(', ')}`
  }

  if (meetingLink) {
    message += `\n🔗 *Meeting Link:* ${meetingLink}`
  }

  if (notes) {
    message += `\n\n📝 *Notes:*\n${notes}`
  }

  message += '\n\n_Good luck!_ 🍀'

  return sendTelegramMessage({
    chat_id: integration.settings.chatId,
    text: message,
  })
}

export async function sendDeadlineReminder(
  userId: string,
  options: {
    company: string
    role: string
    deadline: string
    daysRemaining: number
    notes?: string
  }
): Promise<boolean> {
  const supabase = createRouteHandlerClient({ cookies })

  // Get user's Telegram integration
  const { data: integration } = await supabase
    .from('user_integrations')
    .select('settings')
    .eq('user_id', userId)
    .eq('provider', 'telegram')
    .eq('connected', true)
    .single()

  if (!integration?.settings?.chatId || !integration.settings.notifications?.deadlines) {
    return false
  }

  const { company, role, deadline, daysRemaining, notes } = options
  const date = new Date(deadline)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let urgencyEmoji = '📋'
  if (daysRemaining <= 1) {
    urgencyEmoji = '🚨'
  } else if (daysRemaining <= 3) {
    urgencyEmoji = '⚠️'
  }

  let message = `${urgencyEmoji} *Application Deadline Reminder*

*${company}* - ${role}

📅 *Deadline:* ${formattedDate}`

  if (daysRemaining === 0) {
    message += '\n⏰ *Due TODAY!*'
  } else if (daysRemaining === 1) {
    message += '\n⏰ *Due TOMORROW!*'
  } else {
    message += `\n⏰ *${daysRemaining} days remaining*`
  }

  if (notes) {
    message += `\n\n📝 *Notes:*\n${notes}`
  }

  message += '\n\n_Don\'t forget to submit!_'

  return sendTelegramMessage({
    chat_id: integration.settings.chatId,
    text: message,
  })
}

export async function sendStatusChangeNotification(
  userId: string,
  options: {
    company: string
    role: string
    oldStatus: string
    newStatus: string
  }
): Promise<boolean> {
  const supabase = createRouteHandlerClient({ cookies })

  // Get user's Telegram integration
  const { data: integration } = await supabase
    .from('user_integrations')
    .select('settings')
    .eq('user_id', userId)
    .eq('provider', 'telegram')
    .eq('connected', true)
    .single()

  if (!integration?.settings?.chatId || !integration.settings.notifications?.statusChanges) {
    return false
  }

  const { company, role, oldStatus, newStatus } = options

  const statusEmojis: Record<string, string> = {
    new: '🆕',
    submitted: '📤',
    interviewing: '💼',
    offer: '🎉',
    accepted: '✅',
    rejected: '❌',
  }

  const emoji = statusEmojis[newStatus] || '📋'

  const message = `${emoji} *Application Status Update*

*${company}* - ${role}

Status changed: _${oldStatus}_ → *${newStatus}*`

  return sendTelegramMessage({
    chat_id: integration.settings.chatId,
    text: message,
  })
}
