import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IUser extends Document {
    clerkId: string;  // Link to Clerk user
    name: string;
    email: string;
    role: 'user' | 'manager' | 'admin';
    emailVerified: boolean;
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user' },
    emailVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;