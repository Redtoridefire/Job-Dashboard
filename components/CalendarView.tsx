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
  Video,
  Phone,
  Building,
  Users,
  FileText,
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
import EventDetailModal from './EventDetailModal'

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
  interviewType?: string
}

const interviewTypeIcons: Record<string, React.ReactNode> = {
  phone: <Phone className="h-3 w-3" />,
  video: <Video className="h-3 w-3" />,
  onsite: <Building className="h-3 w-3" />,
  technical: <FileText className="h-3 w-3" />,
  behavioral: <Users className="h-3 w-3" />,
  panel: <Users className="h-3 w-3" />,
}

const interviewTypeColors: Record<string, string> = {
  phone: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  onsite: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  technical: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  behavioral: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  panel: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
}

export default function CalendarView({
  applications,
  interviews,
  onSelectApplication,
  onSelectInterview,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [eventModalOpen, setEventModalOpen] = useState(false)

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
        interviewType: interview.interview_type || undefined,
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
    setSelectedEvent(event)
    setEventModalOpen(true)
  }

  const handleViewApplication = (application: Application) => {
    onSelectApplication(application)
  }

  return (
    <>
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventClick(event)
                            }}
                            className={`
                              text-xs truncate px-1 py-0.5 rounded flex items-center gap-1 cursor-pointer
                              ${
                                event.type === 'interview'
                                  ? event.interviewType
                                    ? interviewTypeColors[event.interviewType]
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              }
                            `}
                            title={`${event.title}: ${event.subtitle}`}
                          >
                            {event.type === 'interview' && event.interviewType && (
                              <span className="flex-shrink-0">
                                {interviewTypeIcons[event.interviewType]}
                              </span>
                            )}
                            <span className="truncate">{event.title}</span>
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
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              event.type === 'interview'
                                ? event.interviewType === 'technical'
                                  ? 'bg-indigo-500'
                                  : event.interviewType === 'video'
                                  ? 'bg-purple-500'
                                  : event.interviewType === 'phone'
                                  ? 'bg-blue-500'
                                  : event.interviewType === 'onsite'
                                  ? 'bg-green-500'
                                  : 'bg-purple-500'
                                : 'bg-orange-500'
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
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="secondary"
                                className={`${
                                  event.type === 'interview'
                                    ? event.interviewType
                                      ? interviewTypeColors[event.interviewType]
                                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                }`}
                              >
                                {event.type === 'interview' && event.interviewType && (
                                  <span className="mr-1">
                                    {interviewTypeIcons[event.interviewType]}
                                  </span>
                                )}
                                {event.type === 'interview'
                                  ? event.interviewType
                                    ? event.interviewType.charAt(0).toUpperCase() +
                                      event.interviewType.slice(1)
                                    : 'Interview'
                                  : 'Deadline'}
                              </Badge>
                            </div>
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
                <h4 className="text-sm font-medium mb-3">Event Types</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500" />
                    <span>Deadline</span>
                  </div>
                  <div className="font-medium mt-3 mb-2">Interview Types:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-blue-500" />
                      <span>Phone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-3 w-3 text-purple-500" />
                      <span>Video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3 text-green-500" />
                      <span>On-site</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-indigo-500" />
                      <span>Technical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-pink-500" />
                      <span>Behavioral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-teal-500" />
                      <span>Panel</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        event={selectedEvent}
        onViewApplication={handleViewApplication}
      />
    </>
  )
}
