import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import User from "@/databases/user.model";
import dbConnect from "@/lib/db";
import Hotel from "@/databases/hotel.model";
import { v2 as cloudinary } from "cloudinary";



// Validate configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary environment variables');
}
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: 'Clerk user not found' }, { status: 404 });
        }

        // 2. Connect to database
        await dbConnect();

        // 3. Verify user exists in database
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }

        // 4. Extract FormData
        const formData = await request.formData();

        const hotelName = formData.get('hotelName') as string;
        const description = formData.get('description') as string;
        const city = formData.get('city') as string;
        const country = formData.get('country') as string;
        const address = formData.get('address') as string;
        const ownerName = formData.get('ownerName') as string;
        const contactEmail = formData.get('contactEmail') as string;
        const phone = formData.get('phone') as string;
        const images = formData.getAll('images') as File[];

        // 5. Validate required fields
        if (!hotelName || !description || !city || !country || !address ||
            !ownerName || !contactEmail || !phone) {
            return NextResponse.json({
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // 6. Validate images
        if (images.length === 0) {
            return NextResponse.json({
                error: 'At least one image is required'
            }, { status: 400 });
        }

        if (images.length > 10) {
            return NextResponse.json({
                error: 'Maximum 10 images allowed'
            }, { status: 400 });
        }

        // Validate image types and sizes
        const invalidImages = images.filter(image => {
            const isValidType = image.type.startsWith('image/');
            const isValidSize = image.size <= 10 * 1024 * 1024; // 10MB
            return !isValidType || !isValidSize;
        });

        if (invalidImages.length > 0) {
            return NextResponse.json({
                error: 'All images must be valid image files under 10MB'
            }, { status: 400 });
        }

        const imageUrls = await Promise.all(images.map(async (image) => {
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
                cloudinary.uploader.upload_stream({
                    resource_type: "image",
                    folder: "Hotels"
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({ secure_url: result?.secure_url || '' });
                    }
                }).end(buffer);
            });
            return uploadResult.secure_url;
        }));
        // console.log('Array of image URLs:',imageUrls);
        // 8. Check if hotel with same name already exists for this user
        const existingHotel = await Hotel.findOne({
            ownerId: userId
        });

        if (existingHotel) {
            return NextResponse.json({
                error: 'You already have a hotel registered. Each owner can only register one hotel.'
            }, { status: 409 });
        }

        function generateSlug(name: string, suffix?: number): string {
            const baseSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
                .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
            return suffix ? `${baseSlug}-${suffix}` : baseSlug;
        }

        // Generate unique slug with collision handling
        let slug = generateSlug(hotelName);
        let suffix = 1;
        while (await Hotel.findOne({ slug })) {
            slug = generateSlug(hotelName, suffix++);
        }

        if (suffix > 100) {  // Prevent infinite loops
            return NextResponse.json({
                error: 'Unable to generate unique slug. Please use a different hotel name.'
            }, { status: 400 });
        }

        // 10. Create hotel registration
        const hotel = await Hotel.create({
            slug: slug,
            name: hotelName,
            description: description,
            city: city,
            country: country,
            fullAddress: address,
            ownerName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || ownerName,  // Fallback to form's ownerName if Clerk names unavailable
            contactEmail: contactEmail,
            contactPhone: phone,
            images: imageUrls,
            ownerId: userId,
            location: `${city}, ${country}`,
        });

        // 11. Return success response
        return NextResponse.json({
            success: true,
            message: 'Hotel registration submitted successfully! Pending admin approval.',
            hotel: {
                id: hotel._id,
                name: hotel.name,
                slug: hotel.slug,
                status: hotel.status,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Hotel registration error:', error);
        return NextResponse.json({
            error: 'Failed to register hotel. Please try again.'
        }, { status: 500 });
    }
}