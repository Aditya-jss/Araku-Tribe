import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import * as contactApi from '../api/contactApi'
import { ApiError } from '../api/client'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  subject: z.string().optional(),
  message: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

const INFO = [
  { title: 'Office Address', body: 'Araku Tribe Coffee, Araku Valley, Visakhapatnam.' },
  { title: 'Phone Number', body: '+91-7893-836-529' },
  { title: 'Message Us', body: 'info@arakutribe.com' },
]

export function Contact() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await contactApi.sendContactMessage(values)
      setSent(true)
      reset()
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Could not send your message' })
    }
  }

  return (
    <div>
      <section
        className="relative flex min-h-[16rem] items-center justify-center bg-cover bg-center px-6 py-20 text-center text-white"
        style={{ backgroundImage: "url('/img/marketing/coffee-pour.jpg')" }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(63, 39, 30, 0.75)' }} />
        <div className="relative">
          <h1 className="mb-3 text-4xl font-bold">Contact Us</h1>
          <p className="mx-auto max-w-xl opacity-90">
            We'd love to hear from you — reach out with questions, feedback, or franchise inquiries.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          {INFO.map((item) => (
            <div key={item.title} className="rounded-lg border bg-white p-6 text-center">
              <h3 className="mb-2 font-bold" style={{ color: 'var(--color-brand-brown)' }}>
                {item.title}
              </h3>
              <p className="text-sm text-brand-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-xl">
          {sent && (
            <p className="mb-4 rounded border border-green-600 bg-green-50 p-4 text-center text-sm text-green-700">
              Thanks for reaching out — we'll get back to you soon.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input id="name" className="w-full rounded border px-3 py-2" {...register('name')} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input id="email" type="email" className="w-full rounded border px-3 py-2" {...register('email')} />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                  Phone
                </label>
                <input id="phone" className="w-full rounded border px-3 py-2" {...register('phone')} />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="mb-1 block text-sm font-medium">
                Subject (optional)
              </label>
              <input id="subject" className="w-full rounded border px-3 py-2" {...register('subject')} />
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium">
                Message
              </label>
              <textarea id="message" rows={5} className="w-full rounded border px-3 py-2" {...register('message')} />
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
            </div>

            {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded py-2.5 font-bold text-black disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-brand-gold)' }}
            >
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
