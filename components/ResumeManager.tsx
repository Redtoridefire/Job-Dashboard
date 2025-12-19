'use client'

import { useState, useRef } from 'react'
import { Database } from '@/types/database'
import { createClient } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  File,
  Calendar,
  Tag,
  MoreVertical,
  Pencil,
  Star,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'

type Resume = Database['public']['Tables']['resumes']['Row']

interface ResumeManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  resumes: Resume[]
  onResumesChange: (resumes: Resume[]) => void
}

export default function ResumeManager({
  open,
  onOpenChange,
  userId,
  resumes,
  onResumesChange,
}: ResumeManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingResume, setEditingResume] = useState<Resume | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    tags: [] as string[],
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const resetForm = () => {
    setFormData({ name: '', version: '', tags: [] })
    setSelectedFile(null)
    setEditingResume(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!formData.name) {
        // Auto-fill name from filename
        setFormData((prev) => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, ''),
        }))
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile && !editingResume) return

    setUploading(true)

    try {
      let filePath = editingResume?.file_path || ''
      let fileType = editingResume?.file_type || ''

      // Upload file if new one selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        filePath = `${userId}/${Date.now()}.${fileExt}`
        fileType = selectedFile.type

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError
      }

      if (editingResume) {
        // Update existing resume
        const { data, error } = await supabase
          .from('resumes')
          .update({
            name: formData.name,
            version: formData.version || null,
            tags: formData.tags.length > 0 ? formData.tags : null,
            file_path: filePath,
            file_type: fileType,
          })
          .eq('id', editingResume.id)
          .select()
          .single()

        if (error) throw error
        if (data) {
          onResumesChange(resumes.map((r) => (r.id === data.id ? data : r)))
        }
      } else {
        // Create new resume
        const { data, error } = await supabase
          .from('resumes')
          .insert({
            user_id: userId,
            name: formData.name,
            version: formData.version || null,
            file_path: filePath,
            file_type: fileType,
            tags: formData.tags.length > 0 ? formData.tags : null,
          })
          .select()
          .single()

        if (error) throw error
        if (data) {
          onResumesChange([...resumes, data])
        }
      }

      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Error uploading resume. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (resume: Resume) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resume.file_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${resume.name}${resume.version ? `_${resume.version}` : ''}.${resume.file_path.split('.').pop()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading resume:', error)
      alert('Error downloading resume. Please try again.')
    }
  }

  const handleDelete = async (resume: Resume) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      // Delete from storage
      await supabase.storage.from('resumes').remove([resume.file_path])

      // Delete from database
      const { error } = await supabase.from('resumes').delete().eq('id', resume.id)

      if (error) throw error
      onResumesChange(resumes.filter((r) => r.id !== resume.id))
    } catch (error) {
      console.error('Error deleting resume:', error)
      alert('Error deleting resume. Please try again.')
    }
  }

  const handleEdit = (resume: Resume) => {
    setEditingResume(resume)
    setFormData({
      name: resume.name,
      version: resume.version || '',
      tags: resume.tags || [],
    })
    setShowForm(true)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    return '📎'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Repository
          </DialogTitle>
          <DialogDescription>
            Store and manage different versions of your resumes
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          <div className="space-y-4">
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Upload New Resume
            </Button>

            {resumes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No resumes uploaded yet.</p>
                <p className="text-sm">Upload your first resume to get started!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFileIcon(resume.file_type)}</span>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {resume.name}
                              {resume.version && (
                                <Badge variant="secondary" className="text-xs">
                                  v{resume.version}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(resume.created_at), 'MMM d, yyyy')}
                            </div>
                            {resume.tags && resume.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {resume.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(resume)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(resume)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(resume)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Resume File {!editingResume && '*'}</Label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                {selectedFile ? (
                  <p className="font-medium">{selectedFile.name}</p>
                ) : editingResume ? (
                  <p className="text-muted-foreground">
                    Click to replace file (optional)
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Click to upload PDF, DOC, or DOCX
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="Software Engineer Resume"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  placeholder="1.0, 2024-Q4, etc."
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="Frontend, Tech, Senior"
                value={formData.tags.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading || (!selectedFile && !editingResume)}>
                {uploading ? 'Uploading...' : editingResume ? 'Update' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
