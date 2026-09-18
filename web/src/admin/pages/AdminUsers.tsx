import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as adminUsersApi from '../api/adminUsersApi'

export function AdminUsers() {
  const [search, setSearch] = useState('')
  const [committed, setCommitted] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', committed],
    queryFn: () => adminUsersApi.listUsers({ search: committed || undefined, page_size: 50 }),
  })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl">Customers</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setCommitted(search)
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-72 rounded border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded border px-4 py-2 text-sm">
          Search
        </button>
      </form>

      {isLoading && <p className="text-brand-muted">Loading…</p>}
      {isError && <p className="text-red-600">Could not load customers.</p>}

      {data && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Verified</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.user_id} className="border-b">
                <td className="py-2">
                  {u.firstname} {u.lastname}
                </td>
                <td className="py-2">{u.email}</td>
                <td className="py-2">{u.phonenumber}</td>
                <td className="py-2">{u.is_verified ? 'Yes' : 'No'}</td>
                <td className="py-2 text-right">
                  <Link to={`/admin/users/${u.user_id}`} className="text-xs underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {data.users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-brand-muted">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
