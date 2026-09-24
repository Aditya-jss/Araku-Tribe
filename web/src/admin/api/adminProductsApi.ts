import { adminApiCall } from './adminClient'

export interface AdminProduct {
  product_id: string
  name: string
  price: number
  quantity: number
  category: string
  image: string
  min_order_quantity: number
  low_stock_alerted: boolean
}

export function listProducts(params: { category?: string; page?: number; page_size?: number } = {}) {
  return adminApiCall<{ products: AdminProduct[]; total: number }>('/api/admin/products', { params })
}

export function createProduct(input: {
  name: string
  price: number
  quantity: number
  category: string
  image: string
  min_order_quantity: number
}) {
  return adminApiCall<AdminProduct>('/api/admin/products', { method: 'POST', body: input })
}

export function updateProduct(productId: string, input: Partial<Omit<AdminProduct, 'product_id' | 'low_stock_alerted'>>) {
  return adminApiCall<AdminProduct>(`/api/admin/products/${productId}`, { method: 'PATCH', body: input })
}

export function deleteProduct(productId: string) {
  return adminApiCall<void>(`/api/admin/products/${productId}`, { method: 'DELETE' })
}
