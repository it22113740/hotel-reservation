'use server'

import ChangeRequest from '@/databases/change-request.model'
import Hotel from '@/databases/hotel.model'
import Room from '@/databases/room.model'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../db'
import { revalidatePath } from 'next/cache'
import User from '@/databases/user.model'
import { 
  sendChangeRequestNotificationEmail,
  sendChangeRequestApprovalEmail,
  sendChangeRequestRejectionEmail
} from '../services/email.service'

/**
 * Get or create pending change request for manager's hotel
 */
async function getOrCreatePendingRequest(hotelId: string, managerId: string) {
  await dbConnect()
  
  let request = await ChangeRequest.findOne({
    hotelId,
    status: 'pending'
  })
  
  if (!request) {
    request = await ChangeRequest.create({
      hotelId,
      managerId,
      status: 'pending',
      hotelChanges: {},
      roomChanges: []
    })
  }
  
  return request
}

/**
 * Merge hotel changes into pending request
 */
function mergeHotelChanges(existing: any, newChanges: any) {
  const merged = { ...existing }
  
  Object.keys(newChanges).forEach(key => {
    const value = newChanges[key]
    
    // Skip undefined values
    if (value === undefined) {
      return
    }
    
    // Special handling for coordinates - only include if both lat and lng are defined
    if (key === 'coordinates') {
      if (value && typeof value === 'object' && value.lat !== undefined && value.lng !== undefined) {
        merged[key] = { lat: value.lat, lng: value.lng }
      }
      // If coordinates is undefined or incomplete, don't set it (keep existing or remove)
      return
    }
    
    // For arrays, only include if it's a valid array
    if (Array.isArray(value)) {
      merged[key] = value
      return
    }
    
    // For other values, include if not undefined
    if (value !== null && value !== undefined) {
      merged[key] = value
    }
  })
  
  // Clean up: remove any undefined values from merged object
  Object.keys(merged).forEach(key => {
    if (merged[key] === undefined) {
      delete merged[key]
    }
  })
  
  return merged
}

/**
 * Merge room changes into pending request
 */
function mergeRoomChanges(existing: any[], newChange: any) {
  const merged = [...existing]
  
  // If updating or deleting an existing room, remove any previous changes for that room
  if (newChange.action === 'update' || newChange.action === 'delete') {
    const index = merged.findIndex(
      c => c.roomId === newChange.roomId && 
      (c.action === 'create' || c.action === 'update' || c.action === 'delete')
    )
    if (index !== -1) {
      merged.splice(index, 1)
    }
  }
  
  // Add the new change
  merged.push(newChange)
  
  return merged
}

/**
 * Manager: Add hotel changes to pending request
 */
