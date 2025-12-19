import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ExploreModeProvider } from '@/lib/explore-context'

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ExploreModeProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ExploreModeProvider>
      </body>
    </html>
  )
}
