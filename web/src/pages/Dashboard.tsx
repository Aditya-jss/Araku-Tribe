import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import * as ordersApi from '../api/ordersApi'
import * as profileApi from '../api/profileApi'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../lib/format'

const ACTIVE_STATUSES = new Set(['Processing', 'Out for Delivery'])

export function Dashboard() {
  const { user } = useAuth()

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.listOrders,
  })
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  })

  const orders = ordersData?.orders ?? []
  const totalOrders = orders.length
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.has(o.order_status)).length
  const deliveredOrders = orders.filter((o) => o.order_status === 'Delivered').length
  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0)
  const recentOrders = orders.slice(0, 5)
  const profile = profileData?.user

  const addressIncomplete = profile ? !profile.area || !profile.zipcode : false

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-1 text-3xl">Welcome back, {user?.firstname ?? 'there'}!</h1>
      <p className="mb-8 text-brand-muted">Here's what's happening with your account.</p>

      {addressIncomplete && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <span>Add a shipping address to speed up checkout next time.</span>
          <Link to="/account/edit" className="font-bold underline">
            Add address
          </Link>
        </div>
      )}

      <div className="mb-10 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-brand-muted">Total Orders</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-brand-muted">In Progress</p>
          <p className="text-2xl font-bold">{activeOrders}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-brand-muted">Delivered</p>
          <p className="text-2xl font-bold">{deliveredOrders}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-brand-muted">Total Spent</p>
          <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
        </div>
      </div>

      <div className="grid gap-10 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link to="/orders" className="text-sm underline">
              View all
            </Link>
          </div>

          {ordersLoading && <p className="text-sm text-brand-muted">Loading…</p>}

          {!ordersLoading && recentOrders.length === 0 && (
            <div className="rounded-lg border bg-white p-6 text-center">
              <p className="mb-4 text-brand-muted">You haven't placed any orders yet.</p>
              <Link
                to="/products/bag"
                className="inline-block rounded px-5 py-2 font-bold text-black"
                style={{ backgroundColor: 'var(--color-brand-gold)' }}
              >
                Start Shopping
              </Link>
            </div>
          )}

          {recentOrders.length > 0 && (
            <ul className="divide-y rounded-lg border bg-white">
              {recentOrders.map((o) => (
                <li key={o.order_id}>
                  <Link
                    to={`/orders/${o.order_id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">Order #{o.order_id}</p>
                      <p className="text-sm text-brand-muted">{new Date(o.order_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(o.total_amount)}</p>
                      <p className="text-sm text-brand-muted">{o.order_status}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Link to="/products/bag" className="rounded border px-4 py-2.5 text-sm hover:bg-gray-50">
              Browse Products
            </Link>
            <Link to="/cart" className="rounded border px-4 py-2.5 text-sm hover:bg-gray-50">
              View Cart
            </Link>
            <Link to="/account/edit" className="rounded border px-4 py-2.5 text-sm hover:bg-gray-50">
              Edit Profile
            </Link>
            <Link to="/account" className="rounded border px-4 py-2.5 text-sm hover:bg-gray-50">
              Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
