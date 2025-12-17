import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Job Search Dashboard - Track Your Applications',
  description: 'A comprehensive job search dashboard to track applications, interviews, and offers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
