import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import * as adminAuthApi from '../api/adminAuthApi'
import { AdminApiError } from '../api/adminClient'

const schema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
  password: z.string().min(8, 'At least 8 characters'),
})
type FormValues = z.infer<typeof schema>

export function AdminResetPassword() {
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
      await adminAuthApi.resetPassword(values.otp, values.password)
      navigate('/admin/login')
    } catch (err) {
      setFormError(err instanceof AdminApiError ? err.message : 'Reset failed')
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: 'var(--color-brand-cream)' }}
    >
      <div className="w-full max-w-sm rounded-lg border bg-white p-8">
        <h1 className="mb-6 text-center text-2xl">Reset Password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="otp" className="mb-1 block text-sm font-medium">
              One-time code
            </label>
            <input id="otp" maxLength={6} className="w-full rounded border px-3 py-2 tracking-widest" {...register('otp')} />
            {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              New password
            </label>
            <input id="password" type="password" className="w-full rounded border px-3 py-2" {...register('password')} />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
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
        </form>
      </div>
    </div>
  )
}
