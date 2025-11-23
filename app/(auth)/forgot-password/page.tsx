'use client'
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSignIn } from '@clerk/nextjs'
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

const ForgotPasswordPage = () => {
  const { isLoaded, signIn } = useSignIn()
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      
      // Only clear email and redirect on success
      setEmail('')
      toast.success('Password reset code sent! Check your email.')
      setTimeout(() => {
        router.push(`/otp?email=${encodeURIComponent(email)}`)
      }, 1500)
    } catch (err: unknown) {
      // Use Clerk's type guard to safely extract error message
      if (isClerkAPIResponseError(err)) {
        toast.error(err.errors?.[0]?.message || 'Failed to send reset email')
      } else {
        toast.error('Failed to send reset email')
      }
    }
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Forgot your password?</h1>
      <p className="text-muted-foreground text-sm text-balance">
        Enter your email below to reset your password
      </p>
      <FieldGroup className="mt-6">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <div id="clerk-captcha"></div>
        <Field>
          <Button type="submit" disabled={!isLoaded}>Reset Password</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default ForgotPasswordPage