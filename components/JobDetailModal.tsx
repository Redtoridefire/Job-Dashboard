'use client'

import { Database } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  User,
  Users,
  Tag,
  FileText,
  Clock,
  Pencil,
  Plus,
  Star,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

type Application = Database['public']['Tables']['applications']['Row']
type Interview = Database['public']['Tables']['interviews']['Row']

interface JobDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application | null
  interviews: Interview[]
  onEdit: (application: Application) => void
  onAddInterview: (application: Application) => void
  onViewInterviews: (application: Application) => void
}

const statusColors: Record<Application['status'], string> = {
  new: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  interviewing: 'bg-yellow-100 text-yellow-800',
  offer: 'bg-green-100 text-green-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

const priorityColors: Record<Application['priority'], string> = {
  A: 'bg-red-100 text-red-800',
  B: 'bg-yellow-100 text-yellow-800',
  C: 'bg-gray-100 text-gray-800',
  Dream: 'bg-purple-100 text-purple-800',
}

const interviewTypeLabels: Record<string, string> = {
  phone: 'Phone Screen',
  video: 'Video Call',
  onsite: 'On-site',
  technical: 'Technical',
  behavioral: 'Behavioral',
  panel: 'Panel',
}

export default function JobDetailModal({
  open,
  onOpenChange,
  application,
  interviews,
  onEdit,
  onAddInterview,
  onViewInterviews,
}: JobDetailModalProps) {
  if (!application) return null

  const appInterviews = interviews
    .filter((i) => i.application_id === application.id)
    .sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime())

  const upcomingInterviews = appInterviews.filter(
    (i) => new Date(i.interview_date) > new Date()
  )
  const pastInterviews = appInterviews.filter(
    (i) => new Date(i.interview_date) <= new Date()
  )

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    return 'Not specified'
  }

  const renderStars = (score: number | null) => {
    if (!score) return null
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  // Build timeline events
  const timelineEvents = [
    {
      id: 'created',
      date: new Date(application.created_at),
      type: 'created',
      title: 'Application Added',
      description: `Added to tracking`,
    },
    ...appInterviews.map((interview) => ({
      id: interview.id,
      date: new Date(interview.interview_date),
      type: 'interview',
      title: `${interviewTypeLabels[interview.interview_type || 'phone'] || 'Interview'}`,
      description: interview.interviewer_names?.join(', ') || '',
      score: interview.score,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {application.company}
                <Badge className={statusColors[application.status]} variant="secondary">
                  {application.status}
                </Badge>
                <Badge className={priorityColors[application.priority]} variant="secondary">
                  {application.priority === 'Dream' ? '⭐ Dream' : `Priority ${application.priority}`}
                </Badge>
              </DialogTitle>
              <p className="text-lg text-muted-foreground mt-1">{application.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(application)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="interviews">
              Interviews ({appInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Job Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Company:</span>
                      <span>{application.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Role:</span>
                      <span>{application.role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span>
                        {application.location || 'Not specified'}
                        {application.work_type && ` (${application.work_type})`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Salary:</span>
                      <span>{formatSalary(application.salary_min, application.salary_max)}</span>
                    </div>
                    {application.job_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={application.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Job Posting
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Hiring Manager:</span>
                      <span>{application.hiring_manager || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Referral:</span>
                      <span>{application.referral_name || 'None'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Dates & Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Added:</span>
                      <span>
                        {format(new Date(application.created_at), 'PPP')}
                        <span className="text-muted-foreground ml-1">
                          ({formatDistanceToNow(new Date(application.created_at), { addSuffix: true })})
                        </span>
                      </span>
                    </div>
                    {application.deadline && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Deadline:</span>
                        <span>
                          {format(new Date(application.deadline), 'PPP')}
                          {new Date(application.deadline) < new Date() ? (
                            <Badge variant="destructive" className="ml-2">Past Due</Badge>
                          ) : (
                            <span className="text-muted-foreground ml-1">
                              ({formatDistanceToNow(new Date(application.deadline), { addSuffix: true })})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {application.tags && application.tags.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {application.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {upcomingInterviews.length > 0 && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-purple-800">
                        Upcoming Interviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {upcomingInterviews.slice(0, 2).map((interview) => (
                          <div key={interview.id} className="text-sm">
                            <div className="font-medium">
                              {interviewTypeLabels[interview.interview_type || 'phone']}
                            </div>
                            <div className="text-muted-foreground">
                              {format(new Date(interview.interview_date), 'PPP p')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {application.job_description && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{application.job_description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="interviews" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Interview History</h3>
              <Button size="sm" onClick={() => onAddInterview(application)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Interview
              </Button>
            </div>

            {appInterviews.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No interviews scheduled yet.
                  <br />
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => onAddInterview(application)}
                  >
                    Schedule your first interview
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {appInterviews.map((interview) => {
                  const isPast = new Date(interview.interview_date) <= new Date()
                  return (
                    <Card
                      key={interview.id}
                      className={isPast ? 'opacity-75' : 'border-purple-200'}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={isPast ? 'secondary' : 'default'}>
                                {interviewTypeLabels[interview.interview_type || 'phone']}
                              </Badge>
                              {renderStars(interview.score)}
                              {isPast && <Badge variant="outline">Completed</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {format(new Date(interview.interview_date), 'PPP p')}
                            </div>
                            {interview.interviewer_names && interview.interviewer_names.length > 0 && (
                              <div className="text-sm mt-1">
                                <span className="text-muted-foreground">With: </span>
                                {interview.interviewer_names.join(', ')}
                              </div>
                            )}
                            {interview.notes && (
                              <p className="text-sm mt-2">{interview.notes}</p>
                            )}
                            {interview.feedback && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <strong>Feedback:</strong> {interview.feedback}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => onViewInterviews(application)}>
                Manage All Interviews
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <div className="relative">
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4 pb-8 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        event.type === 'interview' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}
                    />
                    {index < timelineEvents.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 -mt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.title}</span>
                      {'score' in event && event.score && renderStars(event.score)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(event.date, 'PPP p')}
                    </div>
                    {event.description && (
                      <p className="text-sm mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.notes ? (
                  <p className="whitespace-pre-wrap">{application.notes}</p>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No notes yet. Click Edit to add notes.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
