import { Link } from 'react-router-dom'

const CATEGORIES: { label: string; category: string }[] = [
  { label: 'Coffee Bags', category: 'bag' },
  { label: 'Coffee Cups', category: 'cup' },
  { label: 'Coffee Mugs', category: 'mug' },
  { label: 'T-Shirts', category: 'tshirt' },
]

export function Home() {
  return (
    <div>
      <section
        className="px-6 py-24 text-center text-white"
        style={{ backgroundColor: 'var(--color-brand-brown)' }}
      >
        <h1 className="mb-4 text-4xl font-bold sm:text-5xl">ARAKU TRIBE</h1>
        <p className="mx-auto max-w-xl text-lg opacity-90">
          From the heart of Araku Valley — ethically sourced coffee, grown by the tribal
          communities of the Eastern Ghats.
        </p>
        <Link
          to="/products/bag"
          className="mt-8 inline-block rounded px-6 py-3 font-bold text-black"
          style={{ backgroundColor: 'var(--color-brand-gold)' }}
        >
          Shop Now
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.category}
              to={`/products/${cat.category}`}
              className="rounded-lg border p-8 text-center font-medium hover:shadow-md"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
