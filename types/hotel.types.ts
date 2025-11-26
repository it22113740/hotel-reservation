// types/hotel.types.ts

/**
 * Hotel Registration Status
 */
export type HotelStatus = 'pending' | 'approved' | 'rejected'

/**
 * Hotel Publishing Status
 */
export type PublishStatus = 'draft' | 'publish_requested' | 'published' | 'publish_rejected'

/**
 * Hotel Registration Interface
 * Used in admin dashboard, API responses, and UI components
 */
export interface HotelRegistration {
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
  status: HotelStatus
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
  publishStatus?: PublishStatus
  isPublished?: boolean
  publishRejectionReason?: string
  publishChangeRequest?: string
}

/**
 * Hotel Coordinates
 */
export interface HotelCoordinates {
  lat: number
  lng: number
}

/**
 * Hotel Filters (for search/filtering)
 */
export interface HotelFilters {
  search?: string
  city?: string
  country?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  amenities?: string[]
  status?: HotelStatus
}