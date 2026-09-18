import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import * as profileApi from '../api/profileApi'

export function Account() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  })

  const uploadPicture = useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture(file),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Upload failed'),
  })

  if (isLoading) return <p className="px-6 py-24 text-center text-brand-muted">Loading profile…</p>
  if (isError || !data) return <p className="px-6 py-24 text-center text-red-600">Could not load your profile.</p>

  const profile = data.user

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-3xl">Your Account</h1>

      <div className="mb-8 flex items-center gap-6">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100">
          {profile.profile_picture ? (
            <img src={profile.profile_picture} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-brand-muted">
              {profile.firstname[0]}
              {profile.lastname[0]}
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadPicture.isPending}
            className="rounded border px-4 py-2 text-sm font-medium"
          >
            {uploadPicture.isPending ? 'Uploading…' : 'Change photo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadPicture.mutate(file)
            }}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-brand-muted">First name</dt>
          <dd>{profile.firstname}</dd>
        </div>
        <div>
          <dt className="text-sm text-brand-muted">Last name</dt>
          <dd>{profile.lastname}</dd>
        </div>
        <div>
          <dt className="text-sm text-brand-muted">Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-brand-muted">Phone</dt>
          <dd>{profile.phonenumber}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-sm text-brand-muted">Address</dt>
          <dd>
            {[profile.area, profile.landmark, profile.zipcode].filter(Boolean).join(', ') || 'Not set'}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <Link to="/account/edit" className="rounded border px-5 py-2.5 font-medium">
          Edit Profile
        </Link>
        <Link to="/orders" className="rounded border px-5 py-2.5 font-medium">
          View Orders
        </Link>
        <Link to="/account/delete" className="rounded border border-red-600 px-5 py-2.5 font-medium text-red-600">
          Delete Account
        </Link>
      </div>
    </div>
  )
}
