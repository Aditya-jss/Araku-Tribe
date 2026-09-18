import { Link } from 'react-router-dom'
import { HeritageSection } from '../components/HeritageSection'
import { Testimonials } from '../components/Testimonials'
import { useRotatingText } from '../hooks/useRotatingText'

const TAGLINES = [
  'Savor the Authentic Araku Coffee Experience',
  'Bringing the True Essence of Araku Coffee to Your Cup',
  'Discover the Finest Araku Coffee, freshly brewed for you',
  'Bringing the True Taste of Araku to the World',
]

const FEATURES = [
  {
    title: 'Authentic Araku Coffee',
    body: 'Single-origin beans grown in the Araku Valley, handpicked and roasted to bring out their signature depth and aroma.',
    to: '/products/bag',
  },
  {
    title: 'Araku Tribe Coffee Culture',
    body: 'A movement built with the tribal communities of the Eastern Ghats — every cup supports the farmers who grow it.',
    to: '/about',
  },
  {
    title: 'Araku Tribe Coffee Franchise',
    body: 'Bring the Araku coffee experience to your city. Explore our franchise model and become a partner.',
    to: '/franchise',
  },
  {
    title: 'Araku Tribe Coffee Machines',
    body: 'Premium brewing equipment and merchandise, designed to help you serve the perfect cup every time.',
    to: '/franchise',
  },
]

export function Home() {
  const tagline = useRotatingText(TAGLINES)

  return (
    <div>
      <section
        className="px-6 py-24 text-center text-white"
        style={{ backgroundColor: 'var(--color-brand-brown)' }}
      >
        <h1 className="mb-4 text-4xl font-bold sm:text-5xl">ARAKU TRIBE</h1>
        <p className="mx-auto min-h-8 max-w-xl text-lg opacity-90">{tagline}</p>
        <Link
          to="/products/bag"
          className="mt-8 inline-block rounded px-6 py-3 font-bold text-black"
          style={{ backgroundColor: 'var(--color-brand-gold)' }}
        >
          Shop Now
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h2 className="mb-6 text-2xl">Would You Like Delicious Coffee?</h2>
        <p className="mb-4 text-brand-muted">
          Araku Tribe was born from a simple belief: the best coffee comes from honoring both the
          land it's grown on and the people who grow it. Every bean is sourced directly from the
          tribal communities of the Araku Valley, a region prized for its high altitude and rich,
          biodiverse soil.
        </p>
        <p className="mb-8 text-brand-muted">
          From harvest to cup, we keep our footprint light — eco-friendly packaging, ethical
          sourcing, and a direct relationship with every farmer who contributes to the blend.
        </p>
        <Link to="/about" className="inline-block rounded border px-6 py-2.5 font-bold">
          More About Us
        </Link>
      </section>

      <section className="px-6 py-16" style={{ backgroundColor: 'var(--color-brand-cream)' }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl">What We Provide You</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Link key={f.title} to={f.to} className="rounded-lg border bg-white p-6 hover:shadow-md">
                <h3 className="mb-2 font-bold" style={{ color: 'var(--color-brand-brown)' }}>
                  {f.title}
                </h3>
                <p className="text-sm text-brand-muted">{f.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: 'Coffee Bags', category: 'bag' },
            { label: 'Coffee Cups', category: 'cup' },
            { label: 'Coffee Mugs', category: 'mug' },
            { label: 'T-Shirts', category: 'tshirt' },
          ].map((cat) => (
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

      <section
        className="px-6 py-16 text-center text-white"
        style={{ backgroundColor: 'var(--color-brand-brown)' }}
      >
        <h2 className="mb-4 text-3xl">Turn Your Love for Coffee into a Thriving Business!</h2>
        <p className="mx-auto mb-8 max-w-2xl opacity-90">
          Partner with Araku Tribe and bring premium, ethically sourced coffee to your community.
        </p>
        <Link
          to="/franchise"
          className="inline-block rounded px-6 py-3 font-bold text-black"
          style={{ backgroundColor: 'var(--color-brand-gold)' }}
        >
          Explore Franchise
        </Link>
      </section>

      <HeritageSection />
      <Testimonials />
    </div>
  )
}
