// app/dashboard/manager/hotels/rooms/page.tsx
import { getManagerRooms } from '@/lib/actions/room.actions'
import RoomsManager from '../../../../../components/dashboard/manager/RoomsManager'

export default async function ManagerRoomsPage() {
  const rooms = await getManagerRooms()

  return <RoomsManager initialRooms={rooms} />
}
