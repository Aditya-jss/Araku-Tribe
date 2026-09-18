import { adminApiCall } from './adminClient'

export interface AdminUser {
  admin_id: number
  email: string
  firstname: string
  lastname: string
  role: 'staff' | 'manager' | 'admin' | 'superadmin'
}

export function login(email: string, password: string) {
  return adminApiCall<{ token: string; admin: AdminUser }>('/api/admin/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function me() {
  return adminApiCall<AdminUser>('/api/admin/auth/me')
}

export function forgotPassword(email: string) {
  return adminApiCall<{ message: string }>('/api/admin/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

export function resetPassword(otp: string, password: string) {
  return adminApiCall<{ message: string }>('/api/admin/auth/reset-password', {
    method: 'POST',
    body: { otp, password },
  })
}
