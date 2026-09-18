import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import * as ordersApi from '../api/ordersApi'
import { formatPrice } from '../lib/format'

export function Orders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.listOrders,
  })

  if (isLoading) return <p className="px-6 py-24 text-center text-brand-muted">Loading orders…</p>
  if (isError) return <p className="px-6 py-24 text-center text-red-600">Could not load your orders.</p>

  const orders = data?.orders ?? []

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="mb-4 text-3xl">Your Orders</h1>
        <p className="text-brand-muted">You haven't placed any orders yet.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl">Your Orders</h1>
      <ul className="divide-y rounded border">
        {orders.map((order) => (
          <li key={order.order_id}>
            <Link to={`/orders/${order.order_id}`} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
              <div>
                <p className="font-medium">Order #{order.order_id}</p>
                <p className="text-sm text-brand-muted">{new Date(order.order_date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(order.total_amount)}</p>
                <p className="text-sm text-brand-muted">{order.order_status}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
