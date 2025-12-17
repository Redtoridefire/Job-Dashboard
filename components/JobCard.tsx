'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  ExternalLink, 
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Application = Database['public']['Tables']['applications']['Row']

interface JobCardProps {
  application: Application
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Application['status']) => void
}

const statusColors = {
  new: 'bg-blue-500',
  submitted: 'bg-yellow-500',
  interviewing: 'bg-purple-500',
  offer: 'bg-green-500',
  accepted: 'bg-emerald-500',
  rejected: 'bg-red-500',
}

const priorityColors = {
  A: 'bg-red-100 text-red-800 border-red-300',
  B: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  C: 'bg-green-100 text-green-800 border-green-300',
  Dream: 'bg-purple-100 text-purple-800 border-purple-300',
}

export default function JobCard({ application, onEdit, onDelete, onStatusChange }: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null
    if (min && max) return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`
    if (min) return `$${(min / 1000).toFixed(0)}K+`
    if (max) return `Up to $${(max / 1000).toFixed(0)}K`
  }

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={priorityColors[application.priority]}>
                {application.priority === 'Dream' ? '⭐ Dream' : `Priority ${application.priority}`}
              </Badge>
              <div className={`w-2 h-2 rounded-full ${statusColors[application.status]}`} />
            </div>
            <CardTitle className="text-lg font-semibold">{application.role}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{application.company}</p>
          </div>
          {isHovered && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(application)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(application.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {application.location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            {application.location}
            {application.work_type && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {application.work_type}
              </Badge>
            )}
          </div>
        )}
        
        {formatSalary(application.salary_min, application.salary_max) && (
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="mr-2 h-4 w-4" />
            {formatSalary(application.salary_min, application.salary_max)}
          </div>
        )}

        {application.deadline && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            Deadline: {new Date(application.deadline).toLocaleDateString()}
          </div>
        )}

        {application.tags && application.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {application.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {application.job_url && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => window.open(application.job_url!, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Posting
          </Button>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          Updated {formatDistanceToNow(new Date(application.updated_at), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
}
