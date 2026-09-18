import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import * as adminAdminsApi from '../api/adminAdminsApi'
import { AdminApiError } from '../api/adminClient'
import { useAdminAuth } from '../context/AdminAuthContext'

const ROLES = ['staff', 'manager', 'admin', 'superadmin'] as const

const createSchema = z.object({
  firstname: z.string().min(1, 'Required'),
  lastname: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  role: z.enum(ROLES),
})
type CreateValues = z.infer<typeof createSchema>

export function AdminAdmins() {
  const { admin: currentAdmin } = useAdminAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: adminAdminsApi.listAdmins,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({ resolver: zodResolver(createSchema), defaultValues: { role: 'staff' } })

  const createAdmin = useMutation({
    mutationFn: (values: CreateValues) => adminAdminsApi.createAdmin(values),
    onSuccess: () => {
      setError(null)
      reset()
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] })
    },
    onError: (err) => setError(err instanceof AdminApiError ? err.message : 'Could not create admin'),
  })

  const updateRole = useMutation({
    mutationFn: ({ id, role, firstname, lastname }: { id: number; role: string; firstname: string; lastname: string }) =>
      adminAdminsApi.updateAdmin(id, { firstname, lastname, role }),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] })
    },
    onError: (err) => setError(err instanceof AdminApiError ? err.message : 'Could not update admin'),
  })

  const deleteAdmin = useMutation({
    mutationFn: (id: number) => adminAdminsApi.deleteAdmin(id),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] })
    },
    onError: (err) => setError(err instanceof AdminApiError ? err.message : 'Could not delete admin'),
  })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl">Admin Accounts</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {isLoading && <p className="text-brand-muted">Loading…</p>}
      {isError && <p className="text-red-600">Could not load admins.</p>}

      {data && (
        <table className="mb-10 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.admins.map((a) => (
              <tr key={a.admin_id} className="border-b">
                <td className="py-2">
                  {a.firstname} {a.lastname}
                  {a.admin_id === currentAdmin?.admin_id && <span className="ml-2 text-xs text-brand-muted">(you)</span>}
                </td>
                <td className="py-2">{a.email}</td>
                <td className="py-2">
                  <select
                    value={a.role}
                    disabled={updateRole.isPending}
                    onChange={(e) =>
                      updateRole.mutate({ id: a.admin_id, role: e.target.value, firstname: a.firstname, lastname: a.lastname })
                    }
                    className="rounded border px-2 py-1"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 text-right">
                  {a.admin_id !== currentAdmin?.admin_id && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete admin ${a.email}?`)) deleteAdmin.mutate(a.admin_id)
                      }}
                      className="text-xs text-red-600 underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mb-4 text-lg font-bold">Add Admin</h2>
      <form
        onSubmit={handleSubmit((values) => createAdmin.mutate(values))}
        className="grid max-w-2xl grid-cols-2 gap-4"
      >
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
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" type="email" className="w-full rounded border px-3 py-2" {...register('email')} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Temporary password
          </label>
          <input id="password" type="password" className="w-full rounded border px-3 py-2" {...register('password')} />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium">
            Role
          </label>
          <select id="role" className="w-full rounded border px-3 py-2" {...register('role')}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded px-6 py-2.5 font-bold text-black disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-brand-gold)' }}
          >
            {isSubmitting ? 'Creating…' : 'Create Admin'}
          </button>
        </div>
      </form>
    </div>
  )
}
