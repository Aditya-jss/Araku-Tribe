import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import type { AdminUser } from '../api/adminAuthApi'

export function AdminProtectedRoute({
  children,
  minRole,
}: {
  children: ReactNode
  minRole?: AdminUser['role']
}) {
  const { isAuthenticated, hasRoleAtLeast } = useAdminAuth()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  if (minRole && !hasRoleAtLeast(minRole)) {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="mb-2 text-2xl">Insufficient permissions</h1>
        <p className="text-brand-muted">Your role doesn't have access to this page.</p>
      </div>
    )
  }

  return <>{children}</>
}
