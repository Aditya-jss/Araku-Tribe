import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import * as adminAuthApi from '../api/adminAuthApi'
import { AdminApiError } from '../api/adminClient'
import { useAdminAuth } from '../context/AdminAuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function AdminLogin() {
  const { completeLogin } = useAdminAuth()
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
      const res = await adminAuthApi.login(values.email, values.password)
      completeLogin(res.token, res.admin)
      navigate('/admin', { replace: true })
    } catch (err) {
      setFormError(err instanceof AdminApiError ? err.message : 'Login failed')
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: 'var(--color-brand-cream)' }}
    >
      <div className="w-full max-w-sm rounded-lg border bg-white p-8">
        <h1 className="mb-1 text-center text-2xl font-bold" style={{ color: 'var(--color-brand-brown)' }}>
          ARAKU TRIBE
        </h1>
        <p className="mb-6 text-center text-sm text-brand-muted">Admin sign in</p>

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
            <Link to="/admin/forgot-password" className="underline">
              Forgot password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
