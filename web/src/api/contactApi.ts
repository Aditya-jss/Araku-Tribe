import { apiCall } from './client'

const PATH = '/api/contact.php'

export function sendContactMessage(input: {
  name: string
  email: string
  phone: string
  subject?: string
  message: string
}) {
  return apiCall<{ success: true; message: string }>(PATH, 'send', input)
}
