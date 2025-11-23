'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Building2, User, Mail, Phone, MapPin, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface PartnerFormData {
  // Hotel Information
  hotelName: string
  description: string
  address: string
  city: string
  country: string
  
  // Owner Information
  ownerName: string
  contactEmail: string
  phone: string
  
  // Images
  images: File[]
}

const PartnerRegisterPage = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<PartnerFormData>({
    hotelName: "",
    description: "",
    address: "",
    city: "",
    country: "",
    ownerName: "",
    contactEmail: "",
    phone: "",
    images: [],
  })

  const handleInputChange = (field: keyof PartnerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, images: files }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images') {
          submitData.append(key, value as string)
        }
      })
      
      // Append images
      formData.images.forEach((file) => {
        submitData.append('images', file)
      })

      const response = await fetch('/api/partner/register', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) throw new Error('Registration failed')

      toast.success('Hotel registered successfully!')
      router.push('/partner/success')
      
    } catch (error) {
      toast.error('Failed to register hotel. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full max-w-6xl mx-auto">
          <div 
            className="w-full h-full rounded-3xl opacity-20 blur-3xl filter" 
            style={{ background: 'linear-gradient(90deg, #44ff9a -0.55%, #44b0ff 22.86%, #8b44ff 48.36%, #ff6644 73.33%, #ebff70 99.34%)' }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            Partner Registration
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            List Your Hotel on LankaStay
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of hotel partners and start receiving bookings from travelers worldwide
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Hotel Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">Hotel Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="hotelName" className="mb-2 block">Hotel Name *</Label>
                <Input
                  id="hotelName"
                  type="text"
                  placeholder="Grand Colombo Hotel"
                  value={formData.hotelName}
                  onChange={(e) => handleInputChange('hotelName', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2 block">Description *</Label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Tell us about your hotel, amenities, and what makes it special..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city" className="mb-2 block">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Colombo"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="mb-2 block">Country *</Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="Sri Lanka"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="mb-2 block">Full Address *</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Galle Road, Colombo 03"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Owner Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="ownerName" className="mb-2 block">Owner Name *</Label>
                <Input
                  id="ownerName"
                  type="text"
                  placeholder="John Smith"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactEmail" className="mb-2 block">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="owner@hotel.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="mb-2 block">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">Hotel Images</h2>
            </div>

            <div>
              <Label htmlFor="images" className="mb-3 block">Upload Images (Max 10) *</Label>
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                    >
                      <span>Upload files</span>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  {formData.images.length > 0 && (
                    <p className="text-sm font-medium text-primary mt-2">
                      {formData.images.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              By submitting, you agree to our Terms & Conditions
            </p>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </form>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Easy Setup</h3>
            <p className="text-sm text-gray-600">Quick registration process</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-3">
              <User className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">24/7 Support</h3>
            <p className="text-sm text-gray-600">Dedicated partner assistance</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">Track your performance</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerRegisterPage