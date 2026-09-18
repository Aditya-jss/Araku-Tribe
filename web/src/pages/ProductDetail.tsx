import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as cartApi from '../api/cartApi'
import { ApiError } from '../api/client'
import * as productsApi from '../api/productsApi'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../lib/format'

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProduct(productId!),
    enabled: !!productId,
  })

  const product = data?.product
  const [quantity, setQuantity] = useState(1)

  const addToCart = useMutation({
    mutationFn: () => cartApi.addToCart(product!.product_id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setAdded(true)
      setError(null)
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Could not add to cart')
    },
  })

  if (isLoading) return <p className="px-6 py-24 text-center text-brand-muted">Loading…</p>
  if (isError || !product) return <p className="px-6 py-24 text-center text-red-600">Product not found.</p>

  const minQty = product.min_order_quantity || 1
  const outOfStock = product.quantity <= 0

  function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${product!.category}/${product!.product_id}` } } })
      return
    }
    setAdded(false)
    addToCart.mutate()
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link to={`/products/${product.category}`} className="mb-6 inline-block text-sm underline">
        ← Back to products
      </Link>

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          <h1 className="mb-2 text-3xl">{product.name}</h1>
          <p className="mb-6 text-2xl font-bold" style={{ color: 'var(--color-brand-brown)' }}>
            {formatPrice(product.price)}
          </p>

          {outOfStock ? (
            <p className="mb-4 font-medium text-red-600">Out of stock</p>
          ) : (
            <p className="mb-4 text-sm text-brand-muted">{product.quantity} in stock</p>
          )}

          {!outOfStock && (
            <div className="mb-6 flex items-center gap-3">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min={minQty}
                max={product.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(minQty, Number(e.target.value) || minQty))}
                className="w-20 rounded border px-3 py-2"
              />
            </div>
          )}

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {added && !error && <p className="mb-4 text-sm text-green-700">Added to cart.</p>}

          <button
            type="button"
            disabled={outOfStock || addToCart.isPending}
            onClick={handleAddToCart}
            className="w-full rounded py-3 font-bold text-black disabled:opacity-50 sm:w-auto sm:px-10"
            style={{ backgroundColor: 'var(--color-brand-gold)' }}
          >
            {addToCart.isPending ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
