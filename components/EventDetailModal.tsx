'use client'

import { Database } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Briefcase,
  ExternalLink,
  FileText,
  Video,
  Phone,
  Users,
  Building,
  Link2,
} from 'lucide-react'
import { format } from 'date-fns'

type Application = Database['public']['Tables']['applications']['Row']
type Interview = Database['public']['Tables']['interviews']['Row']

interface EventDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: {
    type: 'deadline' | 'interview'
    date: Date
    application?: Application
    interview?: Interview
  } | null
  onViewApplication?: (application: Application) => void
}

const interviewTypeIcons: Record<string, React.ReactNode> = {
  phone: <Phone className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  onsite: <Building className="h-4 w-4" />,
  technical: <FileText className="h-4 w-4" />,
  behavioral: <Users className="h-4 w-4" />,
  panel: <Users className="h-4 w-4" />,
}

const interviewTypeLabels: Record<string, string> = {
  phone: 'Phone Screen',
  video: 'Video Call',
  onsite: 'On-site',
  technical: 'Technical',
  behavioral: 'Behavioral',
  panel: 'Panel Interview',
}

export default function EventDetailModal({
  open,
  onOpenChange,
  event,
  onViewApplication,
}: EventDetailModalProps) {
  if (!event) return null

  const { type, date, application, interview } = event

  const isInterview = type === 'interview'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isInterview
                  ? 'bg-purple-100 dark:bg-purple-900'
                  : 'bg-orange-100 dark:bg-orange-900'
              }`}
            >
              {isInterview ? (
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              ) : (
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {isInterview ? 'Interview Details' : 'Deadline Details'}
              </DialogTitle>
              <DialogDescription>
                {application?.company} - {application?.role}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Date and Time */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</p>
              {isInterview && (
                <p className="text-sm text-muted-foreground">
                  {format(date, 'h:mm a')}
                </p>
              )}
              {!isInterview && (
                <p className="text-sm text-muted-foreground">Application Deadline</p>
              )}
            </div>
          </div>

          {/* Interview-specific details */}
          {isInterview && interview && (
            <>
              {/* Interview Type */}
              {interview.interview_type && (
                <div className="flex items-center gap-3">
                  {interviewTypeIcons[interview.interview_type] || (
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Interview Type</p>
                    <p className="font-medium">
                      {interviewTypeLabels[interview.interview_type] ||
                        interview.interview_type}
                    </p>
                  </div>
                </div>
              )}

              {/* Interviewers */}
              {interview.interviewer_names && interview.interviewer_names.length > 0 && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Interviewer(s)</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {interview.interviewer_names.map((name, index) => (
                        <Badge key={index} variant="secondary">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {interview.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{interview.notes}</p>
                  </div>
                </div>
              )}

              {/* Google Calendar link */}
              {interview.google_calendar_event_id && (
                <div className="flex items-center gap-3">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Calendar</p>
                    <Badge variant="outline" className="mt-1">
                      Synced to Google Calendar
                    </Badge>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {interview.feedback && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Feedback
                    </p>
                    <p className="text-sm mt-1 text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                      {interview.feedback}
                    </p>
                    {interview.score && (
                      <Badge className="mt-2 bg-blue-600">
                        Score: {interview.score}/10
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Application details */}
          {application && (
            <>
              {/* Location */}
              {application.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {application.location}
                      {application.work_type && (
                        <Badge variant="outline" className="ml-2">
                          {application.work_type}
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Job URL */}
              {application.job_url && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Job Posting</p>
                    <a
                      href={application.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Job Posting
                    </a>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Application Status</p>
                  <Badge
                    className={`mt-1 ${
                      application.status === 'offer' || application.status === 'accepted'
                        ? 'bg-green-600'
                        : application.status === 'rejected'
                        ? 'bg-red-600'
                        : application.status === 'interviewing'
                        ? 'bg-yellow-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Notes for deadline */}
              {!isInterview && application.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{application.notes}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          {application && onViewApplication && (
            <Button
              className="flex-1"
              onClick={() => {
                onViewApplication(application)
                onOpenChange(false)
              }}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              View Application
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
