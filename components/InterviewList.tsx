'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Plus, Calendar, Clock, User, Star, Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase'
import InterviewDialog from './InterviewDialog'

type Interview = Database['public']['Tables']['interviews']['Row']

interface InterviewListProps {
  applicationId: string
}

export default function InterviewList({ applicationId }: InterviewListProps) {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadInterviews()
  }, [applicationId])

  const loadInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('application_id', applicationId)
        .order('interview_date', { ascending: false })

      if (error) throw error
      setInterviews(data || [])
    } catch (error) {
      console.error('Error loading interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview?')) return

    try {
      const { error } = await supabase.from('interviews').delete().eq('id', id)
      if (error) throw error
      loadInterviews()
    } catch (error) {
      console.error('Error deleting interview:', error)
      alert('Error deleting interview. Please try again.')
    }
  }

  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview)
    setDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingInterview(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingInterview(null)
    }
  }

  const getTypeColor = (type: Interview['interview_type']) => {
    const colors = {
      phone: 'bg-blue-100 text-blue-800',
      video: 'bg-purple-100 text-purple-800',
      onsite: 'bg-green-100 text-green-800',
      technical: 'bg-orange-100 text-orange-800',
      behavioral: 'bg-pink-100 text-pink-800',
      panel: 'bg-indigo-100 text-indigo-800',
    }
    return colors[type || 'phone']
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading interviews...</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Interviews ({interviews.length})
        </h4>
        <Button size="sm" variant="outline" onClick={handleAddNew}>
          <Plus className="h-3 w-3 mr-1" />
          Add Interview
        </Button>
      </div>

      {interviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No interviews scheduled yet.</p>
      ) : (
        <div className="space-y-2">
          {interviews.map((interview) => (
            <Card key={interview.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(interview.interview_type)} variant="secondary">
                      {interview.interview_type}
                    </Badge>
                    {interview.score && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{interview.score}/5</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(interview.interview_date), 'PPp')}
                    </div>
                  </div>

                  {interview.interviewer_names && interview.interviewer_names.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {interview.interviewer_names.join(', ')}
                    </div>
                  )}

                  {interview.notes && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Notes:</span> {interview.notes}
                    </p>
                  )}

                  {interview.feedback && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Feedback:</span> {interview.feedback}
                    </p>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(interview)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(interview.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <InterviewDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        applicationId={applicationId}
        editingInterview={editingInterview}
        onSuccess={loadInterviews}
      />
    </div>
  )
}
