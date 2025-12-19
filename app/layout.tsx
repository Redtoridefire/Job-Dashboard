import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ExploreModeProvider } from '@/lib/explore-context'

export const metadata: Metadata = {
  title: 'Job Search Dashboard - Track Your Applications',
  description: 'A comprehensive job search dashboard to track applications, interviews, and offers',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Job Dashboard',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background">
        <ExploreModeProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ExploreModeProvider>
      </body>
    </html>
  )
}
