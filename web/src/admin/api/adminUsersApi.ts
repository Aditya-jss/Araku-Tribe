import { adminApiCall } from './adminClient'

export interface AdminCustomer {
  user_id: number
  firstname: string
  lastname: string
  email: string
  phonenumber: string
  is_verified: boolean
}

export interface AdminCustomerDetail extends AdminCustomer {
  orders: { order_id: number; total_amount: number; order_status: string; order_date: string }[]
}

export function listUsers(params: { search?: string; page?: number; page_size?: number } = {}) {
  return adminApiCall<{ users: AdminCustomer[]; total: number }>('/api/admin/users', { params })
}

export function getUser(userId: number) {
  return adminApiCall<AdminCustomerDetail>(`/api/admin/users/${userId}`)
}

export function updateUser(userId: number, input: { firstname: string; lastname: string; email: string; phonenumber: string }) {
  return adminApiCall<AdminCustomer>(`/api/admin/users/${userId}`, { method: 'PATCH', body: input })
}

export function deleteUser(userId: number) {
  return adminApiCall<void>(`/api/admin/users/${userId}`, { method: 'DELETE' })
}
