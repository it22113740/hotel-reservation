import dbConnect from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/databases/user.model";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: 'Clerk user not found' }, { status: 404 });
        }
        await dbConnect();
        let user = await User.findOne({ clerkId: userId });
        if (user) {
            return NextResponse.json({ user }, { status: 200 });
        }
        user = await User.create({
            clerkId: userId,
            name: clerkUser.firstName + ' ' + clerkUser.lastName,
            email: clerkUser.emailAddresses[0].emailAddress,
            role: 'user',
            emailVerified: true,
        });
        return NextResponse.json({ user }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}