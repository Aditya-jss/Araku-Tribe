import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../api/client'
import * as profileApi from '../api/profileApi'

const schema = z.object({
  firstname: z.string().min(1, 'Required'),
  lastname: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phonenumber: z.string().min(10, 'Enter a valid phone number'),
  area: z.string(),
  landmark: z.string(),
  zipcode: z.string(),
})

type FormValues = z.infer<typeof schema>

export function AccountEdit() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (data) {
      reset({
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        email: data.user.email,
        phonenumber: data.user.phonenumber,
        area: data.user.area,
        landmark: data.user.landmark,
        zipcode: data.user.zipcode,
      })
    }
  }, [data, reset])

  async function onSubmit(values: FormValues) {
    try {
      await profileApi.updateProfile(values)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      navigate('/account')
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'Update failed' })
    }
  }

  if (isLoading) return <p className="px-6 py-24 text-center text-brand-muted">Loading…</p>

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-center text-3xl">Edit Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstname" className="mb-1 block text-sm font-medium">
              First name
            </label>
            <input id="firstname" className="w-full rounded border px-3 py-2" {...register('firstname')} />
            {errors.firstname && <p className="mt-1 text-sm text-red-600">{errors.firstname.message}</p>}
          </div>
          <div>
            <label htmlFor="lastname" className="mb-1 block text-sm font-medium">
              Last name
            </label>
            <input id="lastname" className="w-full rounded border px-3 py-2" {...register('lastname')} />
            {errors.lastname && <p className="mt-1 text-sm text-red-600">{errors.lastname.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" type="email" className="w-full rounded border px-3 py-2" {...register('email')} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phonenumber" className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <input id="phonenumber" className="w-full rounded border px-3 py-2" {...register('phonenumber')} />
          {errors.phonenumber && <p className="mt-1 text-sm text-red-600">{errors.phonenumber.message}</p>}
        </div>

        <div>
          <label htmlFor="area" className="mb-1 block text-sm font-medium">
            Area
          </label>
          <input id="area" className="w-full rounded border px-3 py-2" {...register('area')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="landmark" className="mb-1 block text-sm font-medium">
              Landmark
            </label>
            <input id="landmark" className="w-full rounded border px-3 py-2" {...register('landmark')} />
          </div>
          <div>
            <label htmlFor="zipcode" className="mb-1 block text-sm font-medium">
              Zip code
            </label>
            <input id="zipcode" className="w-full rounded border px-3 py-2" {...register('zipcode')} />
          </div>
        </div>

        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded py-2.5 font-bold text-black disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-brand-gold)' }}
        >
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
