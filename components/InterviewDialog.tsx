'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Star, Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'

type Application = Database['public']['Tables']['applications']['Row']
type Interview = Database['public']['Tables']['interviews']['Row']
type InterviewInsert = Database['public']['Tables']['interviews']['Insert']

interface InterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application | null
  interviews: Interview[]
  onInterviewsChange: (interviews: Interview[]) => void
}

const interviewTypeLabels: Record<NonNullable<Interview['interview_type']>, string> = {
  phone: 'Phone Screen',
  video: 'Video Call',
  onsite: 'On-site',
  technical: 'Technical',
  behavioral: 'Behavioral',
  panel: 'Panel',
}

export default function InterviewDialog({
  open,
  onOpenChange,
  application,
  interviews,
  onInterviewsChange,
}: InterviewDialogProps) {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState<Partial<InterviewInsert>>({
    interview_date: '',
    interview_type: 'video',
    interviewer_names: [],
    notes: '',
    feedback: '',
    score: undefined,
  })

  const appInterviews = interviews.filter(
    (i) => i.application_id === application?.id
  ).sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime())

  useEffect(() => {
    if (!open) {
      setShowForm(false)
      setEditingInterview(null)
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setFormData({
      interview_date: '',
      interview_type: 'video',
      interviewer_names: [],
      notes: '',
      feedback: '',
      score: undefined,
    })
  }

  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview)
    setFormData({
      interview_date: interview.interview_date.slice(0, 16),
      interview_type: interview.interview_type,
      interviewer_names: interview.interviewer_names || [],
      notes: interview.notes || '',
      feedback: interview.feedback || '',
      score: interview.score || undefined,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview?')) return

    try {
      const { error } = await supabase.from('interviews').delete().eq('id', id)
      if (error) throw error
      onInterviewsChange(interviews.filter((i) => i.id !== id))
    } catch (error) {
      console.error('Error deleting interview:', error)
      alert('Error deleting interview. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!application) return
    setLoading(true)

    try {
      if (editingInterview) {
        const updateData: Database['public']['Tables']['interviews']['Update'] = {
          interview_date: formData.interview_date,
          interview_type: formData.interview_type,
          interviewer_names: formData.interviewer_names,
          notes: formData.notes,
          feedback: formData.feedback,
          score: formData.score,
        }

        const { data, error } = await supabase
          .from('interviews')
          .update(updateData)
          .eq('id', editingInterview.id)
          .select()
          .single()

        if (error) throw error
        if (data) {
          onInterviewsChange(
            interviews.map((i) => (i.id === data.id ? data : i))
          )
        }
      } else {
        const insertData: InterviewInsert = {
          application_id: application.id,
          interview_date: formData.interview_date!,
          interview_type: formData.interview_type,
          interviewer_names: formData.interviewer_names,
          notes: formData.notes,
          feedback: formData.feedback,
          score: formData.score,
        }

        const { data, error } = await supabase
          .from('interviews')
          .insert(insertData)
          .select()
          .single()

        if (error) throw error
        if (data) {
          onInterviewsChange([...interviews, data])
        }
      }

      setShowForm(false)
      setEditingInterview(null)
      resetForm()
    } catch (error) {
      console.error('Error saving interview:', error)
      alert('Error saving interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (score: number | null) => {
    if (!score) return null
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Interviews - {application?.company}
          </DialogTitle>
          <DialogDescription>
            {application?.role} • Track and manage interview rounds
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          <div className="space-y-4">
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Interview
            </Button>

            {appInterviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No interviews scheduled yet.
              </div>
            ) : (
              <div className="space-y-3">
                {appInterviews.map((interview) => (
                  <Card key={interview.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {interview.interview_type
                                ? interviewTypeLabels[interview.interview_type]
                                : 'Interview'}
                            </Badge>
                            {renderStars(interview.score)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(interview.interview_date), 'PPP p')}
                          </div>
                          {interview.interviewer_names && interview.interviewer_names.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(interview)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(interview.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interview_date">Date & Time *</Label>
                <Input
                  id="interview_date"
                  type="datetime-local"
                  required
                  value={formData.interview_date}
                  onChange={(e) =>
                    setFormData({ ...formData, interview_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interview_type">Interview Type</Label>
                <Select
                  value={formData.interview_type || 'video'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, interview_type: value as Interview['interview_type'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Screen</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="panel">Panel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewers">Interviewer Names (comma-separated)</Label>
              <Input
                id="interviewers"
                placeholder="John Smith, Jane Doe"
                value={formData.interviewer_names?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interviewer_names: e.target.value
                      .split(',')
                      .map((n) => n.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Preparation notes, questions to ask..."
                value={formData.notes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (post-interview)</Label>
              <Textarea
                id="feedback"
                rows={3}
                placeholder="How did it go? What went well?"
                value={formData.feedback || ''}
                onChange={(e) =>
                  setFormData({ ...formData, feedback: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Score (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <Button
                    key={score}
                    type="button"
                    variant={formData.score === score ? 'default' : 'outline'}
                    size="icon"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        score: formData.score === score ? undefined : score,
                      })
                    }
                  >
                    <Star
                      className={`h-4 w-4 ${
                        formData.score && formData.score >= score
                          ? 'fill-current'
                          : ''
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingInterview(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Saving...'
                  : editingInterview
                  ? 'Update Interview'
                  : 'Add Interview'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
