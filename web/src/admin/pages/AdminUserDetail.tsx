import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import * as adminUsersApi from '../api/adminUsersApi'
import { AdminApiError } from '../api/adminClient'
import { useAdminAuth } from '../context/AdminAuthContext'
import { formatPrice } from '../../lib/format'

const schema = z.object({
  firstname: z.string().min(1, 'Required'),
  lastname: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phonenumber: z.string().min(10, 'Enter a valid phone number'),
})
type FormValues = z.infer<typeof schema>

export function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>()
  const { hasRoleAtLeast } = useAdminAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const id = Number(userId)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminUsersApi.getUser(id),
    enabled: !!id,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (data) {
      reset({ firstname: data.firstname, lastname: data.lastname, email: data.email, phonenumber: data.phonenumber })
    }
  }, [data, reset])

  const deleteUser = useMutation({
    mutationFn: () => adminUsersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      navigate('/admin/users')
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await adminUsersApi.updateUser(id, values)
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    } catch (err) {
      setError('root', { message: err instanceof AdminApiError ? err.message : 'Could not save changes' })
    }
  }

  if (isLoading) return <p className="p-8 text-brand-muted">Loading…</p>
  if (isError || !data) return <p className="p-8 text-red-600">Customer not found.</p>

  return (
    <div className="p-8">
      <Link to="/admin/users" className="mb-6 inline-block text-sm underline">
        ← Back to customers
      </Link>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h1 className="mb-4 text-2xl">Edit Customer</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="mb-1 block text-sm font-medium">
                  First name
                </label>
                <input id="firstname" className="w-full rounded border px-3 py-2" {...register('firstname')} />
              </div>
              <div>
                <label htmlFor="lastname" className="mb-1 block text-sm font-medium">
                  Last name
                </label>
                <input id="lastname" className="w-full rounded border px-3 py-2" {...register('lastname')} />
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
                Phone
              </label>
              <input id="phonenumber" className="w-full rounded border px-3 py-2" {...register('phonenumber')} />
            </div>

            {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded py-2.5 font-bold text-black disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-brand-gold)' }}
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </form>

          {hasRoleAtLeast('superadmin') && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this customer account? This cannot be undone.')) deleteUser.mutate()
              }}
              className="mt-6 rounded border border-red-600 px-4 py-2 text-sm text-red-600"
            >
              Delete Customer
            </button>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">Order History</h2>
          <ul className="divide-y rounded border">
            {data.orders.map((o) => (
              <li key={o.order_id} className="flex justify-between px-4 py-3 text-sm">
                <span>
                  Order #{o.order_id} — {o.order_status}
                </span>
                <span>{formatPrice(o.total_amount)}</span>
              </li>
            ))}
            {data.orders.length === 0 && <li className="px-4 py-3 text-sm text-brand-muted">No orders yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
