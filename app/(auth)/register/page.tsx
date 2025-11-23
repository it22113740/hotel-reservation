'use client'
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useSignUp } from '@clerk/nextjs'
import { isClerkAPIResponseError } from '@clerk/nextjs/errors'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from "sonner"

export default function RegisterPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    // Clear any stale error messages
    setError('')

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      })

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
      toast.success('Verification code sent to your email!')
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors?.[0]?.message || 'Registration failed')
      } else {
        setError('An error occurred during registration')
      }
    }
  }

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    // Clear any stale error messages
    setError('')

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        toast.success('Account created successfully! Welcome!')
        router.push('/')
      }
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors?.[0]?.message || 'Verification failed')
      } else {
        setError('An error occurred during verification')
      }
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return
    
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      })
    } catch (err: unknown) {
      toast.error('Failed to sign up with Google')
    }
  }

  if (pendingVerification) {
    return (
      <form className="flex flex-col gap-6" onSubmit={handleVerify}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter the verification code sent to {email}
            </p>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <Field>
            <FieldLabel htmlFor="code">Verification Code</FieldLabel>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </Field>
          <Field>
            <div id="clerk-captcha"></div>
            <Button type="submit" disabled={!isLoaded}>Verify Email</Button>
          </Field>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your details below to create your account
          </p>
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Field>
        </div>
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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Field>
          <div id="clerk-captcha"></div>
          <Button type="submit" disabled={!isLoaded}>Register</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" onClick={handleGoogleSignUp}>
            <Image src="/images/search.png" alt="Google" width={20} height={20} />
            Register with Google
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Sign in
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}