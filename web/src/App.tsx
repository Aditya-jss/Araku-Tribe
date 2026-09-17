import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ComingSoon } from './pages/ComingSoon'
import { Home } from './pages/Home'

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

        <Route path="products/:category" element={<ComingSoon title="Products" />} />
        <Route path="products/:category/:productId" element={<ComingSoon title="Product Detail" />} />

        <Route path="login" element={<ComingSoon title="Sign In" />} />
        <Route path="signup" element={<ComingSoon title="Create Account" />} />
        <Route path="forgot-password" element={<ComingSoon title="Forgot Password" />} />
        <Route path="reset-password" element={<ComingSoon title="Reset Password" />} />

        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <ComingSoon title="Your Cart" />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <ComingSoon title="Checkout" />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <ComingSoon title="Your Orders" />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:orderId"
          element={
            <ProtectedRoute>
              <ComingSoon title="Order Detail" />
            </ProtectedRoute>
          }
        />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <ComingSoon title="Your Account" />
            </ProtectedRoute>
          }
        />
        <Route
          path="account/edit"
          element={
            <ProtectedRoute>
              <ComingSoon title="Edit Profile" />
            </ProtectedRoute>
          }
        />
        <Route
          path="account/transactions"
          element={
            <ProtectedRoute>
              <ComingSoon title="Transactions" />
            </ProtectedRoute>
          }
        />
        <Route
          path="account/delete"
          element={
            <ProtectedRoute>
              <ComingSoon title="Delete Account" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
