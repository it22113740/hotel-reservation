// types/room.types.ts

/**
 * Room Interface (for UI/API)
 */
export interface Room {
    id: string
    hotelId: string
    name: string
    description?: string
    image: string
    images?: string[]
    capacity: number
    beds: string
    size: string
    view?: string
    floor?: string
    amenities: string[]
    price: number
    available: number
    maxOccupancy?: number
    minNights?: number
    maxNights?: number
  }