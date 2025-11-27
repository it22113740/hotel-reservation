'use server'

import Room from '@/databases/room.model'
import Hotel from '@/databases/hotel.model'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../db'
import { revalidatePath } from 'next/cache'
import { addRoomChangesToRequest } from './change-request.actions'

/**
 * Get all rooms for a hotel by hotelId (for admin)
 */
export async function getHotelRooms(hotelId: string) {
  try {
    const { sessionClaims } = await auth()
    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    
    // Only allow admin to fetch rooms for any hotel
    if (userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const rooms = await Room.find({ hotelId })
      .sort({ price: 1 })
      .lean()

    return JSON.parse(JSON.stringify(rooms))
  } catch (error) {
    console.error('Error fetching hotel rooms:', error)
    throw new Error('Failed to fetch rooms')
  }
}

/**
 * Get all rooms for manager's hotel
 */
export async function getManagerRooms() {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    // Get manager's hotel
    const hotel = await Hotel.findOne({ ownerId: userId })
    if (!hotel) {
      return []
    }

    const rooms = await Room.find({ hotelId: hotel._id })
      .sort({ price: 1 })
      .lean()

    return JSON.parse(JSON.stringify(rooms))
  } catch (error) {
    console.error('Error fetching rooms:', error)
    throw new Error('Failed to fetch rooms')
  }
}

/**
 * Create a new room
 */
export async function createRoom(data: {
  name: string
  description?: string
  image: string
  images?: string[]
  capacity: number
  beds: string
  size: string
  view?: string
  floor?: string
  amenities?: string[]
  price: number
  available: number
  maxOccupancy?: number
  minNights?: number
  maxNights?: number
}) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    // Get manager's hotel
    const hotel = await Hotel.findOne({ ownerId: userId })
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Validate required fields
    if (!data.name || !data.image || !data.capacity || !data.beds || !data.size || !data.price || data.available === undefined) {
      throw new Error('Missing required fields')
    }

    // Add to change request instead of creating directly
    const result = await addRoomChangesToRequest('create', null, {
      name: data.name,
      description: data.description,
      image: data.image,
      images: data.images || [],
      capacity: data.capacity,
      beds: data.beds,
      size: data.size,
      view: data.view,
      floor: data.floor,
      amenities: data.amenities || [],
      price: data.price,
      available: data.available,
      maxOccupancy: data.maxOccupancy,
      minNights: data.minNights,
      maxNights: data.maxNights,
    })

    if (!result.success) {
      return result
    }

    revalidatePath('/dashboard/manager/hotels/rooms')
    revalidatePath('/dashboard/manager/hotels')

    return {
      success: true,
      message: 'Room creation request submitted. Waiting for admin approval.',
    }
  } catch (error: any) {
    console.error('Error creating room:', error)
    return {
      success: false,
      message: error.message || 'Failed to create room'
    }
  }
}

/**
 * Update a room
 */
export async function updateRoom(roomId: string, data: {
  name?: string
  description?: string
  image?: string
  images?: string[]
  capacity?: number
  beds?: string
  size?: string
  view?: string
  floor?: string
  amenities?: string[]
  price?: number
  available?: number
  maxOccupancy?: number
  minNights?: number
  maxNights?: number
}) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    // Get manager's hotel
    const hotel = await Hotel.findOne({ ownerId: userId })
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Verify room belongs to manager's hotel
    const room = await Room.findOne({ _id: roomId, hotelId: hotel._id })
    if (!room) {
      throw new Error('Room not found')
    }

    // Add to change request instead of updating directly
    const result = await addRoomChangesToRequest('update', roomId, data)

    if (!result.success) {
      return result
    }

    revalidatePath('/dashboard/manager/hotels/rooms')
    revalidatePath('/dashboard/manager/hotels')

    return {
      success: true,
      message: 'Room update request submitted. Waiting for admin approval.'
    }
  } catch (error: any) {
    console.error('Error updating room:', error)
    return {
      success: false,
      message: error.message || 'Failed to update room'
    }
  }
}

/**
 * Delete a room
 */
export async function deleteRoom(roomId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    // Get manager's hotel
    const hotel = await Hotel.findOne({ ownerId: userId })
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Verify room belongs to manager's hotel
    const room = await Room.findOne({ _id: roomId, hotelId: hotel._id })
    if (!room) {
      throw new Error('Room not found')
    }

    // Add to change request instead of deleting directly
    const result = await addRoomChangesToRequest('delete', roomId, null)

    if (!result.success) {
      return result
    }

    revalidatePath('/dashboard/manager/hotels/rooms')
    revalidatePath('/dashboard/manager/hotels')

    return {
      success: true,
      message: 'Room deletion request submitted. Waiting for admin approval.'
    }
  } catch (error: any) {
    console.error('Error deleting room:', error)
    return {
      success: false,
      message: error.message || 'Failed to delete room'
    }
  }
}

