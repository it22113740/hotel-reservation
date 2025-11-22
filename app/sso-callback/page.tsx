'use client'

import { useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk()

  useEffect(() => {
    handleRedirectCallback({ redirectUrl: window.location.href })
  }, [handleRedirectCallback])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  )
}