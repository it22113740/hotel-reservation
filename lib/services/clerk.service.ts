'use server'

import { clerkClient } from '@clerk/nextjs/server'
import User from '@/databases/user.model'

/**
 * Create or update Clerk user and set role as manager
 */
export async function updateManagerUser({
    email
}: {
    email: string
}) {
    try {
        const clerk = await clerkClient()

        // Check if user already exists
        const existingUsers = await clerk.users.getUserList({
            emailAddress: [email]
        })
//If user exists, update role to manager and update in the database
        if (existingUsers.data.length > 0) {
            // User exists - update role to manager
            const user = existingUsers.data[0]

            await clerk.users.updateUser(user.id, {
                unsafeMetadata: {
                    role: 'manager'
                }
            })
            await User.updateOne({ clerkId: user.id }, { role: 'manager' })

            console.log(`✅ Updated existing user ${email} to manager role`)
            return { success: true, message: 'Manager user updated successfully' }

        } else {
            return { success: false, message: 'Manager user not found' }
        }

    } catch {
        return { success: false, message: 'Failed to update manager user' }
    }
}