import { getToken } from './client'

const PATH = '/api/ai/chat'

export interface AIChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function sendAIChatMessage(messages: AIChatMessage[]): Promise<string> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(PATH, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages }),
    credentials: 'include',
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail ?? 'The assistant could not respond right now.')
  }
  return data.message as string
}
