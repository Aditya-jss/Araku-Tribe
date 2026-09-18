import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as adminProductsApi from '../api/adminProductsApi'
import { AdminApiError } from '../api/adminClient'
import { useAdminAuth } from '../context/AdminAuthContext'
import { formatPrice } from '../../lib/format'

const CATEGORIES = ['bag', 'cup', 'mug', 'tshirt']

export function AdminProducts() {
  const { hasRoleAtLeast } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>({})

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'products', category],
    queryFn: () => adminProductsApi.listProducts({ category: category || undefined, page_size: 100 }),
  })

  const updateQuantity = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      adminProductsApi.updateProduct(id, { quantity }),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
    onError: (err) => setError(err instanceof AdminApiError ? err.message : 'Could not update quantity'),
  })

  const deleteProduct = useMutation({
    mutationFn: (id: string) => adminProductsApi.deleteProduct(id),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
    onError: (err) => setError(err instanceof AdminApiError ? err.message : 'Could not delete product'),
  })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Products</h1>
        {hasRoleAtLeast('manager') && (
          <Link
            to="/admin/products/new"
            className="rounded px-4 py-2 text-sm font-bold text-black"
            style={{ backgroundColor: 'var(--color-brand-gold)' }}
          >
            Add Product
          </Link>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className={`rounded border px-3 py-1.5 text-sm ${category === '' ? 'bg-gray-100 font-bold' : ''}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSearchParams({ category: c })}
            className={`rounded border px-3 py-1.5 text-sm capitalize ${category === c ? 'bg-gray-100 font-bold' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-brand-muted">Loading…</p>}
      {isError && <p className="text-red-600">Could not load products.</p>}

      {data && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Category</th>
              <th className="py-2">Price</th>
              <th className="py-2">Stock</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.product_id} className="border-b">
                <td className="py-2 font-mono text-xs">{p.product_id}</td>
                <td className="py-2">{p.name}</td>
                <td className="py-2 capitalize">{p.category}</td>
                <td className="py-2">{formatPrice(p.price)}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      className={`w-20 rounded border px-2 py-1 ${p.low_stock_alerted ? 'border-red-400 text-red-600' : ''}`}
                      value={quantityDrafts[p.product_id] ?? p.quantity}
                      onChange={(e) => setQuantityDrafts((d) => ({ ...d, [p.product_id]: e.target.value }))}
                    />
                    <button
                      type="button"
                      disabled={updateQuantity.isPending}
                      onClick={() =>
                        updateQuantity.mutate({
                          id: p.product_id,
                          quantity: Number(quantityDrafts[p.product_id] ?? p.quantity),
                        })
                      }
                      className="rounded border px-2 py-1 text-xs"
                    >
                      Save
                    </button>
                  </div>
                </td>
                <td className="py-2 text-right">
                  {hasRoleAtLeast('manager') && (
                    <Link to={`/admin/products/${p.product_id}/edit`} className="mr-3 text-xs underline">
                      Edit
                    </Link>
                  )}
                  {hasRoleAtLeast('superadmin') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete ${p.name}?`)) deleteProduct.mutate(p.product_id)
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
    </div>
  )
}
