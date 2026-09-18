import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as cartApi from '../api/cartApi'
import { ApiError } from '../api/client'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/format'

export function Cart() {
  const { data, isLoading, isError } = useCart()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const update = useMutation({
    mutationFn: ({ productId, op }: { productId: string; op: 'increase' | 'decrease' | 'delete' }) =>
      cartApi.updateCart(productId, op),
    onSuccess: (res) => {
      setError(null)
      queryClient.setQueryData(['cart'], res)
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Could not update cart'),
  })

  if (isLoading) return <p className="px-6 py-24 text-center text-brand-muted">Loading cart…</p>
  if (isError) return <p className="px-6 py-24 text-center text-red-600">Could not load your cart.</p>

  const items = data?.items ?? []

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="mb-4 text-3xl">Your Cart</h1>
        <p className="mb-6 text-brand-muted">Your cart is empty.</p>
        <Link
          to="/products/bag"
          className="inline-block rounded px-6 py-2.5 font-bold text-black"
          style={{ backgroundColor: 'var(--color-brand-gold)' }}
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl">Your Cart</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.product_id} className="flex items-center gap-4 py-4">
            <img src={item.image} alt={item.product_name} className="h-20 w-20 rounded object-cover" />
            <div className="flex-1">
              <p className="font-medium">{item.product_name}</p>
              <p className="text-sm text-brand-muted">{formatPrice(item.price)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update.mutate({ productId: item.product_id, op: 'decrease' })}
                disabled={update.isPending}
                className="h-8 w-8 rounded border"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                type="button"
                onClick={() => update.mutate({ productId: item.product_id, op: 'increase' })}
                disabled={update.isPending}
                className="h-8 w-8 rounded border"
              >
                +
              </button>
            </div>
            <p className="w-24 text-right font-medium">{formatPrice(item.subtotal)}</p>
            <button
              type="button"
              onClick={() => update.mutate({ productId: item.product_id, op: 'delete' })}
              disabled={update.isPending}
              className="text-sm text-red-600 underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <span className="text-lg font-bold">Total</span>
        <span className="text-lg font-bold">{formatPrice(data!.total)}</span>
      </div>

      <Link
        to="/checkout"
        className="mt-6 block w-full rounded py-3 text-center font-bold text-black"
        style={{ backgroundColor: 'var(--color-brand-gold)' }}
      >
        Proceed to Checkout
      </Link>
    </div>
  )
}
