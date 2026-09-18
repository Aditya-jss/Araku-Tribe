import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import * as authApi from '../api/authApi'
import { ApiError } from '../api/client'
import { OtpStep } from '../components/OtpStep'
import { useAuth } from '../context/AuthContext'

const schema = z
  .object({
    firstname: z.string().min(1, 'Required'),
    lastname: z.string().min(1, 'Required'),
    email: z.string().email('Enter a valid email'),
    phonenumber: z.string().min(10, 'Enter a valid phone number'),
    password: z.string().min(8, 'At least 8 characters'),
    repeat_password: z.string(),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: 'Passwords do not match',
    path: ['repeat_password'],
  })

type FormValues = z.infer<typeof schema>

export function Signup() {
  const { completeLogin } = useAuth()
  const navigate = useNavigate()

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
      await authApi.signup(values)
      setEmail(values.email)
      setStep('otp')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Signup failed')
    }
  }

  async function onVerify(otp: string) {
    const res = await authApi.verifyOtp(otp)
    completeLogin(res.token, res.user)
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-center text-3xl">Create Account</h1>

      {step === 'form' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstname" className="mb-1 block text-sm font-medium">
                First name
              </label>
              <input id="firstname" className="w-full rounded border px-3 py-2" {...register('firstname')} />
              {errors.firstname && <p className="mt-1 text-sm text-red-600">{errors.firstname.message}</p>}
            </div>
            <div>
              <label htmlFor="lastname" className="mb-1 block text-sm font-medium">
                Last name
              </label>
              <input id="lastname" className="w-full rounded border px-3 py-2" {...register('lastname')} />
              {errors.lastname && <p className="mt-1 text-sm text-red-600">{errors.lastname.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input id="email" type="email" className="w-full rounded border px-3 py-2" {...register('email')} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phonenumber" className="mb-1 block text-sm font-medium">
              Phone number
            </label>
            <input id="phonenumber" className="w-full rounded border px-3 py-2" {...register('phonenumber')} />
            {errors.phonenumber && <p className="mt-1 text-sm text-red-600">{errors.phonenumber.message}</p>}
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

          <div>
            <label htmlFor="repeat_password" className="mb-1 block text-sm font-medium">
              Confirm password
            </label>
            <input
              id="repeat_password"
              type="password"
              className="w-full rounded border px-3 py-2"
              {...register('repeat_password')}
            />
            {errors.repeat_password && (
              <p className="mt-1 text-sm text-red-600">{errors.repeat_password.message}</p>
            )}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded py-2.5 font-bold text-black disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-brand-gold)' }}
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline">
              Sign in
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
