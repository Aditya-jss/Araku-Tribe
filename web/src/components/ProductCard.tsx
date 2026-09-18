import { Link } from 'react-router-dom'
import type { Product } from '../api/productsApi'
import { formatPrice } from '../lib/format'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.category}/${product.product_id}`}
      className="block overflow-hidden rounded-lg border bg-white transition hover:shadow-md"
    >
      <div className="aspect-square bg-gray-100">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="p-4">
        <h3 className="mb-1 line-clamp-2 font-medium">{product.name}</h3>
        <p className="font-bold" style={{ color: 'var(--color-brand-brown)' }}>
          {formatPrice(product.price)}
        </p>
        {product.quantity <= 0 && <p className="mt-1 text-sm text-red-600">Out of stock</p>}
      </div>
    </Link>
  )
}
