'use server'

import Hotel from '@/databases/hotel.model'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../db'
import { updateManagerUser } from '../services/clerk.service'
import { 
  sendHotelApprovalEmail, 
  sendHotelRejectionEmail,
  sendPublishRequestEmail,
  sendPublishApprovalEmail,
  sendPublishRejectionEmail,
  sendPublishChangeRequestEmail
} from '../services/email.service'
import { revalidatePath } from 'next/cache'
import Room from '@/databases/room.model'
import User from '@/databases/user.model'

/**
 * Helper function to ensure hotel has publishStatus and isPublished fields
 * Applies defaults for existing hotels that don't have these fields
 * IMPORTANT: Only sets defaults if field is missing (undefined/null), not if it's already set
 */
function ensurePublishFields(hotel: any) {
  if (!hotel) return hotel
  
  // Apply defaults ONLY if fields are missing (undefined or null)
  // Don't override existing values like 'publish_requested'
  if (hotel.publishStatus === undefined || hotel.publishStatus === null) {
    hotel.publishStatus = hotel.status === 'approved' ? 'draft' : 'draft'
  }
  if (hotel.isPublished === undefined || hotel.isPublished === null) {
    hotel.isPublished = false
  }
  
  return hotel
}

export async function getRegistrations(filters: {
  status?: 'pending' | 'approved' | 'rejected'
  search?: string
}) {
  const { sessionClaims } = await auth()

  // Check admin role
  const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role;
  if (userRole !== 'admin') {
    throw new Error('Unauthorized')
  }

  await dbConnect()

  const query: any = {}
  if (filters.status) query.status = filters.status
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { city: { $regex: filters.search, $options: 'i' } },
      { ownerName: { $regex: filters.search, $options: 'i' } }
    ]
  }

  const registrations = await Hotel.find(query)
    .sort({ createdAt: -1 })
    .lean()

  const registrationsData = JSON.parse(JSON.stringify(registrations))
  return registrationsData.map((reg: any) => ensurePublishFields(reg))
}

