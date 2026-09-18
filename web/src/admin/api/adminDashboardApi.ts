import { adminApiCall } from './adminClient'

export interface DashboardStats {
  total_orders: number
  total_users: number
  total_revenue: number
  low_stock_count: number
  orders_by_status: Record<string, number>
}

export interface LowStockProduct {
  product_id: string
  name: string
  category: string
  quantity: number
  min_order_quantity: number
}

export function getDashboard() {
  return adminApiCall<DashboardStats>('/api/admin/dashboard')
}

export function getInventoryAlerts() {
  return adminApiCall<{ products: LowStockProduct[] }>('/api/admin/inventory-alerts')
}
