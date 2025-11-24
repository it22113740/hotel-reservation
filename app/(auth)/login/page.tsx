'use client'
import { cn } from "@/lib/utils"
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
import { useSignIn } from "@clerk/nextjs"
import { isClerkAPIResponseError } from "@clerk/nextjs/errors"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/'


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        toast.success('Login successful')
        router.push(redirectUrl)
      }

      if (result.status === 'needs_second_factor') {
        const emailCodeFactor = result.supportedSecondFactors?.find(
          (factor) => factor.strategy === 'email_code'
        )

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          })

          setNeedsSecondFactor(true)
          toast.info('Verification code sent to your email')
        }
      }
    } catch (error: unknown) {
      if (isClerkAPIResponseError(error)) {
        toast.error(error.errors?.[0]?.message || 'Invalid email or password')
      } else {
        toast.error('An error occurred during login')
      }
    }
  }

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        toast.success('Login successful')
        router.push(redirectUrl)
      }
    } catch (error: unknown) {
      if (isClerkAPIResponseError(error)) {
        toast.error(error.errors?.[0]?.message || 'Invalid verification code')
      } else {
        toast.error('An error occurred during verification')
      }
    }
  }

  const handleGoogleLogin = async () => {
    if (!isLoaded) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      })
    } catch (error: unknown) {
      toast.error('Failed to sign in with Google')
    }
  }

  // Show verification code form if 2FA is required
  if (needsSecondFactor) {
    return (
      <form className="flex flex-col gap-6" onSubmit={handleVerifyCode}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter the verification code sent to {email}
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="code">Verification Code</FieldLabel>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="one-time-code"
            />
          </Field>
          <Field>
            <Button type="submit" disabled={!isLoaded}>
              Verify & Login
            </Button>
          </Field>
          <FieldDescription className="text-center">
            <button
              type="button"
              onClick={() => {
                setNeedsSecondFactor(false)
                setCode('')
              }}
              className="underline underline-offset-4"
            >
              Back to login
            </button>
          </FieldDescription>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div id="clerk-captcha"></div>
        <Field>
          <Button type="submit" disabled={!isLoaded}>Login</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" onClick={handleGoogleLogin}>
            <Image src="/images/search.png" alt="Google" width={20} height={20} />
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/register" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
