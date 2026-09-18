const TOKEN_STORAGE_KEY = 'arakutribe_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type ApiInput = Record<string, string | number | undefined>

/**
 * All legacy endpoints (api/*.php) take `action` as a GET or POST field and
 * always return JSON, so every call in the app funnels through here.
 */
export async function apiCall<T>(
  path: string,
  action: string,
  input: ApiInput = {},
  method: 'GET' | 'POST' = 'POST',
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  let url = path
  let body: BodyInit | undefined

  if (method === 'GET') {
    const params = new URLSearchParams({ action, ...cleanInput(input) })
    url = `${path}?${params.toString()}`
  } else {
    const form = new URLSearchParams({ action, ...cleanInput(input) })
    body = form
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }

  const res = await fetch(url, { method, headers, body, credentials: 'include' })
  const data = await res.json()

  if (!res.ok || data.success === false) {
    // FastAPI's HTTPException serializes as { detail }; older fallbacks kept for safety.
    throw new ApiError(data.detail ?? data.error ?? data.message ?? 'Request failed', res.status)
  }

  return data as T
}

function cleanInput(input: ApiInput): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) out[key] = String(value)
  }
  return out
}
