'use client'

import { useState, useEffect } from 'react'
import { CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateHotelDetails } from '@/lib/actions/hotel.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import PendingChangeRequest from './PendingChangeRequest'

const AVAILABLE_AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'gym', label: 'Gym', icon: '💪' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'spa', label: 'Spa', icon: '🧘' },
  { id: 'bar', label: 'Bar', icon: '🍷' },
  { id: '24hour', label: '24-Hour Front Desk', icon: '🕐' },
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'tv', label: 'TV', icon: '📺' },
  { id: 'concierge', label: 'Concierge', icon: '🎩' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'laundry', label: 'Laundry', icon: '👔' },
  { id: 'airport_shuttle', label: 'Airport Shuttle', icon: '🚐' },
  { id: 'pet_friendly', label: 'Pet Friendly', icon: '🐾' },
  { id: 'conference_room', label: 'Conference Room', icon: '💼' },
  { id: 'room_service', label: 'Room Service', icon: '🛎️' },
]

interface AmenitiesManagerProps {
  currentAmenities: string[]
}

export default function AmenitiesManager({ currentAmenities }: AmenitiesManagerProps) {
  const router = useRouter()
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(currentAmenities)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSelectedAmenities(currentAmenities)
  }, [currentAmenities])

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateHotelDetails({
        amenities: selectedAmenities
      })

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to save amenities')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PendingChangeRequest />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Amenities</h1>
        <p className="text-gray-600 mt-1">Select amenities available at your hotel</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AVAILABLE_AMENITIES.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity.id)
            return (
              <button
                key={amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{amenity.icon}</span>
                    <span className="font-medium text-gray-900">{amenity.label}</span>
                  </div>
                  {isSelected && (
                    <CheckSquare className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isSaving ? 'Saving...' : 'Save Amenities'}
          </Button>
        </div>
      </div>
    </div>
  )
}

