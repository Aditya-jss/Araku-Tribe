import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer
      className="mt-16 px-6 py-10 text-sm text-white"
      style={{ backgroundColor: 'var(--color-brand-brown)' }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-bold">ARAKU TRIBE</h3>
          <p className="opacity-80">From the heart of Araku Valley.</p>
        </div>
        <div>
          <h4 className="mb-3 font-bold">Company</h4>
          <ul className="space-y-1 opacity-80">
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/franchise">Franchise</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold">Legal</h4>
          <ul className="space-y-1 opacity-80">
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms &amp; Conditions</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl border-t border-white/20 pt-4 text-xs opacity-60">
        © {new Date().getFullYear()} Araku Tribe. All rights reserved.
      </p>
    </footer>
  )
}
