import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import * as adminProductsApi from '../api/adminProductsApi'
import { AdminApiError } from '../api/adminClient'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  price: z.number().gt(0, 'Must be greater than 0'),
  quantity: z.number().int().min(0),
  category: z.enum(['bag', 'cup', 'mug', 'tshirt']),
  image: z.string().min(1, 'Required'),
  min_order_quantity: z.number().int().min(1),
})

type FormValues = z.infer<typeof schema>

export function AdminProductForm({ mode }: { mode: 'create' | 'edit' }) {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'product', productId],
    queryFn: async () => {
      const { products } = await adminProductsApi.listProducts({ page_size: 200 })
      return products.find((p) => p.product_id === productId) ?? null
    },
    enabled: mode === 'edit' && !!productId,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'bag', min_order_quantity: 1 },
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        price: existing.price,
        quantity: existing.quantity,
        category: existing.category as FormValues['category'],
        image: existing.image,
        min_order_quantity: existing.min_order_quantity,
      })
    }
  }, [existing, reset])

  async function onSubmit(values: FormValues) {
    try {
      if (mode === 'create') {
        await adminProductsApi.createProduct(values)
      } else {
        await adminProductsApi.updateProduct(productId!, values)
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      navigate('/admin/products')
    } catch (err) {
      setError('root', { message: err instanceof AdminApiError ? err.message : 'Could not save product' })
    }
  }

  if (mode === 'edit' && isLoading) return <p className="p-8 text-brand-muted">Loading…</p>

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-2xl">{mode === 'create' ? 'Add Product' : 'Edit Product'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input id="name" className="w-full rounded border px-3 py-2" {...register('name')} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium">
              Price ($)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              className="w-full rounded border px-3 py-2"
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
              Stock quantity
            </label>
            <input
              id="quantity"
              type="number"
              className="w-full rounded border px-3 py-2"
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium">
              Category
            </label>
            <select id="category" className="w-full rounded border px-3 py-2" {...register('category')}>
              <option value="bag">Bag</option>
              <option value="cup">Cup</option>
              <option value="mug">Mug</option>
              <option value="tshirt">T-Shirt</option>
            </select>
          </div>
          <div>
            <label htmlFor="min_order_quantity" className="mb-1 block text-sm font-medium">
              Min order qty / reorder threshold
            </label>
            <input
              id="min_order_quantity"
              type="number"
              className="w-full rounded border px-3 py-2"
              {...register('min_order_quantity', { valueAsNumber: true })}
            />
            {errors.min_order_quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.min_order_quantity.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="image" className="mb-1 block text-sm font-medium">
            Image path
          </label>
          <input id="image" className="w-full rounded border px-3 py-2" {...register('image')} />
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
        </div>

        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded py-2.5 font-bold text-black disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-brand-gold)' }}
        >
          {isSubmitting ? 'Saving…' : 'Save Product'}
        </button>
      </form>
    </div>
  )
}
