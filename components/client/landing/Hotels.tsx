'use client'

import { useState } from "react"
import HotelCard from "../HotelCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Hotel, Sparkles, DollarSign, TrendingUp } from "lucide-react"

const Hotels = () => {
    const [activeCategory, setActiveCategory] = useState("all")

    const categories = [
        { id: "all", label: "All Hotels", icon: <Hotel className="w-4 h-4" /> },
        { id: "popular", label: "Most Popular", icon: <TrendingUp className="w-4 h-4" /> },
        { id: "luxury", label: "Luxury", icon: <Sparkles className="w-4 h-4" /> },
        { id: "budget", label: "Budget Friendly", icon: <DollarSign className="w-4 h-4" /> },
    ]

    // Sample hotel data - in real app, this would come from API/database
    const hotels = [
        {
            id: "grand-hotel-colombo",
            name: "Grand Luxury Hotel",
            location: "Colombo, Sri Lanka",
            image: "/images/hotel1.png",
            price: 150,
            rating: 4.8,
            reviews: 128,
            amenities: ["wifi", "restaurant", "parking"],
            description: "Experience luxury and comfort in the heart of Colombo",
            category: "luxury"
        },
        {
            id: "beach-resort-galle",
            name: "Paradise Beach Resort",
            location: "Galle, Sri Lanka",
            image: "/images/hotel2.png",
            price: 120,
            rating: 4.6,
            reviews: 96,
            amenities: ["wifi", "restaurant", "parking"],
            description: "Stunning beachfront property with ocean views",
            category: "popular"
        },
        {
            id: "budget-inn-kandy",
            name: "Comfort Inn Kandy",
            location: "Kandy, Sri Lanka",
            image: "/images/hotel3.png",
            price: 65,
            rating: 4.3,
            reviews: 74,
            amenities: ["wifi", "parking"],
            description: "Affordable comfort in the cultural capital",
            category: "budget"
        },
        {
            id: "mountain-view-nuwara",
            name: "Mountain View Hotel",
            location: "Nuwara Eliya, Sri Lanka",
            image: "/images/hotel4.png",
            price: 95,
            rating: 4.5,
            reviews: 112,
            amenities: ["wifi", "restaurant"],
            description: "Breathtaking mountain views and tea plantation tours",
            category: "popular"
        },
        {
            id: "royal-palace-colombo",
            name: "Royal Palace Hotel",
            location: "Colombo, Sri Lanka",
            image: "/images/hotel5.png",
            price: 200,
            rating: 4.9,
            reviews: 156,
            amenities: ["wifi", "restaurant", "parking"],
            description: "Five-star luxury with world-class amenities",
            category: "luxury"
        },
        {
            id: "city-express-negombo",
            name: "City Express Hotel",
            location: "Negombo, Sri Lanka",
            image: "/images/hotel6.png",
            price: 55,
            rating: 4.2,
            reviews: 88,
            amenities: ["wifi"],
            description: "Quick access to airport and beach",
            category: "budget"
        }
    ]

    // Filter hotels based on active category
    const filteredHotels = activeCategory === "all" 
        ? hotels 
        : hotels.filter(hotel => hotel.category === activeCategory)

    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                        <Hotel className="w-4 h-4" />
                        Featured Properties
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Discover Amazing Hotels in 
                        <span className="text-primary"> Sri Lanka</span>
                    </h2>
                    
                    <p className="text-lg text-gray-600">
                        From luxury resorts to budget-friendly stays, find the perfect 
                        accommodation for your next adventure
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`
                                inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium 
                                transition-all duration-300 
                                ${activeCategory === category.id 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary/30'
                                }
                            `}
                        >
                            {category.icon}
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Hotels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                    {filteredHotels.map((hotel) => (
                        <HotelCard 
                            key={hotel.id}
                            {...hotel}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {filteredHotels.length === 0 && (
                    <div className="text-center py-12">
                        <Hotel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No hotels found
                        </h3>
                        <p className="text-gray-600">
                            Try selecting a different category
                        </p>
                    </div>
                )}

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Button 
                        size="lg" 
                        variant="outline"
                        className="group"
                        asChild
                    >
                        <Link href="/hotels">
                            View All Hotels
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                        Showing {filteredHotels.length} of {hotels.length} hotels
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Hotels