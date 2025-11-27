import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IChangeRequest extends Document {
  hotelId: mongoose.Types.ObjectId;
  managerId: string; // Clerk user ID
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  
  // Manager notes (optional context for changes)
  managerNotes?: string;
  
  // Admin feedback (when rejected)
  adminFeedback?: string;
  reviewedBy?: string; // Admin user ID
  reviewedAt?: Date;
  
  // Changes grouped by type
  hotelChanges?: {
    category?: string;
    coordinates?: { lat: number; lng: number };
    amenities?: string[];
    checkIn?: string;
    checkOut?: string;
    languages?: string[];
    policies?: string[];
    description?: string;
    images?: string[];
  };
  
  roomChanges?: Array<{
    action: 'create' | 'update' | 'delete';
    roomId?: string; // For update/delete
    data?: any; // Room data for create/update
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const changeRequestSchema = new Schema<IChangeRequest>({
  hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
  managerId: { type: String, required: true },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  managerNotes: { type: String },
  adminFeedback: { type: String },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  
  hotelChanges: {
    category: { type: String, required: false },
    coordinates: {
      type: {
        lat: { type: Number },
        lng: { type: Number }
      },
      _id: false,
      required: false
    },
    amenities: { type: [String], required: false },
    checkIn: { type: String, required: false },
    checkOut: { type: String, required: false },
    languages: { type: [String], required: false },
    policies: { type: [String], required: false },
    description: { type: String, required: false },
    images: { type: [String], required: false }
  },
  
  roomChanges: [{
    action: {
      type: String,
      enum: ['create', 'update', 'delete'],
      required: true
    },
    roomId: { type: String },
    data: { type: Schema.Types.Mixed }
  }]
}, { timestamps: true });

// Index for finding pending requests for a hotel
changeRequestSchema.index({ hotelId: 1, status: 1 });

const ChangeRequest: Model<IChangeRequest> = mongoose.models.ChangeRequest || mongoose.model<IChangeRequest>('ChangeRequest', changeRequestSchema);

export default ChangeRequest;

