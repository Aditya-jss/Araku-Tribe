import { apiCall } from './client'

const PATH = '/api/auth.php'

export interface User {
  user_id: number
  firstname: string
  lastname: string
  email: string
  phonenumber: string
}

export function signup(input: {
  firstname: string
  lastname: string
  email: string
  phonenumber: string
  password: string
  repeat_password: string
}) {
  return apiCall<{ success: true; message: string }>(PATH, 'signup', input)
}

export function login(input: { email: string; password: string }) {
  return apiCall<{ success: true; message: string }>(PATH, 'login', input)
}

export function resendOtp() {
  return apiCall<{ success: true; message: string }>(PATH, 'resend_otp')
}

export function verifyOtp(otp: string) {
  return apiCall<{ success: true; token: string; user: User }>(PATH, 'verify_otp', { otp })
}

export function logout() {
  return apiCall<{ success: true }>(PATH, 'logout')
}

export function forgotPassword(email: string) {
  return apiCall<{ success: true; message: string }>(PATH, 'forgot_password', { email })
}

export function resetPassword(input: { otp: string; password: string; repeat_password: string }) {
  return apiCall<{ success: true; message: string }>(PATH, 'reset_password', input)
}

/** Used by the Google OAuth callback page to fetch user details for a token
 * that isn't in localStorage yet at that point. */
export function me() {
  return apiCall<{ success: true; user: User }>('/api/auth/me', '', {}, 'GET')
}
