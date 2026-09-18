import { useEffect, useState } from 'react'
import { sendAIChatMessage } from '../../api/aiChatApi'
import type { AIChatMessage } from '../../api/aiChatApi'

const STORAGE_KEY = 'arakutribe_ai_chat_transcript'
const GREETING_ID = 'greeting'

export interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const GREETING: DisplayMessage = {
  id: GREETING_ID,
  role: 'assistant',
  content:
    "Hi! I'm the Araku Tribe assistant. Ask me about our coffee, cups, mugs, or t-shirts — or try " +
    '"add 2 dark roast bags to my cart" or "what\'s the status of my last order?"',
}

function loadTranscript(): DisplayMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [GREETING]
    const parsed = JSON.parse(raw) as DisplayMessage[]
    return parsed.length > 0 ? parsed : [GREETING]
  } catch {
    return [GREETING]
  }
}

export function useAIChat() {
  const [messages, setMessages] = useState<DisplayMessage[]>(loadTranscript)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setError(null)
    const userMessage: DisplayMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setSending(true)

    try {
      const history: AIChatMessage[] = nextMessages
        .filter((m) => m.id !== GREETING_ID)
        .map((m) => ({ role: m.role, content: m.content }))
      const reply = await sendAIChatMessage(history)
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  function reset() {
    setMessages([GREETING])
    setError(null)
  }

  return { messages, sending, error, sendMessage, reset }
}
