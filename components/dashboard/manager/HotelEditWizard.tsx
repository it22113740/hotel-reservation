'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Building2, MapPin, Clock, Globe, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateHotelDetails } from '@/lib/actions/hotel.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import PendingChangeRequest from './PendingChangeRequest'

interface HotelEditWizardProps {
  hotel: any
}

const STEPS = [
  { id: 1, name: 'Basic Information', icon: Building2 },
  { id: 2, name: 'Location', icon: MapPin },
  { id: 3, name: 'Policies & Info', icon: Clock },
  { id: 4, name: 'Languages', icon: Globe },
  { id: 5, name: 'Images', icon: ImageIcon },
]

export default function HotelEditWizard({ hotel }: HotelEditWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    category: hotel.category || '',
    description: hotel.description || '',
    fullAddress: hotel.fullAddress || '',
    city: hotel.city || '',
    country: hotel.country || '',
    coordinates: hotel.coordinates || { lat: '', lng: '' },
    checkIn: hotel.checkIn || '2:00 PM',
    checkOut: hotel.checkOut || '12:00 PM',
    languages: hotel.languages || ['English'],
    policies: hotel.policies || [],
    images: hotel.images || [],
  })
  const [newPolicy, setNewPolicy] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addPolicy = () => {
    if (newPolicy.trim()) {
      setFormData(prev => ({
        ...prev,
        policies: [...prev.policies, newPolicy.trim()]
      }))
      setNewPolicy('')
    }
  }

  const removePolicy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      policies: prev.policies.filter((_: string, i: number) => i !== index)
    }))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage('')
    }
  }

  const removeLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((l: string) => l !== lang)
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateHotelDetails({
        category: formData.category || undefined,
        description: formData.description,
        coordinates: formData.coordinates.lat && formData.coordinates.lng
          ? { lat: parseFloat(formData.coordinates.lat as any), lng: parseFloat(formData.coordinates.lng as any) }
          : undefined,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        languages: formData.languages,
        policies: formData.policies,
        images: formData.images,
      })

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <div className="space-y-6">
      <PendingChangeRequest />
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Hotel Details</h1>
        <p className="text-gray-600 mt-1">Complete your hotel profile to make it ready for publishing</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => goToStep(step.id)}
                  className={`flex flex-col items-center gap-2 flex-1 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isActive
                        ? 'border-primary bg-primary/10'
                        : isCompleted
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-center">{step.name}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Luxury, Budget, Resort"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                rows={8}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your hotel, amenities, and what makes it special..."
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fullAddress">Full Address *</Label>
              <Input
                id="fullAddress"
                value={formData.fullAddress}
                onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude (Optional)</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.coordinates.lat}
                  onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lat: e.target.value })}
                  placeholder="e.g., 6.9271"
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude (Optional)</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.coordinates.lng}
                  onChange={(e) => handleInputChange('coordinates', { ...formData.coordinates, lng: e.target.value })}
                  placeholder="e.g., 79.8612"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Policies & Info */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Policies & Check-in/out</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn">Check-in Time *</Label>
                <Input
                  id="checkIn"
                  value={formData.checkIn}
                  onChange={(e) => handleInputChange('checkIn', e.target.value)}
                  placeholder="e.g., 2:00 PM"
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out Time *</Label>
                <Input
                  id="checkOut"
                  value={formData.checkOut}
                  onChange={(e) => handleInputChange('checkOut', e.target.value)}
                  placeholder="e.g., 12:00 PM"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Hotel Policies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newPolicy}
                  onChange={(e) => setNewPolicy(e.target.value)}
                  placeholder="e.g., Pets are not allowed"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPolicy())}
                />
                <Button type="button" onClick={addPolicy}>Add</Button>
              </div>
              <div className="space-y-2">
                {formData.policies.map((policy: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{policy}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePolicy(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Languages */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Languages Spoken</h2>
            
            <div>
              <Label>Add Language</Label>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="e.g., English, Sinhala, Tamil"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                />
                <Button type="button" onClick={addLanguage}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang: string) => (
                  <div
                    key={lang}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full"
                  >
                    <span className="text-sm font-medium">{lang}</span>
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="text-primary hover:text-primary/80"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Images */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Hotel Images</h2>
            <p className="text-gray-600">Images are managed during registration. You can add more images later.</p>
            <div className="grid grid-cols-3 gap-4">
              {formData.images.map((image: string, index: number) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                  <Image src={image} alt={`Image ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            variant="outline"
            onClick={nextStep}
            disabled={currentStep === STEPS.length}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

