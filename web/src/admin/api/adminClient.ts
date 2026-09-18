const TOKEN_STORAGE_KEY = 'arakutribe_admin_token'

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export class AdminApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/** Admin endpoints are a plain JSON REST API (no legacy contract to mirror
 * here, unlike the action-based customer api/*.php endpoints). */
export async function adminApiCall<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: unknown
    params?: Record<string, string | number | undefined>
  } = {},
): Promise<T> {
  const token = getAdminToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let url = path
  if (options.params) {
    const clean = Object.fromEntries(
      Object.entries(options.params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]),
    )
    const qs = new URLSearchParams(clean).toString()
    if (qs) url = `${path}?${qs}`
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  })

  if (res.status === 204) return undefined as T

  const data = await res.json()
  if (!res.ok) {
    throw new AdminApiError(data.detail ?? 'Request failed', res.status)
  }
  return data as T
}
