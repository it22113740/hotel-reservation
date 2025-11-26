// app/api/hotels/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPublishedHotels } from '@/lib/actions/hotel.actions'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const filters = {
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      country: searchParams.get('country') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
      amenities: searchParams.get('amenities')?.split(',') || undefined,
    }

    const hotels = await getPublishedHotels(filters)
    
    return NextResponse.json({ hotels }, { status: 200 })
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    )
  }
}

