// app/dashboard/manager/hotels/amenities/page.tsx
import { getManagerHotel } from '@/lib/actions/hotel.actions'
import AmenitiesManager from '../../../../../components/dashboard/manager/AmenitiesManager'

export default async function ManagerAmenitiesPage() {
  const hotel = await getManagerHotel()

  return <AmenitiesManager currentAmenities={hotel?.amenities || []} />
}

