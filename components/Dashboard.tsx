'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { useExploreMode, demoApplications, demoInterviews } from '@/lib/explore-context'
import { Database } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Calendar as CalendarIcon,
  BarChart3,
  FileText,
  Link2,
  UserCircle,
  Compass,
  LogOut,
} from 'lucide-react'
import AddJobDialog from './AddJobDialog'
import BoardView from './BoardView'
import TableView from './TableView'
import CalendarView from './CalendarView'
import SearchFilter from './SearchFilter'
import InterviewDialog from './InterviewDialog'
import JobDetailModal from './JobDetailModal'
import StatsCards from './StatsCards'
import AnalyticsDashboard from './AnalyticsDashboard'
import ResumeManager from './ResumeManager'
import IntegrationsPanel from './IntegrationsPanel'
import AccountSettings from './AccountSettings'
import { ThemeToggle } from './ThemeToggle'
import { FeatureLockButton, SignUpPromptDialog } from './FeatureLock'
import { exportApplicationsToCSV } from '@/lib/export'

type Application = Database['public']['Tables']['applications']['Row']
type Interview = Database['public']['Tables']['interviews']['Row']
type Resume = Database['public']['Tables']['resumes']['Row']

interface DashboardProps {
  userId: string
  user?: User
  isExploreMode?: boolean
}

