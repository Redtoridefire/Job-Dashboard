'use client'

import { useState, useEffect } from 'react'
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
  Settings,
  Link2,
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
  }
  telegram: {
    enabled: boolean
    connected: boolean
    chatId: string
    notifications: {
      interviews: boolean
      deadlines: boolean
      statusChanges: boolean
    }
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
    },
    telegram: {
      enabled: false,
      connected: false,
      chatId: '',
      notifications: {
        interviews: true,
        deadlines: true,
        statusChanges: true,
      },
    },
  })
  const [saving, setSaving] = useState(false)
  const [telegramBotToken, setTelegramBotToken] = useState('')

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`integrations-${userId}`)
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [userId])

  const saveSettings = async () => {
    setSaving(true)
    try {
      localStorage.setItem(`integrations-${userId}`, JSON.stringify(settings))
      // In a real app, you'd save this to the database
      await new Promise((resolve) => setTimeout(resolve, 500))
    } finally {
      setSaving(false)
    }
  }

  const handleGoogleCalendarConnect = () => {
    // In production, this would initiate OAuth flow
    // For now, we'll simulate connection
    const connected = confirm(
      'This would redirect you to Google for authentication.\n\nFor demo purposes, click OK to simulate connection.'
    )
    if (connected) {
      setSettings((prev) => ({
        ...prev,
        googleCalendar: {
          ...prev.googleCalendar,
          connected: true,
          enabled: true,
        },
      }))
    }
  }

  const handleGoogleCalendarDisconnect = () => {
    setSettings((prev) => ({
      ...prev,
      googleCalendar: {
        ...prev.googleCalendar,
        connected: false,
        enabled: false,
      },
    }))
  }

  const handleTelegramConnect = async () => {
    if (!settings.telegram.chatId) {
      alert('Please enter your Telegram Chat ID first')
      return
    }

    // Simulate sending a test message
    const success = confirm(
      `This would send a test message to Chat ID: ${settings.telegram.chatId}\n\nClick OK to simulate successful connection.`
    )

    if (success) {
      setSettings((prev) => ({
        ...prev,
        telegram: {
          ...prev.telegram,
          connected: true,
          enabled: true,
        },
      }))
    }
  }

  const handleTelegramDisconnect = () => {
    setSettings((prev) => ({
      ...prev,
      telegram: {
        ...prev.telegram,
        connected: false,
        enabled: false,
      },
    }))
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
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
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
                  <Button onClick={handleGoogleCalendarConnect} className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Google Calendar
                  </Button>
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
                        Automatically add interview appointments to your calendar
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
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={handleGoogleCalendarDisconnect}
                    >
                      <X className="mr-2 h-4 w-4" />
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
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-blue-500" />
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
                    <div className="space-y-2">
                      <Label htmlFor="chat-id">Telegram Chat ID</Label>
                      <Input
                        id="chat-id"
                        placeholder="Your Telegram Chat ID"
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
                      <p className="text-xs text-muted-foreground">
                        Send /start to @JobDashboardBot and it will provide your Chat ID
                      </p>
                    </div>
                    <Button onClick={handleTelegramConnect} className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Connect Telegram
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Connected to:</span> Chat ID {settings.telegram.chatId}
                      </p>
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
                      className="w-full text-red-600 hover:text-red-700"
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
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
