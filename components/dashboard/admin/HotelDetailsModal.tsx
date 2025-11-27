'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Phone, Mail, User, Building2, BedDouble, Users, Ruler, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { getHotelRooms } from '@/lib/actions/room.actions'
import { IRoom } from '@/types/room.types'

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
  contactPhone?: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  publishStatus?: 'draft' | 'publish_requested' | 'published' | 'publish_rejected'
  isPublished?: boolean
  price: number
  rating: number
  amenities?: string[]
  checkIn?: string
  checkOut?: string
  languages?: string[]
  policies?: string[]
  category?: string
  coordinates?: { lat: number; lng: number }
}

interface HotelDetailsModalProps {
  hotel: Hotel
  onClose: () => void
}

export default function HotelDetailsModal({ hotel, onClose }: HotelDetailsModalProps) {
  const [rooms, setRooms] = useState<IRoom[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoadingRooms(true)
      try {
        const hotelRooms = await getHotelRooms(hotel._id)
        setRooms(hotelRooms)
      } catch (error) {
        console.error('Error fetching rooms:', error)
      } finally {
        setIsLoadingRooms(false)
      }
    }

    fetchRooms()
  }, [hotel._id])

  const getPublishStatusBadge = () => {
    if (hotel.isPublished) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Published
        </span>
      )
    }

    switch (hotel.publishStatus) {
      case 'publish_requested':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            Publish Requested
          </span>
        )
      case 'publish_rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            Publish Rejected
          </span>
        )
      case 'draft':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            Draft
          </span>
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-w-6xl mx-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
            {getPublishStatusBadge()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Image Gallery */}
            {hotel.images && hotel.images.length > 0 && (
              <div className="space-y-2">
                <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={hotel.images[activeImageIndex]}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {hotel.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {hotel.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                          activeImageIndex === index ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${hotel.name} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hotel Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{hotel.location}</p>
                        <p className="text-sm text-gray-600">{hotel.fullAddress}</p>
                      </div>
                    </div>

                    {hotel.category && (
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">Category: {hotel.category}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">Starting from ${hotel.price}/night</span>
                    </div>

                    {hotel.checkIn && hotel.checkOut && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">
                          Check-in: {hotel.checkIn} | Check-out: {hotel.checkOut}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
                </div>

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hotel.languages && hotel.languages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {hotel.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hotel.policies && hotel.policies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Policies</h3>
                    <ul className="space-y-2">
                      {hotel.policies.map((policy, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{policy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{hotel.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${hotel.contactEmail}`} className="text-blue-600 hover:underline">
                        {hotel.contactEmail}
                      </a>
                    </div>
                    {hotel.contactPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <a href={`tel:${hotel.contactPhone}`} className="text-blue-600 hover:underline">
                          {hotel.contactPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Registration Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hotel.status === 'approved' ? 'bg-green-100 text-green-700' :
                        hotel.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Publish Status</span>
                      {getPublishStatusBadge()}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Rating</span>
                      <span className="text-gray-900 font-medium">
                        {hotel.rating > 0 ? `${hotel.rating}/5` : 'No ratings yet'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BedDouble className="w-5 h-5" />
                Rooms ({rooms.length})
              </h3>

              {isLoadingRooms ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-gray-600 mt-2">Loading rooms...</p>
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BedDouble className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No rooms added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <div
                      key={room._id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-48 bg-gray-100">
                        {room.image ? (
                          <Image
                            src={room.image}
                            alt={room.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <BedDouble className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900">{room.name}</h4>
                        {room.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{room.capacity} guests</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BedDouble className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{room.beds}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Ruler className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{room.size}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{room.available} available</span>
                          </div>
                        </div>
                        {room.view && (
                          <p className="text-sm text-gray-600">View: {room.view}</p>
                        )}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 3).map((amenity, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {amenity.replace(/_/g, ' ')}
                              </span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="px-2 py-0.5 text-gray-500 text-xs">
                                +{room.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-primary">${room.price}</span>
                            <span className="text-gray-600 text-sm">/night</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </>
  )
}

