import { NavLink, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Customers' },
  { to: '/admin/inventory-alerts', label: 'Inventory Alerts' },
  { to: '/admin/admins', label: 'Admins', minRole: 'superadmin' as const },
]

export function AdminLayout() {
  const { admin, hasRoleAtLeast, logout } = useAdminAuth()

  return (
    <div className="flex min-h-screen">
      <aside
        className="flex w-60 shrink-0 flex-col justify-between text-white"
        style={{ backgroundColor: 'var(--color-brand-brown)' }}
      >
        <div>
          <div className="px-6 py-5 text-lg font-bold">ARAKU TRIBE ADMIN</div>
          <nav className="flex flex-col gap-1 px-3">
            {NAV.filter((item) => !item.minRole || hasRoleAtLeast(item.minRole)).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm ${isActive ? 'bg-white/15 font-bold' : 'opacity-80 hover:opacity-100'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/20 px-6 py-4 text-sm">
          <p className="font-bold">
            {admin?.firstname} {admin?.lastname}
          </p>
          <p className="mb-3 opacity-70">{admin?.role}</p>
          <button type="button" onClick={logout} className="underline">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-white">
        <Outlet />
      </main>
    </div>
  )
}
