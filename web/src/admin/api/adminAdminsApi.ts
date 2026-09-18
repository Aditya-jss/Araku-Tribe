import { adminApiCall } from './adminClient'
import type { AdminUser } from './adminAuthApi'

export function listAdmins() {
  return adminApiCall<{ admins: AdminUser[] }>('/api/admin/admins')
}

export function createAdmin(input: { firstname: string; lastname: string; email: string; password: string; role: string }) {
  return adminApiCall<AdminUser>('/api/admin/admins', { method: 'POST', body: input })
}

export function updateAdmin(adminId: number, input: { firstname: string; lastname: string; role: string }) {
  return adminApiCall<AdminUser>(`/api/admin/admins/${adminId}`, { method: 'PATCH', body: input })
}

export function deleteAdmin(adminId: number) {
  return adminApiCall<void>(`/api/admin/admins/${adminId}`, { method: 'DELETE' })
}
