'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, LayoutGrid, Table as TableIcon, Calendar as CalendarIcon, Download } from 'lucide-react'
import AddJobDialog from './AddJobDialog'
import BoardView from './BoardView'
import TableView from './TableView'
import CalendarView from './CalendarView'
import StatsCards from './StatsCards'
import SearchFilter from './SearchFilter'
import { exportToCSV, generateExportFilename } from '@/lib/export'

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

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Application['status'] | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Application['priority'] | 'all'>('all')
  const [workTypeFilter, setWorkTypeFilter] = useState<Application['work_type'] | 'all'>('all')

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
      // @ts-ignore - Supabase type inference issue with update
      const { error } = await supabase
        .from('applications')
        .update({ status } as any)
        .eq('id', id)

      if (error) throw error
      updateApplication(id, { status } as any)
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

  // Filter applications based on search and filters
  const filteredApplications = applications.filter((app) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        app.company.toLowerCase().includes(query) ||
        app.role.toLowerCase().includes(query) ||
        app.location?.toLowerCase().includes(query) ||
        app.tags?.some((tag) => tag.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter !== 'all' && app.status !== statusFilter) return false

    // Priority filter
    if (priorityFilter !== 'all' && app.priority !== priorityFilter) return false

    // Work type filter
    if (workTypeFilter !== 'all' && app.work_type !== workTypeFilter) return false

    return true
  })

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setWorkTypeFilter('all')
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    workTypeFilter !== 'all'

  const handleExport = () => {
    const dataToExport = hasActiveFilters ? filteredApplications : applications
    exportToCSV(dataToExport, generateExportFilename())
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>
      </div>

      <StatsCards applications={applications} />

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        workTypeFilter={workTypeFilter}
        onWorkTypeFilterChange={setWorkTypeFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

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
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <BoardView
            applications={filteredApplications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onAddNew={handleAddNew}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <TableView
            applications={filteredApplications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView
            applications={filteredApplications}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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
