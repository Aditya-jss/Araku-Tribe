import { createContext, useContext, useState, type ReactNode } from 'react'
import * as authApi from '../api/authApi'
import { clearToken, getToken, setToken } from '../api/client'
import type { User } from '../api/authApi'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  completeLogin: (token: string, user: User) => void
  updateUser: (patch: Partial<User>) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const USER_STORAGE_KEY = 'arakutribe_user'

function loadStoredUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser)

  function completeLogin(token: string, user: User) {
    setToken(token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    setUser(user)
  }

  function updateUser(patch: Partial<User>) {
    setUser((current) => {
      if (!current) return current
      const next = { ...current, ...patch }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      clearToken()
      localStorage.removeItem(USER_STORAGE_KEY)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!getToken() && !!user, completeLogin, updateUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
