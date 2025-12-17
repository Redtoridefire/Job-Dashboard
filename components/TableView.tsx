'use client'

import { useMemo, useState } from 'react'
import { Database } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react'

type Application = Database['public']['Tables']['applications']['Row']

interface TableViewProps {
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Application['status']) => void
}

type SortField = 'company' | 'role' | 'status' | 'priority' | 'salary' | 'created_at'
type SortDirection = 'asc' | 'desc'

const statusOptions: Array<{ value: Application['status']; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

const priorityOptions: Array<{ value: Application['priority']; label: string }> = [
  { value: 'A', label: 'A - High' },
  { value: 'B', label: 'B - Medium' },
  { value: 'C', label: 'C - Low' },
  { value: 'Dream', label: '⭐ Dream' },
]

const statusOrder: Record<Application['status'], number> = {
  new: 1,
  submitted: 2,
  interviewing: 3,
  offer: 4,
  accepted: 5,
  rejected: 6,
}

const priorityOrder: Record<Application['priority'], number> = {
  Dream: 0,
  A: 1,
  B: 2,
  C: 3,
}

function formatCurrencyRange(min?: number | null, max?: number | null) {
  if (!min && !max) return '—'
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
  if (min) return `${formatter.format(min)}+`
  return formatter.format(max as number)
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TableView({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
}: TableViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Application['status'] | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Application['priority'] | 'all'>('all')
  const [tagFilter, setTagFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setTagFilter('')
    setStartDate('')
    setEndDate('')
  }

  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const normalizedTags = tagFilter
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)

    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    if (start) start.setHours(0, 0, 0, 0)
    if (end) end.setHours(23, 59, 59, 999)

    return [...applications]
      .filter((app) => {
        const matchesSearch =
          !normalizedSearch ||
          [app.company, app.role, app.location || ''].some((value) =>
            value.toLowerCase().includes(normalizedSearch)
          )

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter
        const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter

        const matchesTags =
          normalizedTags.length === 0 ||
          (app.tags ?? []).some((tag) =>
            normalizedTags.some((searchTag) => tag.toLowerCase().includes(searchTag))
          )

        const createdDate = new Date(app.created_at)
        const matchesStart = !start || createdDate >= start
        const matchesEnd = !end || createdDate <= end

        return matchesSearch && matchesStatus && matchesPriority && matchesTags && matchesStart && matchesEnd
      })
      .sort((a, b) => {
        let comparison = 0

        switch (sortField) {
          case 'company':
            comparison = a.company.localeCompare(b.company)
            break
          case 'role':
            comparison = a.role.localeCompare(b.role)
            break
          case 'status':
            comparison = statusOrder[a.status] - statusOrder[b.status]
            break
          case 'priority':
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
            break
          case 'salary': {
            const aValues = [a.salary_min, a.salary_max].filter(
              (value): value is number => typeof value === 'number'
            )
            const bValues = [b.salary_min, b.salary_max].filter(
              (value): value is number => typeof value === 'number'
            )
            const aSalary = aValues.length ? aValues.reduce((sum, value) => sum + value, 0) / aValues.length : 0
            const bSalary = bValues.length ? bValues.reduce((sum, value) => sum + value, 0) / bValues.length : 0
            comparison = aSalary - bSalary
            break
          }
          case 'created_at':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            break
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })
  }, [applications, endDate, priorityFilter, searchTerm, sortDirection, sortField, startDate, statusFilter, tagFilter])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input
            placeholder="Search company, role, or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as Application['status'] | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(value) => setPriorityFilter(value as Application['priority'] | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by tags (comma-separated)"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start date"
          />

          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End date"
          />
        </div>

        <div className="flex items-center justify-end mt-3">
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {[
                  { key: 'company', label: 'Company' },
                  { key: 'role', label: 'Role' },
                  { key: 'status', label: 'Status' },
                  { key: 'priority', label: 'Priority' },
                  { key: 'salary', label: 'Salary' },
                  { key: 'created_at', label: 'Date Added' },
                  { key: 'actions', label: 'Actions' },
                ].map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left font-semibold text-muted-foreground"
                  >
                    {column.key === 'actions' ? (
                      column.label
                    ) : (
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => handleSort(column.key as SortField)}
                      >
                        {column.label}
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No applications match your filters.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{app.company}</div>
                      <div className="text-xs text-muted-foreground">{app.location || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{app.role}</div>
                      {app.tags && app.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {app.tags.map((tag) => (
                            <Badge key={`${app.id}-${tag}`} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={app.status} onValueChange={(value) => onStatusChange(app.id, value as Application['status'])}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="font-semibold"
                      >
                        {app.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{formatCurrencyRange(app.salary_min, app.salary_max)}</td>
                    <td className="px-4 py-3">{formatDate(app.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(app)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => onDelete(app.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
