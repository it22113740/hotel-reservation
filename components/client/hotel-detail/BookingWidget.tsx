'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Users, Star, Shield, Award } from "lucide-react"
import { useRouter } from "next/navigation"

interface BookingWidgetProps {
  hotelId: string
  price: number
  rating: number
  reviews: number
}

const BookingWidget = ({ hotelId, price, rating, reviews }: BookingWidgetProps) => {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const [nights, setNights] = useState(1)

  // Calculate nights
  const calculateNights = (checkInDate: string, checkOutDate: string) => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setNights(diffDays || 1)
    }
  }

  const handleCheckInChange = (date: string) => {
    setCheckIn(date)
    calculateNights(date, checkOut)
  }

  const handleCheckOutChange = (date: string) => {
    setCheckOut(date)
    calculateNights(checkIn, date)
  }

  const handleBooking = () => {
    // Navigate to booking page with query params
    router.push(`/booking?hotel=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
  }

  const subtotal = price * nights
  const serviceFee = subtotal * 0.1
  const total = subtotal + serviceFee

  return (
    <div className="sticky top-24 bg-white border border-gray-200 rounded-xl shadow-lg p-6 space-y-6">
      {/* Price Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-600">/ night</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{rating}</span>
          </div>
          <span className="text-gray-600">·</span>
          <span className="text-gray-600">{reviews} reviews</span>
        </div>
      </div>

      {/* Booking Form */}
      <div className="space-y-4">
        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="checkIn" className="text-sm font-medium">Check-in</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOut" className="text-sm font-medium">Check-out</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => handleCheckOutChange(e.target.value)}
                className="pl-10"
                min={checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <Label htmlFor="guests" className="text-sm font-medium">Guests</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="guests"
              type="number"
              min={1}
              max={10}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="pl-10"
            />
          </div>
        </div>

        {/* Reserve Button */}
        <Button
          onClick={handleBooking}
          disabled={!checkIn || !checkOut}
          className="w-full h-12 text-base font-semibold"
        >
          Reserve Now
        </Button>

        <p className="text-center text-sm text-gray-600">
          You won't be charged yet
        </p>
      </div>

      {/* Price Breakdown */}
      {checkIn && checkOut && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">${price} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service fee</span>
            <span className="font-medium">${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-3">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Free cancellation for 48 hours</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Award className="w-4 h-4 text-blue-600" />
          <span>Best price guarantee</span>
        </div>
      </div>
    </div>
  )
}

export default BookingWidget

