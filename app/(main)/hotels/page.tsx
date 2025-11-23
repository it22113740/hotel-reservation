'use client'

import { useState, useEffect } from "react"
import HotelCard from "@/components/client/HotelCard"
import HotelFilters, { FilterState } from "@/components/client/hotels/HotelFilters"
import HotelSkeleton from "@/components/client/hotels/HotelSkeleton"
import EmptyState from "@/components/client/hotels/EmptyState"
import MobileFilterDrawer from "@/components/client/hotels/MobileFilterDrawer"
import { Hotel, MapPin, Search } from "lucide-react"

// Sample hotel data - Replace with API call
const sampleHotels = [
  {
    id: "1",
    name: "Grand Colombo Hotel",
    location: "Colombo, Sri Lanka",
    image: "/images/hotel1.png",
    price: 150,
    rating: 4.8,
    reviews: 324,
    amenities: ["wifi", "restaurant", "parking", "pool", "gym"],
    description: "Luxurious 5-star hotel in the heart of Colombo with stunning city views",
    category: "Luxury"
  },
  {
    id: "2",
    name: "Galle Fort Heritage Hotel",
    location: "Galle, Sri Lanka",
    image: "/images/hotel2.png",
    price: 120,
    rating: 4.6,
    reviews: 189,
    amenities: ["wifi", "restaurant", "spa", "bar"],
    description: "Historic boutique hotel within the UNESCO World Heritage Galle Fort",
    category: "Heritage"
  },
  {
    id: "3",
    name: "Ella Mountain Resort",
    location: "Ella, Sri Lanka",
    image: "/images/hotel3.png",
    price: 90,
    rating: 4.7,
    reviews: 256,
    amenities: ["wifi", "restaurant", "parking", "ac"],
    description: "Scenic mountain resort with breathtaking views of Ella's tea plantations",
    category: "Resort"
  },
  {
    id: "4",
    name: "Kandy Lake View Hotel",
    location: "Kandy, Sri Lanka",
    image: "/images/hotel4.png",
    price: 110,
    rating: 4.5,
    reviews: 198,
    amenities: ["wifi", "restaurant", "parking", "pool"],
    description: "Elegant hotel overlooking the serene Kandy Lake and Temple of the Tooth",
    category: "Heritage"
  },
  {
    id: "5",
    name: "Nuwara Eliya Grand Hotel",
    location: "Nuwara Eliya, Sri Lanka",
    image: "/images/hotel5.png",
    price: 130,
    rating: 4.4,
    reviews: 167,
    amenities: ["wifi", "restaurant", "bar", "gym", "spa"],
    description: "Colonial-era grand hotel in the cool highlands of Nuwara Eliya",
    category: "Luxury"
  },
  {
    id: "6",
    name: "Mirissa Beach Resort",
    location: "Mirissa, Sri Lanka",
    image: "/images/hotel6.png",
    price: 100,
    rating: 4.9,
    reviews: 412,
    amenities: ["wifi", "restaurant", "parking", "pool", "bar"],
    description: "Beachfront paradise with direct access to Mirissa's golden sands",
    category: "Beach"
  },
  {
    id: "7",
    name: "Sigiriya Rock View Hotel",
    location: "Sigiriya, Sri Lanka",
    image: "/images/hotel1.png",
    price: 140,
    rating: 4.7,
    reviews: 289,
    amenities: ["wifi", "restaurant", "parking", "pool", "spa"],
    description: "Luxury hotel with spectacular views of the iconic Sigiriya Rock Fortress",
    category: "Resort"
  },
  {
    id: "8",
    name: "Anuradhapura Heritage Inn",
    location: "Anuradhapura, Sri Lanka",
    image: "/images/hotel2.png",
    price: 80,
    rating: 4.3,
    reviews: 145,
    amenities: ["wifi", "restaurant", "parking", "ac"],
    description: "Comfortable accommodation near ancient Buddhist temples and ruins",
    category: "Budget"
  },
  {
    id: "9",
    name: "Bentota Beach Hotel",
    location: "Bentota, Sri Lanka",
    image: "/images/hotel3.png",
    price: 160,
    rating: 4.8,
    reviews: 367,
    amenities: ["wifi", "restaurant", "parking", "pool", "gym", "spa", "bar"],
    description: "Premium beach resort with water sports and spa facilities",
    category: "Beach"
  },
  {
    id: "10",
    name: "Polonnaruwa Palace Hotel",
    location: "Polonnaruwa, Sri Lanka",
    image: "/images/hotel4.png",
    price: 95,
    rating: 4.4,
    reviews: 178,
    amenities: ["wifi", "restaurant", "parking", "pool"],
    description: "Modern hotel near the ancient city of Polonnaruwa",
    category: "Budget"
  },
  {
    id: "11",
    name: "Yala Safari Lodge",
    location: "Yala, Sri Lanka",
    image: "/images/hotel5.png",
    price: 180,
    rating: 4.9,
    reviews: 423,
    amenities: ["wifi", "restaurant", "parking", "pool", "bar"],
    description: "Exclusive safari lodge on the edge of Yala National Park",
    category: "Resort"
  },
  {
    id: "12",
    name: "Negombo Beach Villa",
    location: "Negombo, Sri Lanka",
    image: "/images/hotel6.png",
    price: 75,
    rating: 4.2,
    reviews: 134,
    amenities: ["wifi", "restaurant", "parking", "ac"],
    description: "Cozy beachside villa perfect for short stays near the airport",
    category: "Budget"
  }
]

