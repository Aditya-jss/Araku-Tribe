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
