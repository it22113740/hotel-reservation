'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function DashboardHeader() {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/')
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      return { href, label }
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Mock notifications (replace with real data)
  const notifications = [
    { id: 1, title: 'New hotel registration', message: 'Grand Colombo Hotel pending approval', time: '5m ago', unread: true },
    { id: 2, title: 'New booking', message: 'Room 204 booked for 3 nights', time: '1h ago', unread: true },
    { id: 3, title: 'Review submitted', message: 'New 5-star review received', time: '2h ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left Section: Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button (for future mobile sidebar) */}
        <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-gray-400">/</span>
              )}
              <span 
                className={`
                  ${index === breadcrumbs.length - 1 
                    ? 'text-gray-900 font-medium' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Right Section: Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Search (optional - can be expanded later) */}
        <button className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs bg-white border border-gray-200 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer
                        ${notification.unread ? 'bg-blue-50/50' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-200">
                  <button className="w-full text-sm text-center text-primary hover:text-primary/80 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* User Profile */}
        <UserButton 
          afterSignOutUrl="/login"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
              userButtonPopoverCard: "shadow-xl",
            }
          }}
        />
      </div>
    </header>
  )
}