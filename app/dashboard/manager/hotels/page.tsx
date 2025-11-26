// app/dashboard/manager/hotels/page.tsx
import { getManagerHotel } from '@/lib/actions/hotel.actions'
import { redirect } from 'next/navigation'
import ManagerHotelView from '../../../../components/dashboard/manager/ManagerHotelView'

export default async function ManagerHotelsPage() {
  const hotel = await getManagerHotel()

  if (!hotel) {
    redirect('/dashboard/manager/hotels/edit')
  }

  return <ManagerHotelView hotel={hotel} />
}

