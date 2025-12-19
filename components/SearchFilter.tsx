'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Download } from 'lucide-react'
import { Database } from '@/types/database'

type Application = Database['public']['Tables']['applications']['Row']

interface SearchFilterProps {
  onSearchChange: (search: string) => void
  onStatusFilter: (status: string | null) => void
  onPriorityFilter: (priority: string | null) => void
  onWorkTypeFilter: (workType: string | null) => void
  onExport: () => void
  search: string
  statusFilter: string | null
  priorityFilter: string | null
  workTypeFilter: string | null
}

export default function SearchFilter({
  onSearchChange,
  onStatusFilter,
  onPriorityFilter,
  onWorkTypeFilter,
  onExport,
  search,
  statusFilter,
  priorityFilter,
  workTypeFilter,
}: SearchFilterProps) {
  const hasFilters = search || statusFilter || priorityFilter || workTypeFilter

  const clearFilters = () => {
    onSearchChange('')
    onStatusFilter(null)
    onPriorityFilter(null)
    onWorkTypeFilter(null)
  }

  return (
    <div className="flex flex-col gap-3 mb-4 sm:mb-6">
      {/* Search bar - full width on mobile */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search company, role, location..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 sm:h-9 text-base sm:text-sm"
        />
      </div>

      {/* Filters row - scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <Select value={statusFilter || 'all'} onValueChange={(v) => onStatusFilter(v === 'all' ? null : v)}>
          <SelectTrigger className="w-[120px] sm:w-[140px] flex-shrink-0 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter || 'all'} onValueChange={(v) => onPriorityFilter(v === 'all' ? null : v)}>
          <SelectTrigger className="w-[120px] sm:w-[140px] flex-shrink-0 h-9 text-sm">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Dream">⭐ Dream</SelectItem>
            <SelectItem value="A">A - High</SelectItem>
            <SelectItem value="B">B - Medium</SelectItem>
            <SelectItem value="C">C - Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={workTypeFilter || 'all'} onValueChange={(v) => onWorkTypeFilter(v === 'all' ? null : v)}>
          <SelectTrigger className="w-[110px] sm:w-[130px] flex-shrink-0 h-9 text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters" className="flex-shrink-0 h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
        )}

        <Button variant="outline" onClick={onExport} title="Export to CSV" className="flex-shrink-0 h-9 text-sm">
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  )
}
