import mongoose, { Schema, Model, Document } from 'mongoose';
import Room from './room.model';
import Review from './review.model';
import { IRoom } from './room.model';
import { IReview } from './review.model';
import { HotelStatus } from '@/types';

// Main Hotel Interface
interface IHotel {
    slug: string                    // URL-friendly identifier
    name: string
    category?: string               // e.g., "Luxury", "Budget", "Resort"

    // Location
    location: string                // Short location (e.g., "Colombo, Sri Lanka")
    fullAddress: string             // Complete address
    coordinates?: {
        lat: number
        lng: number
    }
    city: string
    country: string

    // Pricing
    price: number                   // Starting price per night (base room)
    currency?: string               // Default: "USD"

    // Ratings & Reviews
    rating: number                  // Average rating (1-5)
    reviewsCount: number            // Total number of reviews

    // Content
    description: string             // Full hotel description (can be multi-paragraph)

    // Media
    images: string[]                // Array of image URLs (first is primary)

    // Amenities
    amenities: string[]             // Array of amenity IDs

    // Policies & Info
    checkIn: string                 // e.g., "2:00 PM"
    checkOut: string                // e.g., "12:00 PM"
    languages: string[]             // Languages spoken by staff
    policies: string[]              // Hotel rules and policies


    // Metadata
    verified?: boolean              // Property verification status
    featured?: boolean              // Featured on homepage
    status: HotelStatus                // "pending", "approved", "rejected"
    
    // Publishing
    publishStatus?: 'draft' | 'publish_requested' | 'published' | 'publish_rejected'  // Publishing workflow status
    isPublished?: boolean              // Whether hotel is live on client side
    publishRejectionReason?: string    // Reason if publish was rejected
    publishChangeRequest?: string      // Admin feedback for changes

    // Owner/Management
    ownerId?: string
    ownerName?: string
    contactEmail?: string
    contactPhone?: string
}



const hotelSchema = new Schema<IHotel>({
    // ✅ Required at registration
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    fullAddress: { type: String, required: true },
    location: { type: String, required: true }, // Generated: "City, Country"
    images: { type: [String], required: true, validate: [arrayLimit, 'Max 10 images'] },

    // Owner Info (Required at registration)
    ownerId: { type: String, required: true },
    ownerName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },

    // ✅ Optional at registration (can be added later)
    category: { type: String },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },

    // ✅ Auto-generated/Default values
    price: { type: Number, default: 0 },           // Set when rooms added
    currency: { type: String, default: 'USD' },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },

    // ✅ Optional/Default values
    amenities: { type: [String], default: [] },
    checkIn: { type: String, default: '2:00 PM' },
    checkOut: { type: String, default: '12:00 PM' },
    languages: { type: [String], default: ['English'] },
    policies: { type: [String], default: [] },

    // ✅ Status & Metadata
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    
    // ✅ Publishing Status
    publishStatus: {
        type: String,
        enum: ['draft', 'publish_requested', 'published', 'publish_rejected'],
        default: 'draft'
    },
    isPublished: { type: Boolean, default: false },
    publishRejectionReason: { type: String },
    publishChangeRequest: { type: String },
}, { timestamps: true });

// Custom validator for max 10 images
function arrayLimit(val: string[]) {
    return val.length <= 10;
}


// Create unique index on slug for faster lookups
hotelSchema.index({ slug: 1 }, { unique: true });


const Hotel: Model<IHotel> = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', hotelSchema);

export default Hotel;