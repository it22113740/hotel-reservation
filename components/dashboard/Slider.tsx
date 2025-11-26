// components/dashboard/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Hotel,
  ChevronDown,
  ChevronRight,
  Database
} from 'lucide-react'

interface SidebarProps {
  userRole: string
}

interface MenuItem {
  href: string
  icon: any
  label: string
  submenu: boolean
  items?: MenuItem[]
}

export default function DashboardSidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(['/dashboard/admin/hotels'])

  // Define menu items per role
  const adminMenuItems: MenuItem[] = [
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview', submenu: false },
    {
      href: '/dashboard/admin/hotels',
      icon: Building2,
      label: 'Hotels',
      submenu: true,
      items: [
        { href: '/dashboard/admin/hotels', icon: Building2, label: 'All Hotels', submenu: false },
        { href: '/dashboard/admin/hotels/registrations', icon: Building2, label: 'Registrations', submenu: false },
      ]
    },
    { href: '/dashboard/admin/users', icon: Users, label: 'Users', submenu: false },
    { href: '/dashboard/admin/bookings', icon: Calendar, label: 'Bookings', submenu: false },
    { href: '/dashboard/admin/analytics', icon: BarChart3, label: 'Analytics', submenu: false },
    { href: '/dashboard/admin/settings', icon: Settings, label: 'Settings', submenu: false },
  ]

  const managerMenuItems: MenuItem[] = [
    { href: '/dashboard/manager', icon: LayoutDashboard, label: 'Overview', submenu: false },
    { href: '/dashboard/manager/hotels', icon: Hotel, label: 'My Hotel', submenu: false },
    { href: '/dashboard/manager/bookings', icon: Calendar, label: 'Bookings', submenu: false },
    { href: '/dashboard/manager/settings', icon: Settings, label: 'Settings', submenu: false },
  ]

  // Select menu based on role
  const menuItems = userRole === 'admin' ? adminMenuItems : managerMenuItems

  // Toggle submenu open/closed
  const toggleMenu = (href: string) => {
    setOpenMenus(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  // Check if submenu is open
  const isMenuOpen = (href: string) => openMenus.includes(href)

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">LankaStay</h1>
        {userRole === 'admin' && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
            Admin
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const hasSubmenu = item.submenu && item.items
          const isOpen = isMenuOpen(item.href)

          return (
            <div key={item.href}>
              {/* Parent Menu Item */}
              {hasSubmenu ? (
                // Clickable button for items with submenu
                <button
                  onClick={() => toggleMenu(item.href)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors text-gray-700 hover:bg-gray-100
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                // Regular link for items without submenu
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors
                    ${isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )}

              {/* Submenu Items */}
              {hasSubmenu && isOpen && item.items && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.items.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = pathname === subItem.href

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                          transition-colors
                          ${isSubActive
                            ? 'bg-primary/10 text-primary border-l-2 border-primary'
                            : 'text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <SubIcon className="w-4 h-4" />
                        {subItem.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {userRole === 'admin' ? 'Admin Dashboard' : 'Partner Dashboard'}
        </p>
      </div>
    </aside>
  )
}