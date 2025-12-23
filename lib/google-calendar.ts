'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { decrypt, encrypt, hashForLogging } from './crypto'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''

interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  reminders?: {
    useDefault: boolean
    overrides?: Array<{ method: string; minutes: number }>
  }
}

interface CalendarEventResponse {
  id: string
  htmlLink: string
  hangoutLink?: string
  summary: string
  description?: string
  location?: string
  start: { dateTime: string; timeZone?: string }
  end: { dateTime: string; timeZone?: string }
}

/**
 * Refresh the access token using the refresh token
 * Returns new access token or null if refresh failed
 */
async function refreshAccessToken(
  userId: string,
  encryptedRefreshToken: string
): Promise<string | null> {
  try {
    // Decrypt the refresh token
    const refreshToken = decrypt(encryptedRefreshToken)

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      console.error(
        `Failed to refresh token for user ${hashForLogging(userId)}`
      )
      return null
    }

    const tokens = await response.json()

    // Encrypt the new access token
    const encryptedAccessToken = encrypt(tokens.access_token)
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString()

    // Update tokens in database
    const supabase = createRouteHandlerClient({ cookies })
    await supabase
      .from('user_integrations')
      .update({
        access_token: encryptedAccessToken,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')

    return tokens.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

/**
 * Get a valid access token for the user
 * Automatically refreshes if expired
 */
async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: integration } = await supabase
    .from('user_integrations')
    .select('access_token, refresh_token, expires_at, connected')
    .eq('user_id', userId)
    .eq('provider', 'google_calendar')
    .single()

  if (!integration || !integration.connected) {
    return null
  }

  if (!integration.access_token) {
    return null
  }

  // Check if token is expired (with 5 minute buffer)
  const expiresAt = new Date(integration.expires_at)
  const now = new Date()
  const bufferMs = 5 * 60 * 1000

  if (expiresAt.getTime() - bufferMs <= now.getTime()) {
    // Token expired, try to refresh
    if (!integration.refresh_token) {
      console.warn(`No refresh token for user ${hashForLogging(userId)}`)
      return null
    }
    return await refreshAccessToken(userId, integration.refresh_token)
  }

  // Decrypt and return the access token
  try {
    return decrypt(integration.access_token)
  } catch (error) {
    console.error('Failed to decrypt access token:', error)
    return null
  }
}

export async function createCalendarEvent(
  userId: string,
  event: CalendarEvent
): Promise<CalendarEventResponse | null> {
  const accessToken = await getValidAccessToken(userId)

  if (!accessToken) {
    console.warn(`No valid access token for user ${hashForLogging(userId)}`)
    return null
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to create calendar event:', error.error?.message)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return null
  }
}

export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<CalendarEventResponse | null> {
  const accessToken = await getValidAccessToken(userId)

  if (!accessToken) {
    return null
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      console.error('Failed to update calendar event')
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return null
  }
}

export async function deleteCalendarEvent(
  userId: string,
  eventId: string
): Promise<boolean> {
  const accessToken = await getValidAccessToken(userId)

  if (!accessToken) {
    return false
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return response.ok || response.status === 404
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return false
  }
}

export async function getCalendarEvent(
  userId: string,
  eventId: string
): Promise<CalendarEventResponse | null> {
  const accessToken = await getValidAccessToken(userId)

  if (!accessToken) {
    return null
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting calendar event:', error)
    return null
  }
}

export async function listCalendarEvents(
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEventResponse[]> {
  const accessToken = await getValidAccessToken(userId)

  if (!accessToken) {
    return []
  }

  try {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
    })

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error listing calendar events:', error)
    return []
  }
}

/**
 * Create an interview event in Google Calendar
 */
export async function createInterviewEvent(
  userId: string,
  options: {
    company: string
    role: string
    interviewType: string
    dateTime: string
    durationMinutes?: number
    location?: string
    interviewerNames?: string[]
    notes?: string
    meetingLink?: string
  }
): Promise<CalendarEventResponse | null> {
  const {
    company,
    role,
    interviewType,
    dateTime,
    durationMinutes = 60,
    location,
    interviewerNames,
    notes,
    meetingLink,
  } = options

  const startTime = new Date(dateTime)
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)

  // Build description with interview details
  let description = `Interview for ${role} at ${company}\n\nType: ${interviewType}`
  if (interviewerNames && interviewerNames.length > 0) {
    description += `\nInterviewers: ${interviewerNames.join(', ')}`
  }
  if (notes) {
    description += `\n\nNotes:\n${notes}`
  }
  if (meetingLink) {
    description += `\n\nMeeting Link: ${meetingLink}`
  }

  const event: CalendarEvent = {
    summary: `${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview - ${company}`,
    description,
    location: meetingLink || location,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 1440 }, // 24 hours before
      ],
    },
  }

  return createCalendarEvent(userId, event)
}

/**
 * Create a deadline event in Google Calendar
 */
export async function createDeadlineEvent(
  userId: string,
  options: {
    company: string
    role: string
    deadline: string
    notes?: string
  }
): Promise<CalendarEventResponse | null> {
  const { company, role, deadline, notes } = options

  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(23, 59, 0, 0)
  const startDate = new Date(deadlineDate)
  startDate.setHours(23, 0, 0, 0)

  let description = `Application deadline for ${role} at ${company}`
  if (notes) {
    description += `\n\nNotes:\n${notes}`
  }

  const event: CalendarEvent = {
    summary: `Deadline: ${company} - ${role}`,
    description,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: deadlineDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'email', minutes: 1440 },
      ],
    },
  }

  return createCalendarEvent(userId, event)
}
