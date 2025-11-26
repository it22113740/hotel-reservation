'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Edit, Trash2, X, CheckSquare, Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRoom, updateRoom, deleteRoom } from '@/lib/actions/room.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IRoom } from '@/types/room.types'



interface RoomsManagerProps {
  initialRooms: IRoom[]
}

const ROOM_AMENITIES = [
  'wifi', 'breakfast', 'ac', 'tv', 'minibar', 'city view', 'ocean view', 
  'balcony', 'panoramic view', 'jacuzzi', 'room service', 'safe', 'work desk'
]

export default function RoomsManager({ initialRooms }: RoomsManagerProps) {
  const router = useRouter()
  const [rooms, setRooms] = useState<IRoom[]>(initialRooms)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<{ show: boolean; roomId: string | null; roomName: string }>({
    show: false,
    roomId: null,
    roomName: ''
  })
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string>('')
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    images: [] as string[],
    capacity: 2,
    beds: '',
    size: '',
    view: '',
    floor: '',
    amenities: [] as string[],
    price: 0,
    available: 1,
    maxOccupancy: undefined as number | undefined,
    minNights: undefined as number | undefined,
    maxNights: undefined as number | undefined,
  })

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (primaryImagePreview) URL.revokeObjectURL(primaryImagePreview)
      additionalImagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [primaryImagePreview, additionalImagePreviews])

  const resetForm = () => {
    // Cleanup preview URLs
    if (primaryImagePreview) URL.revokeObjectURL(primaryImagePreview)
    additionalImagePreviews.forEach(url => URL.revokeObjectURL(url))

    setFormData({
      name: '',
      description: '',
      image: '',
      images: [],
      capacity: 2,
      beds: '',
      size: '',
      view: '',
      floor: '',
      amenities: [],
      price: 0,
      available: 1,
      maxOccupancy: undefined,
      minNights: undefined,
      maxNights: undefined,
    })
    setPrimaryImageFile(null)
    setAdditionalImageFiles([])
    setPrimaryImagePreview('')
    setAdditionalImagePreviews([])
    setEditingRoom(null)
    setShowAddForm(false)
  }

  const handleEdit = (room: IRoom) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      description: room.description || '',
      image: room.image,
      images: room.images || [],
      capacity: room.capacity,
      beds: room.beds,
      size: room.size,
      view: room.view || '',
      floor: room.floor || '',
      amenities: room.amenities || [],
      price: room.price,
      available: room.available,
      maxOccupancy: room.maxOccupancy,
      minNights: room.minNights,
      maxNights: room.maxNights,
    })
    // Set previews for existing images
    setPrimaryImagePreview(room.image)
    setAdditionalImagePreviews(room.images || [])
    setPrimaryImageFile(null)
    setAdditionalImageFiles([])
    setShowAddForm(true)
  }

  const handlePrimaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }

    // Cleanup previous preview
    if (primaryImagePreview) URL.revokeObjectURL(primaryImagePreview)

    setPrimaryImageFile(file)
    setPrimaryImagePreview(URL.createObjectURL(file))
  }

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length + additionalImageFiles.length > 4) {
      toast.error('Maximum 4 additional images allowed')
      return
    }

    // Validate files
    const invalidFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024
      return !isValidType || !isValidSize
    })

    if (invalidFiles.length > 0) {
      toast.error('All files must be images under 10MB')
      return
    }

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setAdditionalImageFiles(prev => [...prev, ...files])
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removePrimaryImage = () => {
    if (primaryImagePreview) URL.revokeObjectURL(primaryImagePreview)
    setPrimaryImageFile(null)
    setPrimaryImagePreview('')
    setFormData(prev => ({ ...prev, image: '' }))
  }

  const removeAdditionalImage = (index: number) => {
    URL.revokeObjectURL(additionalImagePreviews[index])
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<{ primary: string; additional: string[] }> => {
    const imagesToUpload: File[] = []
    
    // Add primary image if it's a new file
    if (primaryImageFile) {
      imagesToUpload.push(primaryImageFile)
    }
    
    // Add additional images
    imagesToUpload.push(...additionalImageFiles)

    if (imagesToUpload.length === 0) {
      // If editing and no new images, return existing URLs
      return {
        primary: formData.image || primaryImagePreview,
        additional: formData.images
      }
    }

    // Upload to Cloudinary
    const uploadFormData = new FormData()
    imagesToUpload.forEach(file => {
      uploadFormData.append('images', file)
    })

    const response = await fetch('/api/rooms/upload', {
      method: 'POST',
      body: uploadFormData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload images')
    }

    // Process uploaded URLs
    const uploadedUrls = data.images as string[]
    
    // Determine primary image
    let primary: string
    if (primaryImageFile) {
      // New primary image uploaded - use first URL
      primary = uploadedUrls[0]
    } else {
      // Keep existing primary image
      primary = formData.image || primaryImagePreview
    }

    // Determine additional images
    let additional: string[]
    if (primaryImageFile) {
      // Primary was uploaded, so additional images start from index 1
      additional = uploadedUrls.slice(1)
    } else {
      // Primary wasn't uploaded, so all uploaded URLs are additional
      additional = [...formData.images, ...uploadedUrls]
    }

    return { primary, additional }
  }

  const handleDeleteClick = (roomId: string, roomName: string) => {
    setShowDeleteModal({ show: true, roomId, roomName })
  }

  const confirmDelete = async () => {
    if (!showDeleteModal.roomId) return

    try {
      const result = await deleteRoom(showDeleteModal.roomId)
      if (result.success) {
        toast.success(result.message)
        setRooms(rooms.filter(r => r._id !== showDeleteModal.roomId))
        setShowDeleteModal({ show: false, roomId: null, roomName: '' })
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to delete room')
    }
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields (excluding image - will be uploaded)
      if (!formData.name || !formData.beds || !formData.size || !formData.price || formData.available === undefined) {
        toast.error('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      // Validate that primary image exists (either uploaded or existing)
      if (!primaryImageFile && !formData.image && !primaryImagePreview) {
        toast.error('Please upload a primary image for the room')
        setIsSubmitting(false)
        return
      }

      // Upload images first
      setIsUploadingImages(true)
      const { primary, additional } = await uploadImages()

      // Update form data with uploaded URLs
      const roomData = {
        ...formData,
        image: primary,
        images: additional,
      }

      const result = editingRoom
        ? await updateRoom(editingRoom._id, roomData)
        : await createRoom(roomData)

      if (result.success) {
        toast.success(result.message)
        resetForm()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error: any) {
      console.error('Room save error:', error)
      toast.error(error.message || 'Failed to save room')
    } finally {
      setIsSubmitting(false)
      setIsUploadingImages(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Rooms</h1>
          <p className="text-gray-600 mt-1">Add and manage room types for your hotel</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        )}
      </div>

      {/* Add/Edit Room Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h2>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Room Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Deluxe Room, Executive Suite"
                  required
                />
              </div>

              {/* Primary Image Upload */}
              <div className="md:col-span-2">
                <Label>Primary Image *</Label>
                {primaryImagePreview ? (
                  <div className="mt-2 relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={primaryImagePreview}
                        alt="Primary room image"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removePrimaryImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label
                      htmlFor="primaryImage"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        id="primaryImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePrimaryImageUpload}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Additional Images Upload */}
              <div className="md:col-span-2">
                <Label>Additional Images (Optional, Max 4)</Label>
                <div className="mt-2 space-y-3">
                  {/* Image Previews */}
                  {additionalImagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {additionalImagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={preview}
                            alt={`Additional image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {additionalImagePreviews.length < 4 && (
                    <label
                      htmlFor="additionalImages"
                      className="flex items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Add more images ({additionalImagePreviews.length}/4)
                        </span>
                      </div>
                      <input
                        id="additionalImages"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAdditionalImagesUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div>
                <Label htmlFor="capacity">Capacity (Max Guests) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>

              {/* Beds */}
              <div>
                <Label htmlFor="beds">Beds *</Label>
                <Input
                  id="beds"
                  value={formData.beds}
                  onChange={(e) => setFormData(prev => ({ ...prev, beds: e.target.value }))}
                  placeholder="e.g., 1 King Bed, 2 Twin Beds"
                  required
                />
              </div>

              {/* Size */}
              <div>
                <Label htmlFor="size">Room Size *</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  placeholder="e.g., 35 m²"
                  required
                />
              </div>

              {/* View */}
              <div>
                <Label htmlFor="view">View</Label>
                <Input
                  id="view"
                  value={formData.view}
                  onChange={(e) => setFormData(prev => ({ ...prev, view: e.target.value }))}
                  placeholder="e.g., Ocean View, City View"
                />
              </div>

              {/* Floor */}
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  value={formData.floor}
                  onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                  placeholder="e.g., 3rd Floor"
                />
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price">Price per Night (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              {/* Available */}
              <div>
                <Label htmlFor="available">Number of Rooms Available *</Label>
                <Input
                  id="available"
                  type="number"
                  min="0"
                  value={formData.available}
                  onChange={(e) => setFormData(prev => ({ ...prev, available: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>

              {/* Max Occupancy */}
              <div>
                <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                <Input
                  id="maxOccupancy"
                  type="number"
                  min="1"
                  value={formData.maxOccupancy || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxOccupancy: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>

              {/* Min Nights */}
              <div>
                <Label htmlFor="minNights">Minimum Nights</Label>
                <Input
                  id="minNights"
                  type="number"
                  min="1"
                  value={formData.minNights || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, minNights: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>

              {/* Max Nights */}
              <div>
                <Label htmlFor="maxNights">Maximum Nights</Label>
                <Input
                  id="maxNights"
                  type="number"
                  min="1"
                  value={formData.maxNights || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxNights: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe the room features and amenities..."
              />
            </div>

            {/* Room Amenities */}
            <div>
              <Label>Room Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                {ROOM_AMENITIES.map((amenity) => {
                  const isSelected = formData.amenities.includes(amenity)
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isSelected && <CheckSquare className="w-4 h-4 text-primary" />}
                      <span className="text-sm font-medium">{amenity}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImages}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isUploadingImages 
                  ? 'Uploading Images...' 
                  : isSubmitting 
                    ? 'Saving...' 
                    : editingRoom 
                      ? 'Update Room' 
                      : 'Add Room'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms List */}
      {rooms.length === 0 && !showAddForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms added yet</h3>
          <p className="text-gray-600 mb-4">Add your first room type to get started</p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms
            .filter(room => !editingRoom || room._id !== editingRoom._id) // Hide room being edited
            .map((room) => (
            <div key={room._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Room Image */}
              <div className="relative h-48 bg-gray-100">
                {room.image ? (
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-hotel.jpg'
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Room Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{room.name}</h3>
                  {room.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{room.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium ml-1">{room.capacity} guests</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Beds:</span>
                    <span className="font-medium ml-1">{room.beds}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium ml-1">{room.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium ml-1">{room.available}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">${room.price}</span>
                      <span className="text-gray-600 text-sm">/night</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(room)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(room._id, room.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal.show && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowDeleteModal({ show: false, roomId: null, roomName: '' })}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-100">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Room?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{showDeleteModal.roomName}"</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal({ show: false, roomId: null, roomName: '' })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete Room
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

