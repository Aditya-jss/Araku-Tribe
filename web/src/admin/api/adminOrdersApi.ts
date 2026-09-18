import { adminApiCall } from './adminClient'

export const ORDER_STATUSES = ['Processing', 'Out for Delivery', 'Delivered', 'Cancelled'] as const

export interface AdminOrder {
  order_id: number
  user_id: number
  name: string
  email: string
  total_amount: number
  order_status: string
  order_date: string
  payment_method: string
  payment_status: string
  shipping_address: string
}

export interface AdminOrderDetail extends AdminOrder {
  items: { product_id: string; product_name: string; quantity: number; price: number }[]
}

export function listOrders(params: { status?: string; page?: number; page_size?: number } = {}) {
  return adminApiCall<{ orders: AdminOrder[]; total: number }>('/api/admin/orders', { params })
}

export function getOrder(orderId: number) {
  return adminApiCall<AdminOrderDetail>(`/api/admin/orders/${orderId}`)
}

export function updateOrderStatus(orderId: number, status: string) {
  return adminApiCall<AdminOrder>(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { order_status: status },
  })
}
