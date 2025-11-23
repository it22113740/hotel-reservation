import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, Calendar, Users, Sparkles } from "lucide-react"

const Hero = () => {
    return (
        <section className="relative pt-16 pb-12 sm:pb-16 lg:pt-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-50 -z-10" />
            <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
            
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid max-w-lg grid-cols-1 mx-auto lg:max-w-full lg:items-center lg:grid-cols-2 gap-y-12 lg:gap-x-16">
                    <div>
                        <div className="text-center lg:text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                                <Sparkles className="w-4 h-4" />
                                Your Perfect Stay Awaits
                            </div>

                            {/* Heading */}
                            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl">
                                Discover & Book Amazing Hotels in 
                                <span className="text-primary"> Sri Lanka</span>
                            </h1>
                            
                            {/* Subheading */}
                            <p className="mt-4 text-lg text-gray-600 sm:mt-8">
                                From luxury resorts to cozy boutique hotels, find the perfect 
                                accommodation for your next adventure. Best prices guaranteed.
                            </p>

                            {/* Quick Search Form */}
                            <div className="mt-8 sm:mt-10">
                                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Location Input */}
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Where are you going?"
                                                className="pl-10 h-12 border-gray-200"
                                            />
                                        </div>

                                        {/* Date Input */}
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                type="date"
                                                className="pl-10 h-12 border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Search Button */}
                                    <Button 
                                        className="w-full mt-3 h-12 text-base group"
                                        asChild
                                    >
                                        <Link href="/hotels">
                                            <Search className="w-5 h-5 mr-2" />
                                            Search Hotels
                                        </Link>
                                    </Button>
                                </div>

                                <p className="mt-4 text-sm text-gray-500 text-center lg:text-left">
                                    🔥 <strong>Hot Deal:</strong> Book now and save up to 30% on select hotels
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center mt-10 space-x-6 lg:justify-start sm:space-x-8">
                            <div className="flex items-center">
                                <p className="text-3xl font-medium text-gray-900 sm:text-4xl">10K+</p>
                                <p className="ml-3 text-sm text-gray-900">Hotels<br />Available</p>
                            </div>

                            <div className="hidden sm:block">
                                <svg className="text-gray-400" width="16" height="39" viewBox="0 0 16 39" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="0.72265" y1="10.584" x2="15.7226" y2="0.583975"></line>
                                    <line x1="0.72265" y1="17.584" x2="15.7226" y2="7.58398"></line>
                                    <line x1="0.72265" y1="24.584" x2="15.7226" y2="14.584"></line>
                                    <line x1="0.72265" y1="31.584" x2="15.7226" y2="21.584"></line>
                                    <line x1="0.72265" y1="38.584" x2="15.7226" y2="28.584"></line>
                                </svg>
                            </div>

                            <div className="flex items-center">
                                <p className="text-3xl font-medium text-gray-900 sm:text-4xl">5M+</p>
                                <p className="ml-3 text-sm text-gray-900">Happy<br />Guests</p>
                            </div>

                            <div className="hidden sm:block">
                                <svg className="text-gray-400" width="16" height="39" viewBox="0 0 16 39" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="0.72265" y1="10.584" x2="15.7226" y2="0.583975"></line>
                                    <line x1="0.72265" y1="17.584" x2="15.7226" y2="7.58398"></line>
                                    <line x1="0.72265" y1="24.584" x2="15.7226" y2="14.584"></line>
                                    <line x1="0.72265" y1="31.584" x2="15.7226" y2="21.584"></line>
                                    <line x1="0.72265" y1="38.584" x2="15.7226" y2="28.584"></line>
                                </svg>
                            </div>

                            <div className="flex items-center">
                                <p className="text-3xl font-medium text-gray-900 sm:text-4xl">98%</p>
                                <p className="ml-3 text-sm text-gray-900">Satisfaction<br />Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                            <Image 
                                className="w-full h-auto" 
                                src="/images/hotel1.png" 
                                alt="Luxury hotel in Sri Lanka" 
                                width={600}
                                height={600}
                                priority
                            />
                            
                            {/* Floating Card - Popular Destination */}
                            <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Popular</p>
                                        <p className="font-semibold text-gray-900">Colombo</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card - Active Bookings */}
                            <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Active Bookings</p>
                                        <p className="font-semibold text-gray-900">2,543+</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero