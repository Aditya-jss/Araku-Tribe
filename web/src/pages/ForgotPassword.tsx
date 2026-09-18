import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import * as authApi from '../api/authApi'
import { ApiError } from '../api/client'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPassword() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await authApi.forgotPassword(values.email)
      navigate('/reset-password')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-center text-3xl">Forgot Password</h1>
      <p className="mb-6 text-center text-sm text-brand-muted">
        Enter your account email and we'll send you a one-time code to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" type="email" className="w-full rounded border px-3 py-2" {...register('email')} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded py-2.5 font-bold text-black disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-brand-gold)' }}
        >
          {isSubmitting ? 'Sending…' : 'Send Reset Code'}
        </button>

        <p className="text-center text-sm">
          <Link to="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
