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
  Trash2,
  Plus,
  Eye,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Application = Database['public']['Tables']['applications']['Row']

interface JobCardProps {
  application: Application
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Application['status']) => void
  onViewDetails: (application: Application) => void
  onAddInterview: (application: Application) => void
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

export default function JobCard({
  application,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDetails,
  onAddInterview,
}: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null
    if (min && max) return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`
    if (min) return `$${(min / 1000).toFixed(0)}K+`
    if (max) return `Up to $${(max / 1000).toFixed(0)}K`
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on a button or dropdown
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('[role="menu"]') ||
      target.closest('a')
    ) {
      return
    }
    onViewDetails(application)
  }

  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
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
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {application.role}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{application.company}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(application)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(application)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddInterview(application)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Interview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(application.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {application.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {application.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{application.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Quick Actions - shown on hover */}
        <div className={`flex gap-2 pt-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onAddInterview(application)
            }}
          >
            <Plus className="mr-1 h-3 w-3" />
            Interview
          </Button>
          {application.job_url && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                window.open(application.job_url!, '_blank')
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Updated {formatDistanceToNow(new Date(application.updated_at), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
}
