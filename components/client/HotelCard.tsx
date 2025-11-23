import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { MapPin, Star, Users, Wifi, Utensils, Car } from "lucide-react";

interface HotelCardProps {
    id?: string;
    name?: string;
    location?: string;
    image?: string;
    price?: number;
    rating?: number;
    reviews?: number;
    amenities?: string[];
    description?: string;
}

const HotelCard = ({
    id = "hotel-1",
    name = "Grand Luxury Hotel",
    location = "Colombo, Sri Lanka",
    image = "/images/hotel1.png",
    price = 150,
    rating = 4.8,
    reviews = 128,
    amenities = ["wifi", "restaurant", "parking"],
    description = "Experience luxury and comfort in the heart of the city"
}: HotelCardProps) => {
    
    const amenityIcons = {
        wifi: <Wifi className="w-4 h-4" />,
        restaurant: <Utensils className="w-4 h-4" />,
        parking: <Car className="w-4 h-4" />
    };

    return (
        <Card className="w-full h-full border border-gray-200 shadow-sm rounded-xl hover:shadow-xl transition-all duration-300 hover:cursor-pointer hover:-translate-y-1 bg-white overflow-hidden group">
            <CardHeader className="p-0 relative overflow-hidden">
                <div className="relative w-full h-56">
                    <Image 
                        src={image} 
                        alt={name} 
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{rating}</span>
                        <span className="text-xs text-gray-500">({reviews})</span>
                    </div>
                    {/* Price Badge */}
                    <div className="absolute bottom-3 left-3 bg-primary/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-md">
                        <span className="text-xs font-medium">From</span>
                        <span className="text-lg font-bold ml-1">${price}</span>
                        <span className="text-xs">/night</span>
                    </div>
                </div>
            </CardHeader>
            
            <CardBody className="p-4 space-y-3">
                {/* Hotel Name */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm line-clamp-1">{location}</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">
                    {description}
                </p>

                {/* Amenities */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    {amenities.slice(0, 3).map((amenity) => (
                        <div 
                            key={amenity} 
                            className="flex items-center gap-1.5 text-gray-600"
                            title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                        >
                            {amenityIcons[amenity as keyof typeof amenityIcons]}
                            <span className="text-xs capitalize">{amenity}</span>
                        </div>
                    ))}
                </div>
            </CardBody>

            {/* <CardFooter className="p-4 pt-0 flex gap-2">
                <Button 
                    variant="outline" 
                    className="flex-1"
                    asChild
                >
                    <Link href={`/hotel/${id}`}>View Details</Link>
                </Button>
                <Button 
                    variant="default" 
                    className="flex-1"
                    asChild
                >
                    <Link href={`/booking?hotel=${id}`}>Book Now</Link>
                </Button>
            </CardFooter> */}
        </Card>
    )
}

export default HotelCard