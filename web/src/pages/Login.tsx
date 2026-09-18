import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import * as authApi from '../api/authApi'
import { ApiError } from '../api/client'
import { OtpStep } from '../components/OtpStep'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function Login() {
  const { completeLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [formError, setFormError] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await authApi.login(values)
      setEmail(values.email)
      setStep('otp')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Login failed')
    }
  }

  async function onVerify(otp: string) {
    const res = await authApi.verifyOtp(otp)
    completeLogin(res.token, res.user)
    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-center text-3xl">Sign In</h1>

      {step === 'form' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input id="email" type="email" className="w-full rounded border px-3 py-2" {...register('email')} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded border px-3 py-2"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded py-2.5 font-bold text-black disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-brand-gold)' }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-sm">
            <Link to="/forgot-password" className="underline">
              Forgot password?
            </Link>
          </p>
          <p className="text-center text-sm">
            New here?{' '}
            <Link to="/signup" className="font-bold underline">
              Create an account
            </Link>
          </p>
        </form>
      ) : (
        <OtpStep
          message={`Enter the code sent to ${email}.`}
          onSubmit={onVerify}
          onResend={() => authApi.resendOtp().then(() => undefined)}
        />
      )}
    </div>
  )
}
