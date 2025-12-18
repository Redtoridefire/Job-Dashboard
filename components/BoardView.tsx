'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import JobCard from './JobCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

type Application = Database['public']['Tables']['applications']['Row']

interface BoardViewProps {
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Application['status']) => void
  onAddNew: () => void
  onViewDetails: (application: Application) => void
  onAddInterview: (application: Application) => void
}

const statuses: Array<{ value: Application['status']; label: string; color: string }> = [
  { value: 'new', label: 'New', color: 'bg-blue-50 border-blue-200' },
  { value: 'submitted', label: 'Submitted', color: 'bg-yellow-50 border-yellow-200' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-purple-50 border-purple-200' },
  { value: 'offer', label: 'Offer', color: 'bg-green-50 border-green-200' },
  { value: 'accepted', label: 'Accepted', color: 'bg-emerald-50 border-emerald-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-50 border-red-200' },
]

export default function BoardView({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
  onAddNew,
  onViewDetails,
  onAddInterview,
}: BoardViewProps) {
  const [draggedApp, setDraggedApp] = useState<Application | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<Application['status'] | null>(null)

  const getApplicationsByStatus = (status: Application['status']) => {
    return applications.filter((app) => app.status === status)
  }

  const handleDragStart = (e: React.DragEvent, app: Application) => {
    setDraggedApp(app)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', app.id)
    // Add a slight delay to show the drag visual
    const target = e.target as HTMLElement
    setTimeout(() => {
      target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    setDraggedApp(null)
    setDragOverStatus(null)
  }

  const handleDragOver = (e: React.DragEvent, status: Application['status']) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverStatus !== status) {
      setDragOverStatus(status)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if we're leaving the column entirely
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || !relatedTarget.closest('[data-drop-zone]')) {
      setDragOverStatus(null)
    }
  }

  const handleDrop = (e: React.DragEvent, status: Application['status']) => {
    e.preventDefault()
    if (draggedApp && draggedApp.status !== status) {
      onStatusChange(draggedApp.id, status)
    }
    setDraggedApp(null)
    setDragOverStatus(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const statusApps = getApplicationsByStatus(status.value)
        const isDragOver = dragOverStatus === status.value

        return (
          <div
            key={status.value}
            data-drop-zone
            onDragOver={(e) => handleDragOver(e, status.value)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status.value)}
            className={`
              flex-shrink-0 w-80 rounded-lg border-2 p-4 transition-all duration-200
              ${status.color}
              ${isDragOver ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{status.label}</h3>
                <p className="text-sm text-muted-foreground">{statusApps.length} applications</p>
              </div>
              {status.value === 'new' && (
                <Button size="sm" variant="ghost" onClick={onAddNew}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {statusApps.length === 0 ? (
                <div
                  className={`
                    text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg
                    ${isDragOver ? 'border-primary bg-primary/5' : 'border-transparent'}
                  `}
                >
                  {isDragOver ? 'Drop here' : 'No applications'}
                </div>
              ) : (
                statusApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app)}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <JobCard
                      application={app}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      onViewDetails={onViewDetails}
                      onAddInterview={onAddInterview}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
