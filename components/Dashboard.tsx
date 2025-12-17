'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, LayoutGrid, Table as TableIcon, Calendar as CalendarIcon } from 'lucide-react'
import AddJobDialog from './AddJobDialog'
import BoardView from './BoardView'
import StatsCards from './StatsCards'

type Application = Database['public']['Tables']['applications']['Row']

interface DashboardProps {
  userId: string
}

export default function Dashboard({ userId }: DashboardProps) {
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const { applications, setApplications, deleteApplication, updateApplication } = useAppStore()
  const supabase = createClient()

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (application: Application) => {
    setEditingApplication(application)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      const { error } = await supabase.from('applications').delete().eq('id', id)
      if (error) throw error
      deleteApplication(id)
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Error deleting application. Please try again.')
    }
  }

  const handleStatusChange = async (id: string, status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      updateApplication(id, { status })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    }
  }

  const handleAddNew = () => {
    setEditingApplication(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingApplication(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Search Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your job applications
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>

      <StatsCards applications={applications} />

      <Tabs defaultValue="board" className="mt-6">
        <TabsList>
          <TabsTrigger value="board">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Board View
          </TabsTrigger>
          <TabsTrigger value="table">
            <TableIcon className="mr-2 h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="calendar" disabled>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar View (Coming Soon)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <BoardView
            applications={applications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onAddNew={handleAddNew}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            Table view coming soon...
          </div>
        </TabsContent>
      </Tabs>

      <AddJobDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingApplication={editingApplication}
        userId={userId}
      />
    </div>
  )
}