const HotelsPage = () => {
  const [hotels, setHotels] = useState(sampleHotels)
  const [filteredHotels, setFilteredHotels] = useState(sampleHotels)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    priceRange: [0, 500],
    rating: 0,
    amenities: [],
    sortBy: "recommended"
  })

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  // Apply filters
  useEffect(() => {
    let result = [...hotels]

    // Search filter
    if (filters.search) {
      result = result.filter(hotel =>
        hotel.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        hotel.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Location filter
    if (filters.location) {
      result = result.filter(hotel =>
        hotel.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Price range filter
    result = result.filter(hotel =>
      hotel.price >= filters.priceRange[0] && hotel.price <= filters.priceRange[1]
    )

    // Rating filter
    if (filters.rating > 0) {
      result = result.filter(hotel => hotel.rating >= filters.rating)
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter(hotel =>
        filters.amenities.every(amenity => hotel.amenities.includes(amenity))
      )
    }

    // Sorting
    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        // Keep original order for recommended/newest
        break
      default:
        // Recommended - sort by rating and reviews
        result.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    }

    setFilteredHotels(result)
  }, [filters, hotels])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleReset = () => {
    setFilters({
      search: "",
      location: "",
      priceRange: [0, 500],
      rating: 0,
      amenities: [],
      sortBy: "recommended"
    })
  }

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    filters.amenities.length

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-blue-50 to-transparent border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Hotel className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">
              Discover Hotels in Sri Lanka
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl">
            Find and book the perfect accommodation for your stay. From luxury resorts to budget-friendly options.
          </p>
          
          {/* Results Summary */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-900">{filteredHotels.length}</span>
              <span className="text-gray-600">hotels found</span>
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                <Search className="w-4 h-4" />
                <span className="font-semibold">{activeFiltersCount}</span>
                <span>active filters</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block">
            <HotelFilters
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              totalResults={filteredHotels.length}
            />
          </aside>

          {/* Hotels Grid */}
          <main className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredHotels.length} Hotels
              </h2>
              <MobileFilterDrawer
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                totalResults={filteredHotels.length}
                activeFiltersCount={activeFiltersCount}
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <HotelSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Hotels Grid */}
            {!isLoading && filteredHotels.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredHotels.map((hotel) => (
                  <HotelCard key={hotel.id} {...hotel} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredHotels.length === 0 && (
              <div className="grid grid-cols-1">
                <EmptyState type="no-results" onReset={handleReset} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default HotelsPage