import { Database } from '@/types/database'

type Application = Database['public']['Tables']['applications']['Row']
type Interview = Database['public']['Tables']['interviews']['Row']

export function exportApplicationsToCSV(applications: Application[]): void {
  const headers = [
    'Company',
    'Role',
    'Status',
    'Priority',
    'Location',
    'Work Type',
    'Salary Min',
    'Salary Max',
    'Job URL',
    'Referral',
    'Hiring Manager',
    'Deadline',
    'Tags',
    'Notes',
    'Created At',
    'Updated At',
  ]

  const rows = applications.map((app) => [
    escapeCSV(app.company),
    escapeCSV(app.role),
    app.status,
    app.priority,
    escapeCSV(app.location || ''),
    app.work_type || '',
    app.salary_min?.toString() || '',
    app.salary_max?.toString() || '',
    escapeCSV(app.job_url || ''),
    escapeCSV(app.referral_name || ''),
    escapeCSV(app.hiring_manager || ''),
    app.deadline ? new Date(app.deadline).toLocaleDateString() : '',
    escapeCSV((app.tags || []).join(', ')),
    escapeCSV(app.notes || ''),
    new Date(app.created_at).toLocaleDateString(),
    new Date(app.updated_at).toLocaleDateString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  downloadCSV(csvContent, `job-applications-${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportInterviewsToCSV(interviews: Interview[], applications: Application[]): void {
  const appMap = new Map(applications.map((app) => [app.id, app]))

  const headers = [
    'Company',
    'Role',
    'Interview Date',
    'Interview Type',
    'Interviewers',
    'Score',
    'Notes',
    'Feedback',
  ]

  const rows = interviews.map((interview) => {
    const app = appMap.get(interview.application_id)
    return [
      escapeCSV(app?.company || 'Unknown'),
      escapeCSV(app?.role || 'Unknown'),
      new Date(interview.interview_date).toLocaleString(),
      interview.interview_type || '',
      escapeCSV((interview.interviewer_names || []).join(', ')),
      interview.score?.toString() || '',
      escapeCSV(interview.notes || ''),
      escapeCSV(interview.feedback || ''),
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  downloadCSV(csvContent, `interviews-${new Date().toISOString().split('T')[0]}.csv`)
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