export async function addHotelChangesToRequest(data: {
  category?: string
  coordinates?: { lat: number; lng: number }
  amenities?: string[]
  checkIn?: string
  checkOut?: string
  languages?: string[]
  policies?: string[]
  description?: string
  images?: string[]
}, managerNotes?: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const hotel = await Hotel.findOne({ ownerId: userId })
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Get or create pending request
    const request = await getOrCreatePendingRequest(hotel._id.toString(), userId)

    // Filter out unchanged fields by comparing with current hotel data
    const changesToMerge: any = {}
    Object.keys(data).forEach(key => {
      const newValue = data[key as keyof typeof data]
      const currentValue = (hotel as any)[key]
      
      // Skip undefined values
      if (newValue === undefined) {
        return
      }
      
      // Special handling for coordinates - only include if both lat and lng are defined and different
      if (key === 'coordinates' && newValue) {
        if (typeof newValue === 'object' && 'lat' in newValue && 'lng' in newValue && 
            newValue.lat !== undefined && newValue.lng !== undefined) {
          // Compare with current coordinates
          if (!currentValue || 
              currentValue.lat !== newValue.lat || 
              currentValue.lng !== newValue.lng) {
            changesToMerge[key] = newValue
          }
        }
        return
      }
      
      // Handle arrays (like amenities, languages, policies, images)
      if (Array.isArray(newValue) && Array.isArray(currentValue)) {
        const newSorted = JSON.stringify([...newValue].sort())
        const currentSorted = JSON.stringify([...currentValue].sort())
        if (newSorted !== currentSorted) {
          changesToMerge[key] = newValue
        }
        return
      }
      
      // Handle primitive values
      if (newValue !== currentValue) {
        changesToMerge[key] = newValue
      }
    })
    
    // If no fields actually changed, return early
    if (Object.keys(changesToMerge).length === 0) {
      return {
        success: false,
        message: 'No changes detected. All values are the same as current.'
      }
    }
    
    // Get existing hotelChanges as plain object to avoid Mongoose validation issues
    const existingChanges = request.hotelChanges ? 
      (typeof request.hotelChanges.toObject === 'function' 
        ? request.hotelChanges.toObject() 
        : JSON.parse(JSON.stringify(request.hotelChanges))) 
      : {}
    
    // Merge changes into plain object
    const mergedChanges = mergeHotelChanges(existingChanges, changesToMerge)
    
    // Clean up: remove undefined values and invalid coordinates
    const cleanedChanges: any = {}
    Object.keys(mergedChanges).forEach(key => {
      const value = mergedChanges[key]
      
      // Skip undefined values
      if (value === undefined) {
        return
      }
      
      // Special handling for coordinates - only include if valid object
      if (key === 'coordinates') {
        if (value && typeof value === 'object' && 'lat' in value && 'lng' in value &&
            value.lat !== undefined && value.lng !== undefined) {
          cleanedChanges[key] = { lat: value.lat, lng: value.lng }
        }
        return
      }
      
      // Include other valid values
      if (value !== null && value !== undefined) {
        cleanedChanges[key] = value
      }
    })
    
    // Use set method to update hotelChanges safely
    request.set('hotelChanges', cleanedChanges)
    
    // Update manager notes if provided
    if (managerNotes) {
      request.managerNotes = managerNotes
    }

    await request.save()

    // Send notification to admins if this is a new request
    const isNewRequest = !request.createdAt || 
      (Date.now() - new Date(request.createdAt).getTime()) < 5000 // Created within last 5 seconds

    if (isNewRequest) {
      try {
        const adminUsers = await User.find({ role: 'admin' }).lean()
        if (adminUsers.length > 0) {
          const emailPromises = adminUsers.map(admin =>
            sendChangeRequestNotificationEmail({
              to: admin.email,
              hotelName: hotel.name,
              managerName: hotel.ownerName || 'Manager',
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/change-requests`
            })
          )
          await Promise.allSettled(emailPromises)
        }
      } catch (emailError) {
        console.error('Error sending change request notification:', emailError)
      }
    }

    revalidatePath('/dashboard/manager/hotels')
    revalidatePath('/dashboard/manager/hotels/edit')
    revalidatePath('/dashboard/manager/hotels/amenities')
    revalidatePath('/dashboard/manager/hotels/rooms')

    return {
      success: true,
      message: 'Changes added to pending approval request'
    }
  } catch (error: any) {
    console.error('Error adding hotel changes:', error)
    return {
      success: false,
      message: error.message || 'Failed to add changes'
    }
  }
}

/**
 * Manager: Add room changes to pending request
 */
export async function addRoomChangesToRequest(
  action: 'create' | 'update' | 'delete',
  roomId: string | null,
  roomData: any,
  managerNotes?: string
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const hotel = await Hotel.findOne({ ownerId: userId })
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Get or create pending request
    const request = await getOrCreatePendingRequest(hotel._id.toString(), userId)

    // For updates, filter out unchanged fields by comparing with current room
    let filteredRoomData = roomData
    if (action === 'update' && roomId && roomData) {
      const currentRoom = await Room.findById(roomId).lean()
      if (currentRoom) {
        // Only include fields that actually changed
        filteredRoomData = {}
        Object.keys(roomData).forEach(key => {
          const newValue = roomData[key]
          const currentValue = (currentRoom as any)[key]
          
          // Skip undefined values
          if (newValue === undefined) {
            return
          }
          
          // Handle arrays (like images, amenities)
          if (Array.isArray(newValue) && Array.isArray(currentValue)) {
            const newSorted = JSON.stringify([...newValue].sort())
            const currentSorted = JSON.stringify([...currentValue].sort())
            if (newSorted !== currentSorted) {
              filteredRoomData[key] = newValue
            }
            return
          }
          
          // Handle objects
          if (typeof newValue === 'object' && newValue !== null && 
              typeof currentValue === 'object' && currentValue !== null) {
            if (JSON.stringify(newValue) !== JSON.stringify(currentValue)) {
              filteredRoomData[key] = newValue
            }
            return
          }
          
          // Handle primitive values
          if (newValue !== currentValue) {
            filteredRoomData[key] = newValue
          }
        })
        
        // If no fields actually changed, return early
        if (Object.keys(filteredRoomData).length === 0) {
          return {
            success: false,
            message: 'No changes detected. All values are the same as current.'
          }
        }
      }
    }

    // Add room change
    const roomChange: any = {
      action,
      data: action === 'delete' ? undefined : filteredRoomData
    }
    
    if (action !== 'create') {
      roomChange.roomId = roomId
    }

    request.roomChanges = mergeRoomChanges(request.roomChanges || [], roomChange)
    
    // Update manager notes if provided
    if (managerNotes) {
      request.managerNotes = managerNotes
    }

    await request.save()

    // Send notification to admins if this is a new request
    const isNewRequest = !request.createdAt || 
      (Date.now() - new Date(request.createdAt).getTime()) < 5000

    if (isNewRequest) {
      try {
        const adminUsers = await User.find({ role: 'admin' }).lean()
        if (adminUsers.length > 0) {
          const emailPromises = adminUsers.map(admin =>
            sendChangeRequestNotificationEmail({
              to: admin.email,
              hotelName: hotel.name,
              managerName: hotel.ownerName || 'Manager',
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/change-requests`
            })
          )
          await Promise.allSettled(emailPromises)
        }
      } catch (emailError) {
        console.error('Error sending change request notification:', emailError)
      }
    }

    revalidatePath('/dashboard/manager/hotels/rooms')

    return {
      success: true,
      message: 'Changes added to pending approval request'
    }
  } catch (error: any) {
    console.error('Error adding room changes:', error)
    return {
      success: false,
      message: error.message || 'Failed to add changes'
    }
  }
}

