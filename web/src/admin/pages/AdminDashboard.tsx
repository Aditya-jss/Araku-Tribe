import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import * as adminDashboardApi from '../api/adminDashboardApi'
import { formatPrice } from '../../lib/format'

export function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminDashboardApi.getDashboard,
  })

  if (isLoading) return <p className="p-8 text-brand-muted">Loading…</p>
  if (isError || !data) return <p className="p-8 text-red-600">Could not load dashboard.</p>

  const cards = [
    { label: 'Total Orders', value: data.total_orders },
    { label: 'Total Customers', value: data.total_users },
    { label: 'Revenue (paid orders)', value: formatPrice(data.total_revenue) },
    { label: 'Low Stock Products', value: data.low_stock_count, link: '/admin/inventory-alerts' },
  ]

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {cards.map((card) => {
          const body = (
            <>
              <p className="text-sm text-brand-muted">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </>
          )
          return card.link ? (
            <Link key={card.label} to={card.link} className="rounded-lg border p-5 hover:shadow-md">
              {body}
            </Link>
          ) : (
            <div key={card.label} className="rounded-lg border p-5">
              {body}
            </div>
          )
        })}
      </div>

      <h2 className="mb-3 font-bold">Orders by Status</h2>
      <ul className="divide-y rounded border">
        {Object.entries(data.orders_by_status).map(([status, count]) => (
          <li key={status} className="flex justify-between px-4 py-3 text-sm">
            <span>{status}</span>
            <span className="font-medium">{count}</span>
          </li>
        ))}
        {Object.keys(data.orders_by_status).length === 0 && (
          <li className="px-4 py-3 text-sm text-brand-muted">No orders yet.</li>
        )}
      </ul>
    </div>
  )
}
