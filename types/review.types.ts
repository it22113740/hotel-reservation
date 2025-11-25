// types/review.types.ts

/**
 * Review Interface (for UI/API)
 */
export interface Review {
    id: string
    hotelId: string
    userId?: string
    author: string
    avatar?: string
    verified?: boolean
    rating: number
    title?: string
    comment: string
    images?: string[]
    helpful: number
    date: string
    stayDate?: string
    roomType?: string
    tripType?: string
    approved?: boolean
    flagged?: boolean
  }