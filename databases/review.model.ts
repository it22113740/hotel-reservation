import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IReview {
    hotelId: mongoose.Types.ObjectId                 // Reference to hotel

    // Reviewer Information
    userId?: mongoose.Types.ObjectId                 // If registered user
    author: string                  // Display name
    avatar?: string                 // Profile picture URL
    verified?: boolean              // Verified stay

    // Review Content
    rating: number                  // 1-5 stars
    title?: string                  // Review headline
    comment: string                 // Review text

    // Media
    images?: string[]               // Photos from guest

    // Engagement
    helpful: number                 // Helpful votes count

    // Metadata
    date: string                    // Review date (formatted)
    stayDate?: string               // Actual stay date
    roomType?: string               // Room stayed in
    tripType?: string               // "Business", "Leisure", "Family"

    // Moderation
    approved?: boolean
    flagged?: boolean

}


const reviewSchema = new Schema<IReview>({
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    author: { type: String, required: true },
    avatar: { type: String },
    verified: { type: Boolean, default: false },
    rating: { type: Number, required: true },
    title: { type: String },
    comment: { type: String, required: true },
    images: { type: [String] },
    helpful: { type: Number, required: true ,default: 0},
    stayDate: { type: String },
    roomType: { type: String },
    tripType: { type: String },
    approved: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false },
    date: { type: String, required: true },
}, { timestamps: true });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

export default Review;