'use client'

import { useState, useMemo } from 'react'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronsUpDown,
} from 'lucide-react'
import { format } from 'date-fns'

type Application = Database['public']['Tables']['applications']['Row']

interface TableViewProps {
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Application['status']) => void
  onViewInterviews: (application: Application) => void
}

type SortField = 'company' | 'role' | 'status' | 'priority' | 'salary_max' | 'created_at' | 'deadline'
type SortDirection = 'asc' | 'desc'

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

const priorityOrder: Record<Application['priority'], number> = {
  Dream: 0,
  A: 1,
  B: 2,
  C: 3,
}

const statusOrder: Record<Application['status'], number> = {
  offer: 0,
  interviewing: 1,
  submitted: 2,
  new: 3,
  accepted: 4,
  rejected: 5,
}

export default function TableView({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
  onViewInterviews,
}: TableViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'company':
        case 'role':
          comparison = (a[sortField] || '').localeCompare(b[sortField] || '')
          break
        case 'status':
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'salary_max':
          comparison = (a.salary_max || 0) - (b.salary_max || 0)
          break
        case 'created_at':
        case 'deadline':
          const dateA = a[sortField] ? new Date(a[sortField]!).getTime() : 0
          const dateB = b[sortField] ? new Date(b[sortField]!).getTime() : 0
          comparison = dateA - dateB
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [applications, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    )
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return '-'
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`
    if (min) return `$${(min / 1000).toFixed(0)}k+`
    return '-'
  }

  if (applications.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No applications yet. Add your first application to get started!
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('company')}
                  className="flex items-center hover:text-primary"
                >
                  Company
                  <SortIcon field="company" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('role')}
                  className="flex items-center hover:text-primary"
                >
                  Role
                  <SortIcon field="role" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center hover:text-primary"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center hover:text-primary"
                >
                  Priority
                  <SortIcon field="priority" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('salary_max')}
                  className="flex items-center hover:text-primary"
                >
                  Salary
                  <SortIcon field="salary_max" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">Location</th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('deadline')}
                  className="flex items-center hover:text-primary"
                >
                  Deadline
                  <SortIcon field="deadline" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center hover:text-primary"
                >
                  Added
                  <SortIcon field="created_at" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedApplications.map((app) => (
              <tr key={app.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <div className="font-medium">{app.company}</div>
                  {app.job_url && (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View posting <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </td>
                <td className="p-3">{app.role}</td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button>
                        <Badge className={statusColors[app.status]} variant="secondary">
                          {app.status}
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {(['new', 'submitted', 'interviewing', 'offer', 'accepted', 'rejected'] as const).map(
                        (status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => onStatusChange(app.id, status)}
                          >
                            <Badge className={statusColors[status]} variant="secondary">
                              {status}
                            </Badge>
                          </DropdownMenuItem>
                        )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                <td className="p-3">
                  <Badge className={priorityColors[app.priority]} variant="secondary">
                    {app.priority === 'Dream' ? '⭐ Dream' : app.priority}
                  </Badge>
                </td>
                <td className="p-3 text-sm">
                  {formatSalary(app.salary_min, app.salary_max)}
                </td>
                <td className="p-3 text-sm">
                  {app.location || '-'}
                  {app.work_type && (
                    <span className="text-muted-foreground ml-1">({app.work_type})</span>
                  )}
                </td>
                <td className="p-3 text-sm">
                  {app.deadline ? format(new Date(app.deadline), 'MMM d, yyyy') : '-'}
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {format(new Date(app.created_at), 'MMM d, yyyy')}
                </td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(app)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewInterviews(app)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Interviews
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(app.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
