// app/dashboard/layout.tsx
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/Slider'
import DashboardHeader from '@/components/dashboard/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/login?redirect_url=/dashboard')
  }

  const user = await currentUser()
  const userRole = user?.unsafeMetadata?.role as string

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ✅ Shared Sidebar - shows different items per role */}
      <DashboardSidebar userRole={userRole} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}