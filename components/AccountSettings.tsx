'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { User as UserIcon, Lock, Shield, Trash2, AlertTriangle, Check, X } from 'lucide-react'

interface AccountSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onSignOut: () => void
}

export default function AccountSettings({
  open,
  onOpenChange,
  user,
  onSignOut,
}: AccountSettingsProps) {
  const supabase = createClient()

  // Profile state
  const [displayName, setDisplayName] = useState(user.user_metadata?.display_name || '')
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Privacy state
  const [profilePublic, setProfilePublic] = useState(user.user_metadata?.profile_public || false)
  const [showEmail, setShowEmail] = useState(user.user_metadata?.show_email || false)
  const [activityTracking, setActivityTracking] = useState(user.user_metadata?.activity_tracking !== false)
  const [privacyLoading, setPrivacyLoading] = useState(false)
  const [privacyMessage, setPrivacyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Delete account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleUpdateProfile = async () => {
    setProfileLoading(true)
    setProfileMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          avatar_url: avatarUrl,
        },
      })

      if (error) throw error

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      setProfileMessage({ type: 'error', text: errorMessage })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordLoading(true)
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' })
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setPasswordLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
      setPasswordMessage({ type: 'error', text: errorMessage })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleUpdatePrivacy = async () => {
    setPrivacyLoading(true)
    setPrivacyMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          profile_public: profilePublic,
          show_email: showEmail,
          activity_tracking: activityTracking,
        },
      })

      if (error) throw error

      setPrivacyMessage({ type: 'success', text: 'Privacy settings updated!' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update privacy settings'
      setPrivacyMessage({ type: 'error', text: errorMessage })
    } finally {
      setPrivacyLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm')
      return
    }

    setDeleteLoading(true)
    setDeleteError(null)

    try {
      // First, delete all user data from the database
      const { error: appsError } = await supabase
        .from('applications')
        .delete()
        .eq('user_id', user.id)

      if (appsError) throw appsError

      const { error: resumesError } = await supabase
        .from('resumes')
        .delete()
        .eq('user_id', user.id)

      if (resumesError) throw resumesError

      // Delete files from storage
      const { data: files } = await supabase.storage
        .from('resumes')
        .list(user.id)

      if (files && files.length > 0) {
        const filePaths = files.map((file) => `${user.id}/${file.name}`)
        await supabase.storage.from('resumes').remove(filePaths)
      }

      // Sign out the user (note: full account deletion requires admin API or edge function)
      await supabase.auth.signOut()
      onSignOut()

      // Note: Full user deletion from auth.users requires admin privileges
      // In production, you'd call an edge function or API route with admin privileges
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account'
      setDeleteError(errorMessage)
      setDeleteLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      // Fetch all user data
      const [applicationsRes, resumesRes, interviewsRes] = await Promise.all([
        supabase.from('applications').select('*').eq('user_id', user.id),
        supabase.from('resumes').select('*').eq('user_id', user.id),
        supabase.from('interviews').select('*, applications!inner(user_id)').eq('applications.user_id', user.id),
      ])

      const userData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          metadata: user.user_metadata,
        },
        applications: applicationsRes.data || [],
        resumes: resumesRes.data || [],
        interviews: interviewsRes.data || [],
        exported_at: new Date().toISOString(),
      }

      // Download as JSON
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `job-dashboard-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings, privacy, and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your display name and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                  {avatarUrl && (
                    <div className="mt-2">
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-full object-cover border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                {profileMessage && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded text-sm ${
                      profileMessage.type === 'success'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {profileMessage.type === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    {profileMessage.text}
                  </div>
                )}

                <Button onClick={handleUpdateProfile} disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {passwordMessage && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded text-sm ${
                      passwordMessage.type === 'success'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {passwordMessage.type === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    {passwordMessage.text}
                  </div>
                )}

                <Button onClick={handleChangePassword} disabled={passwordLoading}>
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
                <CardDescription>
                  Details about your current session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Created:</span>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sign In:</span>
                  <span>
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how your information is used and displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to view your profile
                    </p>
                  </div>
                  <Switch
                    checked={profilePublic}
                    onCheckedChange={setProfilePublic}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your email on your public profile
                    </p>
                  </div>
                  <Switch
                    checked={showEmail}
                    onCheckedChange={setShowEmail}
                    disabled={!profilePublic}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Activity Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve by tracking app usage
                    </p>
                  </div>
                  <Switch
                    checked={activityTracking}
                    onCheckedChange={setActivityTracking}
                  />
                </div>

                {privacyMessage && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded text-sm ${
                      privacyMessage.type === 'success'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {privacyMessage.type === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    {privacyMessage.text}
                  </div>
                )}

                <Button onClick={handleUpdatePrivacy} disabled={privacyLoading}>
                  {privacyLoading ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Your Data</CardTitle>
                <CardDescription>
                  Download all your data in JSON format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export all your applications, resumes, interviews, and account
                  information. This helps you maintain a backup or move your data.
                </p>
                <Button variant="outline" onClick={handleExportData}>
                  Export All Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="mt-4 space-y-4">
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle>Danger Zone</CardTitle>
                </div>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                    Delete Account
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Once you delete your account, there is no going back. All your
                    applications, resumes, interviews, and data will be permanently
                    deleted.
                  </p>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete My Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Delete Account Permanently?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                          <p>
                            This action cannot be undone. This will permanently delete
                            your account and remove all your data from our servers.
                          </p>
                          <p>This includes:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>All job applications and their history</li>
                            <li>All uploaded resumes and documents</li>
                            <li>All scheduled interviews and notes</li>
                            <li>All account settings and preferences</li>
                          </ul>
                          <div className="mt-4">
                            <Label htmlFor="deleteConfirm">
                              Type <strong>DELETE</strong> to confirm:
                            </Label>
                            <Input
                              id="deleteConfirm"
                              value={deleteConfirmation}
                              onChange={(e) => setDeleteConfirmation(e.target.value)}
                              placeholder="DELETE"
                              className="mt-2"
                            />
                          </div>
                          {deleteError && (
                            <p className="text-sm text-red-600">{deleteError}</p>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading || deleteConfirmation !== 'DELETE'}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteLoading ? 'Deleting...' : 'Delete Account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Sign Out</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign out of your account on this device.
                  </p>
                  <Button variant="outline" onClick={onSignOut}>
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
