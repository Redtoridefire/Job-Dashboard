'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useExploreMode } from '@/lib/explore-context'
import { User } from '@supabase/supabase-js'
import Dashboard from '@/components/Dashboard'
import Auth from '@/components/Auth'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { isExploreMode } = useExploreMode()
  const supabase = createClient()

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    checkUser()

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show dashboard in explore mode with demo data
  if (isExploreMode) {
    return <Dashboard userId="demo-user" isExploreMode={true} />
  }

  if (!user) {
    return <Auth />
  }

  return <Dashboard userId={user.id} user={user} />
}
