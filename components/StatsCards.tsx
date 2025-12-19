'use client'

import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Send, Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

type Application = Database['public']['Tables']['applications']['Row']

interface StatsCardsProps {
  applications: Application[]
}

export default function StatsCards({ applications }: StatsCardsProps) {
  const totalApplications = applications.length
  const submitted = applications.filter((app) => 
    ['submitted', 'interviewing', 'offer', 'accepted'].includes(app.status)
  ).length
  const interviewing = applications.filter((app) => app.status === 'interviewing').length
  const offers = applications.filter((app) => app.status === 'offer').length
  const accepted = applications.filter((app) => app.status === 'accepted').length
  const rejected = applications.filter((app) => app.status === 'rejected').length

  const interviewRate = submitted > 0 ? ((interviewing + offers + accepted) / submitted * 100).toFixed(1) : '0'
  const offerRate = submitted > 0 ? ((offers + accepted) / submitted * 100).toFixed(1) : '0'

  const stats = [
    {
      title: 'Total Applications',
      value: totalApplications,
      icon: Briefcase,
      color: 'text-blue-500',
    },
    {
      title: 'Submitted',
      value: submitted,
      icon: Send,
      color: 'text-yellow-500',
    },
    {
      title: 'Interviewing',
      value: interviewing,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Offers',
      value: offers,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Interview Rate',
      value: `${interviewRate}%`,
      icon: TrendingUp,
      color: 'text-cyan-500',
    },
    {
      title: 'Rejected',
      value: rejected,
      icon: XCircle,
      color: 'text-red-500',
    },
  ]

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 flex-shrink-0 ${stat.color}`} />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