export default function Dashboard({ userId, user, isExploreMode = false }: DashboardProps) {
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
  const [selectedApplicationForInterview, setSelectedApplicationForInterview] = useState<Application | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<Application | null>(null)
  const [resumeManagerOpen, setResumeManagerOpen] = useState(false)
  const [integrationsOpen, setIntegrationsOpen] = useState(false)
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [activeTab, setActiveTab] = useState('board')

  const { exitExploreMode, setShowSignUpPrompt } = useExploreMode()

  const {
    applications,
    setApplications,
    deleteApplication,
    updateApplication,
    interviews,
    setInterviews,
    filterStatus,
    filterPriority,
    filterWorkType,
    searchQuery,
    setFilterStatus,
    setFilterPriority,
    setFilterWorkType,
    setSearchQuery,
    getFilteredApplications,
  } = useAppStore()

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [isExploreMode])

  const loadData = async () => {
    // In explore mode, use demo data
    if (isExploreMode) {
      setApplications(demoApplications as Application[])
      setInterviews(demoInterviews as Interview[])
      setResumes([])
      setLoading(false)
      return
    }

    try {
      // Load applications, interviews, and resumes in parallel
      const [applicationsResult, interviewsResult, resumesResult] = await Promise.all([
        supabase
          .from('applications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('interviews')
          .select('*')
          .order('interview_date', { ascending: true }),
        supabase
          .from('resumes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ])

      if (applicationsResult.error) throw applicationsResult.error
      if (interviewsResult.error) throw interviewsResult.error

      setApplications(applicationsResult.data || [])
      setInterviews(interviewsResult.data || [])
      setResumes(resumesResult.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
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

  const handleViewDetails = (application: Application) => {
    setSelectedApplicationForDetails(application)
    setDetailModalOpen(true)
  }

  const handleDetailModalClose = (open: boolean) => {
    setDetailModalOpen(open)
    if (!open) {
      setSelectedApplicationForDetails(null)
    }
  }

  const handleAddInterview = (application: Application) => {
    setSelectedApplicationForInterview(application)
    setInterviewDialogOpen(true)
  }

  const handleViewInterviews = (application: Application) => {
    setSelectedApplicationForInterview(application)
    setInterviewDialogOpen(true)
  }

  const handleInterviewDialogClose = (open: boolean) => {
    setInterviewDialogOpen(open)
    if (!open) {
      setSelectedApplicationForInterview(null)
    }
  }

  const handleExport = () => {
    const filteredApps = getFilteredApplications()
    exportApplicationsToCSV(filteredApps)
  }

  const handleSelectInterview = (interview: Interview) => {
    const app = applications.find((a) => a.id === interview.application_id)
    if (app) {
      setSelectedApplicationForInterview(app)
      setInterviewDialogOpen(true)
    }
  }

  const handleEditFromDetail = (application: Application) => {
    setDetailModalOpen(false)
    setSelectedApplicationForDetails(null)
    handleEdit(application)
  }

  const handleAddInterviewFromDetail = (application: Application) => {
    setDetailModalOpen(false)
    setSelectedApplicationForDetails(null)
    handleAddInterview(application)
  }

  const handleViewInterviewsFromDetail = (application: Application) => {
    setDetailModalOpen(false)
    setSelectedApplicationForDetails(null)
    handleViewInterviews(application)
  }

  const filteredApplications = getFilteredApplications()

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
      {/* Explore Mode Banner */}
      {isExploreMode && (
        <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Explore Mode</p>
              <p className="text-sm text-muted-foreground">
                You&apos;re viewing sample data. Sign up to save your own applications!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exitExploreMode}>
              <LogOut className="mr-2 h-4 w-4" />
              Exit
            </Button>
            <Button size="sm" onClick={() => setShowSignUpPrompt(true)}>
              Sign Up
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Search Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your job applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isExploreMode ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSignUpPrompt(true)}
                title="Resume Repository (Sign up required)"
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSignUpPrompt(true)}
                title="Integrations (Sign up required)"
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <FeatureLockButton feature="add applications">
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </FeatureLockButton>
            </>
          ) : (
            <>
              <Button variant="outline" size="icon" onClick={() => setResumeManagerOpen(true)} title="Resume Repository">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIntegrationsOpen(true)} title="Integrations">
                <Link2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setAccountSettingsOpen(true)} title="Account Settings">
                <UserCircle className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </Button>
            </>
          )}
        </div>
      </div>

      <StatsCards applications={applications} />

      <div className="mt-6">
        <SearchFilter
          search={searchQuery}
          statusFilter={filterStatus}
          priorityFilter={filterPriority}
          workTypeFilter={filterWorkType}
          onSearchChange={setSearchQuery}
          onStatusFilter={setFilterStatus}
          onPriorityFilter={setFilterPriority}
          onWorkTypeFilter={setFilterWorkType}
          onExport={handleExport}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
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
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <BoardView
            applications={filteredApplications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onAddNew={handleAddNew}
            onViewDetails={handleViewDetails}
            onAddInterview={handleAddInterview}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <TableView
            applications={filteredApplications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onViewInterviews={handleViewInterviews}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView
            applications={filteredApplications}
            interviews={interviews}
            onSelectApplication={handleViewDetails}
            onSelectInterview={handleSelectInterview}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard
            applications={applications}
            interviews={interviews}
          />
        </TabsContent>
      </Tabs>

      <AddJobDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingApplication={editingApplication}
        userId={userId}
      />

      <InterviewDialog
        open={interviewDialogOpen}
        onOpenChange={handleInterviewDialogClose}
        application={selectedApplicationForInterview}
        interviews={interviews}
        onInterviewsChange={setInterviews}
      />

      <JobDetailModal
        open={detailModalOpen}
        onOpenChange={handleDetailModalClose}
        application={selectedApplicationForDetails}
        interviews={interviews}
        onEdit={handleEditFromDetail}
        onAddInterview={handleAddInterviewFromDetail}
        onViewInterviews={handleViewInterviewsFromDetail}
      />

      <ResumeManager
        open={resumeManagerOpen}
        onOpenChange={setResumeManagerOpen}
        userId={userId}
        resumes={resumes}
        onResumesChange={setResumes}
      />

      <IntegrationsPanel
        open={integrationsOpen}
        onOpenChange={setIntegrationsOpen}
        userId={userId}
      />

      {user && (
        <AccountSettings
          open={accountSettingsOpen}
          onOpenChange={setAccountSettingsOpen}
          user={user}
          onSignOut={handleSignOut}
        />
      )}

      {/* Sign up prompt dialog for explore mode */}
      <SignUpPromptDialog />
    </div>
  )
}
