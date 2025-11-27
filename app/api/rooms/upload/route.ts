// app/api/rooms/upload/route.ts
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import Hotel from "@/databases/hotel.model"
import dbConnect from "@/lib/db"

// Validate configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary environment variables')
}
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Connect to database
        await dbConnect()

        // 3. Verify user has a hotel
        const hotel = await Hotel.findOne({ ownerId: userId })
        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
        }

        // 4. Extract FormData
        const formData = await request.formData()
        const images = formData.getAll('images') as File[]

        // 5. Validate images
        if (images.length === 0) {
            return NextResponse.json({
                error: 'At least one image is required'
            }, { status: 400 })
        }

        if (images.length > 5) {
            return NextResponse.json({
                error: 'Maximum 5 images allowed per room'
            }, { status: 400 })
        }

        // Validate image types and sizes
        const invalidImages = images.filter(image => {
            const isValidType = image.type.startsWith('image/')
            const isValidSize = image.size <= 10 * 1024 * 1024 // 10MB
            return !isValidType || !isValidSize
        })

        if (invalidImages.length > 0) {
            return NextResponse.json({
                error: 'All images must be valid image files under 10MB'
            }, { status: 400 })
        }

        // 6. Upload images to Cloudinary
        const imageUrls = await Promise.all(images.map(async (image) => {
            const arrayBuffer = await image.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
                cloudinary.uploader.upload_stream({
                    resource_type: "image",
                    folder: "Rooms"
                }, (error, result) => {
                    if (error) {
                        reject(error)
                    } else if (!result?.secure_url) {
                        reject(new Error('Upload succeeded but no URL returned'))
                    } else {
                        resolve({ secure_url: result.secure_url })
                    }
                }).end(buffer)
            })
            return uploadResult.secure_url
        }))

        // 7. Return success response
        return NextResponse.json({
            success: true,
            images: imageUrls
        }, { status: 200 })

    } catch (error) {
        console.error('Room image upload error:', error)
        return NextResponse.json({
            error: 'Failed to upload images. Please try again.'
        }, { status: 500 })
    }
}

