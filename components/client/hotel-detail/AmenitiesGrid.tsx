import { 
  Wifi, 
  Car, 
  Utensils, 
  Dumbbell, 
  Wind, 
  Waves, 
  Coffee,
  Tv,
  ShowerHead,
  Shield,
  Clock,
  Smartphone,
  Check
} from "lucide-react"

interface AmenitiesGridProps {
  amenities: string[]
}

const amenityIcons: Record<string, JSX.Element> = {
  wifi: <Wifi className="w-5 h-5" />,
  parking: <Car className="w-5 h-5" />,
  restaurant: <Utensils className="w-5 h-5" />,
  gym: <Dumbbell className="w-5 h-5" />,
  ac: <Wind className="w-5 h-5" />,
  pool: <Waves className="w-5 h-5" />,
  breakfast: <Coffee className="w-5 h-5" />,
  tv: <Tv className="w-5 h-5" />,
  spa: <ShowerHead className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
  "24hour": <Clock className="w-5 h-5" />,
  bar: <Coffee className="w-5 h-5" />,
  concierge: <Smartphone className="w-5 h-5" />
}

const amenityLabels: Record<string, string> = {
  wifi: "Free WiFi",
  parking: "Free Parking",
  restaurant: "Restaurant",
  gym: "Fitness Center",
  ac: "Air Conditioning",
  pool: "Swimming Pool",
  breakfast: "Breakfast Included",
  tv: "Flat-screen TV",
  spa: "Spa & Wellness",
  security: "24/7 Security",
  "24hour": "24-hour Front Desk",
  bar: "Bar/Lounge",
  concierge: "Concierge Service"
}

const AmenitiesGrid = ({ amenities }: AmenitiesGridProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenities.map((amenity) => (
          <div
            key={amenity}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-primary">
              {amenityIcons[amenity] || <Check className="w-5 h-5" />}
            </div>
            <span className="text-gray-700 font-medium">
              {amenityLabels[amenity] || amenity}
            </span>
          </div>
        ))}
      </div>

      {/* View All Button (if more than 9 amenities) */}
      {amenities.length > 9 && (
        <button className="mt-6 text-primary font-semibold hover:underline">
          View all {amenities.length} amenities
        </button>
      )}
    </div>
  )
}

export default AmenitiesGrid

