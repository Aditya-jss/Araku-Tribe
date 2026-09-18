import { useEffect, useRef, useState } from 'react'
import { FaComment, FaXmark } from 'react-icons/fa6'
import { useChatBot } from './useChatBot'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const { messages, typing, awaitingInput, handleOption, handleTextSubmit } = useChatBot()
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

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
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  <div
                    className={`whitespace-pre-line rounded-lg px-3 py-2 text-sm ${
                      m.from === 'user' ? 'text-black' : 'bg-gray-100 text-black'
                    }`}
                    style={m.from === 'user' ? { backgroundColor: 'var(--color-brand-gold)' } : undefined}
                  >
                    {m.text}
                  </div>
                  {m.options && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.options.map((opt) => (
                        <button
                          key={opt.action}
                          type="button"
                          onClick={() => handleOption(opt)}
                          className="rounded-full border px-3 py-1 text-xs hover:bg-gray-50"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-brand-muted">…</div>
              </div>
            )}
          </div>

          {awaitingInput && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleTextSubmit(inputValue)
                setInputValue('')
              }}
              className="flex gap-2 border-t p-2"
            >
              <input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={awaitingInput === 'orderId' ? 'Order ID…' : 'Type your message…'}
                className="flex-1 rounded border px-3 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="rounded px-3 py-1.5 text-sm font-bold text-black"
                style={{ backgroundColor: 'var(--color-brand-gold)' }}
              >
                Send
              </button>
            </form>
          )}
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
