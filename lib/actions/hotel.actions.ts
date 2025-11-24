'use server'

import Hotel from '@/databases/hotel.model'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../db'
import { updateManagerUser } from '../services/clerk.service'
import { sendHotelApprovalEmail, sendHotelRejectionEmail } from '../services/email.service'
import { revalidatePath } from 'next/cache'

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

  return JSON.parse(JSON.stringify(registrations))
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