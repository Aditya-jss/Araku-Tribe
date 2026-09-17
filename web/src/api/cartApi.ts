import { apiCall } from './client'

const PATH = '/api/cart.php'

export interface CartItem {
  product_id: string
  product_name: string
  price: number
  quantity: number
  image: string
  subtotal: number
}

export interface CartResponse {
  success: true
  items: CartItem[]
  total: number
}

export function getCart() {
  return apiCall<CartResponse>(PATH, 'get', {}, 'GET')
}

export function addToCart(product_id: string, quantity: number) {
  return apiCall<CartResponse>(PATH, 'add', { product_id, quantity })
}

export function updateCart(product_id: string, op: 'increase' | 'decrease' | 'delete') {
  return apiCall<CartResponse>(PATH, 'update', { product_id, op })
}
