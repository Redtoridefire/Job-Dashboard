'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ExploreModeContextType {
  isExploreMode: boolean
  enterExploreMode: () => void
  exitExploreMode: () => void
  showSignUpPrompt: boolean
  setShowSignUpPrompt: (show: boolean) => void
}

const ExploreModeContext = createContext<ExploreModeContextType | undefined>(undefined)

export function ExploreModeProvider({ children }: { children: ReactNode }) {
  const [isExploreMode, setIsExploreMode] = useState(false)
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false)

  const enterExploreMode = () => {
    setIsExploreMode(true)
  }

  const exitExploreMode = () => {
    setIsExploreMode(false)
    setShowSignUpPrompt(false)
  }

  return (
    <ExploreModeContext.Provider
      value={{
        isExploreMode,
        enterExploreMode,
        exitExploreMode,
        showSignUpPrompt,
        setShowSignUpPrompt,
      }}
    >
      {children}
    </ExploreModeContext.Provider>
  )
}

export function useExploreMode() {
  const context = useContext(ExploreModeContext)
  if (context === undefined) {
    throw new Error('useExploreMode must be used within an ExploreModeProvider')
  }
  return context
}

// Demo data for explore mode - matching actual database types
export const demoApplications = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    company: 'Google',
    role: 'Senior Software Engineer',
    status: 'interviewing' as const,
    priority: 'A' as const,
    work_type: 'hybrid' as const,
    location: 'Mountain View, CA',
    salary_min: 180000,
    salary_max: 250000,
    job_url: 'https://careers.google.com',
    job_description: 'Building cloud infrastructure',
    notes: 'Had a great phone screen, technical interview next week',
    tags: ['FAANG', 'Tech', 'Cloud'],
    referral_name: null,
    hiring_manager: 'John Smith',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    company: 'Stripe',
    role: 'Full Stack Developer',
    status: 'submitted' as const,
    priority: 'A' as const,
    work_type: 'remote' as const,
    location: 'Remote',
    salary_min: 150000,
    salary_max: 200000,
    job_url: 'https://stripe.com/jobs',
    job_description: 'Payment infrastructure development',
    notes: 'Applied through referral',
    tags: ['Fintech', 'Payments', 'Remote'],
    referral_name: 'Jane Doe',
    hiring_manager: null,
    deadline: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    company: 'Netflix',
    role: 'Platform Engineer',
    status: 'offer' as const,
    priority: 'Dream' as const,
    work_type: 'onsite' as const,
    location: 'Los Gatos, CA',
    salary_min: 200000,
    salary_max: 350000,
    job_url: 'https://jobs.netflix.com',
    job_description: 'Streaming platform engineering',
    notes: 'Received offer! Negotiating salary',
    tags: ['FAANG', 'Streaming', 'Infrastructure'],
    referral_name: null,
    hiring_manager: 'Sarah Johnson',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    user_id: 'demo-user',
    company: 'Airbnb',
    role: 'Frontend Engineer',
    status: 'new' as const,
    priority: 'B' as const,
    work_type: 'hybrid' as const,
    location: 'San Francisco, CA',
    salary_min: 160000,
    salary_max: 220000,
    job_url: 'https://careers.airbnb.com',
    job_description: 'React/Next.js development',
    notes: 'Need to update resume first',
    tags: ['Travel', 'Marketplace', 'React'],
    referral_name: null,
    hiring_manager: null,
    deadline: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    user_id: 'demo-user',
    company: 'Shopify',
    role: 'Backend Developer',
    status: 'rejected' as const,
    priority: 'B' as const,
    work_type: 'remote' as const,
    location: 'Remote',
    salary_min: 140000,
    salary_max: 180000,
    job_url: 'https://www.shopify.com/careers',
    job_description: 'Ruby on Rails development',
    notes: 'Rejected after final round - need more Rails experience',
    tags: ['E-commerce', 'Ruby', 'Remote'],
    referral_name: null,
    hiring_manager: 'Mike Brown',
    deadline: null,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-6',
    user_id: 'demo-user',
    company: 'Notion',
    role: 'Product Engineer',
    status: 'submitted' as const,
    priority: 'A' as const,
    work_type: 'hybrid' as const,
    location: 'New York, NY',
    salary_min: 170000,
    salary_max: 230000,
    job_url: 'https://www.notion.so/careers',
    job_description: 'Building productivity tools',
    notes: 'Recruiter call scheduled for tomorrow',
    tags: ['Productivity', 'Startup', 'Product'],
    referral_name: null,
    hiring_manager: null,
    deadline: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const demoInterviews = [
  {
    id: 'demo-interview-1',
    application_id: 'demo-1',
    interview_type: 'technical' as const,
    interview_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    interviewer_names: ['Sarah Chen', 'Tom Wilson'],
    notes: 'System design interview - prepare distributed systems concepts',
    score: null,
    feedback: null,
    google_calendar_event_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-interview-2',
    application_id: 'demo-6',
    interview_type: 'phone' as const,
    interview_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    interviewer_names: ['Mike Johnson'],
    notes: 'Initial call to discuss role and experience',
    score: null,
    feedback: null,
    google_calendar_event_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
