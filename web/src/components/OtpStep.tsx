import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'

interface OtpStepProps {
  message: string
  onSubmit: (otp: string) => Promise<void>
  onResend?: () => Promise<void>
}

export function OtpStep({ message, onSubmit, onResend }: OtpStepProps) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(otp)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    if (!onResend) return
    setError(null)
    try {
      await onResend()
      setResent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend OTP')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-brand-muted">{message}</p>

      <div>
        <label htmlFor="otp" className="mb-1 block text-sm font-medium">
          One-time code
        </label>
        <input
          id="otp"
          inputMode="numeric"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className="w-full rounded border px-3 py-2 tracking-widest"
          placeholder="000000"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {resent && !error && <p className="text-sm text-green-700">OTP resent.</p>}

      <button
        type="submit"
        disabled={submitting || otp.length !== 6}
        className="w-full rounded py-2.5 font-bold text-black disabled:opacity-50"
        style={{ backgroundColor: 'var(--color-brand-gold)' }}
      >
        {submitting ? 'Verifying…' : 'Verify'}
      </button>

      {onResend && (
        <button type="button" onClick={handleResend} className="w-full text-sm underline">
          Resend code
        </button>
      )}
    </form>
  )
}
