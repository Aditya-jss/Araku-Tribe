import { apiCall, getToken } from './client'

const PATH = '/api/profile.php'
const PICTURE_PATH = '/api/profile_picture.php'

export interface Profile {
  firstname: string
  lastname: string
  email: string
  phonenumber: string
  area: string
  landmark: string
  zipcode: string
  profile_picture: string | null
}

export function getProfile() {
  return apiCall<{ success: true; user: Profile }>(PATH, 'get', {}, 'GET')
}

export function updateProfile(input: Omit<Profile, 'profile_picture'>) {
  return apiCall<{ success: true }>(PATH, 'update', input)
}

export function deleteAccount(input: { password: string; reason?: string }) {
  return apiCall<{ success: true; message: string }>(PATH, 'delete_account', input)
}

/**
 * Multipart upload, so it bypasses the shared apiCall helper (which is
 * form-urlencoded only) — talks to the new api/profile_picture.php endpoint.
 */
export async function uploadProfilePicture(file: File): Promise<{ success: true; profile_picture: string }> {
  const token = getToken()
  const formData = new FormData()
  formData.append('profile_picture', file)

  const res = await fetch(PICTURE_PATH, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok || data.success === false) {
    throw new Error(data.detail ?? data.error ?? 'Upload failed')
  }
  return data
}
