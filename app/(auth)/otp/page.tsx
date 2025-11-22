'use client'
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSignIn } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from "sonner"
const OTPPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      })

      if (result.status === 'complete') {
        toast.success('Password reset successful')
        await setActive({ session: result.createdSessionId })
        router.push('/')
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Invalid code or password')
    }
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <p className="text-muted-foreground text-sm text-balance">
        Enter the code sent to {email || 'your email'}
      </p>
      <FieldGroup className="mt-6">
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <Field>
          <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
          <Input
            id="otp"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={!isLoaded}>
            Reset Password
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default OTPPage