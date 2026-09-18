import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import * as adminDashboardApi from '../api/adminDashboardApi'

export function AdminInventoryAlerts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'inventory-alerts'],
    queryFn: adminDashboardApi.getInventoryAlerts,
  })

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl">Inventory Alerts</h1>
      <p className="mb-6 text-sm text-brand-muted">
        Products at or below their reorder threshold (min order quantity).
      </p>

      {isLoading && <p className="text-brand-muted">Loading…</p>}
      {isError && <p className="text-red-600">Could not load inventory alerts.</p>}

      {data && data.products.length === 0 && (
        <p className="rounded border border-green-600 bg-green-50 p-4 text-sm text-green-700">
          Nothing is low on stock right now.
        </p>
      )}

      {data && data.products.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Category</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Threshold</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.product_id} className="border-b">
                <td className="py-2 font-mono text-xs">{p.product_id}</td>
                <td className="py-2">{p.name}</td>
                <td className="py-2 capitalize">{p.category}</td>
                <td className="py-2 font-bold text-red-600">{p.quantity}</td>
                <td className="py-2">{p.min_order_quantity}</td>
                <td className="py-2 text-right">
                  <Link to={`/admin/products/${p.product_id}/edit`} className="text-xs underline">
                    Restock
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
