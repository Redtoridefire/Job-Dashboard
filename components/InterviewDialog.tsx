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
import { createClient } from '@/lib/supabase'

type Interview = Database['public']['Tables']['interviews']['Row']
type InterviewInsert = Database['public']['Tables']['interviews']['Insert']

interface InterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  editingInterview?: Interview | null
  onSuccess: () => void
}

export default function InterviewDialog({
  open,
  onOpenChange,
  applicationId,
  editingInterview,
  onSuccess,
}: InterviewDialogProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState<Partial<InterviewInsert>>({
    application_id: applicationId,
    interview_date: '',
    interview_type: 'phone',
    interviewer_names: [],
    notes: '',
    feedback: '',
    score: undefined,
  })

  useEffect(() => {
    if (editingInterview) {
      setFormData({
        ...editingInterview,
        interview_date: editingInterview.interview_date?.split('T')[0] || '',
      })
    } else {
      setFormData({
        application_id: applicationId,
        interview_date: '',
        interview_type: 'phone',
        interviewer_names: [],
        notes: '',
        feedback: '',
        score: undefined,
      })
    }
  }, [editingInterview, open, applicationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingInterview) {
        // Update existing interview
        // @ts-ignore - Supabase type inference issue with update
        const { error } = await supabase
          .from('interviews')
          .update({
            interview_date: formData.interview_date,
            interview_type: formData.interview_type,
            interviewer_names: formData.interviewer_names,
            notes: formData.notes,
            feedback: formData.feedback,
            score: formData.score,
          } as any)
          .eq('id', editingInterview.id)

        if (error) throw error
      } else {
        // Create new interview
        // @ts-ignore - Supabase type inference issue with insert
        const { error } = await supabase
          .from('interviews')
          .insert({
            application_id: applicationId,
            interview_date: formData.interview_date!,
            interview_type: formData.interview_type,
            interviewer_names: formData.interviewer_names,
            notes: formData.notes,
            feedback: formData.feedback,
            score: formData.score,
          } as any)

        if (error) throw error
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving interview:', error)
      alert('Error saving interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingInterview ? 'Edit Interview' : 'Schedule Interview'}
          </DialogTitle>
          <DialogDescription>
            {editingInterview
              ? 'Update the interview details'
              : 'Add a new interview for this application'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview_date">Interview Date *</Label>
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
                value={formData.interview_type || 'phone'}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, interview_type: value })
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
            <Label htmlFor="interviewer_names">Interviewer Names (comma-separated)</Label>
            <Input
              id="interviewer_names"
              placeholder="Jane Smith, John Doe"
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
              placeholder="Preparation notes, topics to cover, etc."
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (After Interview)</Label>
            <Textarea
              id="feedback"
              rows={3}
              placeholder="How did the interview go? Key takeaways..."
              value={formData.feedback || ''}
              onChange={(e) =>
                setFormData({ ...formData, feedback: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">Rating (1-5)</Label>
            <Select
              value={formData.score?.toString() || ''}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  score: value ? parseInt(value) : undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No rating</SelectItem>
                <SelectItem value="1">⭐ 1 - Poor</SelectItem>
                <SelectItem value="2">⭐⭐ 2 - Fair</SelectItem>
                <SelectItem value="3">⭐⭐⭐ 3 - Good</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ 4 - Very Good</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ 5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Saving...'
                : editingInterview
                ? 'Update Interview'
                : 'Schedule Interview'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
