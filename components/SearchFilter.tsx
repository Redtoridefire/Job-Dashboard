'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { Database } from '@/types/database'

type Application = Database['public']['Tables']['applications']['Row']

interface SearchFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: Application['status'] | 'all'
  onStatusFilterChange: (status: Application['status'] | 'all') => void
  priorityFilter: Application['priority'] | 'all'
  onPriorityFilterChange: (priority: Application['priority'] | 'all') => void
  workTypeFilter: Application['work_type'] | 'all'
  onWorkTypeFilterChange: (workType: Application['work_type'] | 'all') => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  workTypeFilter,
  onWorkTypeFilterChange,
  onClearFilters,
  hasActiveFilters,
}: SearchFilterProps) {
  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company, role, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as Application['status'] | 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={priorityFilter}
          onValueChange={(value) => onPriorityFilterChange(value as Application['priority'] | 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Dream">⭐ Dream Job</SelectItem>
            <SelectItem value="A">A - High</SelectItem>
            <SelectItem value="B">B - Medium</SelectItem>
            <SelectItem value="C">C - Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Work Type Filter */}
        <Select
          value={workTypeFilter || 'all'}
          onValueChange={(value) => onWorkTypeFilterChange(value as Application['work_type'] | 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Work Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Work Types</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Active filters applied
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
