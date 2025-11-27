'use client'

import { X, CheckCircle, XCircle, Building2, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ChangeRequestModalProps {
  request: any
  requestDetails: {
    request: any
    currentHotel: any
    currentRooms: any[]
  }
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  isLoading: boolean
}

export default function ChangeRequestModal({
  request,
  requestDetails,
  onClose,
  onApprove,
  onReject,
  isLoading
}: ChangeRequestModalProps) {
  const { currentHotel, currentRooms } = requestDetails

  const renderHotelChanges = () => {
    if (!request.hotelChanges) return null

    const changes = request.hotelChanges
    const sections: React.ReactElement[] = []

    // Helper to check if arrays are different
    const arraysDifferent = (arr1: any[], arr2: any[]) => {
      if (!arr1 && !arr2) return false
      if (!arr1 || !arr2) return true
      return JSON.stringify([...arr1].sort()) !== JSON.stringify([...arr2].sort())
    }

    // Helper to format field name
    const formatFieldName = (key: string) => {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
    }

    // Only show amenities if they actually changed
    if (changes.amenities && arraysDifferent(changes.amenities, currentHotel.amenities || [])) {
      sections.push(
        <div key="amenities" className="space-y-2">
          <h4 className="font-semibold text-gray-900">Amenities</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current:</p>
              <div className="bg-gray-50 p-2 rounded text-sm">
                {currentHotel.amenities?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {currentHotel.amenities.map((a: string) => (
                      <span key={a} className="px-2 py-1 bg-gray-200 rounded text-xs">{a}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">New:</p>
              <div className="bg-blue-50 p-2 rounded text-sm border border-blue-200">
                <div className="flex flex-wrap gap-1">
                  {changes.amenities.map((a: string) => (
                    <span key={a} className="px-2 py-1 bg-blue-200 rounded text-xs">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Only show description if it changed
    if (changes.description && changes.description !== currentHotel.description) {
      sections.push(
        <div key="description" className="space-y-2">
          <h4 className="font-semibold text-gray-900">Description</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current:</p>
              <div className="bg-gray-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
                {currentHotel.description || <span className="text-gray-400">None</span>}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">New:</p>
              <div className="bg-blue-50 p-2 rounded text-sm max-h-32 overflow-y-auto border border-blue-200">
                {changes.description}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Only show category if it changed
    if (changes.category && changes.category !== currentHotel.category) {
      sections.push(
        <div key="category" className="space-y-2">
          <h4 className="font-semibold text-gray-900">Category</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current:</p>
              <div className="bg-gray-50 p-2 rounded text-sm">
                {currentHotel.category || <span className="text-gray-400">None</span>}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">New:</p>
              <div className="bg-blue-50 p-2 rounded text-sm border border-blue-200">
                {changes.category}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Only show check-in/check-out if they changed
    const checkInChanged = changes.checkIn && changes.checkIn !== currentHotel.checkIn
    const checkOutChanged = changes.checkOut && changes.checkOut !== currentHotel.checkOut
    if (checkInChanged || checkOutChanged) {
      sections.push(
        <div key="checkinout" className="space-y-2">
          <h4 className="font-semibold text-gray-900">Check-in/Check-out</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current:</p>
              <div className="bg-gray-50 p-2 rounded text-sm">
                <p>Check-in: {currentHotel.checkIn || 'N/A'}</p>
                <p>Check-out: {currentHotel.checkOut || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">New:</p>
              <div className="bg-blue-50 p-2 rounded text-sm border border-blue-200">
                <p>Check-in: {changes.checkIn || currentHotel.checkIn || 'N/A'}</p>
                <p>Check-out: {changes.checkOut || currentHotel.checkOut || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Only show languages if they changed
    if (changes.languages && arraysDifferent(changes.languages, currentHotel.languages || [])) {
      sections.push(
        <div key="languages" className="space-y-2">
          <h4 className="font-semibold text-gray-900">Languages</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current:</p>
              <div className="bg-gray-50 p-2 rounded text-sm">
                {currentHotel.languages?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {currentHotel.languages.map((l: string) => (
                      <span key={l} className="px-2 py-1 bg-gray-200 rounded text-xs">{l}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">New:</p>
              <div className="bg-blue-50 p-2 rounded text-sm border border-blue-200">
                <div className="flex flex-wrap gap-1">
                  {changes.languages.map((l: string) => (
                    <span key={l} className="px-2 py-1 bg-blue-200 rounded text-xs">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Only show policies if they changed
    if (changes.policies && arraysDifferent(changes.policies, currentHotel.policies || [])) {
      sections.push(
        <div key="policies" className="space-y-2">
          <h4 className="font-semibold text-gray-900">Policies</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current:</p>
              <div className="bg-gray-50 p-2 rounded text-sm">
                {currentHotel.policies?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {currentHotel.policies.map((p: string, i: number) => (
                      <li key={i} className="text-xs">{p}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">New:</p>
              <div className="bg-blue-50 p-2 rounded text-sm border border-blue-200">
                <ul className="list-disc list-inside space-y-1">
                  {changes.policies.map((p: string, i: number) => (
                    <li key={i} className="text-xs">{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Only show images if they changed
    if (changes.images && arraysDifferent(changes.images, currentHotel.images || [])) {
      sections.push(
        <div key="images" className="space-y-2">
          <h4 className="font-semibold text-gray-900">Images</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current ({currentHotel.images?.length || 0}):</p>
              <div className="bg-gray-50 p-2 rounded text-sm">
                {currentHotel.images?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1">
                    {currentHotel.images.slice(0, 4).map((img: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded overflow-hidden border border-gray-200">
                        <Image 
                          src={img} 
                          alt={`Current ${i}`} 
                          fill 
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">New ({changes.images.length}):</p>
              <div className="bg-blue-50 p-2 rounded text-sm border border-blue-200">
                <div className="grid grid-cols-2 gap-1">
                  {changes.images.slice(0, 4).map((img: string, i: number) => (
                    <div key={i} className="relative aspect-square rounded overflow-hidden border border-blue-200">
                      <Image 
                        src={img} 
                        alt={`New ${i}`} 
                        fill 
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  ))}
                  {changes.images.length > 4 && (
                    <div className="flex items-center justify-center text-xs text-gray-500">
                      +{changes.images.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Only show coordinates if they changed
    if (changes.coordinates && currentHotel.coordinates) {
      const coordsChanged = 
        changes.coordinates.lat !== currentHotel.coordinates.lat ||
        changes.coordinates.lng !== currentHotel.coordinates.lng
      
      if (coordsChanged) {
        sections.push(
          <div key="coordinates" className="space-y-2">
            <h4 className="font-semibold text-gray-900">Location Coordinates</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current:</p>
                <div className="bg-gray-50 p-2 rounded text-sm">
                  <p>Lat: {currentHotel.coordinates.lat}</p>
                  <p>Lng: {currentHotel.coordinates.lng}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">New:</p>
                <div className="bg-blue-50 p-2 rounded text-sm border border-blue-200">
                  <p>Lat: {changes.coordinates.lat}</p>
                  <p>Lng: {changes.coordinates.lng}</p>
                </div>
              </div>
            </div>
          </div>
        )
      }
    } else if (changes.coordinates && !currentHotel.coordinates) {
      // New coordinates being added
      sections.push(
        <div key="coordinates" className="space-y-2">
          <h4 className="font-semibold text-gray-900">Location Coordinates</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current:</p>
              <div className="bg-gray-50 p-2 rounded text-sm">
                <span className="text-gray-400">None</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">New:</p>
              <div className="bg-blue-50 p-2 rounded text-sm border border-blue-200">
                <p>Lat: {changes.coordinates.lat}</p>
                <p>Lng: {changes.coordinates.lng}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return sections.length > 0 ? (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Hotel Changes
        </h3>
        {sections}
      </div>
    ) : null
  }

  const renderRoomChanges = () => {
    if (!request.roomChanges || request.roomChanges.length === 0) return null

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Room Changes
        </h3>
        <div className="space-y-3">
          {request.roomChanges.map((roomChange: any, index: number) => {
            if (roomChange.action === 'create') {
              const roomData = roomChange.data || {}
              
              return (
                <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">New Room: {roomData.name || 'Untitled Room'}</span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Primary Image */}
                    {roomData.image && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2 text-sm">Primary Image:</p>
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blue-200">
                          <Image 
                            src={roomData.image} 
                            alt={roomData.name || 'Room image'} 
                            fill 
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Images */}
                    {roomData.images && roomData.images.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2 text-sm">Additional Images ({roomData.images.length}):</p>
                        <div className="grid grid-cols-4 gap-2">
                          {roomData.images.map((img: string, i: number) => (
                            <div key={i} className="relative aspect-square rounded overflow-hidden border border-blue-200">
                              <Image 
                                src={img} 
                                alt={`Additional ${i + 1}`} 
                                fill 
                                className="object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Room Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Name:</p>
                        <p className="text-gray-900">{roomData.name || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700">Price:</p>
                        <p className="text-gray-900">${roomData.price || 0}/night</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700">Capacity:</p>
                        <p className="text-gray-900">{roomData.capacity || 'N/A'} guests</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700">Beds:</p>
                        <p className="text-gray-900">{roomData.beds || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700">Size:</p>
                        <p className="text-gray-900">{roomData.size || 'N/A'}</p>
                      </div>
                      
                      {roomData.view && (
                        <div>
                          <p className="font-medium text-gray-700">View:</p>
                          <p className="text-gray-900">{roomData.view}</p>
                        </div>
                      )}
                      
                      {roomData.floor && (
                        <div>
                          <p className="font-medium text-gray-700">Floor:</p>
                          <p className="text-gray-900">{roomData.floor}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="font-medium text-gray-700">Available Rooms:</p>
                        <p className="text-gray-900">{roomData.available !== undefined ? roomData.available : 'N/A'}</p>
                      </div>
                      
                      {roomData.maxOccupancy && (
                        <div>
                          <p className="font-medium text-gray-700">Max Occupancy:</p>
                          <p className="text-gray-900">{roomData.maxOccupancy}</p>
                        </div>
                      )}
                      
                      {roomData.minNights && (
                        <div>
                          <p className="font-medium text-gray-700">Minimum Nights:</p>
                          <p className="text-gray-900">{roomData.minNights}</p>
                        </div>
                      )}
                      
                      {roomData.maxNights && (
                        <div>
                          <p className="font-medium text-gray-700">Maximum Nights:</p>
                          <p className="text-gray-900">{roomData.maxNights}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    {roomData.description && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2 text-sm">Description:</p>
                        <div className="bg-white p-3 rounded border border-blue-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{roomData.description}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Room Amenities */}
                    {roomData.amenities && roomData.amenities.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2 text-sm">Room Amenities:</p>
                        <div className="flex flex-wrap gap-2">
                          {roomData.amenities.map((amenity: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-xs font-medium">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            } else if (roomChange.action === 'update') {
              const currentRoom = currentRooms.find((r: any) => r._id === roomChange.roomId)
              if (!currentRoom) return null
              
              // Only show fields that actually changed
              const changedFields = Object.keys(roomChange.data || {}).filter(key => {
                const newValue = roomChange.data[key]
                const currentValue = (currentRoom as any)[key]
                
                // Handle arrays (like images, amenities)
                if (Array.isArray(newValue) && Array.isArray(currentValue)) {
                  return JSON.stringify(newValue.sort()) !== JSON.stringify(currentValue.sort())
                }
                
                // Handle objects
                if (typeof newValue === 'object' && newValue !== null && typeof currentValue === 'object' && currentValue !== null) {
                  return JSON.stringify(newValue) !== JSON.stringify(currentValue)
                }
                
                // Handle primitive values
                return newValue !== currentValue
              })
              
              if (changedFields.length === 0) return null
              
              const formatFieldName = (key: string) => {
                return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
              }
              
              const renderFieldValue = (value: any, key: string) => {
                // Handle images
                if (key === 'image' || key === 'images') {
                  const imageUrls = Array.isArray(value) ? value : (value ? [value] : [])
                  if (imageUrls.length === 0) return <span className="text-gray-400">None</span>
                  
                  return (
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {imageUrls.slice(0, 4).map((img: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded overflow-hidden border border-gray-200">
                          <Image 
                            src={img} 
                            alt={`${key} ${i}`} 
                            fill 
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      ))}
                      {imageUrls.length > 4 && (
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          +{imageUrls.length - 4} more
                        </div>
                      )}
                    </div>
                  )
                }
                
                // Handle arrays (like amenities)
                if (Array.isArray(value)) {
                  if (value.length === 0) return <span className="text-gray-400">None</span>
                  return (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {value.map((item: any, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-200 rounded text-xs">{item}</span>
                      ))}
                    </div>
                  )
                }
                
                // Handle primitive values
                return <span>{value !== null && value !== undefined ? String(value) : 'N/A'}</span>
              }
              
              return (
                <div key={index} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-900">Update Room: {currentRoom.name || 'Unknown'}</span>
                  </div>
                  <div className="space-y-4 text-sm">
                    {changedFields.map((key) => (
                      <div key={key} className="border-b border-yellow-200 pb-3 last:border-0 last:pb-0">
                        <p className="font-medium text-gray-700 mb-2">{formatFieldName(key)}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500 mb-2">Current</p>
                            {renderFieldValue((currentRoom as any)[key], key)}
                          </div>
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-xs text-gray-500 mb-2">New</p>
                            {renderFieldValue(roomChange.data[key], key)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            } else if (roomChange.action === 'delete') {
              const currentRoom = currentRooms.find((r: any) => r._id === roomChange.roomId)
              return (
                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">Delete Room: {currentRoom?.name || 'Unknown'}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>This room will be permanently deleted.</p>
                    {currentRoom && (
                      <div className="mt-2 space-y-1">
                        <p><strong>Name:</strong> {currentRoom.name}</p>
                        <p><strong>Price:</strong> ${currentRoom.price}/night</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Change Request Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {request.hotelId.name} • {request.hotelId.ownerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Manager Notes */}
          {request.managerNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Manager Notes
              </h4>
              <p className="text-sm text-blue-800">{request.managerNotes}</p>
            </div>
          )}

          {/* Hotel Changes */}
          {renderHotelChanges()}

          {/* Room Changes */}
          {renderRoomChanges()}

          {/* No Changes Message */}
          {!request.hotelChanges && (!request.roomChanges || request.roomChanges.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <p>No changes specified in this request</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={onReject}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={onApprove}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isLoading ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      </div>
    </>
  )
}

