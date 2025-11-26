// app/dashboard/manager/hotels/edit/page.tsx
import { getManagerHotel } from '@/lib/actions/hotel.actions'
import { redirect } from 'next/navigation'
import HotelEditWizard from '../../../../../components/dashboard/manager/HotelEditWizard'

export default async function HotelEditPage() {
  const hotel = await getManagerHotel()

  if (!hotel) {
    redirect('/partner-hotel')
  }

  return <HotelEditWizard hotel={hotel} />
}

