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
  Eye,
  Plus,
} from 'lucide-react'
import { format } from 'date-fns'

type Application = Database['public']['Tables']['applications']['Row']

interface TableViewProps {
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Application['status']) => void
  onViewInterviews: (application: Application) => void
  onViewDetails: (application: Application) => void
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
  onViewDetails,
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
      <div className="border rounded-lg p-6 sm:p-8 text-center text-muted-foreground text-sm sm:text-base">
        No applications yet. Add your first application to get started!
      </div>
    )
  }

  // Mobile card view
  const MobileCard = ({ app }: { app: Application }) => (
    <div
      className="border rounded-lg p-4 bg-card hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={() => onViewDetails(app)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{app.company}</h3>
          <p className="text-sm text-muted-foreground truncate">{app.role}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(app); }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(app); }}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewInterviews(app); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Interview
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(app.id); }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                  onClick={(e) => { e.stopPropagation(); onStatusChange(app.id, status); }}
                >
                  <Badge className={statusColors[status]} variant="secondary">
                    {status}
                  </Badge>
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Badge className={priorityColors[app.priority]} variant="secondary">
          {app.priority === 'Dream' ? '⭐ Dream' : app.priority}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Salary: </span>
          <span>{formatSalary(app.salary_min, app.salary_max)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Location: </span>
          <span>{app.location || '-'}</span>
        </div>
        {app.deadline && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Deadline: </span>
            <span>{format(new Date(app.deadline), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {sortedApplications.map((app) => (
          <MobileCard key={app.id} app={app} />
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('company')}
                    className="flex items-center hover:text-primary text-sm"
                  >
                    Company
                    <SortIcon field="company" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center hover:text-primary text-sm"
                  >
                    Role
                    <SortIcon field="role" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-primary text-sm"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center hover:text-primary text-sm"
                  >
                    Priority
                    <SortIcon field="priority" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">
                  <button
                    onClick={() => handleSort('salary_max')}
                    className="flex items-center hover:text-primary text-sm"
                  >
                    Salary
                    <SortIcon field="salary_max" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium hidden xl:table-cell">Location</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">
                  <button
                    onClick={() => handleSort('deadline')}
                    className="flex items-center hover:text-primary text-sm"
                  >
                    Deadline
                    <SortIcon field="deadline" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center hover:text-primary text-sm"
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
                <tr
                  key={app.id}
                  className="border-t hover:bg-muted/30 cursor-pointer"
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest('button') || target.closest('[role="menu"]') || target.closest('a')) {
                      return
                    }
                    onViewDetails(app)
                  }}
                >
                  <td className="p-3">
                    <div className="font-medium text-sm">{app.company}</div>
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
                  <td className="p-3 text-sm">{app.role}</td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button>
                          <Badge className={`${statusColors[app.status]} text-xs`} variant="secondary">
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
                    <Badge className={`${priorityColors[app.priority]} text-xs`} variant="secondary">
                      {app.priority === 'Dream' ? '⭐ Dream' : app.priority}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    {formatSalary(app.salary_min, app.salary_max)}
                  </td>
                  <td className="p-3 text-sm hidden xl:table-cell">
                    {app.location || '-'}
                    {app.work_type && (
                      <span className="text-muted-foreground ml-1">({app.work_type})</span>
                    )}
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    {app.deadline ? format(new Date(app.deadline), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {format(new Date(app.created_at), 'MMM d')}
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(app)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(app)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewInterviews(app)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Interview
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
    </>
  )
}
