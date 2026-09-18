import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../api/client'
import * as profileApi from '../api/profileApi'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  password: z.string().min(1, 'Password is required'),
  reason: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function AccountDelete() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await profileApi.deleteAccount(values)
      await logout()
      navigate('/', { replace: true })
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Could not delete account' })
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-center text-3xl">Delete Account</h1>
      <p className="mb-6 text-center text-sm text-brand-muted">
        This permanently deletes your account, cart, and order history. This cannot be undone.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Confirm your password
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
          <label htmlFor="reason" className="mb-1 block text-sm font-medium">
            Reason (optional)
          </label>
          <textarea id="reason" rows={3} className="w-full rounded border px-3 py-2" {...register('reason')} />
        </div>

        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-red-600 py-2.5 font-bold text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Deleting…' : 'Permanently Delete Account'}
        </button>
      </form>
    </div>
  )
}