/**
 * Manager: Get pending change request
 */
export async function getManagerPendingRequest() {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const hotel = await Hotel.findOne({ ownerId: userId })
    if (!hotel) {
      return null
    }

    const request = await ChangeRequest.findOne({
      hotelId: hotel._id,
      status: 'pending'
    }).lean()

    return request ? JSON.parse(JSON.stringify(request)) : null
  } catch (error) {
    console.error('Error fetching pending request:', error)
    return null
  }
}

/**
 * Manager: Cancel pending request
 */
export async function cancelPendingRequest() {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const hotel = await Hotel.findOne({ ownerId: userId })
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    await ChangeRequest.deleteOne({
      hotelId: hotel._id,
      status: 'pending'
    })

    revalidatePath('/dashboard/manager/hotels')

    return {
      success: true,
      message: 'Pending request cancelled'
    }
  } catch (error: any) {
    console.error('Error cancelling request:', error)
    return {
      success: false,
      message: error.message || 'Failed to cancel request'
    }
  }
}

/**
 * Manager: Update manager notes
 */
export async function updateManagerNotes(notes: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const hotel = await Hotel.findOne({ ownerId: userId })
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    const request = await ChangeRequest.findOne({
      hotelId: hotel._id,
      status: 'pending'
    })

    if (!request) {
      throw new Error('No pending request found')
    }

    request.managerNotes = notes
    await request.save()

    revalidatePath('/dashboard/manager/hotels')

    return {
      success: true,
      message: 'Notes updated'
    }
  } catch (error: any) {
    console.error('Error updating notes:', error)
    return {
      success: false,
      message: error.message || 'Failed to update notes'
    }
  }
}

// ========== ADMIN ACTIONS ==========

/**
 * Admin: Get all pending change requests
 */
