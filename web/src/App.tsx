import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Account } from './pages/Account'
import { AccountDelete } from './pages/AccountDelete'
import { AccountEdit } from './pages/AccountEdit'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { ComingSoon } from './pages/ComingSoon'
import { ForgotPassword } from './pages/ForgotPassword'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { OrderDetail } from './pages/OrderDetail'
import { Orders } from './pages/Orders'
import { ProductDetail } from './pages/ProductDetail'
import { ProductList } from './pages/ProductList'
import { ResetPassword } from './pages/ResetPassword'
import { Signup } from './pages/Signup'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="about" element={<ComingSoon title="About Araku Tribe" />} />
        <Route path="contact" element={<ComingSoon title="Contact Us" />} />
        <Route path="franchise" element={<ComingSoon title="Franchise" />} />
        <Route path="privacy" element={<ComingSoon title="Privacy Policy" />} />
        <Route path="terms" element={<ComingSoon title="Terms & Conditions" />} />
        <Route path="terms-deletion" element={<ComingSoon title="Account Deletion Terms" />} />

        <Route path="products/:category" element={<ProductList />} />
        <Route path="products/:category/:productId" element={<ProductDetail />} />

        <Route path="login" element={<Login />} />
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
    </Routes>
  )
}

export default App
