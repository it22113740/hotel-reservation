'use client'

import { useState } from 'react'
import { Building2, MapPin, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Edit, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requestPublish } from '@/lib/actions/hotel.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { PublishStatus } from '@/types/hotel.types'

interface ManagerHotelViewProps {
  hotel: {
    _id: string
    name: string
    slug: string
    description: string
    city: string
    country: string
    fullAddress: string
    location: string
    images: string[]
    status: 'pending' | 'approved' | 'rejected'
    publishStatus?: PublishStatus
    isPublished?: boolean
    publishRejectionReason?: string
    publishChangeRequest?: string
    price: number
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
}

export default function ManagerHotelView({ hotel }: ManagerHotelViewProps) {
  const router = useRouter()
  const [isRequestingPublish, setIsRequestingPublish] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)

  const handlePublishRequest = async () => {
    setIsRequestingPublish(true)
    try {
      const result = await requestPublish()
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        if (result.missingFields) {
          toast.error(result.message, {
            description: `Missing: ${result.missingFields.join(', ')}`
          })
        } else {
          toast.error(result.message)
        }
      }
    } catch (error) {
      toast.error('Failed to submit publish request')
    } finally {
      setIsRequestingPublish(false)
      setShowPublishConfirm(false)
    }
  }

  const getPublishStatusBadge = () => {
    if (hotel.isPublished) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Published
        </div>
      )
    }

    switch (hotel.publishStatus) {
      case 'publish_requested':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending Review
          </div>
        )
      case 'publish_rejected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rejected
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Draft
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Hotel</h1>
          <p className="text-gray-600 mt-1">Manage your hotel listing</p>
        </div>
        <div className="flex items-center gap-3">
          {getPublishStatusBadge()}
          <Link href="/dashboard/manager/hotels/edit">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
          </Link>
          <Link href={`/hotels/${hotel.slug}`} target="_blank">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Public Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Hotel Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Image */}
        <div className="relative h-64 bg-gray-100">
          {hotel.images && hotel.images.length > 0 ? (
            <Image
              src={hotel.images[0]}
              alt={hotel.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{hotel.location}</span>
            </div>
          </div>

          <p className="text-gray-700">{hotel.description}</p>

          {/* Status Messages */}
          {hotel.publishRejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Rejection Reason:</h3>
              <p className="text-red-700">{hotel.publishRejectionReason}</p>
            </div>
          )}

          {hotel.publishChangeRequest && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Change Request:</h3>
              <p className="text-yellow-700">{hotel.publishChangeRequest}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Check-in</p>
              <p className="font-semibold text-gray-900">{hotel.checkIn}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Check-out</p>
              <p className="font-semibold text-gray-900">{hotel.checkOut}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amenities</p>
              <p className="font-semibold text-gray-900">{hotel.amenities?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Images</p>
              <p className="font-semibold text-gray-900">{hotel.images?.length || 0}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Link href="/dashboard/manager/hotels/edit" className="flex-1">
              <Button variant="outline" className="w-full">
                Edit Hotel Details
              </Button>
            </Link>
            <Link href="/dashboard/manager/hotels/rooms" className="flex-1">
              <Button variant="outline" className="w-full">
                Manage Rooms
              </Button>
            </Link>
            <Link href="/dashboard/manager/hotels/amenities" className="flex-1">
              <Button variant="outline" className="w-full">
                Manage Amenities
              </Button>
            </Link>
          </div>

          {/* Publish Button */}
          {hotel.status === 'approved' && !hotel.isPublished && hotel.publishStatus !== 'publish_requested' && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={() => setShowPublishConfirm(true)}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Request to Publish Hotel
              </Button>
            </div>
          )}

          {hotel.publishStatus === 'publish_rejected' && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={() => setShowPublishConfirm(true)}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Resubmit Publish Request
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      {showPublishConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowPublishConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request to Publish Hotel?</h3>
            <p className="text-gray-600 mb-6">
              Your hotel will be submitted for admin review. Once approved, it will be visible to all travelers on LankaStay.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPublishConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublishRequest}
                disabled={isRequestingPublish}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isRequestingPublish ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

