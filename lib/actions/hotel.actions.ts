'use server'

import Hotel from '@/databases/hotel.model'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../db'

export async function getRegistrations(filters: {
  status?: 'pending' | 'approved' | 'rejected'
  search?: string
}) {
  const { sessionClaims } = await auth()

  // Check admin role
  const userRole = (sessionClaims?.metadata as { role?: string })?.role;
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

export async function updateHotelStatus(hotelId: string, status: 'pending' | 'approved' | 'rejected') {
  const { sessionClaims } = await auth()

  // Check admin role
  const userRole = (sessionClaims?.metadata as { role?: string })?.role;
  if (userRole !== 'admin') {
    throw new Error('Unauthorized')
  }

  await dbConnect()

  const hotel = await Hotel.findByIdAndUpdate(hotelId, { status }, { new: true }).lean()
  return JSON.parse(JSON.stringify(hotel))
}