import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import * as adminOrdersApi from '../api/adminOrdersApi'
import { formatPrice } from '../../lib/format'

export function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: () => adminOrdersApi.listOrders({ status: status || undefined, page_size: 100 }),
  })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl">Orders</h1>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className={`rounded border px-3 py-1.5 text-sm ${status === '' ? 'bg-gray-100 font-bold' : ''}`}
        >
          All
        </button>
        {adminOrdersApi.ORDER_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSearchParams({ status: s })}
            className={`rounded border px-3 py-1.5 text-sm ${status === s ? 'bg-gray-100 font-bold' : ''}`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-brand-muted">Loading…</p>}
      {isError && <p className="text-red-600">Could not load orders.</p>}

      {data && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Order</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Date</th>
              <th className="py-2">Total</th>
              <th className="py-2">Payment</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o.order_id} className="border-b">
                <td className="py-2">#{o.order_id}</td>
                <td className="py-2">{o.name}</td>
                <td className="py-2">{new Date(o.order_date).toLocaleDateString()}</td>
                <td className="py-2">{formatPrice(o.total_amount)}</td>
                <td className="py-2">{o.payment_status}</td>
                <td className="py-2">{o.order_status}</td>
                <td className="py-2 text-right">
                  <Link to={`/admin/orders/${o.order_id}`} className="text-xs underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {data.orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-brand-muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
