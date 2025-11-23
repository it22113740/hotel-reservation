'use client'

import { useEffect, useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const completeCallback = async () => {
      try {
        await handleRedirectCallback({
          redirectUrl: '/',
        })
        // If successful and component still mounted, redirect will happen automatically
      } catch (err: unknown) {
        // Log error for diagnostics
        console.error('SSO callback error:', err)
        
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
          setError(errorMessage)
          
          // Redirect to login page after a brief delay
          setTimeout(() => {
            router.push('/login?error=sso_failed')
          }, 3000)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    completeCallback()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [handleRedirectCallback, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="text-red-500 text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-sm">{error}</p>
        </div>
        <p className="text-muted-foreground text-sm">
          Redirecting to login page...
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">
          {isLoading ? 'Completing sign in...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}