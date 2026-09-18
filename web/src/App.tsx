import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './admin/components/AdminLayout'
import { AdminProtectedRoute } from './admin/components/AdminProtectedRoute'
import { AdminAdmins } from './admin/pages/AdminAdmins'
import { AdminDashboard } from './admin/pages/AdminDashboard'
import { AdminForgotPassword } from './admin/pages/AdminForgotPassword'
import { AdminInventoryAlerts } from './admin/pages/AdminInventoryAlerts'
import { AdminLogin } from './admin/pages/AdminLogin'
import { AdminOrderDetail } from './admin/pages/AdminOrderDetail'
import { AdminOrders } from './admin/pages/AdminOrders'
import { AdminProductForm } from './admin/pages/AdminProductForm'
import { AdminProducts } from './admin/pages/AdminProducts'
import { AdminResetPassword } from './admin/pages/AdminResetPassword'
import { AdminUserDetail } from './admin/pages/AdminUserDetail'
import { AdminUsers } from './admin/pages/AdminUsers'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { About } from './pages/About'
import { Account } from './pages/Account'
import { AccountDelete } from './pages/AccountDelete'
import { AccountEdit } from './pages/AccountEdit'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Contact } from './pages/Contact'
import { ForgotPassword } from './pages/ForgotPassword'
import { Franchise } from './pages/Franchise'
import { GoogleAuthComplete } from './pages/GoogleAuthComplete'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { OrderDetail } from './pages/OrderDetail'
import { Orders } from './pages/Orders'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { ProductDetail } from './pages/ProductDetail'
import { ProductList } from './pages/ProductList'
import { ResetPassword } from './pages/ResetPassword'
import { Signup } from './pages/Signup'
import { TermsAndConditions } from './pages/TermsAndConditions'
import { TermsDeletion } from './pages/TermsDeletion'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="franchise" element={<Franchise />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsAndConditions />} />
        <Route path="terms-deletion" element={<TermsDeletion />} />

        <Route path="products/:category" element={<ProductList />} />
        <Route path="products/:category/:productId" element={<ProductDetail />} />

        <Route path="login" element={<Login />} />
        <Route path="auth/google/complete" element={<GoogleAuthComplete />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="account/edit"
          element={
            <ProtectedRoute>
              <AccountEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="account/transactions"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="account/delete"
          element={
            <ProtectedRoute>
              <AccountDelete />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="admin/reset-password" element={<AdminResetPassword />} />

      <Route
        path="admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route
          path="products/new"
          element={
            <AdminProtectedRoute minRole="manager">
              <AdminProductForm mode="create" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="products/:productId/edit"
          element={
            <AdminProtectedRoute minRole="manager">
              <AdminProductForm mode="edit" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <AdminProtectedRoute minRole="manager">
              <AdminOrders />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="orders/:orderId"
          element={
            <AdminProtectedRoute minRole="manager">
              <AdminOrderDetail />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <AdminProtectedRoute minRole="admin">
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="users/:userId"
          element={
            <AdminProtectedRoute minRole="admin">
              <AdminUserDetail />
            </AdminProtectedRoute>
          }
        />
        <Route path="inventory-alerts" element={<AdminInventoryAlerts />} />
        <Route
          path="admins"
          element={
            <AdminProtectedRoute minRole="superadmin">
              <AdminAdmins />
            </AdminProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
