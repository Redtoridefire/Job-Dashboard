import { Database } from '@/types/database'

type Application = Database['public']['Tables']['applications']['Row']

export function exportToCSV(applications: Application[], filename: string = 'job-applications.csv') {
  if (applications.length === 0) {
    alert('No applications to export')
    return
  }

  // Define CSV headers
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
    'Tags',
    'Referral Name',
    'Hiring Manager',
    'Notes',
    'Job Description',
    'Deadline',
    'Created At',
    'Updated At',
  ]

  // Convert applications to CSV rows
  const rows = applications.map((app) => [
    app.company,
    app.role,
    app.status,
    app.priority,
    app.location || '',
    app.work_type || '',
    app.salary_min || '',
    app.salary_max || '',
    app.job_url || '',
    app.tags?.join('; ') || '',
    app.referral_name || '',
    app.hiring_manager || '',
    app.notes || '',
    app.job_description || '',
    app.deadline || '',
    app.created_at,
    app.updated_at,
  ])

  // Escape CSV values (handle quotes and commas)
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // Build CSV content
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    // Create a link to the file
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export function generateExportFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `job-applications-${year}${month}${day}-${hours}${minutes}.csv`
}
