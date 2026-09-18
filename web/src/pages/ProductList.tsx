import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import * as productsApi from '../api/productsApi'
import type { Category, SortOrder } from '../api/productsApi'
import { ProductCard } from '../components/ProductCard'

const CATEGORY_LABELS: Record<Category, string> = {
  bag: 'Coffee Bags',
  cup: 'Coffee Cups',
  mug: 'Coffee Mugs',
  tshirt: 'T-Shirts',
}

const VALID_CATEGORIES = new Set<Category>(['bag', 'cup', 'mug', 'tshirt'])

export function ProductList() {
  const { category } = useParams<{ category: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const sort = (searchParams.get('sort') ?? '') as SortOrder
  const page = Number(searchParams.get('page') ?? '1')

  const isValidCategory = category !== undefined && VALID_CATEGORIES.has(category as Category)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', category, sort, page],
    queryFn: () => productsApi.listProducts({ category: category as Category, sort, page }),
    enabled: isValidCategory,
  })

  if (!isValidCategory) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="mb-4 text-3xl">Unknown category</h1>
      </div>
    )
  }

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl">{CATEGORY_LABELS[category as Category]}</h1>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="">Sort by</option>
          <option value="lowtohigh">Price: Low to High</option>
          <option value="hightolow">Price: High to Low</option>
          <option value="quantity_asc">Stock: Low to High</option>
          <option value="quantity_desc">Stock: High to Low</option>
        </select>
      </div>

      {isLoading && <p className="text-center text-brand-muted">Loading products…</p>}
      {isError && <p className="text-center text-red-600">Could not load products.</p>}

      {data && data.products.length === 0 && (
        <p className="text-center text-brand-muted">No products in this category yet.</p>
      )}

      {data && data.products.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {data.products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>

          {data.total_pages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateParam('page', String(p))}
                  className="h-9 w-9 rounded border text-sm"
                  style={
                    p === data.page
                      ? { backgroundColor: 'var(--color-brand-gold)', borderColor: 'var(--color-brand-gold)' }
                      : undefined
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
