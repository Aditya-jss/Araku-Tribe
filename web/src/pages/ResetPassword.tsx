import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import * as authApi from '../api/authApi'
import { ApiError } from '../api/client'

const schema = z
  .object({
    otp: z.string().length(6, 'Enter the 6-digit code'),
    password: z.string().min(8, 'At least 8 characters'),
    repeat_password: z.string(),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: 'Passwords do not match',
    path: ['repeat_password'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPassword() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await authApi.resetPassword(values)
      setDone(true)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Reset failed')
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="mb-4 text-3xl">Password Reset</h1>
        <p className="mb-6 text-brand-muted">You can now sign in with your new password.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="rounded px-6 py-2.5 font-bold text-black"
          style={{ backgroundColor: 'var(--color-brand-gold)' }}
        >
          Go to Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-center text-3xl">Reset Password</h1>
      <p className="mb-6 text-center text-sm text-brand-muted">
        Enter the code we emailed you along with your new password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="otp" className="mb-1 block text-sm font-medium">
            One-time code
          </label>
          <input id="otp" inputMode="numeric" maxLength={6} className="w-full rounded border px-3 py-2 tracking-widest" {...register('otp')} />
          {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            New password
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
            Confirm new password
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
          {isSubmitting ? 'Resetting…' : 'Reset Password'}
        </button>

        <p className="text-center text-sm">
          <Link to="/forgot-password" className="underline">
            Didn't get a code? Request again
          </Link>
        </p>
      </form>
    </div>
  )
}
