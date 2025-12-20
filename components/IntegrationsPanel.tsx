'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  MessageCircle,
  Bell,
  Check,
  X,
  ExternalLink,
  Link2,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface IntegrationsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

interface IntegrationSettings {
  googleCalendar: {
    enabled: boolean
    connected: boolean
    syncInterviews: boolean
    syncDeadlines: boolean
    loading: boolean
  }
  telegram: {
    enabled: boolean
    connected: boolean
    chatId: string
    botUsername: string
    notifications: {
      interviews: boolean
      deadlines: boolean
      statusChanges: boolean
    }
    loading: boolean
    testSending: boolean
  }
}

export default function IntegrationsPanel({
  open,
  onOpenChange,
  userId,
}: IntegrationsPanelProps) {
  const [settings, setSettings] = useState<IntegrationSettings>({
    googleCalendar: {
      enabled: false,
      connected: false,
      syncInterviews: true,
      syncDeadlines: true,
      loading: false,
    },
    telegram: {
      enabled: false,
      connected: false,
      chatId: '',
      botUsername: '',
      notifications: {
        interviews: true,
        deadlines: true,
        statusChanges: true,
      },
      loading: false,
      testSending: false,
    },
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load integration status from database
  const loadIntegrations = useCallback(async () => {
    try {
      const { data: integrations } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', userId)

      if (integrations) {
        const googleIntegration = integrations.find(i => i.provider === 'google_calendar')
        const telegramIntegration = integrations.find(i => i.provider === 'telegram')

        setSettings(prev => ({
          ...prev,
          googleCalendar: {
            ...prev.googleCalendar,
            connected: googleIntegration?.connected || false,
            enabled: googleIntegration?.connected || false,
            syncInterviews: googleIntegration?.settings?.syncInterviews ?? true,
            syncDeadlines: googleIntegration?.settings?.syncDeadlines ?? true,
          },
          telegram: {
            ...prev.telegram,
            connected: telegramIntegration?.connected || false,
            enabled: telegramIntegration?.connected || false,
            chatId: telegramIntegration?.settings?.chatId || '',
            notifications: {
              interviews: telegramIntegration?.settings?.notifications?.interviews ?? true,
              deadlines: telegramIntegration?.settings?.notifications?.deadlines ?? true,
              statusChanges: telegramIntegration?.settings?.notifications?.statusChanges ?? true,
            },
          },
        }))
      }
    } catch (err) {
      console.error('Failed to load integrations:', err)
    }
  }, [userId, supabase])

  useEffect(() => {
    if (open) {
      loadIntegrations()
    }
  }, [open, loadIntegrations])

  // Check for Google OAuth callback success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('google_connected') === 'true') {
      loadIntegrations()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    const googleError = urlParams.get('error')
    if (googleError?.startsWith('google_auth_')) {
      setError('Failed to connect Google Calendar. Please try again.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [loadIntegrations])

  const handleGoogleCalendarConnect = async () => {
    setSettings(prev => ({
      ...prev,
      googleCalendar: { ...prev.googleCalendar, loading: true },
    }))
    setError(null)

    try {
      // Get OAuth URL from our API
      const response = await fetch('/api/auth/google')
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Google OAuth
      window.location.href = data.url
    } catch (err) {
      console.error('Failed to initiate Google OAuth:', err)
      setError('Failed to connect Google Calendar. Please try again.')
      setSettings(prev => ({
        ...prev,
        googleCalendar: { ...prev.googleCalendar, loading: false },
      }))
    }
  }

  const handleGoogleCalendarDisconnect = async () => {
    setSettings(prev => ({
      ...prev,
      googleCalendar: { ...prev.googleCalendar, loading: true },
    }))

    try {
      await supabase
        .from('user_integrations')
        .update({ connected: false, access_token: null, refresh_token: null })
        .eq('user_id', userId)
        .eq('provider', 'google_calendar')

      setSettings(prev => ({
        ...prev,
        googleCalendar: {
          ...prev.googleCalendar,
          connected: false,
          enabled: false,
          loading: false,
        },
      }))
    } catch (err) {
      console.error('Failed to disconnect:', err)
      setSettings(prev => ({
        ...prev,
        googleCalendar: { ...prev.googleCalendar, loading: false },
      }))
    }
  }

  const handleTelegramConnect = async () => {
    if (!settings.telegram.chatId) {
      setError('Please enter your Telegram Chat ID first')
      return
    }

    setSettings(prev => ({
      ...prev,
      telegram: { ...prev.telegram, loading: true },
    }))
    setError(null)

    try {
      // Verify chat ID by sending a test message
      const response = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: settings.telegram.chatId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify Telegram')
      }

      // Save to database
      const integrationData = {
        user_id: userId,
        provider: 'telegram' as const,
        connected: true,
        settings: {
          chatId: settings.telegram.chatId,
          notifications: settings.telegram.notifications,
        },
      }

      const { data: existing } = await supabase
        .from('user_integrations')
        .select('id')
        .eq('user_id', userId)
        .eq('provider', 'telegram')
        .single()

      if (existing) {
        await supabase
          .from('user_integrations')
          .update(integrationData)
          .eq('id', existing.id)
      } else {
        await supabase.from('user_integrations').insert(integrationData)
      }

      setSettings(prev => ({
        ...prev,
        telegram: {
          ...prev.telegram,
          connected: true,
          enabled: true,
          loading: false,
          botUsername: data.botUsername || '',
        },
      }))
    } catch (err) {
      console.error('Failed to connect Telegram:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect Telegram')
      setSettings(prev => ({
        ...prev,
        telegram: { ...prev.telegram, loading: false },
      }))
    }
  }

  const handleTelegramDisconnect = async () => {
    try {
      await supabase
        .from('user_integrations')
        .update({ connected: false })
        .eq('user_id', userId)
        .eq('provider', 'telegram')

      setSettings(prev => ({
        ...prev,
        telegram: {
          ...prev.telegram,
          connected: false,
          enabled: false,
        },
      }))
    } catch (err) {
      console.error('Failed to disconnect Telegram:', err)
    }
  }

  const handleSendTestMessage = async () => {
    setSettings(prev => ({
      ...prev,
      telegram: { ...prev.telegram, testSending: true },
    }))

    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: settings.telegram.chatId,
          message: '🎉 Test message from Job Dashboard!\n\nYour Telegram integration is working correctly.',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send test message')
      }
    } catch (err) {
      setError('Failed to send test message')
    } finally {
      setSettings(prev => ({
        ...prev,
        telegram: { ...prev.telegram, testSending: false },
      }))
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Update Google Calendar settings
      if (settings.googleCalendar.connected) {
        await supabase
          .from('user_integrations')
          .update({
            settings: {
              syncInterviews: settings.googleCalendar.syncInterviews,
              syncDeadlines: settings.googleCalendar.syncDeadlines,
            },
          })
          .eq('user_id', userId)
          .eq('provider', 'google_calendar')
      }

      // Update Telegram settings
      if (settings.telegram.connected) {
        await supabase
          .from('user_integrations')
          .update({
            settings: {
              chatId: settings.telegram.chatId,
              notifications: settings.telegram.notifications,
            },
          })
          .eq('user_id', userId)
          .eq('provider', 'telegram')
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Integrations
          </DialogTitle>
          <DialogDescription>
            Connect external services to enhance your job search workflow
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Tabs defaultValue="calendar" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Google Calendar
            </TabsTrigger>
            <TabsTrigger value="telegram">
              <MessageCircle className="mr-2 h-4 w-4" />
              Telegram
            </TabsTrigger>
          </TabsList>

          {/* Google Calendar */}
          <TabsContent value="calendar" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Google Calendar</CardTitle>
                      <CardDescription>
                        Sync interviews and deadlines to your calendar
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={settings.googleCalendar.connected ? 'default' : 'secondary'}>
                    {settings.googleCalendar.connected ? (
                      <>
                        <Check className="mr-1 h-3 w-3" /> Connected
                      </>
                    ) : (
                      'Not Connected'
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!settings.googleCalendar.connected ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Connect your Google account to automatically sync interview schedules
                      and application deadlines to your Google Calendar.
                    </p>
                    <Button
                      onClick={handleGoogleCalendarConnect}
                      className="w-full"
                      disabled={settings.googleCalendar.loading}
                    >
                      {settings.googleCalendar.loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-2 h-4 w-4" />
                      )}
                      Connect Google Calendar
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sync-interviews" className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Sync Interview Events
                        </Label>
                        <Switch
                          id="sync-interviews"
                          checked={settings.googleCalendar.syncInterviews}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              googleCalendar: {
                                ...prev.googleCalendar,
                                syncInterviews: checked,
                              },
                            }))
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automatically add interview appointments to your calendar with reminders
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sync-deadlines" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Sync Application Deadlines
                        </Label>
                        <Switch
                          id="sync-deadlines"
                          checked={settings.googleCalendar.syncDeadlines}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              googleCalendar: {
                                ...prev.googleCalendar,
                                syncDeadlines: checked,
                              },
                            }))
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add deadline reminders for your applications
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 dark:text-red-400"
                      onClick={handleGoogleCalendarDisconnect}
                      disabled={settings.googleCalendar.loading}
                    >
                      {settings.googleCalendar.loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Disconnect Google Calendar
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Telegram */}
          <TabsContent value="telegram" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Telegram Notifications</CardTitle>
                      <CardDescription>
                        Get instant notifications via Telegram bot
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={settings.telegram.connected ? 'default' : 'secondary'}>
                    {settings.telegram.connected ? (
                      <>
                        <Check className="mr-1 h-3 w-3" /> Connected
                      </>
                    ) : (
                      'Not Connected'
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!settings.telegram.connected ? (
                  <>
                    <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">How to get your Chat ID:</p>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Open Telegram and search for <strong>@JobDashboardBot</strong></li>
                        <li>Start a conversation with the bot</li>
                        <li>Send the command <code className="bg-muted px-1 rounded">/start</code></li>
                        <li>The bot will reply with your Chat ID</li>
                      </ol>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chat-id">Telegram Chat ID</Label>
                      <Input
                        id="chat-id"
                        placeholder="e.g., 123456789"
                        value={settings.telegram.chatId}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            telegram: {
                              ...prev.telegram,
                              chatId: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <Button
                      onClick={handleTelegramConnect}
                      className="w-full"
                      disabled={settings.telegram.loading || !settings.telegram.chatId}
                    >
                      {settings.telegram.loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MessageCircle className="mr-2 h-4 w-4" />
                      )}
                      Connect Telegram
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Connected</p>
                        <p className="text-sm text-muted-foreground">
                          Chat ID: {settings.telegram.chatId}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendTestMessage}
                        disabled={settings.telegram.testSending}
                      >
                        {settings.telegram.testSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Send Test'
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-medium">Notification Preferences</Label>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-interviews" className="font-normal">
                          Interview Reminders
                        </Label>
                        <Switch
                          id="notify-interviews"
                          checked={settings.telegram.notifications.interviews}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              telegram: {
                                ...prev.telegram,
                                notifications: {
                                  ...prev.telegram.notifications,
                                  interviews: checked,
                                },
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-deadlines" className="font-normal">
                          Deadline Alerts
                        </Label>
                        <Switch
                          id="notify-deadlines"
                          checked={settings.telegram.notifications.deadlines}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              telegram: {
                                ...prev.telegram,
                                notifications: {
                                  ...prev.telegram.notifications,
                                  deadlines: checked,
                                },
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-status" className="font-normal">
                          Status Change Updates
                        </Label>
                        <Switch
                          id="notify-status"
                          checked={settings.telegram.notifications.statusChanges}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              telegram: {
                                ...prev.telegram,
                                notifications: {
                                  ...prev.telegram.notifications,
                                  statusChanges: checked,
                                },
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 dark:text-red-400"
                      onClick={handleTelegramDisconnect}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Disconnect Telegram
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
