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
import { useAppStore } from '@/lib/store'

type Application = Database['public']['Tables']['applications']['Row']
type ApplicationInsert = Database['public']['Tables']['applications']['Insert']
type ApplicationUpdate = Database['public']['Tables']['applications']['Update']

interface AddJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingApplication?: Application | null
  userId: string
}

export default function AddJobDialog({
  open,
  onOpenChange,
  editingApplication,
  userId,
}: AddJobDialogProps) {
  const [loading, setLoading] = useState(false)
  const { addApplication, updateApplication } = useAppStore()
  const supabase = createClient()

  const [formData, setFormData] = useState<Partial<ApplicationInsert>>({
    company: '',
    role: '',
    location: '',
    work_type: 'remote',
    salary_min: undefined,
    salary_max: undefined,
    job_url: '',
    job_description: '',
    priority: 'B',
    status: 'new',
    tags: [],
    referral_name: '',
    hiring_manager: '',
    notes: '',
    deadline: undefined,
  })

  useEffect(() => {
    if (editingApplication) {
      setFormData(editingApplication)
    } else {
      setFormData({
        company: '',
        role: '',
        location: '',
        work_type: 'remote',
        salary_min: undefined,
        salary_max: undefined,
        job_url: '',
        job_description: '',
        priority: 'B',
        status: 'new',
        tags: [],
        referral_name: '',
        hiring_manager: '',
        notes: '',
        deadline: undefined,
      })
    }
  }, [editingApplication, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingApplication) {
        // Update existing application
        const updateData: ApplicationUpdate = {
          company: formData.company,
          role: formData.role,
          location: formData.location,
          work_type: formData.work_type,
          salary_min: formData.salary_min,
          salary_max: formData.salary_max,
          job_url: formData.job_url,
          job_description: formData.job_description,
          priority: formData.priority,
          status: formData.status,
          tags: formData.tags,
          referral_name: formData.referral_name,
          hiring_manager: formData.hiring_manager,
          notes: formData.notes,
          deadline: formData.deadline,
        }

        const { data, error } = await supabase
          .from('applications')
          .update(updateData as any)
          .eq('id', editingApplication.id)
          .select()
          .single()

        if (error) throw error
        if (data) updateApplication(data.id, data)
      } else {
        // Create new application
        const { data, error } = await supabase
          .from('applications')
          .insert({ ...formData, user_id: userId })
          .select()
          .single()

        if (error) throw error
        if (data) addApplication(data)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Error saving application:', error)
      alert('Error saving application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingApplication ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
          <DialogDescription>
            {editingApplication
              ? 'Update the details of your job application'
              : 'Add a new job application to track'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_type">Work Type</Label>
              <Select
                value={formData.work_type || 'remote'}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, work_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Min Salary</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder="100000"
                value={formData.salary_min || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salary_min: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">Max Salary</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder="150000"
                value={formData.salary_max || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salary_max: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - High</SelectItem>
                  <SelectItem value="B">B - Medium</SelectItem>
                  <SelectItem value="C">C - Low</SelectItem>
                  <SelectItem value="Dream">⭐ Dream Job</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_url">Job Posting URL</Label>
            <Input
              id="job_url"
              type="url"
              placeholder="https://..."
              value={formData.job_url || ''}
              onChange={(e) =>
                setFormData({ ...formData, job_url: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea
              id="job_description"
              rows={4}
              placeholder="Paste the job description here..."
              value={formData.job_description || ''}
              onChange={(e) =>
                setFormData({ ...formData, job_description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="referral_name">Referral Name</Label>
              <Input
                id="referral_name"
                value={formData.referral_name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, referral_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hiring_manager">Hiring Manager</Label>
              <Input
                id="hiring_manager"
                value={formData.hiring_manager || ''}
                onChange={(e) =>
                  setFormData({ ...formData, hiring_manager: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="Security, Leadership, Remote"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Additional notes..."
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Application Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={
                formData.deadline
                  ? new Date(formData.deadline).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })
              }
            />
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
              {loading ? 'Saving...' : editingApplication ? 'Update' : 'Add Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
