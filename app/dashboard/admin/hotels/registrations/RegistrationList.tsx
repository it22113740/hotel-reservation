'use client'

import { useState } from 'react'
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  Eye,
  Check,
  X,
  Search,
  Filter,
  ChevronDown,
  Image as ImageIcon,
  User,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { updateHotelStatus } from '@/lib/actions/hotel.actions'

interface HotelRegistration {
  _id: string
  id: string
  name: string
  slug: string
  description: string
  city: string
  country: string
  fullAddress: string
  location: string
  ownerName: string
  contactEmail: string
  contactPhone: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  ownerId: string
  price: number
  currency: string
  rating: number
  reviewsCount: number
  amenities: string[]
  checkIn: string
  checkOut: string
  languages: string[]
  policies: string[]
  verified: boolean
  featured: boolean
}

export default function RegistrationsPage( { data }: { data: HotelRegistration[] } ) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedRegistration, setSelectedRegistration] = useState<HotelRegistration | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ show: boolean; action: 'approve' | 'reject' | null; id: string | null }>({
    show: false,
    action: null,
    id: null
  })

  // Map _id to id and initialize state
  const [registrations, setRegistrations] = useState<HotelRegistration[]>(
    data.map(reg => ({ ...reg, id: reg._id }))
  )

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = (reg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (reg.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (reg.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handle approve/reject
  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setShowConfirmDialog({ show: true, action, id })
  }

  const confirmAction = async () => {
    if (!showConfirmDialog.id || !showConfirmDialog.action) return

    setRegistrations(prev => prev.map(reg => 
      reg.id === showConfirmDialog.id 
        ? { ...reg, status: showConfirmDialog.action === 'approve' ? 'approved' : 'rejected' }
        : reg
    ))

    setShowConfirmDialog({ show: false, action: null, id: null })
    setShowDetailModal(false)

    await updateHotelStatus(showConfirmDialog.id, showConfirmDialog.action === 'approve' ? 'approved' : 'rejected')
  }

  // View details
  const viewDetails = (registration: HotelRegistration) => {
    setSelectedRegistration(registration)
    setShowDetailModal(true)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const pendingCount = registrations.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotel Registrations</h1>
          <p className="text-gray-600 mt-1">Review and manage hotel registration applications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
            {pendingCount} Pending
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by hotel name, city, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations Grid */}
      {filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No registrations found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search or filters' : 'No hotel registrations to review'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Image Preview */}
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {registration.images.length > 0 ? (
                  <div className="relative h-full">
                    <Image
                      src={registration.images[0]}
                      alt={registration.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-hotel.jpg'
                      }}
                    />
                    {registration.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {registration.images.length} photos
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {registration.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {registration.city}, {registration.country}
                    </div>
                  </div>
                  {getStatusBadge(registration.status)}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {registration.description}
                </p>

                {/* Owner Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="truncate">{registration.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="truncate">{formatDate(registration.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewDetails(registration)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  
                  {registration.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAction(registration.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(registration.id, 'reject')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRegistration && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRegistration.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedRegistration.status)}
                  <span className="text-sm text-gray-500">
                    Submitted {formatDate(selectedRegistration.createdAt)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-6">
                {/* Images */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Hotel Images</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedRegistration.images.map((image, index) => (
                      <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`${selectedRegistration.name} ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/placeholder-hotel.jpg'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRegistration.description}</p>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-900">{selectedRegistration.fullAddress}</p>
                          <p className="text-gray-600">{selectedRegistration.city}, {selectedRegistration.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Owner Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{selectedRegistration.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${selectedRegistration.contactEmail}`} className="text-primary hover:underline">
                          {selectedRegistration.contactEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{selectedRegistration.contactPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            {selectedRegistration.status === 'pending' && (
              <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleAction(selectedRegistration.id, 'reject')}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
                <Button
                  onClick={() => handleAction(selectedRegistration.id, 'approve')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog.show && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowConfirmDialog({ show: false, action: null, id: null })}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                showConfirmDialog.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {showConfirmDialog.action === 'approve' ? (
                  <Check className="w-6 h-6 text-green-600" />
                ) : (
                  <X className="w-6 h-6 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showConfirmDialog.action === 'approve' ? 'Approve Registration?' : 'Reject Registration?'}
              </h3>
              <p className="text-gray-600 mb-6">
                {showConfirmDialog.action === 'approve'
                  ? 'This hotel will be approved and listed on the platform.'
                  : 'This hotel registration will be rejected and the owner will be notified.'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog({ show: false, action: null, id: null })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmAction}
                  className={`flex-1 ${
                    showConfirmDialog.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {showConfirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}