export async function updateHotelStatus(hotelId: string, status: 'pending' | 'approved' | 'rejected', rejectionReason?: string) {
  try {
    const { sessionClaims } = await auth()

    // Check admin role
    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role;
    if (userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const hotel = await Hotel.findById(hotelId)
    if (!hotel) {
      throw new Error('Hotel not found')
    }
    hotel.status = status
    if (status === 'approved') {
      hotel.verified = true
      hotel.publishStatus = 'draft' // Set initial publish status to draft
      hotel.isPublished = false
    }

    await hotel.save()

    if (status === 'approved') {
      if (!hotel.contactEmail || !hotel.ownerName) {
        throw new Error('Hotel contact information is incomplete')
      }
      await updateManagerUser({ email: hotel.contactEmail as string })

      await sendHotelApprovalEmail({ to: hotel.contactEmail as string, hotelName: hotel.name, ownerName: hotel.ownerName as string, email: hotel.contactEmail as string, loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login` })

    } else if (status === 'rejected') {
      if (!hotel.contactEmail || !hotel.ownerName) {
        throw new Error('Hotel contact information is incomplete')
      }
      await sendHotelRejectionEmail({ to: hotel.contactEmail as string, hotelName: hotel.name, ownerName: hotel.ownerName as string, reason: rejectionReason })
    }

    // Revalidate the registrations page - Reson for this is to show the updated status in the table
    revalidatePath('/dashboard/admin/hotels/registrations')


    return {
      success: true, message: status === 'approved'
        ? 'Hotel approved and manager account created successfully'
        : 'Hotel rejected and notification sent'
    }
  } catch(error) {
    console.error(error)
    return {
      success: false,
      message: 'Failed to update hotel status'
    }
  }
}

// ========== MANAGER ACTIONS ==========

/**
 * Get manager's hotel
 */
export async function getManagerHotel() {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const hotel = await Hotel.findOne({ ownerId: userId })
      .lean()

    if (!hotel) {
      return null
    }

    const hotelData = JSON.parse(JSON.stringify(hotel))
    return ensurePublishFields(hotelData)
  } catch (error) {
    console.error('Error fetching manager hotel:', error)
    throw new Error('Failed to fetch hotel')
  }
}

/**
 * Update hotel details (manager)
 */
export async function updateHotelDetails(data: {
  category?: string
  coordinates?: { lat: number; lng: number }
  amenities?: string[]
  checkIn?: string
  checkOut?: string
  languages?: string[]
  policies?: string[]
  description?: string
  images?: string[]
}) {
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

    // Update fields
    if (data.category !== undefined) hotel.category = data.category
    if (data.coordinates) hotel.coordinates = data.coordinates
    if (data.amenities) hotel.amenities = data.amenities
    if (data.checkIn) hotel.checkIn = data.checkIn
    if (data.checkOut) hotel.checkOut = data.checkOut
    if (data.languages) hotel.languages = data.languages
    if (data.policies) hotel.policies = data.policies
    if (data.description) hotel.description = data.description
    if (data.images) hotel.images = data.images

    // If hotel was published and manager is editing, reset publish status
    if (hotel.isPublished && hotel.publishStatus === 'published') {
      hotel.publishStatus = 'draft'
      hotel.isPublished = false
    }

    await hotel.save()

    revalidatePath('/dashboard/manager/hotels')
    revalidatePath('/dashboard/manager/hotels/edit')

    return {
      success: true,
      message: 'Hotel details updated successfully'
    }
  } catch (error) {
    console.error('Error updating hotel:', error)
    return {
      success: false,
      message: 'Failed to update hotel details'
    }
  }
}

/**
 * Request to publish hotel (manager)
 */
export async function requestPublish() {
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

    // Validate required fields
    const requiredFields = {
      name: hotel.name,
      description: hotel.description,
      city: hotel.city,
      country: hotel.country,
      fullAddress: hotel.fullAddress,
      images: hotel.images && hotel.images.length > 0,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      amenities: hotel.amenities && hotel.amenities.length > 0,
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    // Check if rooms exist
    const roomsCount = await Room.countDocuments({ hotelId: hotel._id })
    if (roomsCount === 0) {
      missingFields.push('rooms')
    }

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Please complete the following required fields: ${missingFields.join(', ')}`,
        missingFields
      }
    }

    // Use raw MongoDB update to bypass any Mongoose strict mode issues
    // This ensures the fields are saved even if they don't exist in the document
    const mongoose = await import('mongoose')
    const connection = mongoose.connection
    
    if (connection.readyState !== 1) {
      throw new Error('Database connection not ready')
    }
    
    const db = connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    
    const collection = db.collection('hotels')
    const hotelObjectId = new mongoose.Types.ObjectId(hotel._id.toString())
    
    const updateResult = await collection.updateOne(
      { _id: hotelObjectId },
      {
        $set: {
          publishStatus: 'publish_requested',
          isPublished: false
        }
      }
    )
    
    if (updateResult.matchedCount === 0) {
      throw new Error('Hotel not found for update')
    }
    
    // Wait a moment for the update to propagate
    // await new Promise(resolve => setTimeout(resolve, 200))
    
    // Verify the update worked by querying directly from MongoDB (bypassing Mongoose)
    const verifyDoc = await collection.findOne({ _id: hotelObjectId })
    
    if (!verifyDoc) {
      throw new Error('Failed to retrieve hotel after update')
    }
    
    // Check if the update actually worked
    if (verifyDoc.publishStatus !== 'publish_requested') {
      console.error('Database update failed:', {
        hotelId: hotel._id.toString(),
        expected: 'publish_requested',
        got: verifyDoc.publishStatus
      })
      throw new Error(`Failed to update hotel publish status. Got: ${verifyDoc.publishStatus}, Expected: publish_requested`)
    }

    // Send email to all admins
    try {
      // Fetch all admin users from database
      const adminUsers = await User.find({ role: 'admin' }).lean()
      
      if (adminUsers.length === 0) {
        // Fallback to environment variable if no admins in DB
        const fallbackEmail = process.env.ADMIN_EMAIL
        if (fallbackEmail) {
          await sendPublishRequestEmail({
            to: fallbackEmail,
            hotelName: hotel.name,
            ownerName: hotel.ownerName || 'Manager'
          })
        } else {
          console.error('No admin emails found. Please set ADMIN_EMAIL environment variable or create admin users in database.')
        }
      } else {
        // Send email to all admins
        const emailPromises = adminUsers.map(admin => 
          sendPublishRequestEmail({
            to: admin.email,
            hotelName: hotel.name,
            ownerName: hotel.ownerName || 'Manager'
          })
        )
        
        await Promise.allSettled(emailPromises)
      }
    } catch (emailError) {
      console.error('❌ Error sending publish request emails:', emailError)
      // Don't fail the request if email fails - the status is already updated
    }

    revalidatePath('/dashboard/manager/hotels')
    revalidatePath('/dashboard/admin/hotels')
    revalidatePath('/dashboard/admin/hotels', 'page')

    return {
      success: true,
      message: 'Publish request submitted successfully. Admin will review your hotel.'
    }
  } catch (error: any) {
    console.error('Error requesting publish:', error)
    return {
      success: false,
      message: error.message || 'Failed to submit publish request'
    }
  }
}

// ========== ADMIN PUBLISH ACTIONS ==========

/**
 * Get all hotels (for admin)
 */
export async function getAllHotels(filters?: {
  status?: 'pending' | 'approved' | 'rejected'
  publishStatus?: 'draft' | 'publish_requested' | 'published' | 'publish_rejected'
  search?: string
}) {
  try {
    const { sessionClaims } = await auth()

    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    if (userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const query: any = {}
    
    if (filters?.status) {
      query.status = filters.status
    }
    
    if (filters?.publishStatus) {
      query.publishStatus = filters.publishStatus
    }
    
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { city: { $regex: filters.search, $options: 'i' } },
        { ownerName: { $regex: filters.search, $options: 'i' } }
      ]
    }

    const hotels = await Hotel.find(query)
      .sort({ updatedAt: -1 })
      .lean()

    const hotelsData = JSON.parse(JSON.stringify(hotels))
    const processedHotels = hotelsData.map((hotel: any) => ensurePublishFields(hotel))
    
    return processedHotels
  } catch (error) {
    console.error('Error fetching hotels:', error)
    throw new Error('Failed to fetch hotels')
  }
}

/**
 * Get hotels with publish requests
 */
export async function getPublishRequests() {
  try {
    const { sessionClaims } = await auth()

    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    if (userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    const hotels = await Hotel.find({ publishStatus: 'publish_requested' })
      .sort({ updatedAt: -1 })
      .lean()

    const hotelsData = JSON.parse(JSON.stringify(hotels))
    const processedHotels = hotelsData.map((hotel: any) => ensurePublishFields(hotel))
    
    return processedHotels
  } catch (error) {
    console.error('Error fetching publish requests:', error)
    throw new Error('Failed to fetch publish requests')
  }
}

/**
 * Admin: Approve publish request
 */
export async function approvePublish(hotelId: string) {
  try {
    const { sessionClaims } = await auth()

    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    if (userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    // Use raw MongoDB update to ensure fields are saved
    const mongoose = await import('mongoose')
    const connection = mongoose.connection
    
    if (connection.readyState !== 1) {
      throw new Error('Database connection not ready')
    }
    
    const db = connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    
    const collection = db.collection('hotels')
    const hotelObjectId = new mongoose.Types.ObjectId(hotelId)
    
    // Update using raw MongoDB
    const updateResult = await collection.updateOne(
      { _id: hotelObjectId },
      {
        $set: {
          publishStatus: 'published',
          isPublished: true
        },
        $unset: {
          publishRejectionReason: '',
          publishChangeRequest: ''
        }
      }
    )
    
    if (updateResult.matchedCount === 0) {
      throw new Error('Hotel not found for update')
    }
    
    // Wait for update to propagate
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Verify the update
    const verifyDoc = await collection.findOne({ _id: hotelObjectId })
    
    if (!verifyDoc) {
      throw new Error('Failed to retrieve hotel after update')
    }
    
    if (verifyDoc.publishStatus !== 'published' || verifyDoc.isPublished !== true) {
      console.error('approvePublish update failed:', {
        hotelId,
        expected: { publishStatus: 'published', isPublished: true },
        got: { publishStatus: verifyDoc.publishStatus, isPublished: verifyDoc.isPublished }
      })
      throw new Error(`Failed to update hotel. Got publishStatus: ${verifyDoc.publishStatus}, isPublished: ${verifyDoc.isPublished}`)
    }
    
    // Get hotel for email (using Mongoose for convenience)
    const hotel = await Hotel.findById(hotelId)
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Send email to manager
    if (hotel.contactEmail && hotel.ownerName) {
      await sendPublishApprovalEmail({
        to: hotel.contactEmail,
        hotelName: hotel.name,
        ownerName: hotel.ownerName,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/manager/hotels`
      })
    }

    revalidatePath('/dashboard/admin/hotels')
    revalidatePath('/dashboard/manager/hotels')
    revalidatePath('/hotels')

    return {
      success: true,
      message: 'Hotel published successfully'
    }
  } catch (error) {
    console.error('Error approving publish:', error)
    return {
      success: false,
      message: 'Failed to approve publish request'
    }
  }
}

/**
 * Admin: Reject publish request
 */
export async function rejectPublish(hotelId: string, reason: string) {
  try {
    const { sessionClaims } = await auth()

    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    if (userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    // Use raw MongoDB update
    const mongoose = await import('mongoose')
    const connection = mongoose.connection
    
    if (connection.readyState !== 1) {
      throw new Error('Database connection not ready')
    }
    
    const db = connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    
    const collection = db.collection('hotels')
    const hotelObjectId = new mongoose.Types.ObjectId(hotelId)
    
    const updateResult = await collection.updateOne(
      { _id: hotelObjectId },
      {
        $set: {
          publishStatus: 'publish_rejected',
          isPublished: false,
          publishRejectionReason: reason
        },
        $unset: {
          publishChangeRequest: ''
        }
      }
    )
    
    if (updateResult.matchedCount === 0) {
      throw new Error('Hotel not found for update')
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Verify update
    const verifyDoc = await collection.findOne({ _id: hotelObjectId })
    if (!verifyDoc || verifyDoc.publishStatus !== 'publish_rejected') {
      throw new Error('Failed to update hotel publish status')
    }
    
    // Get hotel for email
    const hotel = await Hotel.findById(hotelId)
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Send email to manager
    if (hotel.contactEmail && hotel.ownerName) {
      await sendPublishRejectionEmail({
        to: hotel.contactEmail,
        hotelName: hotel.name,
        ownerName: hotel.ownerName,
        reason: reason,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/manager/hotels/edit`
      })
    }

    revalidatePath('/dashboard/admin/hotels')
    revalidatePath('/dashboard/manager/hotels')

    return {
      success: true,
      message: 'Publish request rejected and manager notified'
    }
  } catch (error) {
    console.error('Error rejecting publish:', error)
    return {
      success: false,
      message: 'Failed to reject publish request'
    }
  }
}

/**
 * Admin: Request changes for publish
 */
export async function requestPublishChanges(hotelId: string, changeRequest: string) {
  try {
    const { sessionClaims } = await auth()

    const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role
    if (userRole !== 'admin') {
      throw new Error('Unauthorized')
    }

    await dbConnect()

    // Use raw MongoDB update
    const mongoose = await import('mongoose')
    const connection = mongoose.connection
    
    if (connection.readyState !== 1) {
      throw new Error('Database connection not ready')
    }
    
    const db = connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    
    const collection = db.collection('hotels')
    const hotelObjectId = new mongoose.Types.ObjectId(hotelId)
    
    const updateResult = await collection.updateOne(
      { _id: hotelObjectId },
      {
        $set: {
          publishStatus: 'draft',
          isPublished: false,
          publishChangeRequest: changeRequest
        },
        $unset: {
          publishRejectionReason: ''
        }
      }
    )
    
    if (updateResult.matchedCount === 0) {
      throw new Error('Hotel not found for update')
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Verify update
    const verifyDoc = await collection.findOne({ _id: hotelObjectId })
    if (!verifyDoc || verifyDoc.publishStatus !== 'draft') {
      throw new Error('Failed to update hotel publish status')
    }
    
    // Get hotel for email
    const hotel = await Hotel.findById(hotelId)
    if (!hotel) {
      throw new Error('Hotel not found')
    }

    // Send email to manager
    if (hotel.contactEmail && hotel.ownerName) {
      await sendPublishChangeRequestEmail({
        to: hotel.contactEmail,
        hotelName: hotel.name,
        ownerName: hotel.ownerName,
        changeRequest: changeRequest,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/manager/hotels/edit`
      })
    }

    revalidatePath('/dashboard/admin/hotels')
    revalidatePath('/dashboard/manager/hotels')

    return {
      success: true,
      message: 'Change request sent to manager'
    }
  } catch (error) {
    console.error('Error requesting changes:', error)
    return {
      success: false,
      message: 'Failed to send change request'
    }
  }
}

// ========== CLIENT-SIDE ACTIONS ==========

/**
 * Get all published hotels (for client-side listing)
 */
export async function getPublishedHotels(filters?: {
  search?: string
  city?: string
  country?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  amenities?: string[]
}) {
  try {
    await dbConnect()

    const query: any = {
      isPublished: true,
      status: 'approved'
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { city: { $regex: filters.search, $options: 'i' } }
      ]
    }

    if (filters?.city) {
      query.city = { $regex: filters.city, $options: 'i' }
    }

    if (filters?.country) {
      query.country = { $regex: filters.country, $options: 'i' }
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.price = {}
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice
    }

    if (filters?.rating) {
      query.rating = { $gte: filters.rating }
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      query.amenities = { $in: filters.amenities }
    }

    const hotels = await Hotel.find(query)
      .sort({ featured: -1, rating: -1, createdAt: -1 })
      .lean()

    const hotelsData = JSON.parse(JSON.stringify(hotels))
    return hotelsData.map((hotel: any) => ensurePublishFields(hotel))
  } catch (error) {
    console.error('Error fetching published hotels:', error)
    throw new Error('Failed to fetch hotels')
  }
}
