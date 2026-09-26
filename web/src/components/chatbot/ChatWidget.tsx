import { useEffect, useRef, useState } from 'react'
import { FaComment, FaXmark } from 'react-icons/fa6'
import { useAIChat } from './useAIChat'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const { messages, sending, error, sendMessage } = useAIChat()
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = inputValue
    setInputValue('')
    sendMessage(text)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border bg-white shadow-xl">
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ backgroundColor: 'var(--color-brand-brown)' }}
          >
            <span className="font-bold">Araku Tribe Assistant</span>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}>
              <FaXmark />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm text-black"
                  style={{ backgroundColor: m.role === 'user' ? 'var(--color-brand-gold)' : '#f3f4f6' }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-lg bg-gray-100 px-3 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t p-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about products, cart, orders…"
              disabled={sending}
              className="flex-1 rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !inputValue.trim()}
              className="rounded px-3 py-1.5 text-sm font-bold text-black disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-brand-gold)' }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
        style={{ backgroundColor: 'var(--color-brand-brown)' }}
      >
        {open ? <FaXmark size={20} /> : <FaComment size={20} />}
      </button>
    </div>
  )
}
