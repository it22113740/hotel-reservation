import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IRoom {
    hotelId: mongoose.Types.ObjectId                 // Reference to hotel
    name: string                    // e.g., "Deluxe Room", "Executive Suite"
    description?: string            // Room description
    image: string                   // Primary room image
    images?: string[]               // Additional room images

    // Capacity
    capacity: number                // Maximum guests
    beds: string                    // e.g., "1 King Bed", "2 Twin Beds"

    // Specifications
    size: string                    // e.g., "35 m²"
    view?: string                   // e.g., "Ocean View", "City View"
    floor?: string                  // e.g., "3rd Floor"

    // Room Amenities (in addition to hotel amenities)
    amenities: string[]

    // Pricing & Availability
    price: number                   // Price per night
    available: number               // Number of rooms available
    maxOccupancy?: number           // Different from capacity

    // Booking Rules
    minNights?: number              // Minimum stay requirement
    maxNights?: number              // Maximum stay allowed
}



const roomSchema = new Schema<IRoom>({
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    images: { type: [String] },
    capacity: { type: Number, required: true },
    beds: { type: String, required: true },
    size: { type: String, required: true },
    view: { type: String },
    floor: { type: String },
    amenities: {
        type: [String], enum: [
            "wifi", "parking", "restaurant", "gym", "ac",
            "pool", "spa", "bar", "24hour", "breakfast",
            "tv", "concierge", "security", "laundry",
            "airport_shuttle", "pet_friendly", "conference_room", "room_service"
        ],
        default: []
    },
    price: { type: Number, required: true },
    available: { type: Number, required: true },
    maxOccupancy: { type: Number },
    minNights: { type: Number },
    maxNights: { type: Number },
}, { timestamps: true });

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema);

export default Room;