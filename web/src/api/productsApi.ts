import { apiCall } from './client'

const PATH = '/api/products.php'

export type Category = 'bag' | 'cup' | 'mug' | 'tshirt'
export type SortOrder = 'lowtohigh' | 'hightolow' | 'quantity_asc' | 'quantity_desc' | ''

export interface Product {
  product_id: string
  name: string
  price: number
  quantity: number
  category: Category
  image: string
  min_order_quantity: number
}

export function listProducts(input: { category: Category; sort?: SortOrder; page?: number }) {
  return apiCall<{
    success: true
    products: Product[]
    total: number
    page: number
    total_pages: number
  }>(PATH, 'list', input, 'GET')
}

export function getProduct(product_id: string) {
  return apiCall<{ success: true; product: Product }>(PATH, 'detail', { product_id }, 'GET')
}
