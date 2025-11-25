// types/user.types.ts

/**
 * User Role
 */
export type UserRole = 'user' | 'manager' | 'admin'

/**
 * User Interface (for UI/API)
 */
export interface User {
  id: string
  clerkId: string
  name: string
  email: string
  role: UserRole
  emailVerified: boolean
  createdAt: string
}