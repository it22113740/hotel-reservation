'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Search, X, SlidersHorizontal, MapPin, Star, DollarSign } from "lucide-react"

interface HotelFiltersProps {
  onFilterChange: (filters: FilterState) => void
  onReset: () => void
  totalResults: number
}

export interface FilterState {
  search: string
  location: string
  priceRange: [number, number]
  rating: number
  amenities: string[]
  sortBy: string
}

const HotelFilters = ({ onFilterChange, onReset, totalResults }: HotelFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    priceRange: [0, 500],
    rating: 0,
    amenities: [],
    sortBy: "recommended"
  })

  const amenitiesList = [
    { id: "wifi", label: "Free WiFi" },
    { id: "parking", label: "Free Parking" },
    { id: "pool", label: "Swimming Pool" },
    { id: "restaurant", label: "Restaurant" },
    { id: "gym", label: "Gym/Fitness" },
    { id: "spa", label: "Spa & Wellness" },
    { id: "ac", label: "Air Conditioning" },
    { id: "bar", label: "Bar/Lounge" }
  ]

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter(a => a !== amenityId)
      : [...filters.amenities, amenityId]
    updateFilter("amenities", newAmenities)
  }

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: "",
      location: "",
      priceRange: [0, 500],
      rating: 0,
      amenities: [],
      sortBy: "recommended"
    }
    setFilters(resetFilters)
    onReset()
  }

  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    filters.amenities.length

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-24">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            {isExpanded ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-1">{totalResults} hotels found</p>
      </div>

      {/* Filter Content */}
      <div className={`p-4 space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700">
            Search Hotels
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Hotel name..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-gray-700">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="location"
              type="text"
              placeholder="City, region..."
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Price Range</Label>
            <span className="text-sm font-semibold text-primary">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </span>
          </div>
          <Slider
            min={0}
            max={500}
            step={10}
            value={filters.priceRange}
            onValueChange={(value: number[]) => updateFilter("priceRange", value as [number, number])}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>$0</span>
            <span>$500+</span>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Minimum Rating</Label>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => updateFilter("rating", rating === filters.rating ? 0 : rating)}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                  filters.rating === rating
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">& up</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Amenities</Label>
          <div className="space-y-2">
            {amenitiesList.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.id}
                  checked={filters.amenities.includes(amenity.id)}
                  onCheckedChange={() => handleAmenityToggle(amenity.id)}
                />
                <label
                  htmlFor={amenity.id}
                  className="text-sm text-gray-700 cursor-pointer flex-1"
                >
                  {amenity.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
            Sort By
          </Label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  )
}

export default HotelFilters

