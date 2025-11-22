import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent} from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/databases/user.model";

export async function POST(request: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if(!WEBHOOK_SECRET){
        return NextResponse.json({ error: 'CLERK_WEBHOOK_SECRET is not set' }, { status: 500 });
    }
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');
    if(!svix_id || !svix_timestamp || !svix_signature){
        return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }
    const playload = await request.json();
    const body = JSON.stringify(playload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid svix payload' }, { status: 400 });
    }

    await dbConnect();
    switch (evt.type) {
        case 'user.created':
            await User.create({
                clerkId: evt.data.id,
                name: evt.data.first_name + ' ' + evt.data.last_name,
                email: evt.data.email_addresses[0].email_address,
                role: 'user',
                emailVerified: true,
            });
            break;
        case 'user.updated':
            await User.findOneAndUpdate({
                clerkId: evt.data.id,
            },
        {
            name: evt.data.first_name + ' ' + evt.data.last_name,
            email: evt.data.email_addresses[0].email_address,
            emailVerified: true,
        });
            break;
        case 'user.deleted':
            await User.findOneAndDelete({
                clerkId: evt.data.id,
            });
            break;
    }
    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
}