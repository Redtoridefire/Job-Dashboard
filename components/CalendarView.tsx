'use client'

import { useState, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { Database } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

type Application = Database['public']['Tables']['applications']['Row']

interface CalendarViewProps {
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
}

// Setup date-fns localizer
const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Application
  type: 'deadline' | 'created'
}

export default function CalendarView({ applications, onEdit, onDelete }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [view, setView] = useState<View>('month')

  // Convert applications to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const eventList: CalendarEvent[] = []

    applications.forEach((app) => {
      // Add deadline events
      if (app.deadline) {
        const deadlineDate = new Date(app.deadline)
        eventList.push({
          id: `${app.id}-deadline`,
          title: `📅 ${app.company} - ${app.role}`,
          start: deadlineDate,
          end: deadlineDate,
          resource: app,
          type: 'deadline',
        })
      }

      // Add created events (optional - you can remove this if too cluttered)
      const createdDate = new Date(app.created_at)
      eventList.push({
        id: `${app.id}-created`,
        title: `➕ ${app.company}`,
        start: createdDate,
        end: createdDate,
        resource: app,
        type: 'created',
      })
    })

    return eventList
  }, [applications])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
  }, [])

  const handleCloseDialog = () => {
    setSelectedEvent(null)
  }

  // Custom event styling
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = '#3b82f6' // default blue

    if (event.type === 'deadline') {
      // Color by status
      const status = event.resource.status
      if (status === 'accepted') backgroundColor = '#10b981' // green
      else if (status === 'rejected') backgroundColor = '#ef4444' // red
      else if (status === 'offer') backgroundColor = '#22c55e' // light green
      else if (status === 'interviewing') backgroundColor = '#a855f7' // purple
      else if (status === 'submitted') backgroundColor = '#eab308' // yellow
      else backgroundColor = '#3b82f6' // blue for 'new'
    } else {
      backgroundColor = '#94a3b8' // gray for created events
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
      },
    }
  }, [])

  const getStatusColor = (status: Application['status']) => {
    const colors: Record<Application['status'], string> = {
      new: 'bg-blue-100 text-blue-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      interviewing: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  const getPriorityColor = (priority: Application['priority']) => {
    const colors: Record<Application['priority'], string> = {
      A: 'bg-red-100 text-red-800',
      B: 'bg-orange-100 text-orange-800',
      C: 'bg-gray-100 text-gray-800',
      Dream: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800',
    }
    return colors[priority]
  }

  return (
    <div className="bg-white rounded-lg border p-4" style={{ height: '700px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        popup
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
      />

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.type === 'deadline' ? '📅 Application Deadline' : '➕ Application Added'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.type === 'deadline'
                ? 'Application deadline details'
                : 'Application creation details'}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.resource.company}</h3>
                <p className="text-muted-foreground">{selectedEvent.resource.role}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedEvent.resource.status)} variant="secondary">
                    {selectedEvent.resource.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge className={getPriorityColor(selectedEvent.resource.priority)} variant="secondary">
                    {selectedEvent.resource.priority === 'Dream' ? '⭐ Dream' : selectedEvent.resource.priority}
                  </Badge>
                </div>
              </div>

              {selectedEvent.resource.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-sm">{selectedEvent.resource.location}</p>
                </div>
              )}

              {selectedEvent.resource.work_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Work Type</p>
                  <p className="text-sm capitalize">{selectedEvent.resource.work_type}</p>
                </div>
              )}

              {(selectedEvent.resource.salary_min || selectedEvent.resource.salary_max) && (
                <div>
                  <p className="text-sm text-muted-foreground">Salary Range</p>
                  <p className="text-sm">
                    {selectedEvent.resource.salary_min
                      ? `$${(selectedEvent.resource.salary_min / 1000).toFixed(0)}k`
                      : '-'}
                    {' - '}
                    {selectedEvent.resource.salary_max
                      ? `$${(selectedEvent.resource.salary_max / 1000).toFixed(0)}k`
                      : '-'}
                  </p>
                </div>
              )}

              {selectedEvent.resource.deadline && (
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="text-sm">{format(new Date(selectedEvent.resource.deadline), 'PPP')}</p>
                </div>
              )}

              {selectedEvent.resource.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedEvent.resource.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedEvent.resource.job_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedEvent.resource.job_url!, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Job
                  </Button>
                )}
                <Button onClick={() => {
                  onEdit(selectedEvent.resource)
                  handleCloseDialog()
                }}>
                  Edit Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
