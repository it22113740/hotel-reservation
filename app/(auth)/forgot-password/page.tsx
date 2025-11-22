'use client'
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSignIn } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

const ForgotPasswordPage = () => {
  const { isLoaded, signIn } = useSignIn()
  const [email, setEmail] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      }).then(() => {
        toast.success('Password reset code sent! Check your email.')
        router.push(`/otp?email=${encodeURIComponent(email)}`)
      })
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Failed to send reset email')
    } finally {
      setEmail('')
    }
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Forgot your password?</h1>
      <p className="text-muted-foreground text-sm text-balance">
        Enter your email below to reset your password
      </p>
      <FieldGroup className="mt-6">
        {successMessage && (
          <div className="text-green-500 text-sm text-center">{successMessage}</div>
        )}
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
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
        <Field>
          <Button type="submit" disabled={!isLoaded}>Reset Password</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default ForgotPasswordPage