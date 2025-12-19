'use client'

import { ReactNode } from 'react'
import { useExploreMode } from '@/lib/explore-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Lock, UserPlus } from 'lucide-react'

interface FeatureLockProps {
  children: ReactNode
  feature: string
  description?: string
}

export function FeatureLock({ children, feature, description }: FeatureLockProps) {
  const { isExploreMode, showSignUpPrompt, setShowSignUpPrompt, exitExploreMode } = useExploreMode()

  if (!isExploreMode) {
    return <>{children}</>
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSignUpPrompt(true)
  }

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className="cursor-pointer"
        title={`Sign up to ${feature.toLowerCase()}`}
      >
        <div className="pointer-events-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Sign up to unlock</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeatureLockButton({
  children,
  feature,
  onClick,
  ...props
}: {
  children: ReactNode
  feature: string
  onClick?: () => void
  [key: string]: unknown
}) {
  const { isExploreMode, setShowSignUpPrompt } = useExploreMode()

  const handleClick = () => {
    if (isExploreMode) {
      setShowSignUpPrompt(true)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <Button onClick={handleClick} {...props}>
      {isExploreMode && <Lock className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  )
}

export function SignUpPromptDialog() {
  const { showSignUpPrompt, setShowSignUpPrompt, exitExploreMode } = useExploreMode()

  return (
    <Dialog open={showSignUpPrompt} onOpenChange={setShowSignUpPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Create an Account</DialogTitle>
          <DialogDescription className="text-center">
            Sign up to unlock all features and start tracking your job applications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">With a free account you can:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Add and manage job applications
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Upload and organize your resumes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Schedule and track interviews
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Export your data anytime
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Access analytics and insights
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Connect with Google Calendar
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={exitExploreMode} className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up Now
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowSignUpPrompt(false)}
            className="w-full"
          >
            Continue Exploring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
