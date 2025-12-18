'use client'

import { useState, useMemo } from 'react'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns'

type Application = Database['public']['Tables']['applications']['Row']
type Interview = Database['public']['Tables']['interviews']['Row']

interface CalendarViewProps {
  applications: Application[]
  interviews: Interview[]
  onSelectApplication: (application: Application) => void
  onSelectInterview: (interview: Interview) => void
}

interface CalendarEvent {
  id: string
  date: Date
  type: 'deadline' | 'interview'
  title: string
  subtitle: string
  application?: Application
  interview?: Interview
}

const statusColors: Record<Application['status'], string> = {
  new: 'bg-gray-500',
  submitted: 'bg-blue-500',
  interviewing: 'bg-yellow-500',
  offer: 'bg-green-500',
  accepted: 'bg-emerald-500',
  rejected: 'bg-red-500',
}

export default function CalendarView({
  applications,
  interviews,
  onSelectApplication,
  onSelectInterview,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const events = useMemo(() => {
    const eventList: CalendarEvent[] = []

    // Add application deadlines
    applications.forEach((app) => {
      if (app.deadline) {
        eventList.push({
          id: `deadline-${app.id}`,
          date: new Date(app.deadline),
          type: 'deadline',
          title: app.company,
          subtitle: `Deadline: ${app.role}`,
          application: app,
        })
      }
    })

    // Add interviews
    interviews.forEach((interview) => {
      const app = applications.find((a) => a.id === interview.application_id)
      eventList.push({
        id: `interview-${interview.id}`,
        date: new Date(interview.interview_date),
        type: 'interview',
        title: app?.company || 'Interview',
        subtitle: `${interview.interview_type || 'Interview'} - ${app?.role || ''}`,
        interview,
        application: app,
      })
    })

    return eventList
  }, [applications, interviews])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.date, day))
  }

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : []

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'interview' && event.interview) {
      onSelectInterview(event.interview)
    } else if (event.application) {
      onSelectApplication(event.application)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isTodayDate = isToday(day)

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] p-1 border rounded-md text-left transition-colors
                      ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-background'}
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                      ${isTodayDate ? 'border-primary' : 'border-border'}
                      hover:bg-muted/50
                    `}
                  >
                    <div
                      className={`
                        text-sm font-medium mb-1
                        ${isTodayDate ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            text-xs truncate px-1 py-0.5 rounded
                            ${event.type === 'interview' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}
                          `}
                          title={`${event.title}: ${event.subtitle}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Panel */}
      <div>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>

            {selectedDate ? (
              selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            event.type === 'interview' ? 'bg-purple-500' : 'bg-orange-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {event.subtitle}
                          </div>
                          {event.type === 'interview' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {format(event.date, 'h:mm a')}
                            </div>
                          )}
                          <Badge
                            variant="secondary"
                            className={`mt-2 ${
                              event.type === 'interview'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {event.type === 'interview' ? 'Interview' : 'Deadline'}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No events scheduled for this date.
                </p>
              )
            ) : (
              <p className="text-muted-foreground text-sm">
                Click on a date to see scheduled events.
              </p>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span>Interview</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span>Application Deadline</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
