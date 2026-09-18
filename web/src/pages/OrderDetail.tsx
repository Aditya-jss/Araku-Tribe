import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import * as ordersApi from '../api/ordersApi'
import { formatPrice } from '../lib/format'

const CANCELLABLE_STATUSES = new Set(['Processing', 'Pending'])

export function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrder(Number(orderId)),
    enabled: !!orderId,
  })

  const cancel = useMutation({
    mutationFn: () => ordersApi.cancelOrder(Number(orderId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not cancel order'),
  })

  if (isLoading) return <p className="px-6 py-24 text-center text-brand-muted">Loading order…</p>
  if (isError || !data) return <p className="px-6 py-24 text-center text-red-600">Order not found.</p>

  const order = data.order

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/orders" className="mb-6 inline-block text-sm underline">
        ← Back to orders
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl">Order #{order.order_id}</h1>
        <span className="rounded-full border px-3 py-1 text-sm">{order.order_status}</span>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-brand-muted">Placed on</dt>
          <dd>{new Date(order.order_date).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-brand-muted">Payment</dt>
          <dd>
            {order.payment_method.toUpperCase()} — {order.payment_status}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-brand-muted">Shipping address</dt>
          <dd>{order.shipping_address}</dd>
        </div>
      </dl>

      <h2 className="mb-3 font-bold">Items</h2>
      <ul className="mb-6 divide-y rounded border">
        {order.items.map((item) => (
          <li key={item.product_id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {item.product_name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mb-8 flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatPrice(order.total_amount)}</span>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {CANCELLABLE_STATUSES.has(order.order_status) && (
        <button
          type="button"
          onClick={() => cancel.mutate()}
          disabled={cancel.isPending}
          className="rounded border border-red-600 px-6 py-2.5 font-bold text-red-600 disabled:opacity-50"
        >
          {cancel.isPending ? 'Cancelling…' : 'Cancel Order'}
        </button>
      )}
    </div>
  )
}
