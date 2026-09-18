import { useState } from 'react'
import { FaCartShopping, FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6'
import { HiMenu, HiX } from 'react-icons/hi'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../lib/format'

const PRODUCT_LINKS: { label: string; category: string }[] = [
  { label: 'Coffee Bags', category: 'bag' },
  { label: 'Coffee Cups', category: 'cup' },
  { label: 'Coffee Mugs', category: 'mug' },
  { label: 'T-Shirts', category: 'tshirt' },
]

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { data: cart } = useCart()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const itemCount = cart?.items.length ?? 0

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div
        className="hidden justify-between px-6 py-2 text-sm text-white md:flex"
        style={{ backgroundColor: 'var(--color-brand-brown-dark)' }}
      >
        <span>From the heart of Araku Valley</span>
        <div className="flex items-center gap-4">
          <a href="https://www.facebook.com/profile.php?id=61572935911579" target="_blank" rel="noreferrer">
            <FaFacebookF />
          </a>
          <a href="https://www.instagram.com/araku_tribe" target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
          <a href="https://x.com/university94155" target="_blank" rel="noreferrer">
            <FaXTwitter />
          </a>

          <div className="relative">
            <button
              type="button"
              aria-label="Cart"
              className="relative"
              onClick={() => setCartOpen((open) => !open)}
            >
              <FaCartShopping className="text-lg" style={{ color: 'var(--color-brand-gold)' }} />
              {itemCount > 0 && (
                <span
                  className="absolute -right-2 -top-2 rounded-full px-1.5 text-xs font-bold text-black"
                  style={{ backgroundColor: 'var(--color-brand-amber)' }}
                >
                  {itemCount}
                </span>
              )}
            </button>
            {cartOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded bg-white p-3 text-black shadow-lg">
                {itemCount > 0 ? (
                  <>
                    <ul className="max-h-60 divide-y overflow-auto text-sm">
                      {cart!.items.map((item) => (
                        <li key={item.product_id} className="py-2">
                          <strong>{item.product_name}</strong>
                          <div>
                            {formatPrice(item.price)} × {item.quantity}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/cart"
                      className="mt-2 block rounded py-1.5 text-center text-white"
                      style={{ backgroundColor: 'var(--color-brand-amber)' }}
                      onClick={() => setCartOpen(false)}
                    >
                      View Cart
                    </Link>
                  </>
                ) : (
                  <p className="text-center text-gray-500">Your cart is empty</p>
                )}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="group relative">
              <button type="button" className="font-bold" style={{ color: 'var(--color-brand-gold)' }}>
                Hello, {user?.firstname ?? 'User'} ▾
              </button>
              <div className="absolute right-0 hidden w-40 rounded border bg-white text-black shadow-lg group-hover:block">
                <Link to="/account" className="block px-4 py-2 hover:bg-gray-100">
                  Profile
                </Link>
                <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
                  Orders
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <span>
              Hello, Guest |{' '}
              <Link to="/login" className="font-bold" style={{ color: 'var(--color-brand-gold)' }}>
                Sign In
              </Link>{' '}
              |{' '}
              <Link to="/signup" className="font-bold" style={{ color: 'var(--color-brand-gold)' }}>
                Register Now
              </Link>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-2xl font-bold" style={{ color: 'var(--color-brand-brown)' }}>
          ARAKU TRIBE
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className="hover:opacity-70">
            Home
          </NavLink>
          <NavLink to="/about" className="hover:opacity-70">
            About
          </NavLink>
          <div className="group relative">
            <button type="button" className="hover:opacity-70">
              Products
            </button>
            <div className="absolute left-0 hidden w-48 rounded border bg-white shadow-lg group-hover:block">
              {PRODUCT_LINKS.map((link) => (
                <Link
                  key={link.category}
                  to={`/products/${link.category}`}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/franchise" className="hover:opacity-70">
            Franchise
          </NavLink>
          <NavLink to="/contact" className="hover:opacity-70">
            Contact
          </NavLink>
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {mobileNavOpen && (
        <nav className="flex flex-col gap-1 border-t px-6 py-3 md:hidden">
          <Link to="/" onClick={() => setMobileNavOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setMobileNavOpen(false)}>
            About
          </Link>
          {PRODUCT_LINKS.map((link) => (
            <Link
              key={link.category}
              to={`/products/${link.category}`}
              onClick={() => setMobileNavOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/franchise" onClick={() => setMobileNavOpen(false)}>
            Franchise
          </Link>
          <Link to="/contact" onClick={() => setMobileNavOpen(false)}>
            Contact
          </Link>
          <hr className="my-2" />
          {isAuthenticated ? (
            <>
              <Link to="/account" onClick={() => setMobileNavOpen(false)}>
                Profile
              </Link>
              <Link to="/orders" onClick={() => setMobileNavOpen(false)}>
                Orders
              </Link>
              <button type="button" className="text-left" onClick={() => logout()}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setMobileNavOpen(false)}>
                Register Now
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
