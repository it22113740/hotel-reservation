'use client'

import { useState, useMemo, useEffect } from 'react'
import { Building2, MapPin, Search, Filter, CheckCircle, XCircle, Clock, AlertCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { approvePublish, rejectPublish, requestPublishChanges } from '@/lib/actions/hotel.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import PublishRequestModal from './PublishRequestModal'
import HotelDetailsModal from './HotelDetailsModal'

interface Hotel {
  _id: string
  name: string
  slug: string
  description: string
  city: string
  country: string
  fullAddress: string
  location: string
  ownerName: string
  contactEmail: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  publishStatus?: 'draft' | 'publish_requested' | 'published' | 'publish_rejected'
  isPublished?: boolean
  createdAt: string
  updatedAt: string
  price: number
  rating: number
}

interface HotelsListProps {
  initialHotels: Hotel[]
}

export default function HotelsList({ initialHotels }: HotelsListProps) {
  const router = useRouter()
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels)
  
  // Update hotels when initialHotels changes (after router.refresh())
  useEffect(() => {
    setHotels(initialHotels)
  }, [initialHotels])
  const [searchQuery, setSearchQuery] = useState('')
  const [publishStatusFilter, setPublishStatusFilter] = useState<'all' | 'publish_requested' | 'published' | 'draft' | 'publish_rejected'>('all')
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Filter hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const matchesSearch = 
        (hotel.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hotel.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hotel.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesPublishStatus = publishStatusFilter === 'all' || 
        (publishStatusFilter === 'published' ? hotel.isPublished === true : hotel.publishStatus === publishStatusFilter)

      return matchesSearch && matchesPublishStatus
    })
  }, [hotels, searchQuery, publishStatusFilter])

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPublishStatusBadge = (publishStatus?: string, isPublished?: boolean) => {
    if (isPublished) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Published
        </div>
      )
    }

    switch (publishStatus) {
      case 'publish_requested':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Publish Requested
          </div>
        )
      case 'publish_rejected':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Publish Rejected
          </div>
        )
      case 'draft':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Draft
          </div>
        )
      default:
        return null
    }
  }

  const publishRequestCount = hotels.filter(h => h.publishStatus === 'publish_requested').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Hotels</h1>
          <p className="text-gray-600 mt-1">Manage all hotel listings and publish requests</p>
        </div>
        {publishRequestCount > 0 && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
            {publishRequestCount} Publish Request{publishRequestCount !== 1 ? 's' : ''}
          </div>
        )}
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

          {/* Publish Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'publish_requested', label: 'Publish Requests' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'publish_rejected', label: 'Rejected' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPublishStatusFilter(value as any)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${publishStatusFilter === value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      {filteredHotels.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search or filters' : 'No hotels to display'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel._id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {hotel.images && hotel.images.length > 0 ? (
                  <Image
                    src={hotel.images[0]}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{hotel.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {hotel.location}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {getPublishStatusBadge(hotel.publishStatus, hotel.isPublished)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{hotel.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Owner: {hotel.ownerName}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedHotel(hotel)
                      setShowDetailsModal(true)
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  
                  {hotel.publishStatus === 'publish_requested' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedHotel(hotel)
                          setShowPublishModal(true)
                        }}
                      >
                        Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const result = await approvePublish(hotel._id)
                          if (result.success) {
                            toast.success(result.message)
                            router.refresh()
                          } else {
                            toast.error(result.message)
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  {hotel.isPublished && (
                    <Link href={`/hotels/${hotel.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        View Live
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hotel Details Modal */}
      {showDetailsModal && selectedHotel && (
        <HotelDetailsModal
          hotel={selectedHotel}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedHotel(null)
          }}
        />
      )}

      {/* Publish Request Modal */}
      {showPublishModal && selectedHotel && selectedHotel.publishStatus === 'publish_requested' && (
        <PublishRequestModal
          hotel={selectedHotel as Hotel & { publishStatus: 'publish_requested' }}
          onClose={() => {
            setShowPublishModal(false)
            setSelectedHotel(null)
          }}
          onSuccess={() => {
            router.refresh()
            setShowPublishModal(false)
            setSelectedHotel(null)
          }}
        />
      )}
    </div>
  )
}

