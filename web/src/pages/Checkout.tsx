import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../api/client'
import * as ordersApi from '../api/ordersApi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/format'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  address: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  zipcode: z.string().min(1, 'Required'),
  payment_method: z.enum(['upi', 'card', 'amazonpay', 'netbanking', 'cod']),
})

type FormValues = z.infer<typeof schema>

export function Checkout() {
  const { user } = useAuth()
  const { data: cart, isLoading } = useCart()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user ? `${user.firstname} ${user.lastname}` : '',
      email: user?.email ?? '',
      phone: user?.phonenumber ?? '',
      payment_method: 'cod',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const res = await ordersApi.placeOrder(values)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      navigate(`/orders/${res.order_id}`, { replace: true })
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Could not place order' })
    }
  }

  if (isLoading) return <p className="px-6 py-24 text-center text-brand-muted">Loading…</p>
  if (!cart || cart.items.length === 0) return <Navigate to="/cart" replace />

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl">Checkout</h1>

      <div className="grid gap-10 sm:grid-cols-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:col-span-3">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Full name
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
            <label htmlFor="address" className="mb-1 block text-sm font-medium">
              Address
            </label>
            <input id="address" className="w-full rounded border px-3 py-2" {...register('address')} />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-medium">
                City
              </label>
              <input id="city" className="w-full rounded border px-3 py-2" {...register('city')} />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
            </div>
            <div>
              <label htmlFor="state" className="mb-1 block text-sm font-medium">
                State
              </label>
              <input id="state" className="w-full rounded border px-3 py-2" {...register('state')} />
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
            </div>
            <div>
              <label htmlFor="zipcode" className="mb-1 block text-sm font-medium">
                Zip
              </label>
              <input id="zipcode" className="w-full rounded border px-3 py-2" {...register('zipcode')} />
              {errors.zipcode && <p className="mt-1 text-sm text-red-600">{errors.zipcode.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="payment_method" className="mb-1 block text-sm font-medium">
              Payment method
            </label>
            <select id="payment_method" className="w-full rounded border px-3 py-2" {...register('payment_method')}>
              <option value="cod">Cash on Delivery</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="amazonpay">Amazon Pay</option>
            </select>
          </div>

          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded py-3 font-bold text-black disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-brand-gold)' }}
          >
            {isSubmitting ? 'Placing order…' : `Place Order — ${formatPrice(cart.total)}`}
          </button>
        </form>

        <div className="sm:col-span-2">
          <h2 className="mb-4 font-bold">Order Summary</h2>
          <ul className="divide-y rounded border">
            {cart.items.map((item) => (
              <li key={item.product_id} className="flex justify-between px-4 py-3 text-sm">
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span>{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
