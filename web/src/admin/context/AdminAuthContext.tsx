import { createContext, useContext, useState, type ReactNode } from 'react'
import { clearAdminToken, getAdminToken, setAdminToken } from '../api/adminClient'
import type { AdminUser } from '../api/adminAuthApi'

interface AdminAuthContextValue {
  admin: AdminUser | null
  isAuthenticated: boolean
  hasRoleAtLeast: (minimum: AdminUser['role']) => boolean
  completeLogin: (token: string, admin: AdminUser) => void
  logout: () => void
}

const ROLE_ORDER: AdminUser['role'][] = ['staff', 'manager', 'admin', 'superadmin']

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

const ADMIN_STORAGE_KEY = 'arakutribe_admin_user'

function loadStoredAdmin(): AdminUser | null {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(loadStoredAdmin)

  function completeLogin(token: string, admin: AdminUser) {
    setAdminToken(token)
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin))
    setAdmin(admin)
  }

  function logout() {
    clearAdminToken()
    localStorage.removeItem(ADMIN_STORAGE_KEY)
    setAdmin(null)
  }

  function hasRoleAtLeast(minimum: AdminUser['role']): boolean {
    if (!admin) return false
    return ROLE_ORDER.indexOf(admin.role) >= ROLE_ORDER.indexOf(minimum)
  }

  return (
    <AdminAuthContext.Provider
      value={{ admin, isAuthenticated: !!getAdminToken() && !!admin, hasRoleAtLeast, completeLogin, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
