// app/dashboard/admin/hotels/registrations/page.tsx
import { getRegistrations } from '@/lib/actions/hotel.actions'
import RegistrationList from './RegistrationList'

interface HotelRegistration {
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
    status: 'pending' | 'approved' | 'rejected'
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
}

export default async function RegistrationsPage() {
    // ✅ Direct fetch on server
    //   const registrations = await getRegistrations({ status: 'pending' })
    // const registrations: HotelRegistration[] = [
    //     {
    //         id: '1',
    //         hotelName: 'Grand Colombo Hotel',
    //         description: 'Luxury 5-star hotel in the heart of Colombo with ocean views and premium amenities.',
    //         city: 'Colombo',
    //         country: 'Sri Lanka',
    //         address: '123 Galle Road, Colombo 03',
    //         ownerName: 'John Smith',
    //         contactEmail: 'owner@grandcolombo.com',
    //         contactPhone: '+94 77 123 4567',
    //         images: ['/images/hotel1.png', '/images/hotel2.png'],
    //         status: 'pending',
    //         submittedAt: '2024-01-15T10:30:00Z'
    //     },
    //     {
    //         id: '2',
    //         hotelName: 'Galle Beach Resort',
    //         description: 'Beachfront resort with stunning sunset views and traditional Sri Lankan hospitality.',
    //         city: 'Galle',
    //         country: 'Sri Lanka',
    //         address: '456 Beach Road, Galle Fort',
    //         ownerName: 'Sarah Williams',
    //         contactEmail: 'info@gallebeach.com',
    //         contactPhone: '+94 77 234 5678',
    //         images: ['/images/hotel3.png'],
    //         status: 'pending',
    //         submittedAt: '2024-01-14T15:45:00Z'
    //     },
    //     {
    //         id: '3',
    //         hotelName: 'Kandy Hills Resort',
    //         description: 'Mountain retreat with tea plantation views and spa facilities.',
    //         city: 'Kandy',
    //         country: 'Sri Lanka',
    //         address: '789 Hill Top Road, Kandy',
    //         ownerName: 'Michael Chen',
    //         contactEmail: 'contact@kandyhills.com',
    //         contactPhone: '+94 77 345 6789',
    //         images: ['/images/hotel4.png', '/images/hotel5.png'],
    //         status: 'approved',
    //         submittedAt: '2024-01-13T09:20:00Z'
    //     }
    // ]

    const registrationsData: HotelRegistration[] = await getRegistrations({})
    console.log(registrationsData)
    return <RegistrationList data={registrationsData} />
}