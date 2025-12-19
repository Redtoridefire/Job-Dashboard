'use client'

import { useMemo } from 'react'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Briefcase,
  Send,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  Clock,
  Calendar,
  Star,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { format, subDays, startOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns'

type Application = Database['public']['Tables']['applications']['Row']
type Interview = Database['public']['Tables']['interviews']['Row']

interface AnalyticsDashboardProps {
  applications: Application[]
  interviews: Interview[]
}

const STATUS_COLORS: Record<string, string> = {
  new: '#9CA3AF',
  submitted: '#3B82F6',
  interviewing: '#A855F7',
  offer: '#22C55E',
  accepted: '#10B981',
  rejected: '#EF4444',
}

const PRIORITY_COLORS: Record<string, string> = {
  Dream: '#A855F7',
  A: '#EF4444',
  B: '#F59E0B',
  C: '#6B7280',
}

export default function AnalyticsDashboard({
  applications,
  interviews,
}: AnalyticsDashboardProps) {
  const stats = useMemo(() => {
    const total = applications.length
    const submitted = applications.filter((app) =>
      ['submitted', 'interviewing', 'offer', 'accepted'].includes(app.status)
    ).length
    const interviewing = applications.filter((app) => app.status === 'interviewing').length
    const offers = applications.filter((app) => app.status === 'offer').length
    const accepted = applications.filter((app) => app.status === 'accepted').length
    const rejected = applications.filter((app) => app.status === 'rejected').length
    const dreamJobs = applications.filter((app) => app.priority === 'Dream').length

    const interviewRate = submitted > 0 ? ((interviewing + offers + accepted) / submitted) * 100 : 0
    const offerRate = submitted > 0 ? ((offers + accepted) / submitted) * 100 : 0
    const acceptanceRate = offers + accepted > 0 ? (accepted / (offers + accepted)) * 100 : 0

    const avgSalary = applications.filter((app) => app.salary_max).length > 0
      ? applications
          .filter((app) => app.salary_max)
          .reduce((sum, app) => sum + (app.salary_max || 0), 0) /
        applications.filter((app) => app.salary_max).length
      : 0

    return {
      total,
      submitted,
      interviewing,
      offers,
      accepted,
      rejected,
      dreamJobs,
      interviewRate,
      offerRate,
      acceptanceRate,
      avgSalary,
      totalInterviews: interviews.length,
    }
  }, [applications, interviews])

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    applications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name],
    }))
  }, [applications])

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {}
    applications.forEach((app) => {
      counts[app.priority] = (counts[app.priority] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name === 'Dream' ? '⭐ Dream' : `Priority ${name}`,
      value,
      color: PRIORITY_COLORS[name],
    }))
  }, [applications])

  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({
      start: subWeeks(new Date(), 11),
      end: new Date(),
    })

    return weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const weekApps = applications.filter((app) => {
        const created = new Date(app.created_at)
        return created >= weekStart && created < weekEnd
      })

      const weekInterviews = interviews.filter((interview) => {
        const date = new Date(interview.interview_date)
        return date >= weekStart && date < weekEnd
      })

      return {
        week: format(weekStart, 'MMM d'),
        applications: weekApps.length,
        interviews: weekInterviews.length,
      }
    })
  }, [applications, interviews])

  const workTypeData = useMemo(() => {
    const counts: Record<string, number> = { remote: 0, hybrid: 0, onsite: 0, unspecified: 0 }
    applications.forEach((app) => {
      if (app.work_type) {
        counts[app.work_type] = (counts[app.work_type] || 0) + 1
      } else {
        counts.unspecified++
      }
    })
    return [
      { name: 'Remote', value: counts.remote, color: '#22C55E' },
      { name: 'Hybrid', value: counts.hybrid, color: '#3B82F6' },
      { name: 'On-site', value: counts.onsite, color: '#F59E0B' },
      { name: 'Unspecified', value: counts.unspecified, color: '#9CA3AF' },
    ].filter((d) => d.value > 0)
  }, [applications])

  const statCards = [
    { title: 'Total Applications', value: stats.total, icon: Briefcase, color: 'text-blue-500' },
    { title: 'Active Pipeline', value: stats.submitted, icon: Send, color: 'text-yellow-500' },
    { title: 'Interviewing', value: stats.interviewing, icon: Users, color: 'text-purple-500' },
    { title: 'Offers', value: stats.offers, icon: CheckCircle, color: 'text-green-500' },
    { title: 'Interview Rate', value: `${stats.interviewRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-cyan-500' },
    { title: 'Offer Rate', value: `${stats.offerRate.toFixed(1)}%`, icon: Target, color: 'text-emerald-500' },
    { title: 'Dream Jobs', value: stats.dreamJobs, icon: Star, color: 'text-purple-500' },
    { title: 'Total Interviews', value: stats.totalInterviews, icon: Calendar, color: 'text-indigo-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Activity */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Weekly Activity (Last 12 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                    name="Applications"
                  />
                  <Line
                    type="monotone"
                    dataKey="interviews"
                    stroke="#A855F7"
                    strokeWidth={2}
                    dot={{ fill: '#A855F7' }}
                    name="Interviews"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Work Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Work Type Preference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {workTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Salary Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Target Salary</p>
                <p className="text-2xl font-bold">
                  {stats.avgSalary > 0 ? `$${Math.round(stats.avgSalary).toLocaleString()}` : 'N/A'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Highest Offer</p>
                  <p className="text-lg font-semibold">
                    {applications.filter((a) => a.status === 'offer' || a.status === 'accepted').length > 0
                      ? `$${Math.max(
                          ...applications
                            .filter((a) => (a.status === 'offer' || a.status === 'accepted') && a.salary_max)
                            .map((a) => a.salary_max || 0)
                        ).toLocaleString()}`
                      : 'No offers yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Apps with Salary</p>
                  <p className="text-lg font-semibold">
                    {applications.filter((a) => a.salary_max).length} / {applications.length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
