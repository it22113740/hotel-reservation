import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, Bed, Maximize, Wifi, Coffee, Check } from "lucide-react"
import { JSX } from "react"

interface Room {
  id: string
  name: string
  image: string
  capacity: number
  beds: string
  size: string
  amenities: string[]
  price: number
  available: number
}

interface RoomCardProps {
  room: Room
  onBook: (roomId: string) => void
}

const RoomCard = ({ room, onBook }: RoomCardProps) => {
  const amenityIcons: Record<string, JSX.Element> = {
    wifi: <Wifi className="w-4 h-4" />,
    breakfast: <Coffee className="w-4 h-4" />,
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Room Image */}
        <div className="relative h-48 md:h-full">
          <Image
            src={room.image}
            alt={room.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Room Details */}
        <div className="col-span-2 p-6">
          <div className="flex flex-col h-full">
            {/* Room Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{room.name}</h3>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{room.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bed className="w-4 h-4" />
                  <span className="text-sm">{room.beds}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Maximize className="w-4 h-4" />
                  <span className="text-sm">{room.size}</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-3 mb-4">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-1.5 text-sm text-gray-700"
                  >
                    {amenityIcons[amenity] || <Check className="w-4 h-4 text-green-600" />}
                    <span className="capitalize">{amenity}</span>
                  </div>
                ))}
              </div>

              {room.available < 5 && room.available > 0 && (
                <p className="text-sm text-orange-600 font-medium">
                  Only {room.available} rooms left at this price!
                </p>
              )}
            </div>

            {/* Price and Booking */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">${room.price}</span>
                  <span className="text-gray-600">/ night</span>
                </div>
                <p className="text-sm text-gray-600">Includes taxes & fees</p>
              </div>
              <Button
                onClick={() => onBook(room.id)}
                disabled={room.available === 0}
                className="px-8"
              >
                {room.available === 0 ? 'Sold Out' : 'Select Room'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomCard

