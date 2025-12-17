'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDistance } from 'date-fns'

type Application = Database['public']['Tables']['applications']['Row']

interface TableViewProps {
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Application['status']) => void
}

type SortField = 'company' | 'role' | 'status' | 'priority' | 'created_at' | 'salary_min'
type SortDirection = 'asc' | 'desc'

export default function TableView({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
}: TableViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedApplications = [...applications].sort((a, b) => {
    let aVal: any = a[sortField]
    let bVal: any = b[sortField]

    // Handle null values
    if (aVal === null) return 1
    if (bVal === null) return -1

    // Convert to comparable values
    if (sortField === 'created_at') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  const getStatusColor = (status: Application['status']) => {
    const colors: Record<Application['status'], string> = {
      new: 'bg-blue-100 text-blue-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      interviewing: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  const getPriorityColor = (priority: Application['priority']) => {
    const colors: Record<Application['priority'], string> = {
      A: 'bg-red-100 text-red-800',
      B: 'bg-orange-100 text-orange-800',
      C: 'bg-gray-100 text-gray-800',
      Dream: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800',
    }
    return colors[priority]
  }

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return '-'
    if (min && max) return `$${(min / 1000).toFixed(0)}k-$${(max / 1000).toFixed(0)}k`
    if (min) return `$${(min / 1000).toFixed(0)}k+`
    return `Up to $${(max! / 1000).toFixed(0)}k`
  }

  if (applications.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No applications yet. Add your first one!</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-sm">
                <button
                  onClick={() => handleSort('company')}
                  className="flex items-center hover:text-primary"
                >
                  Company
                  <SortIcon field="company" />
                </button>
              </th>
              <th className="text-left p-3 font-medium text-sm">
                <button
                  onClick={() => handleSort('role')}
                  className="flex items-center hover:text-primary"
                >
                  Role
                  <SortIcon field="role" />
                </button>
              </th>
              <th className="text-left p-3 font-medium text-sm">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center hover:text-primary"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="text-left p-3 font-medium text-sm">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center hover:text-primary"
                >
                  Priority
                  <SortIcon field="priority" />
                </button>
              </th>
              <th className="text-left p-3 font-medium text-sm">
                <button
                  onClick={() => handleSort('salary_min')}
                  className="flex items-center hover:text-primary"
                >
                  Salary
                  <SortIcon field="salary_min" />
                </button>
              </th>
              <th className="text-left p-3 font-medium text-sm">Location</th>
              <th className="text-left p-3 font-medium text-sm">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center hover:text-primary"
                >
                  Added
                  <SortIcon field="created_at" />
                </button>
              </th>
              <th className="text-right p-3 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedApplications.map((app) => (
              <tr key={app.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="font-medium">{app.company}</div>
                </td>
                <td className="p-3">
                  <div className="font-medium">{app.role}</div>
                  {app.work_type && (
                    <div className="text-xs text-muted-foreground capitalize mt-1">
                      {app.work_type}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <Badge className={getStatusColor(app.status)} variant="secondary">
                    {app.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge className={getPriorityColor(app.priority)} variant="secondary">
                    {app.priority === 'Dream' ? '⭐ Dream' : app.priority}
                  </Badge>
                </td>
                <td className="p-3 text-sm">
                  {formatSalary(app.salary_min, app.salary_max)}
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {app.location || '-'}
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {formatDistance(new Date(app.created_at), new Date(), { addSuffix: true })}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {app.job_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(app.job_url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(app)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDelete(app.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
