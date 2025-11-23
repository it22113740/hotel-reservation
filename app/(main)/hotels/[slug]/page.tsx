'use client'

import { useState } from "react"
import ImageGallery from "@/components/client/hotel-detail/ImageGallery"
import BookingWidget from "@/components/client/hotel-detail/BookingWidget"
import AmenitiesGrid from "@/components/client/hotel-detail/AmenitiesGrid"
import ReviewsSection from "@/components/client/hotel-detail/ReviewsSection"
import RoomCard from "@/components/client/hotel-detail/RoomCard"
import HotelCard from "@/components/client/HotelCard"
import { MapPin, Star, Award, Shield, Clock, Share2, Heart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Sample hotel data - Replace with API call using params.slug
const hotelData = {
  id: "1",
  slug: "grand-colombo-hotel",
  name: "Grand Colombo Hotel",
  location: "Colombo 03, Sri Lanka",
  fullAddress: "123 Galle Road, Colombo 03, Sri Lanka",
  rating: 4.8,
  reviewsCount: 324,
  price: 150,
  description: `Experience unparalleled luxury in the heart of Colombo. Our 5-star hotel offers breathtaking city views, world-class amenities, and exceptional service. Whether you're here for business or leisure, Grand Colombo Hotel provides the perfect blend of comfort and sophistication.

Situated in the vibrant Colombo 03 district, our hotel is within walking distance of premium shopping, fine dining, and cultural attractions. Each room is thoughtfully designed with modern elegance and equipped with state-of-the-art facilities to ensure your stay is nothing short of extraordinary.`,
  images: [
    "/images/hotel1.png",
    "/images/hotel2.png",
    "/images/hotel3.png",
    "/images/hotel4.png",
    "/images/hotel5.png",
    "/images/hotel6.png",
  ],
  amenities: [
    "wifi",
    "parking",
    "restaurant",
    "gym",
    "pool",
    "spa",
    "ac",
    "bar",
    "24hour",
    "breakfast",
    "concierge",
    "security",
  ],
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
  languages: ["English", "Sinhala", "Tamil"],
  policies: [
    "Pets are not allowed",
    "Smoking is not permitted",
    "Parties/events are not allowed",
    "Check-in time starts at 2:00 PM",
    "Check-out time is 12:00 PM",
  ],
  rooms: [
    {
      id: "1",
      name: "Deluxe Room",
      image: "/images/hotel1.png",
      capacity: 2,
      beds: "1 King Bed",
      size: "35 m²",
      amenities: ["wifi", "breakfast", "city view", "minibar"],
      price: 150,
      available: 3,
    },
    {
      id: "2",
      name: "Executive Suite",
      image: "/images/hotel2.png",
      capacity: 3,
      beds: "1 King Bed + Sofa Bed",
      size: "55 m²",
      amenities: ["wifi", "breakfast", "ocean view", "balcony"],
      price: 250,
      available: 2,
    },
    {
      id: "3",
      name: "Presidential Suite",
      image: "/images/hotel3.png",
      capacity: 4,
      beds: "2 King Beds",
      size: "100 m²",
      amenities: ["wifi", "breakfast", "panoramic view", "jacuzzi"],
      price: 450,
      available: 1,
    },
  ],
  reviewsList: [
    {
      id: "1",
      author: "Sarah Johnson",
      rating: 5,
      date: "December 2024",
      comment: "Absolutely stunning hotel! The staff was incredibly helpful and the rooms were spotless. The infinity pool on the rooftop offers breathtaking views of the city. Highly recommend!",
      helpful: 24,
    },
    {
      id: "2",
      author: "Michael Chen",
      rating: 5,
      date: "November 2024",
      comment: "Best hotel experience in Colombo! The location is perfect, breakfast buffet was amazing, and the spa facilities are world-class. Will definitely return.",
      helpful: 18,
    },
    {
      id: "3",
      author: "Emma Williams",
      rating: 4,
      date: "November 2024",
      comment: "Great hotel with excellent service. The rooms are spacious and well-appointed. Only minor issue was the wifi speed, but everything else was perfect.",
      helpful: 12,
    },
    {
      id: "4",
      author: "Rajesh Kumar",
      rating: 5,
      date: "October 2024",
      comment: "Perfect for business travel. The conference facilities are top-notch, and the business center was very helpful. Great location near the financial district.",
      helpful: 15,
    },
    {
      id: "5",
      author: "Lisa Anderson",
      rating: 5,
      date: "October 2024",
      comment: "Our honeymoon was made special by this wonderful hotel. The staff went above and beyond to make our stay memorable. The ocean view suite was breathtaking!",
      helpful: 28,
    },
    {
      id: "6",
      author: "David Park",
      rating: 4,
      date: "September 2024",
      comment: "Solid 5-star experience. The gym and pool facilities are excellent. Restaurant has great food with reasonable prices. Would stay here again.",
      helpful: 9,
    },
  ],
}

// Similar hotels data
const similarHotels = [
  {
    id: "2",
    name: "Galle Fort Heritage Hotel",
    location: "Galle, Sri Lanka",
    image: "/images/hotel2.png",
    price: 120,
    rating: 4.6,
    reviews: 189,
    amenities: ["wifi", "restaurant", "spa"],
    description: "Historic boutique hotel within the UNESCO World Heritage Galle Fort",
  },
  {
    id: "3",
    name: "Ella Mountain Resort",
    location: "Ella, Sri Lanka",
    image: "/images/hotel3.png",
    price: 90,
    rating: 4.7,
    reviews: 256,
    amenities: ["wifi", "restaurant", "parking"],
    description: "Scenic mountain resort with breathtaking views",
  },
  {
    id: "4",
    name: "Kandy Lake View Hotel",
    location: "Kandy, Sri Lanka",
    image: "/images/hotel4.png",
    price: 110,
    rating: 4.5,
    reviews: 198,
    amenities: ["wifi", "restaurant", "pool"],
    description: "Elegant hotel overlooking Kandy Lake",
  },
]

interface HotelDetailPageProps {
  params: {
    slug: string
  }
}

const HotelDetailPage = ({ params }: HotelDetailPageProps) => {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleRoomBooking = (roomId: string) => {
    // Navigate to booking page with selected room
    console.log("Booking room:", roomId)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/hotels" className="hover:text-primary">Hotels</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{hotelData.name}</span>
        </nav>

        {/* Hotel Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {hotelData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{hotelData.rating}</span>
                  <span>({hotelData.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{hotelData.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">Top Rated</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Verified Property</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-gray-700">Instant Confirmation</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <ImageGallery images={hotelData.images} hotelName={hotelData.name} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Hotel</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {hotelData.description}
              </p>
            </div>

            {/* Check-in/out Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Check-in & Check-out</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-1">Check-in</p>
                  <p className="text-lg font-semibold text-gray-900">{hotelData.checkIn}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Check-out</p>
                  <p className="text-lg font-semibold text-gray-900">{hotelData.checkOut}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <AmenitiesGrid amenities={hotelData.amenities} />

            {/* Available Rooms */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
              <div className="space-y-6">
                {hotelData.rooms.map((room) => (
                  <RoomCard key={room.id} room={room} onBook={handleRoomBooking} />
                ))}
              </div>
            </div>

            {/* Reviews */}
            <ReviewsSection
              reviews={hotelData.reviewsList}
              averageRating={hotelData.rating}
              totalReviews={hotelData.reviewsCount}
            />

            {/* Hotel Policies */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotel Policies</h2>
              <ul className="space-y-2">
                {hotelData.policies.map((policy, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-primary mt-1">•</span>
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
              <p className="text-gray-700 mb-4">{hotelData.fullAddress}</p>
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Map View (Integrate Google Maps API)</p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <BookingWidget
              hotelId={hotelData.id}
              price={hotelData.price}
              rating={hotelData.rating}
              reviews={hotelData.reviewsCount}
            />
          </div>
        </div>

        {/* Similar Hotels */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Similar Hotels You Might Like</h2>
            <Link href="/hotels">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarHotels.map((hotel) => (
              <HotelCard key={hotel.id} {...hotel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HotelDetailPage