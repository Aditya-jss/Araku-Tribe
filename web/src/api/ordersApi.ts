import { apiCall } from './client'

const PATH = '/api/orders.php'

export type PaymentMethod = 'upi' | 'card' | 'amazonpay' | 'netbanking' | 'cod'

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
}

export interface Order {
  order_id: number
  total_amount: number
  order_status: string
  order_date: string
  payment_method: PaymentMethod
  payment_status: 'Pending' | 'Paid'
  shipping_address: string
  items: OrderItem[]
}

export function placeOrder(input: {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipcode: string
  payment_method: PaymentMethod
}) {
  return apiCall<{
    success: true
    order_id: number
    total: number
    payment_status: string
    email_sent: boolean
  }>(PATH, 'place', input)
}

export function listOrders() {
  return apiCall<{ success: true; orders: Order[] }>(PATH, 'list', {}, 'GET')
}

export function getOrder(order_id: number) {
  return apiCall<{ success: true; order: Order }>(PATH, 'detail', { order_id }, 'GET')
}

export function cancelOrder(order_id: number) {
  return apiCall<{ success: true; order_id: number; order_status: string }>(PATH, 'cancel', {
    order_id,
  })
}
