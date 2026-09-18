import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as adminOrdersApi from '../api/adminOrdersApi'
import { AdminApiError } from '../api/adminClient'
import { formatPrice } from '../../lib/format'

export function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const id = Number(orderId)
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminOrdersApi.getOrder(id),
    enabled: !!id,
  })

  const updateStatus = useMutation({
    mutationFn: (status: string) => adminOrdersApi.updateOrderStatus(id, status),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
    onError: (err) => setError(err instanceof AdminApiError ? err.message : 'Could not update status'),
  })

  if (isLoading) return <p className="p-8 text-brand-muted">Loading…</p>
  if (isError || !data) return <p className="p-8 text-red-600">Order not found.</p>

  return (
    <div className="p-8">
      <Link to="/admin/orders" className="mb-6 inline-block text-sm underline">
        ← Back to orders
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Order #{data.order_id}</h1>
        <select
          value={data.order_status}
          onChange={(e) => updateStatus.mutate(e.target.value)}
          disabled={updateStatus.isPending}
          className="rounded border px-3 py-2 text-sm"
        >
          {adminOrdersApi.ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <dl className="mb-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-brand-muted">Customer</dt>
          <dd>
            {data.name} ({data.email})
          </dd>
        </div>
        <div>
          <dt className="text-brand-muted">Placed on</dt>
          <dd>{new Date(data.order_date).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-brand-muted">Payment</dt>
          <dd>
            {data.payment_method.toUpperCase()} — {data.payment_status}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-brand-muted">Shipping address</dt>
          <dd>{data.shipping_address}</dd>
        </div>
      </dl>

      <h2 className="mb-3 font-bold">Items</h2>
      <ul className="mb-6 divide-y rounded border">
        {data.items.map((item) => (
          <li key={item.product_id} className="flex justify-between px-4 py-3 text-sm">
            <span>
              {item.product_name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatPrice(data.total_amount)}</span>
      </div>
    </div>
  )
}
