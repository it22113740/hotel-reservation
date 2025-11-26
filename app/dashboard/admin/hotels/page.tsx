// app/dashboard/admin/hotels/page.tsx
import { getAllHotels } from '@/lib/actions/hotel.actions'
import HotelsList from '../../../../components/dashboard/admin/HotelsList'

export default async function AdminHotelsPage() {
  const hotels = await getAllHotels()

  return <HotelsList initialHotels={hotels} />
}
