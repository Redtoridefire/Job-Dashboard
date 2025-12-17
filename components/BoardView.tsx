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
}: BoardViewProps) {
  const getApplicationsByStatus = (status: Application['status']) => {
    return applications.filter((app) => app.status === status)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const statusApps = getApplicationsByStatus(status.value)
        
        return (
          <div
            key={status.value}
            className={`flex-shrink-0 w-80 rounded-lg border-2 ${status.color} p-4`}
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
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No applications
                </div>
              ) : (
                statusApps.map((app) => (
                  <JobCard
                    key={app.id}
                    application={app}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