export async function getAllPendingChangeRequests() {
  try {
    const { sessionClaims } = await auth()
    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    
    if (userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const requests = await ChangeRequest.find({ status: 'pending' })
      .populate('hotelId', 'name ownerName contactEmail')
      .sort({ createdAt: -1 })
      .lean()

    return JSON.parse(JSON.stringify(requests))
  } catch (error) {
    console.error('Error fetching change requests:', error)
    throw new Error('Failed to fetch change requests')
  }
}

/**
 * Admin: Get specific change request
 */
export async function getChangeRequest(requestId: string) {
  try {
    const { sessionClaims } = await auth()
    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    
    if (userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const request = await ChangeRequest.findById(requestId)
      .populate('hotelId')
      .lean()

    if (!request) {
      throw new Error('Change request not found')
    }

    // Get current hotel and room data for comparison
    const hotel = await Hotel.findById((request.hotelId as any)._id).lean()
    const rooms = await Room.find({ hotelId: (request.hotelId as any)._id }).lean()

    return JSON.parse(JSON.stringify({
      request,
      currentHotel: hotel,
      currentRooms: rooms
    }))
  } catch (error) {
    console.error('Error fetching change request:', error)
    throw new Error('Failed to fetch change request')
  }
}

/**
 * Admin: Approve change request
 */
export async function approveChangeRequest(requestId: string) {
  try {
    const { userId, sessionClaims } = await auth()
    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    
    if (userRole !== 'admin' || !userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const request = await ChangeRequest.findById(requestId)
    if (!request) {
      throw new Error('Change request not found')
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not pending')
    }

    const hotel = await Hotel.findById(request.hotelId)
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Apply hotel changes
    if (request.hotelChanges) {
      const changes = request.hotelChanges as any
      if (changes.category !== undefined) hotel.category = changes.category
      if (changes.coordinates) hotel.coordinates = changes.coordinates
      if (changes.amenities) hotel.amenities = changes.amenities
      if (changes.checkIn) hotel.checkIn = changes.checkIn
      if (changes.checkOut) hotel.checkOut = changes.checkOut
      if (changes.languages) hotel.languages = changes.languages
      if (changes.policies) hotel.policies = changes.policies
      if (changes.description) hotel.description = changes.description
      if (changes.images) hotel.images = changes.images
      
      await hotel.save()
    }

    // Apply room changes
    if (request.roomChanges && request.roomChanges.length > 0) {
      for (const roomChange of request.roomChanges) {
        if (roomChange.action === 'create') {
          await Room.create({
            hotelId: hotel._id,
            ...roomChange.data
          })
        } else if (roomChange.action === 'update' && roomChange.roomId) {
          const room = await Room.findById(roomChange.roomId)
          if (room) {
            Object.keys(roomChange.data || {}).forEach(key => {
              if (roomChange.data[key] !== undefined) {
                (room as any)[key] = roomChange.data[key]
              }
            })
            await room.save()
          }
        } else if (roomChange.action === 'delete' && roomChange.roomId) {
          await Room.deleteOne({ _id: roomChange.roomId })
        }
      }

      // Update hotel base price
      const allRooms = await Room.find({ hotelId: hotel._id }).sort({ price: 1 })
      if (allRooms.length > 0) {
        hotel.price = allRooms[0].price
      } else {
        hotel.price = 0
      }
      await hotel.save()
    }

    // Update request status
    request.status = 'approved'
    request.reviewedBy = userId
    request.reviewedAt = new Date()
    await request.save()

    // Send approval email to manager
    if (hotel.contactEmail && hotel.ownerName) {
      try {
        await sendChangeRequestApprovalEmail({
          to: hotel.contactEmail,
          hotelName: hotel.name,
          ownerName: hotel.ownerName,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/manager/hotels`
        })
      } catch (emailError) {
        console.error('Error sending approval email:', emailError)
      }
    }

    revalidatePath('/dashboard/admin/change-requests')
    revalidatePath('/dashboard/manager/hotels')

    return {
      success: true,
      message: 'Change request approved successfully'
    }
  } catch (error: any) {
    console.error('Error approving change request:', error)
    return {
      success: false,
      message: error.message || 'Failed to approve change request'
    }
  }
}

/**
 * Admin: Reject change request
 */
export async function rejectChangeRequest(requestId: string, feedback: string) {
  try {
    const { userId, sessionClaims } = await auth()
    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    
    if (userRole !== 'admin' || !userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const request = await ChangeRequest.findById(requestId)
    if (!request) {
      throw new Error('Change request not found')
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not pending')
    }

    const hotel = await Hotel.findById(request.hotelId)
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Update request status
    request.status = 'rejected'
    request.adminFeedback = feedback
    request.reviewedBy = userId
    request.reviewedAt = new Date()
    await request.save()

    // Send rejection email to manager
    if (hotel.contactEmail && hotel.ownerName) {
      try {
        await sendChangeRequestRejectionEmail({
          to: hotel.contactEmail,
          hotelName: hotel.name,
          ownerName: hotel.ownerName,
          feedback: feedback,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/manager/hotels`
        })
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError)
      }
    }

    revalidatePath('/dashboard/admin/change-requests')
    revalidatePath('/dashboard/manager/hotels')

    return {
      success: true,
      message: 'Change request rejected'
    }
  } catch (error: any) {
    console.error('Error rejecting change request:', error)
    return {
      success: false,
      message: error.message || 'Failed to reject change request'
    }
  }
}

